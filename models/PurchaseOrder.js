import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Supplier from "./Supplier.js";

const PurchaseOrder = db.define("purchase_order", {
    id:                 { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_po:           { type: Sequelize.STRING, unique: true },
    id_supplier:        { type: Sequelize.INTEGER, allowNull: false, references: { model: Supplier, key: "id" } },
    tanggal_po:         { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_diharapkan: { type: Sequelize.DATEONLY },
    gudang_tujuan:      { type: Sequelize.STRING },
    metode_pembayaran:  { type: Sequelize.STRING },
    mata_uang:          { type: Sequelize.STRING, defaultValue: "IDR" },
    catatan:            { type: Sequelize.TEXT },
    // draft | waiting | approved | partial | done | cancel
    status:             { type: Sequelize.STRING, defaultValue: "draft" },
    total_nilai:        { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    dibuat_oleh:        { type: Sequelize.STRING },
}, { freezeTableName: true });

PurchaseOrder.belongsTo(Supplier, { foreignKey: "id_supplier", as: "supplier" });
Supplier.hasMany(PurchaseOrder, { foreignKey: "id_supplier", as: "purchase_orders" });

export default PurchaseOrder;
