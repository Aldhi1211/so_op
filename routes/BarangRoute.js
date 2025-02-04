import express from "express";
import { AddBarang, deleteBarang, getBarang, getBarangById, updateBarang } from '../controllers/BarangController.js'
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";


const router = express.Router();


router.get('/barang', getBarang);
router.get('/barang/:id', getBarangById);
router.post('/barang', AddBarang);
router.patch('/barang/:id', updateBarang);
router.delete('/barang/:id', deleteBarang);

export default router;