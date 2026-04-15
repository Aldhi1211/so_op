import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        timezone: '+07:00',
        logging: false,
    }
);



// Sinkronisasi database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synchronized');
    })
    .catch((error) => {
        console.error('Error synchronizing database:', error);
    });



export default sequelize;