import Supplier from "../models/Supplier.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

const generateKode = async () => {
    const count = await Supplier.count();
    return `SUP-${String(count + 1).padStart(3, '0')}`;
};

export const getSuppliers = async (req, res) => {
    try {
        const page   = parseInt(req.query.page)  || 0;
        const limit  = parseInt(req.query.limit) || 20;
        const search = req.query.search_query    || "";
        const offset = limit * page;

        const totalRows = await Supplier.count({
            where: { nama: { [Op.iLike]: `%${search}%` } },
        });

        const rows = await Supplier.findAll({
            where:  { nama: { [Op.iLike]: `%${search}%` } },
            offset, limit,
            order: [["nama", "ASC"]],
        });

        res.status(200).json({ response: rows, totalRows, totalPage: Math.ceil(totalRows / limit), page });
    } catch (err) {
        logger.error(`getSuppliers: ${err.message}`);
        res.status(500).json({ msg: "Error fetching suppliers" });
    }
};

export const getSupplierById = async (req, res) => {
    try {
        const row = await Supplier.findByPk(req.params.id);
        if (!row) return res.status(404).json({ msg: "Supplier not found" });
        res.status(200).json(row);
    } catch (err) {
        logger.error(`getSupplierById: ${err.message}`);
        res.status(500).json({ msg: "Error fetching supplier" });
    }
};

export const addSupplier = async (req, res) => {
    const { nama, alamat, telepon, email, contact_person, keterangan } = req.body;
    if (!nama) return res.status(400).json({ error: "Nama supplier wajib diisi." });
    try {
        const kode = await generateKode();
    const row = await Supplier.create({ nama, kode, alamat, telepon, email, contact_person, keterangan });
        res.status(201).json({ msg: "Supplier berhasil ditambahkan", supplier: row });
    } catch (err) {
        logger.error(`addSupplier: ${err.message}`);
        res.status(500).json({ error: "Gagal menambahkan supplier." });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const row = await Supplier.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: "Supplier tidak ditemukan." });
        await row.update(req.body);
        res.status(200).json({ msg: "Supplier berhasil diupdate", supplier: row });
    } catch (err) {
        logger.error(`updateSupplier: ${err.message}`);
        res.status(500).json({ error: "Gagal mengupdate supplier." });
    }
};

export const deleteSupplier = async (req, res) => {
    try {
        const row = await Supplier.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: "Supplier tidak ditemukan." });
        await row.destroy();
        res.status(200).json({ msg: "Supplier berhasil dihapus" });
    } catch (err) {
        logger.error(`deleteSupplier: ${err.message}`);
        res.status(500).json({ error: "Gagal menghapus supplier." });
    }
};
