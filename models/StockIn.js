import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Barang from "./Barang.js";

const { DataTypes } = Sequelize;


const StockIn = db.define('stock_in', {
    id_barang: { type: DataTypes.INTEGER },
    tanggal_beli: { type: DataTypes.DATE },
    quantity: { type: DataTypes.INTEGER },
    satuan: { type: DataTypes.STRING },
    submitted_by: { type: DataTypes.STRING },
},
    {
        freezeTableName: true
    });

StockIn.belongsTo(Barang, { foreignKey: 'id_barang', as: 'barang' }); // Relasi dengan tabel Barang


export default StockIn;

// import { DataTypes, Model } from 'sequelize';

// class StockIn extends Model {
//     static initModel(sequelize) {
//         StockIn.init(
//             {
//                 id: {
//                     type: DataTypes.INTEGER,
//                     primaryKey: true,
//                     autoIncrement: true,
//                 },
//                 quantity: {
//                     type: DataTypes.INTEGER,
//                     allowNull: false,
//                 },
//                 satuan: {
//                     type: DataTypes.STRING,
//                     allowNull: false,
//                 },
//                 tanggal_beli: {
//                     type: DataTypes.DATEONLY,
//                     allowNull: false,
//                 },
//                 submitted_by: {
//                     type: DataTypes.STRING,
//                     allowNull: false,
//                 },
//                 id_barang: {
//                     type: DataTypes.INTEGER,
//                     allowNull: false,
//                 },
//             },
//             { sequelize, modelName: 'StockIn', tableName: 'stock_in' }
//         );
//     }
// }

// export default StockIn;
