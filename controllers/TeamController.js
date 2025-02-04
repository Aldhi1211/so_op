import Teams from "../models/Teams.js";
import { Op } from "sequelize";
import multer from "multer";
import fs from "fs";
import { imageFolder } from './ProductController.js'
import path from "path";

export const getTeams = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await Teams.count({
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`, // Search in Product.name
                        },
                    },
                    {
                        jabatan: {
                            [Op.like]: `%${search}%`, // Search in Product.description
                        },
                    },
                    {
                        description: {
                            [Op.like]: `%${search}%`, // Search in Product.description
                        },
                    },
                ],
            },
        });

        const totalPage = Math.ceil(totalRows / limit);

        // Fetch paginated records with search, include related Specifications and Customs
        const teams = await Teams.findAll({
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`,
                        },
                    },
                    {
                        jabatan: {
                            [Op.like]: `%${search}%`,
                        },
                    },
                    {
                        description: {
                            [Op.like]: `%${search}%`, // Search in Product.description
                        },
                    },
                ],
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']], // Order by latest
        });

        res.status(200).json({
            response: teams,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching products" });
    }
};

export const getTeamById = async (req, res) => {
    try {
        const response = await Teams.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
};

// Konfigurasi multer untuk menyimpan file gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageFolder); // Folder untuk menyimpan file
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nama file unik
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB
});

// Middleware untuk upload file
export const uploadPhoto = upload.single("foto");


export const AddTeams = async (req, res) => {
    const { name, jabatan, foto, fb, linkedin, instagram, description } = req.body;

    try {
        // Validasi input
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }

        if (!name) {
            return res.status(400).json({ error: "Name are required." });
        }

        // URL file yang diupload
        const imageUrl = `http://localhost:5000/${imageFolder}/${req.file.filename}`;

        // Tambahkan data ke database
        const insertTeams = await Teams.create({
            name,
            jabatan,
            fb,
            linkedin,
            instagram,
            description,
            foto: imageUrl, // Simpan URL foto
        });

        res.status(201).json({
            msg: "Teams added successfully",
            teams: {
                id: insertTeams.id,
                name: insertTeams.name,
                foto: imageUrl,
            },
        });
    } catch (error) {
        console.error("Error adding teams:", error.message);
        res.status(500).json({ error: "Failed to add teams." });
    }
};

export const updateTeams = async (req, res) => {
    const { name, jabatan, fb, linkedin, instagram, description } = req.body;

    try {
        // Validasi input
        if (!name) {
            return res.status(400).json({ error: "Name are required." });
        }

        // Cari produk berdasarkan ID
        const teams = await Teams.findByPk(req.params.id);

        if (!teams) {
            return res.status(404).json({ error: "Teams not found." });
        }

        // Tentukan URL gambar
        let imageUrl = teams.foto; // Gambar lama tetap digunakan jika tidak ada file baru

        if (req.file) {
            // Jika ada file yang diunggah, gunakan file baru
            imageUrl = `http://localhost:5000/${imageFolder}/${req.file.filename}`;
        }

        // Update data produk
        const [affectedCount] = await Teams.update(
            {
                name,
                jabatan,
                fb,
                linkedin,
                instagram,
                description,
                foto: imageUrl,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );

        if (affectedCount > 0) {
            // Ambil data produk yang sudah diperbarui
            const updatedTeams = await Teams.findByPk(req.params.id);
            res.status(200).json({
                msg: "Teams updated successfully",
                teams: updateTeams,
            });
        } else {
            res.status(404).json({ error: "Teams not updated." });
        }
    } catch (error) {
        console.error("Error updating teams:", error.message);
        res.status(500).json({ error: "Failed to update teams." });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        await Teams.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Teams Deleted" });

    } catch (error) {

        console.log(error.message);

    }
};