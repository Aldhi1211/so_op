import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const Specs = db.define('specs', {
    id_product: { type: DataTypes.INTEGER },
    spesification: { type: DataTypes.STRING }
}, {
    freezeTableName: true
});

export default Specs;

