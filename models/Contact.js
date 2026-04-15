import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Contact = db.define('contacts', {
    nama: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    perusahaan: { type: DataTypes.STRING },
    pesan: { type: DataTypes.TEXT },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    freezeTableName: true
});

export default Contact;
