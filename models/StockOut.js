import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Barang from "./Barang.js";

const { DataTypes } = Sequelize;

const StockOut = db.define('stock_out', {
    id_barang: { type: DataTypes.INTEGER },
    tanggal_keluar: { type: DataTypes.DATE },
    quantity: { type: DataTypes.INTEGER },
    satuan: { type: DataTypes.STRING },
    submitted_by: { type: DataTypes.STRING },
}, {
    freezeTableName: true
});

StockOut.belongsTo(Barang, { foreignKey: 'id_barang', as: 'barang' }); // Relasi dengan tabel Barang


export default StockOut;

