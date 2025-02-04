import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // Untuk mendefinisikan __dirname
import cookieParser from "cookie-parser";

import UserRoute from './routes/UserRoute.js';
import StockRoute from './routes/StockRoute.js';
import GalleryRoute from './routes/GalleryRoute.js';
import TeamRoute from './routes/TeamRoute.js';
import BarangRoute from './routes/BarangRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import sequelize from "./config/database.js";
import { imageFolder } from "./controllers/ProductController.js";

dotenv.config();

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test koneksi database
sequelize
    .authenticate()
    .then(() => {
        console.log('Database connected...');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

const app = express();
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());

// Routing
app.use(UserRoute);
app.use(StockRoute);
app.use(BarangRoute);
app.use(ProductRoute);
app.use(TeamRoute);
app.use(GalleryRoute);

// Middleware untuk menyajikan folder statis
app.use(`/${imageFolder}`, express.static(path.join(__dirname, imageFolder)));

// Jalankan server
app.listen(5000, () => console.log('Server up and running...'));
