import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { imageFolder } from './ProductController.js'
import fs from "fs";
import path from "path";

// export const getUsers = async (req, res) => {
//     try {
//         const response = await User.findAll();
//         res.status(200).json(response);

//     } catch (error) {

//         console.log(error.message);

//     }
// }

export const getUsers = async (req, res) => {
    try {
        const response = await User.findAll({
            attributes: ['id', 'name', 'email', 'gender', 'role', 'foto']
        });
        res.json(response);

    } catch (error) {

        console.log(error.message);

    }
}

export const getUsersById = async (req, res) => {
    try {
        const response = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
}

export const searchEmail = async (req, res) => {
    try {

        const search = req.query.check_email || ""; // Search query

        // Fetch paginated records with search, include related Specifications and Customs
        const users = await User.findOne({
            where: {
                email: `${search}`,
            },
            order: [['id', 'DESC']], // Order by latest
        });

        res.status(200).json({
            response: users
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching Users" });
    }
};

// export const createUser = async (req, res) => {
//     const { name, email, password, confPassword } = req.body;
//     try {
//         await User.create(req.body);
//         res.status(201).json({ msg: "User Created" });

//     } catch (error) {

//         console.log(error.message);

//     }
// }



export const register = async (req, res) => {
    const { name, email, password, confPassword, gender } = req.body;

    if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak Cocok" });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);



    try {

        await User.create({
            name: name,
            email: email,
            password: hashPassword,
            gender: gender,
            role: "Guest",
        });
        res.json({ msg: "Register Berhasil" });

    } catch (error) {

        console.log(error);

    }
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

export const uploadPhoto = upload.single("foto");


export const editProfile = async (req, res) => {
    const { email } = req.body; // Mengambil email dari body request

    try {
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Tentukan URL gambar, gunakan gambar lama jika tidak ada file baru
        let imageUrl = user.foto;

        if (req.file) {
            // Jika ada file baru yang diunggah, gunakan file tersebut
            imageUrl = `http://localhost:5000/${imageFolder}/${req.file.filename}`;
        }

        // Update foto profil berdasarkan email
        const [affectedCount] = await User.update(
            { foto: imageUrl },
            { where: { email } }
        );

        if (affectedCount > 0) {
            // Ambil data terbaru setelah diupdate
            const updatedProfile = await User.findOne({ where: { email } });
            res.status(200).json({
                msg: "Profile updated successfully",
                profile: updatedProfile,
            });
        } else {
            res.status(400).json({ error: "Profile not updated." });
        }

    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ error: "Failed to update profile." });
    }
};


export const updateUser = async (req, res) => {
    try {
        await User.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "User Updated" });

    } catch (error) {

        console.log(error.message);

    }
}

export const deleteUser = async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "User Deleted" });

    } catch (error) {

        console.log(error.message);

    }
}

export const login = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({ msg: "Wrong Password" });
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const role = user[0].role;
        const accessToken = jwt.sign({ userId, name, email, role }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({ userId, name, email, role }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await User.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: false
        });
        res.json({ accessToken });

    } catch (error) {
        res.status(404).json({ msg: "Email Tidak Ditemukan" })
    }
}

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await User.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await User.update({ refreshToken: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

