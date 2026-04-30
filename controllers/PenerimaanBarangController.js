import { Op } from "sequelize";
import db from "../config/database.js";
import logger from "../utils/logger.js";
import PenerimaanBarang from "../models/PenerimaanBarang.js";
import PenerimaanBarangItem from "../models/PenerimaanBarangItem.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import PurchaseOrderItem from "../models/PurchaseOrderItem.js";
import Barang from "../models/Barang.js";
import Supplier from "../models/Supplier.js";
import Stock from "../models/Stock.js";

// ── generate nomor GRN: GRN-YYYY-XXXX ─────────────────────────
const generateNomorGRN = async () => {
    const year  = new Date().getFullYear();
    const count = await PenerimaanBarang.count({
        where: { nomor_grn: { [Op.like]: `GRN-${year}-%` } },
    });
    const seq = String(count + 1).padStart(4, "0");
    return `GRN-${year}-${seq}`;
};

// ── update stok setelah penerimaan ─────────────────────────────
const updateStock = async (id_barang, qty, satuan, transaction) => {
    const existing = await Stock.findOne({ where: { id_barang }, transaction });
    if (existing) {
        await existing.update({ quantity: existing.quantity + qty }, { transaction });
    } else {
        await Stock.create({ id_barang, quantity: qty, satuan }, { transaction });
    }
};

// ── GET list ───────────────────────────────────────────────────
export const getPenerimaan = async (req, res) => {
    try {
        const page   = parseInt(req.query.page)  || 0;
        const limit  = parseInt(req.query.limit) || 10;
        const search = req.query.search_query    || "";
        const status = req.query.status          || "";
        const offset = limit * page;

        const where = {};
        if (search) where.nomor_grn = { [Op.iLike]: `%${search}%` };
        if (status) where.status    = status;

        const totalRows = await PenerimaanBarang.count({ where });
        const rows = await PenerimaanBarang.findAll({
            where, offset, limit,
            order: [["id", "DESC"]],
            include: [{
                model: PurchaseOrder, as: "po",
                attributes: ["id", "nomor_po"],
                include: [{ model: Supplier, as: "supplier", attributes: ["id", "nama"] }],
            }],
        });

        res.status(200).json({ response: rows, totalRows, totalPage: Math.ceil(totalRows / limit), page });
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ msg: "Error fetching penerimaan barang" });
    }
};

// ── GET single ─────────────────────────────────────────────────
export const getPenerimaanById = async (req, res) => {
    try {
        const row = await PenerimaanBarang.findByPk(req.params.id, {
            include: [
                { model: PurchaseOrder, as: "po",
                  include: [{ model: Supplier, as: "supplier" }] },
                { model: PenerimaanBarangItem, as: "items",
                  include: [{ model: Barang, as: "barang", attributes: ["id", "name"] }] },
            ],
        });
        if (!row) return res.status(404).json({ msg: "Penerimaan tidak ditemukan" });
        res.status(200).json(row);
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ msg: "Error fetching penerimaan" });
    }
};

// ── GET nomor GRN berikutnya ───────────────────────────────────
export const getNextNomorGRN = async (req, res) => {
    try {
        const nomor = await generateNomorGRN();
        res.status(200).json({ nomor_grn: nomor });
    } catch (err) {
        res.status(500).json({ msg: "Error generating nomor GRN" });
    }
};

