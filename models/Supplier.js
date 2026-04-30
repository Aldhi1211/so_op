import { Sequelize } from "sequelize";
import db from "../config/database.js";

const Supplier = db.define("supplier", {
    id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    kode:            { type: Sequelize.STRING },
    nama:            { type: Sequelize.STRING, allowNull: false },
    alamat:          { type: Sequelize.TEXT },
    telepon:         { type: Sequelize.STRING },
    email:           { type: Sequelize.STRING },
    contact_person:  { type: Sequelize.STRING },
    keterangan:      { type: Sequelize.TEXT },
}, { freezeTableName: true });

export default Supplier;
