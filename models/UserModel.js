import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const User = db.define('users', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    foto: { type: DataTypes.TEXT },
    role: { type: DataTypes.STRING },
    refresh_token: { type: DataTypes.TEXT },
}, {
    freezeTableName: true
});

export default User;

