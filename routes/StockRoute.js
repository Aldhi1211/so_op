import express from "express";
import { AddStock, AddStockIn, AddStockOut, deleteStock, getStock, getStockIn, getStockOut, IssuedStock, searchStock, updateStock } from "../controllers/StockController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";


const router = express.Router();


router.get('/stock', verifyToken, getStock);
router.get('/stock/get_stock', searchStock);
router.get('/stockin', verifyToken, getStockIn);
router.get('/stockout', getStockOut);
router.post('/stockin', AddStockIn);
router.post('/stockout', AddStockOut);
router.post('/issuedstock', IssuedStock);
router.post('/stock', AddStock);
router.patch('/stock/:id', updateStock);
router.delete('/stock/:id', deleteStock);


export default router;
