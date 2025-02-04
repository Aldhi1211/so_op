import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Teams = db.define('teams', {
    name: { type: DataTypes.STRING },
    jabatan: { type: DataTypes.STRING },
    foto: { type: DataTypes.TEXT },
    fb: { type: DataTypes.TEXT },
    linkedin: { type: DataTypes.TEXT },
    instagram: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT }
}, {
    freezeTableName: true
});

export default Teams;

