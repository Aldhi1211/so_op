import { Op } from "sequelize";
import db from "../config/database.js";
import logger from "../utils/logger.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import PurchaseOrderItem from "../models/PurchaseOrderItem.js";
import Supplier from "../models/Supplier.js";
import Barang from "../models/Barang.js";

// ── generate nomor PO: PO-YYYY-XXXX ───────────────────────────
const generateNomorPO = async () => {
    const year  = new Date().getFullYear();
    const count = await PurchaseOrder.count({
        where: { nomor_po: { [Op.like]: `PO-${year}-%` } },
    });
    const seq = String(count + 1).padStart(4, "0");
    return `PO-${year}-${seq}`;
};

// ── GET list ───────────────────────────────────────────────────
export const getPurchaseOrders = async (req, res) => {
    try {
        const page   = parseInt(req.query.page)   || 0;
        const limit  = parseInt(req.query.limit)  || 10;
        const search = req.query.search_query     || "";
        const status = req.query.status           || "";
        const offset = limit * page;

        const where = {};
        if (search) where.nomor_po = { [Op.iLike]: `%${search}%` };
        if (status) where.status   = status;

        const totalRows = await PurchaseOrder.count({ where });
        const rows = await PurchaseOrder.findAll({
            where, offset, limit,
            order: [["id", "DESC"]],
            include: [{ model: Supplier, as: "supplier", attributes: ["id", "nama"] }],
        });

        res.status(200).json({ response: rows, totalRows, totalPage: Math.ceil(totalRows / limit), page });
    } catch (err) {
        logger.error(`getPurchaseOrders: ${err.message}`);
        res.status(500).json({ msg: "Error fetching purchase orders" });
    }
};

// ── GET single ─────────────────────────────────────────────────
export const getPurchaseOrderById = async (req, res) => {
    try {
        const row = await PurchaseOrder.findByPk(req.params.id, {
            include: [
                { model: Supplier, as: "supplier" },
                { model: PurchaseOrderItem, as: "items",
                  include: [{ model: Barang, as: "barang", attributes: ["id", "name"] }] },
            ],
        });
        if (!row) return res.status(404).json({ msg: "PO tidak ditemukan" });
        res.status(200).json(row);
    } catch (err) {
        logger.error(`getPurchaseOrderById: ${err.message}`);
        res.status(500).json({ msg: "Error fetching purchase order" });
    }
};

// ── GET nomor PO berikutnya ────────────────────────────────────
export const getNextNomorPO = async (req, res) => {
    try {
        const nomor = await generateNomorPO();
        res.status(200).json({ nomor_po: nomor });
    } catch (err) {
        logger.error(`getNextNomorPO: ${err.message}`);
        res.status(500).json({ msg: "Error generating nomor PO" });
    }
};

// ── CREATE ─────────────────────────────────────────────────────
export const createPurchaseOrder = async (req, res) => {
    const { id_supplier, tanggal_po, tanggal_diharapkan, gudang_tujuan,
            metode_pembayaran, mata_uang, catatan, status, dibuat_oleh, items } = req.body;

    if (!id_supplier || !tanggal_po) {
        return res.status(400).json({ error: "Supplier dan tanggal PO wajib diisi." });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Minimal 1 item barang harus diisi." });
    }

    const t = await db.transaction();
    try {
        const nomor_po    = await generateNomorPO();
        const total_nilai = items.reduce((sum, i) => sum + (i.quantity * i.harga_satuan), 0);

        const po = await PurchaseOrder.create({
            nomor_po, id_supplier, tanggal_po, tanggal_diharapkan,
            gudang_tujuan, metode_pembayaran, mata_uang: mata_uang || "IDR",
            catatan, status: status || "draft", dibuat_oleh, total_nilai,
        }, { transaction: t });

        const itemRows = items.map(i => ({
            id_po:        po.id,
            id_barang:    i.id_barang,
            quantity:     i.quantity,
            satuan:       i.satuan,
            harga_satuan: i.harga_satuan || 0,
            subtotal:     i.quantity * (i.harga_satuan || 0),
        }));
        await PurchaseOrderItem.bulkCreate(itemRows, { transaction: t });

        await t.commit();
        res.status(201).json({ msg: "Purchase Order berhasil dibuat", nomor_po });
    } catch (err) {
        await t.rollback();
        logger.error(`createPurchaseOrder: ${err.message}`);
        res.status(500).json({ error: "Gagal membuat PO." });
    }
};

// ── UPDATE status / header ─────────────────────────────────────
export const updatePurchaseOrder = async (req, res) => {
    try {
        const po = await PurchaseOrder.findByPk(req.params.id);
        if (!po) return res.status(404).json({ error: "PO tidak ditemukan." });

        const allowed = ["id_supplier", "tanggal_po", "tanggal_diharapkan", "gudang_tujuan",
                         "metode_pembayaran", "mata_uang", "catatan", "status", "dibuat_oleh"];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        await po.update(updates);
        res.status(200).json({ msg: "PO berhasil diupdate", po });
    } catch (err) {
        logger.error(`updatePurchaseOrder: ${err.message}`);
        res.status(500).json({ error: "Gagal mengupdate PO." });
    }
};

// ── DELETE ─────────────────────────────────────────────────────
export const deletePurchaseOrder = async (req, res) => {
    try {
        const po = await PurchaseOrder.findByPk(req.params.id);
        if (!po) return res.status(404).json({ error: "PO tidak ditemukan." });
        if (po.status !== "draft" && po.status !== "cancel") {
            return res.status(400).json({ error: "Hanya PO berstatus Draft atau Cancel yang bisa dihapus." });
        }
        await PurchaseOrderItem.destroy({ where: { id_po: po.id } });
        await po.destroy();
        res.status(200).json({ msg: "PO berhasil dihapus" });
    } catch (err) {
        logger.error(`deletePurchaseOrder: ${err.message}`);
        res.status(500).json({ error: "Gagal menghapus PO." });
    }
};