// ── CREATE penerimaan + update stok otomatis ───────────────────
export const createPenerimaan = async (req, res) => {
    const { id_po, tanggal_terima, no_surat_jalan, no_invoice,
            diterima_oleh, gudang, catatan, dibuat_oleh, items } = req.body;

    if (!id_po || !tanggal_terima) {
        return res.status(400).json({ error: "Referensi PO dan tanggal terima wajib diisi." });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Minimal 1 item harus diisi." });
    }

    const t = await db.transaction();
    try {
        // Cek PO valid dan sudah approved
        const po = await PurchaseOrder.findByPk(id_po, { transaction: t });
        if (!po) return res.status(404).json({ error: "PO tidak ditemukan." });
        if (!["approved", "partial"].includes(po.status)) {
            return res.status(400).json({ error: "PO harus berstatus Approved atau Penerimaan Sebagian." });
        }

        const nomor_grn = await generateNomorGRN();

        // Tentukan status GRN: selesai jika semua qty terpenuhi, partial jika ada selisih
        const anyShort = items.some(i => i.quantity_diterima < i.quantity_po);
        const grnStatus = anyShort ? "partial" : "selesai";

        const grn = await PenerimaanBarang.create({
            nomor_grn, id_po, tanggal_terima, no_surat_jalan,
            no_invoice, diterima_oleh, gudang, catatan,
            status: grnStatus, dibuat_oleh,
        }, { transaction: t });

        // Buat items + update stok + update qty_diterima di PO item
        for (const item of items) {
            const selisih = item.quantity_diterima - item.quantity_po;

            await PenerimaanBarangItem.create({
                id_grn:            grn.id,
                id_po_item:        item.id_po_item || null,
                id_barang:         item.id_barang,
                quantity_po:       item.quantity_po,
                quantity_diterima: item.quantity_diterima,
                selisih,
                satuan:            item.satuan,
                kondisi:           item.kondisi || "Baik",
                harga_satuan:      item.harga_satuan || 0,
            }, { transaction: t });

            // Update stok barang bertambah sejumlah qty diterima
            if (item.quantity_diterima > 0 && item.kondisi !== "Ditolak") {
                await updateStock(item.id_barang, item.quantity_diterima, item.satuan, t);
            }

            // Update qty_diterima di PO item
            if (item.id_po_item) {
                const poItem = await PurchaseOrderItem.findByPk(item.id_po_item, { transaction: t });
                if (poItem) {
                    await poItem.update({
                        qty_diterima: poItem.qty_diterima + item.quantity_diterima,
                    }, { transaction: t });
                }
            }
        }

        // Update status PO
        const allPoItems = await PurchaseOrderItem.findAll({ where: { id_po }, transaction: t });
        const allDone    = allPoItems.every(pi => pi.qty_diterima >= pi.quantity);
        await po.update({ status: allDone ? "done" : "partial" }, { transaction: t });

        await t.commit();
        res.status(201).json({ msg: "Penerimaan barang berhasil dicatat, stok diperbarui", nomor_grn });
    } catch (err) {
        await t.rollback();
        logger.error(err.message);
        res.status(500).json({ error: "Gagal mencatat penerimaan." });
    }
};

// ── UPDATE status saja (verifikasi / tolak) ────────────────────
export const updateStatusPenerimaan = async (req, res) => {
    const { status } = req.body;
    const allowed    = ["selesai", "partial", "waiting", "ditolak"];
    if (!allowed.includes(status)) {
        return res.status(400).json({ error: "Status tidak valid." });
    }
    try {
        const grn = await PenerimaanBarang.findByPk(req.params.id);
        if (!grn) return res.status(404).json({ error: "Penerimaan tidak ditemukan." });
        await grn.update({ status });
        res.status(200).json({ msg: "Status penerimaan diperbarui", grn });
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ error: "Gagal mengupdate status." });
    }
};

// ── DELETE (hanya jika waiting, stok belum berubah) ───────────
export const deletePenerimaan = async (req, res) => {
    try {
        const grn = await PenerimaanBarang.findByPk(req.params.id);
        if (!grn) return res.status(404).json({ error: "Penerimaan tidak ditemukan." });
        if (grn.status !== "waiting") {
            return res.status(400).json({ error: "Hanya penerimaan berstatus Menunggu Verifikasi yang bisa dihapus." });
        }
        await PenerimaanBarangItem.destroy({ where: { id_grn: grn.id } });
        await grn.destroy();
        res.status(200).json({ msg: "Penerimaan berhasil dihapus" });
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ error: "Gagal menghapus penerimaan." });
    }
};
