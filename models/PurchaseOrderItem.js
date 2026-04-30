import { Sequelize } from "sequelize";
import db from "../config/database.js";
import PurchaseOrder from "./PurchaseOrder.js";
import Barang from "./Barang.js";

const PurchaseOrderItem = db.define("purchase_order_item", {
    id:            { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_po:         { type: Sequelize.INTEGER, allowNull: false, references: { model: PurchaseOrder, key: "id" } },
    id_barang:     { type: Sequelize.INTEGER, allowNull: false, references: { model: Barang, key: "id" } },
    quantity:      { type: Sequelize.INTEGER, allowNull: false },
    satuan:        { type: Sequelize.STRING },
    harga_satuan:  { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    subtotal:      { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
    // qty yang sudah diterima (diupdate saat penerimaan)
    qty_diterima:  { type: Sequelize.INTEGER, defaultValue: 0 },
}, { freezeTableName: true });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "id_po", as: "items", onDelete: "CASCADE" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "id_po", as: "po" });

PurchaseOrderItem.belongsTo(Barang, { foreignKey: "id_barang", as: "barang" });
Barang.hasMany(PurchaseOrderItem, { foreignKey: "id_barang", as: "po_items" });

export default PurchaseOrderItem;
