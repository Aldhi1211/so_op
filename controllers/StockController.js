import Barang from "../models/Barang.js";
import Stock from "../models/Stock.js";
import StockIn from "../models/StockIn.js";
import StockOut from "../models/StockOut.js";
import { Op, Sequelize } from "sequelize";

export const getCurrentStock = async (req, res) => {
    try {
        const stockInTotals = await StockIn.findAll({
            attributes: [
                'id_barang',
                'satuan',
                [Sequelize.fn('SUM', Sequelize.col('stock_in.quantity')), 'total_in']
            ],
            include: [{ model: Barang, as: 'barang', attributes: ['id', 'name'] }],
            group: ['stock_in.id_barang', 'stock_in.satuan', 'barang.id', 'barang.name']
        });

        const stockOutTotals = await StockOut.findAll({
            attributes: [
                'id_barang',
                'satuan',
                [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_out']
            ],
            group: ['id_barang', 'satuan'],
            raw: true
        });

        const outMap = {};
        stockOutTotals.forEach(item => {
            outMap[`${item.id_barang}-${item.satuan}`] = parseInt(item.total_out) || 0;
        });

        const result = stockInTotals.map(item => {
            const key = `${item.id_barang}-${item.satuan}`;
            const totalIn = parseInt(item.dataValues.total_in) || 0;
            const totalOut = outMap[key] || 0;
            return {
                id_barang: item.id_barang,
                barang: item.barang,
                satuan: item.satuan,
                total_in: totalIn,
                total_out: totalOut,
                current_stock: totalIn - totalOut
            };
        });

        res.status(200).json({ response: result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Error fetching current stock' });
    }
};

export const getStock = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await Stock.count({
            include: [
                {
                    model: Barang,
                    as: 'barang',

                },
            ],
            where: {
                [Op.or]: [
                    {
                        '$barang.name$': {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        satuan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                ],
            },
        });

        const totalPage = Math.ceil(totalRows / limit);

        // Fetch paginated records with search
        const response = await Stock.findAll({
            include: [
                {
                    model: Barang,
                    as: 'barang',
                    attributes: ['id', 'name'], // Select specific fields

                },
            ],
            where: {
                [Op.or]: [
                    {
                        '$barang.name$': {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        satuan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                ],
                id_barang: {
                    [Op.ne]: null,
                },
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']], // Order by latest
        });

        res.status(200).json({
            response,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {

        console.log(error.message);

    }
}

export const getStockById = async (req, res) => {
    try {
        const response = await Stock.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
}

export const se = async (req, res) => {
    try {
        const response = await Stock.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);

    } catch (error) {

        console.log(error.message);

    }
}

export const searchStock = async (req, res) => {

    try {
        const barang = req.query.barang || ""; // Search query
        const satuan = req.query.satuan || ""; // Search query
        const response = await Stock.findOne({
            where: {
                [Op.and]: [
                    {
                        id_barang: `${barang}`, // Search in Barang.name
                    },
                    {
                        satuan: `${satuan}`, // Search in submitted_by
                    },
                ],
            },
            order: [['id', 'DESC']], // Order by latest
        });

        res.status(200).json({
            response
        });
    } catch (error) {

        console.log(error.message);

    }
}


export const AddStock = async (req, res) => {
    const { id_barang, quantity, satuan } = req.body;

    try {
        // Pastikan 'quantity' adalah angka
        const parsedQuantity = parseInt(quantity, 10);

        // Cari stok berdasarkan id_barang dan satuan
        const stock = await Stock.findOne({
            where: { id_barang, satuan },
        });

        if (stock) {
            // Jika data dengan id_barang dan satuan yang sama ditemukan, update stok
            await Stock.update(
                { quantity: stock.quantity + parsedQuantity }, // Penjumlahan stok
                { where: { id_barang, satuan } }
            );
            return res.status(200).json({ msg: "Stock Updated Successfully (Added New Quantity)" });
        } else {
            // Jika data dengan id_barang dan satuan berbeda atau tidak ditemukan, buat entri baru
            await Stock.create({ id_barang, quantity: parsedQuantity, satuan });
            return res.status(201).json({ msg: "New Stock Created Successfully" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};




export const updateStock = async (req, res) => {
    try {
        await Stock.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Stock Updated" });

    } catch (error) {

        console.log(error.message);

    }
};

export const deleteStock = async (req, res) => {
    try {
        await Stock.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Stock Deleted" });

    } catch (error) {

        console.log(error.message);

    }
}

export const getStockIn = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await StockIn.count({
            include: [
                {
                    model: Barang,
                    as: 'barang',

                },
            ],
            where: {
                [Op.or]: [
                    {
                        '$barang.name$': {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        satuan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        submitted_by: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    Sequelize.where(
                        Sequelize.cast(Sequelize.col('stock_in.tanggal_beli'), 'varchar'),
                        { [Op.iLike]: `%${search}%` }
                    ),
                ],
            },
        });

        const totalPage = Math.ceil(totalRows / limit);

        // Fetch paginated records with search
        const data = await StockIn.findAll({
            include: [
                {
                    model: Barang,
                    as: 'barang',
                    attributes: ['id', 'name'], // Select specific fields

                },
            ],
            where: {
                [Op.or]: [
                    {
                        '$barang.name$': {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        satuan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        submitted_by: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    Sequelize.where(
                        Sequelize.cast(Sequelize.col('stock_in.tanggal_beli'), 'varchar'),
                        { [Op.iLike]: `%${search}%` }
                    ),
                ],
                id_barang: {
                    [Op.ne]: null,
                },
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']], // Order by latest
        });

        res.status(200).json({
            data,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



export const AddStockIn = async (req, res) => {
    const { id_barang, tanggal_beli, quantity, satuan, submitted_by } = req.body;
    try {
        await StockIn.create(req.body);
        res.status(201).json({ msg: "Stock Added" });

    } catch (error) {

        console.log(error.message);

    }
}


export const getStockOut = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 0; // Current page
        const limit = parseInt(req.query.limit) || 10; // Records per page
        const search = req.query.search_query || ""; // Search query
        const offset = limit * page;

        // Count total records with search
        const totalRows = await StockOut.count({
            include: [
                {
                    model: Barang,
                    as: 'barang',

                },
            ],
            where: {
                [Op.or]: [
                    {
                        '$barang.name$': {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        satuan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        submitted_by: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    Sequelize.where(
                        Sequelize.cast(Sequelize.col('stock_out.tanggal_keluar'), 'varchar'),
                        { [Op.iLike]: `%${search}%` }
                    ),
                ],
            },
        });

        const totalPage = Math.ceil(totalRows / limit);

        // Fetch paginated records with search
        const response = await StockOut.findAll({
            include: [
                {
                    model: Barang,
                    as: 'barang',
                    attributes: ['id', 'name'], // Select specific fields

                },
            ],
            where: {
                [Op.or]: [
                    {
                        '$barang.name$': {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        satuan: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        submitted_by: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    Sequelize.where(
                        Sequelize.cast(Sequelize.col('stock_out.tanggal_keluar'), 'varchar'),
                        { [Op.iLike]: `%${search}%` }
                    ),
                ],
                id_barang: {
                    [Op.ne]: null,
                },
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']], // Order by latest
        });

        res.status(200).json({
            response,
            totalRows,
            totalPage,
            page,
        });
    } catch (error) {

        console.log(error.message);

    }
}


export const AddStockOut = async (req, res) => {
    const { id_barang, tanggal_keluar, quantity, satuan, submitted_by } = req.body;
    try {
        await StockOut.create(req.body);
        res.status(201).json({ msg: "Stock Issued" });

    } catch (error) {

        console.log(error.message);

    }
}

export const IssuedStock = async (req, res) => {
    const { id_barang, quantity, satuan } = req.body;

    try {
        // Pastikan 'quantity' adalah angka
        const parsedQuantity = parseInt(quantity, 10);

        // Cari stok berdasarkan id_barang dan satuan
        const stock = await Stock.findOne({
            where: { id_barang, satuan },
        });

        if (stock) {
            // Jika data dengan id_barang dan satuan yang sama ditemukan, update stok
            if (stock.quantity >= quantity) {
                await Stock.update(
                    { quantity: stock.quantity - parsedQuantity }, // Penjumlahan stok
                    { where: { id_barang, satuan } }
                );
                return res.status(200).json({ msg: "Stock Issued Successfully (Issued Stock)" });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Quantity tidak mencukupi di stock saat ini.",
                });
            }


        } else {
            // Jika tidak ditemukan, kirim alert
            return res.status(404).json({
                success: false,
                message: "Data tidak ditemukan berdasarkan nama barang dan satuan.",
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};


