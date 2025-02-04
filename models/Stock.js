import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Barang from "./Barang.js";

const { DataTypes } = Sequelize;

const Stock = db.define('stock', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_barang: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
    satuan: { type: DataTypes.STRING },
}, {
    freezeTableName: true
});

Stock.belongsTo(Barang, { foreignKey: 'id_barang', as: 'barang' }); // Relasi dengan tabel Barang


export default Stock;

