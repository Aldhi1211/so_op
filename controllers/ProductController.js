import Product from "../models/Product.js";
import Specs from "../models/Spesification.js";
import Custom from "../models/Custom.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

export const getProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await Product.count({
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`, // Search in Product.name
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
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`,
                        },
                    },
                    {
                        description: {
                            [Op.like]: `%${search}%`,
                        },
                    },
                ],
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']], // Order by latest
            include: [
                {
                    model: Specs,

                    required: false, // Include even if no specifications exist
                },
                {
                    model: Custom,
                    required: false, // Include even if no customs exist
                },
            ],
        });

        res.status(200).json({
            response: products,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching products" });
    }
};

// export const getProduct = async (req, res) => {
//     try {
//         const response = await Product.findAll();
//         res.json(response);

//     } catch (error) {

//         console.log(error.message);

//     }
// };

export const getProductById = async (req, res) => {
    try {
        const response = await Product.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
};

// Konfigurasi penyimpanan multer
// Pastikan folder 'images/' ada atau buat otomatis jika belum ada
export const imageFolder = "images";
if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder);
}

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
export const uploadPhoto = upload.single("images");

// Endpoint untuk menambahkan produk
export const AddProduct = async (req, res) => {
    const { name, description, link_tokped, link_whatsapp } = req.body;

    try {
        // Validasi input
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded." });
        }

        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required." });
        }

        // URL file yang diupload
        const imageUrl = `http://localhost:5000/${imageFolder}/${req.file.filename}`;

        // Tambahkan data ke database
        const insertProduct = await Product.create({
            name,
            description,
            link_tokped,
            link_whatsapp,
            images: imageUrl, // Simpan URL foto
        });

        res.status(201).json({
            msg: "Product added successfully",
            product: {
                id: insertProduct.id,
                name: insertProduct.name,
                image: imageUrl,
            },
        });
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.status(500).json({ error: "Failed to add product." });
    }
};


export const updateProduct = async (req, res) => {
    const { name, description, link_tokped, link_whatsapp } = req.body;

    try {
        // Validasi input
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required." });
        }

        // Cari produk berdasarkan ID
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        // Tentukan URL gambar
        let imageUrl = product.images; // Gambar lama tetap digunakan jika tidak ada file baru

        if (req.file) {
            // Jika ada file yang diunggah, gunakan file baru
            imageUrl = `http://localhost:5000/${imageFolder}/${req.file.filename}`;
        }

        // Update data produk
        const [affectedCount] = await Product.update(
            {
                name,
                description,
                link_tokped,
                link_whatsapp,
                images: imageUrl,
            },
            {
                where: {
                    id: req.params.id,
                },
            }
        );

        if (affectedCount > 0) {
            // Ambil data produk yang sudah diperbarui
            const updatedProduct = await Product.findByPk(req.params.id);
            res.status(200).json({
                msg: "Product updated successfully",
                product: updatedProduct,
            });
        } else {
            res.status(404).json({ error: "Product not updated." });
        }
    } catch (error) {
        console.error("Error updating product:", error.message);
        res.status(500).json({ error: "Failed to update product." });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        await Product.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Product Deleted" });

    } catch (error) {

        console.log(error.message);

    }
};


export const getSpecs = async (req, res) => {
    try {
        const response = await Specs.findAll();
        res.json(response);

    } catch (error) {

        console.log(error.message);

    }
};

export const getSpecsById = async (req, res) => {
    try {
        const response = await Specs.findAll({
            where: {
                id_product: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
};

export const updateSpecs = async (req, res) => {
    try {
        await Specs.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Product Updated" });

    } catch (error) {

        console.log(error.message);

    }
};

export const deleteSpecs = async (req, res) => {
    try {
        await Specs.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Product Deleted" });

    } catch (error) {

        console.log(error.message);

    }
};

export const AddSpecs = async (req, res) => {
    const { id_product, spesification } = req.body;
    try {
        await Specs.bulkCreate(req.body);
        res.status(201).json({ msg: "Product Added" });

    } catch (error) {

        console.log(error.message);

    }
};

export const getCustom = async (req, res) => {
    try {
        const response = await Custom.findAll();
        res.json(response);

    } catch (error) {

        console.log(error.message);

    }
};

export const getCustomById = async (req, res) => {
    try {
        const response = await Custom.findAll({
            where: {
                id_product: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
};


export const updateCustom = async (req, res) => {
    try {
        await Custom.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Product Updated" });

    } catch (error) {

        console.log(error.message);

    }
};

export const deleteCustom = async (req, res) => {
    try {
        await Custom.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Product Deleted" });

    } catch (error) {

        console.log(error.message);

    }
};

export const AddCustom = async (req, res) => {
    const { id_product, custom } = req.body;
    try {
        await Custom.bulkCreate(req.body);
        res.status(201).json({ msg: "Product Added" });

    } catch (error) {

        console.log(error.message);

    }
};

