import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Gallery = db.define('gallery', {
    name: { type: DataTypes.STRING },
    foto: { type: DataTypes.TEXT }
}, {
    freezeTableName: true
});

export default Gallery;

