import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Spesification from "../models/Spesification.js";
import Custom from "../models/Custom.js";

const { DataTypes } = Sequelize;

const Product = db.define('product', {
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    link_tokped: { type: DataTypes.TEXT },
    link_whatsapp: { type: DataTypes.TEXT },
    images: { type: DataTypes.TEXT },
}, {
    freezeTableName: true
});

// Di model Product
Product.hasMany(Spesification, { foreignKey: 'id_product' });
Product.hasMany(Custom, { foreignKey: 'id_product' });


export default Product;

