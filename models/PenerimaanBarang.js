import { Sequelize } from "sequelize";
import db from "../config/database.js";
import PurchaseOrder from "./PurchaseOrder.js";

const PenerimaanBarang = db.define("penerimaan_barang", {
    id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_grn:      { type: Sequelize.STRING, unique: true },
    id_po:          { type: Sequelize.INTEGER, allowNull: false, references: { model: PurchaseOrder, key: "id" } },
    tanggal_terima: { type: Sequelize.DATEONLY, allowNull: false },
    no_surat_jalan: { type: Sequelize.STRING },
    no_invoice:     { type: Sequelize.STRING },
    diterima_oleh:  { type: Sequelize.STRING },
    gudang:         { type: Sequelize.STRING },
    catatan:        { type: Sequelize.TEXT },
    // selesai | partial | waiting | ditolak
    status:         { type: Sequelize.STRING, defaultValue: "waiting" },
    dibuat_oleh:    { type: Sequelize.STRING },
}, { freezeTableName: true });

PenerimaanBarang.belongsTo(PurchaseOrder, { foreignKey: "id_po", as: "po" });
PurchaseOrder.hasMany(PenerimaanBarang, { foreignKey: "id_po", as: "penerimaan" });

export default PenerimaanBarang;
