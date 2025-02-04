import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Custom = db.define('custom', {
    id_product: { type: DataTypes.INTEGER },
    custom: { type: DataTypes.STRING }
}, {
    freezeTableName: true
});

export default Custom;

