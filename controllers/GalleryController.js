import Gallery from "../models/Gallery.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { imageFolder } from './ProductController.js'
import { Op } from "sequelize";

// export const getGallery = async (req, res) => {
//     try {
//         const response = await Gallery.findAll();
//         res.json(response);

//     } catch (error) {

//         console.log(error.message);

//     }
// };

export const getGallery = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await Gallery.count({
            where:
            {
                name: {
                    [Op.like]: `%${search}%`, // Search in Product.name
                },


            },
        });

        const totalPage = Math.ceil(totalRows / limit);

        // Fetch paginated records with search, include related Specifications and Customs
        const galleries = await Gallery.findAll({
            where:
            {
                name: {
                    [Op.like]: `%${search}%`, // Search in Product.name
                },


            },

            offset: offset,
            limit: limit,
            order: [['id', 'DESC']], // Order by latest

        });

        res.status(200).json({
            response: galleries,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching products" });
    }
};

export const getGalleryById = async (req, res) => {
    try {
        const response = await Gallery.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
};

// export const AddGallery = async (req, res) => {
//     const { name, foto } = req.body;
//     try {
//         await Gallery.create(req.body);
//         res.status(201).json({ msg: "Gallery Added" });

//     } catch (error) {

//         console.log(error.message);

//     }
// };


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

// Endpoint untuk menambahkan produk
export const AddGallery = async (req, res) => {
    const { name } = req.body;

    try {
        // Validasi input
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }

        if (!name) {
            return res.status(400).json({ error: "Name are required." });
        }

        // URL file yang diupload
        const imageUrl = `http://18.141.194.160/api/${imageFolder}/${req.file.filename}`;

        // Tambahkan data ke database
        const insertGallery = await Gallery.create({
            name,
            foto: imageUrl, // Simpan URL foto
        });

        res.status(201).json({
            msg: "Gallery added successfully",
            gallery: {
                id: insertGallery.id,
                name: insertGallery.name,
                foto: imageUrl,
            },
        });
    } catch (error) {
        console.error("Error adding gallery:", error.message);
        res.status(500).json({ error: "Failed to add gallery." });
    }
};

export const updateGallery = async (req, res) => {
    const { name } = req.body;

    try {
        // Validasi input
        if (!name) {
            return res.status(400).json({ error: "Name are required." });
        }

        // Cari produk berdasarkan ID
        const gallery = await Gallery.findByPk(req.params.id);

        if (!gallery) {
            return res.status(404).json({ error: "Gallery not found." });
        }

        // Tentukan URL gambar
        let imageUrl = gallery.foto; // Gambar lama tetap digunakan jika tidak ada file baru

        if (req.file) {
            // Jika ada file yang diunggah, gunakan file baru
            imageUrl = `http://18.141.194.160/api/${imageFolder}/${req.file.filename}`;
        }

        // Update data produk
        const [affectedCount] = await Gallery.update(
            {
                name,
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
            const updatedGallery = await Gallery.findByPk(req.params.id);
            res.status(200).json({
                msg: "Gallery updated successfully",
                gallery: updateGallery,
            });
        } else {
            res.status(404).json({ error: "Gallery not updated." });
        }
    } catch (error) {
        console.error("Error updating gallery:", error.message);
        res.status(500).json({ error: "Failed to update gallery." });
    }
};

export const deleteGallery = async (req, res) => {
    try {
        await Gallery.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Gallery Deleted" });

    } catch (error) {

        console.log(error.message);

    }
};