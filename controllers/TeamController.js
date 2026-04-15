import Teams from "../models/Teams.js";
import { Op } from "sequelize";
import { uploadToCloudinary } from "../config/cloudinary.js";

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
                            [Op.iLike]: `%${search}%`, // Search in Product.name
                        },
                    },
                    {
                        jabatan: {
                            [Op.iLike]: `%${search}%`, // Search in Product.description
                        },
                    },
                    {
                        description: {
                            [Op.iLike]: `%${search}%`, // Search in Product.description
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
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        jabatan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        description: {
                            [Op.iLike]: `%${search}%`, // Search in Product.description
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

export const uploadPhoto = uploadToCloudinary.single("foto");


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
        const imageUrl = req.file.path;

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
            imageUrl = req.file.path;
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