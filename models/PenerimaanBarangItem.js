import { Sequelize } from "sequelize";
import db from "../config/database.js";
import PenerimaanBarang from "./PenerimaanBarang.js";
import PurchaseOrderItem from "./PurchaseOrderItem.js";
import Barang from "./Barang.js";

const PenerimaanBarangItem = db.define("penerimaan_barang_item", {
    id:                { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    id_grn:            { type: Sequelize.INTEGER, allowNull: false, references: { model: PenerimaanBarang, key: "id" } },
    id_po_item:        { type: Sequelize.INTEGER, references: { model: PurchaseOrderItem, key: "id" } },
    id_barang:         { type: Sequelize.INTEGER, allowNull: false, references: { model: Barang, key: "id" } },
    quantity_po:       { type: Sequelize.INTEGER, defaultValue: 0 },
    quantity_diterima: { type: Sequelize.INTEGER, allowNull: false },
    selisih:           { type: Sequelize.INTEGER, defaultValue: 0 },
    satuan:            { type: Sequelize.STRING },
    kondisi:           { type: Sequelize.STRING, defaultValue: "Baik" }, // Baik | Rusak Sebagian | Ditolak
    harga_satuan:      { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
}, { freezeTableName: true });

PenerimaanBarang.hasMany(PenerimaanBarangItem, { foreignKey: "id_grn", as: "items", onDelete: "CASCADE" });
PenerimaanBarangItem.belongsTo(PenerimaanBarang, { foreignKey: "id_grn", as: "grn" });

PenerimaanBarangItem.belongsTo(Barang, { foreignKey: "id_barang", as: "barang" });
Barang.hasMany(PenerimaanBarangItem, { foreignKey: "id_barang", as: "grn_items" });

PenerimaanBarangItem.belongsTo(PurchaseOrderItem, { foreignKey: "id_po_item", as: "po_item" });

export default PenerimaanBarangItem;
