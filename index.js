import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

dotenv.config();

import logger, { requestLogger } from './utils/logger.js';

// ── Import semua model agar Sequelize mengenali semua tabel saat sync ──
import './models/Supplier.js';
import './models/PurchaseOrder.js';
import './models/PurchaseOrderItem.js';
import './models/PenerimaanBarang.js';
import './models/PenerimaanBarangItem.js';

// ── Import routes ──
import UserRoute from './routes/UserRoute.js';
import StockRoute from './routes/StockRoute.js';
import GalleryRoute from './routes/GalleryRoute.js';
import TeamRoute from './routes/TeamRoute.js';
import BarangRoute from './routes/BarangRoute.js';
import ProductRoute from './routes/ProductRoute.js';
import ContactRoute from './routes/ContactRoute.js';
import SupplierRoute from './routes/SupplierRoute.js';
import PurchaseOrderRoute from './routes/PurchaseOrderRoute.js';
import PenerimaanBarangRoute from './routes/PenerimaanBarangRoute.js';
import sequelize from "./config/database.js";
import { imageFolder } from "./controllers/ProductController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Sync database (semua model sudah terdaftar di atas) ──
sequelize
    .authenticate()
    .then(() => {
        logger.info('Database connected');
        return sequelize.sync({ alter: true });
    })
    .then(() => logger.info('Database synchronized (all tables up to date)'))
    .catch((err) => logger.error(`Database error: ${err.message}`));

const app = express();
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if (
            !origin ||
            origin.startsWith('http://localhost') ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
app.use(express.json());

// ── Request logger (semua HTTP request dicatat ke logs/YYYY-MM-DD.log) ──
app.use(requestLogger);

// ── Routing ──
app.use(UserRoute);
app.use(StockRoute);
app.use(BarangRoute);
app.use(ProductRoute);
app.use(TeamRoute);
app.use(GalleryRoute);
app.use(ContactRoute);
app.use(SupplierRoute);
app.use(PurchaseOrderRoute);
app.use(PenerimaanBarangRoute);

app.use(`/${imageFolder}`, express.static(path.join(__dirname, imageFolder)));

// ── Global error handler ──
app.use((err, _req, res, _next) => {
    logger.error(`Unhandled: ${err.message}\n${err.stack}`);
    res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(5000, () => logger.info('Server running on port 5000'));
}

export default app;
