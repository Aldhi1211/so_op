import Contact from "../models/Contact.js";
import { Op } from "sequelize";

export const getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search_query || "";
        const offset = page * limit;

        const where = search
            ? {
                [Op.or]: [
                    { nama: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { perusahaan: { [Op.like]: `%${search}%` } },
                    { pesan: { [Op.like]: `%${search}%` } },
                ],
            }
            : {};

        const { count, rows } = await Contact.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.status(200).json({
            response: rows,
            totalRows: count,
            totalPage: Math.ceil(count / limit),
            page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching contacts" });
    }
};

export const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findOne({ where: { id: req.params.id } });
        if (!contact) return res.status(404).json({ msg: "Pesan tidak ditemukan" });
        res.status(200).json(contact);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching contact" });
    }
};

export const createContact = async (req, res) => {
    try {
        const { nama, email, perusahaan, pesan } = req.body;
        if (!nama || !email || !pesan) {
            return res.status(400).json({ msg: "Nama, email, dan pesan wajib diisi" });
        }
        await Contact.create({ nama, email, perusahaan, pesan });
        res.status(201).json({ msg: "Pesan berhasil dikirim" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Gagal mengirim pesan" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        await Contact.update({ is_read: true }, { where: { id: req.params.id } });
        res.status(200).json({ msg: "Ditandai sudah dibaca" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Gagal memperbarui status" });
    }
};

export const deleteContact = async (req, res) => {
    try {
        await Contact.destroy({ where: { id: req.params.id } });
        res.status(200).json({ msg: "Pesan dihapus" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Gagal menghapus pesan" });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Contact.count({ where: { is_read: false } });
        res.status(200).json({ count });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error" });
    }
};
