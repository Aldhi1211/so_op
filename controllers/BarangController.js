import Barang from "../models/Barang.js";
import { Op } from "sequelize";


export const getBarang = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await Barang.count({
            where:
            {
                name: {
                    [Op.like]: `%${search}%`, // Search in Product.name
                },


            },
        });

        const totalPage = Math.ceil(totalRows / limit);

        // Fetch paginated records with search, include related Specifications and Customs
        const barang = await Barang.findAll({
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
            response: barang,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Error fetching Barang" });
    }
};

export const getBarangById = async (req, res) => {
    try {
        const response = await Barang.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
};

export const AddBarang = async (req, res) => {
    const { name } = req.body;
    try {
        await Barang.create(req.body);
        res.status(201).json({ msg: "Barang Added" });

    } catch (error) {

        console.log(error.message);

    }
};

export const updateBarang = async (req, res) => {
    try {
        await Barang.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Barang Updated" });

    } catch (error) {

        console.log(error.message);

    }
};

export const deleteBarang = async (req, res) => {
    try {
        await Barang.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Barang Deleted" });

    } catch (error) {

        console.log(error.message);

    }
};