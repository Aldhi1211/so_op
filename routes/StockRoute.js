import express from "express";
import { AddStockIn, AddStockOut, getCurrentStock, getStockIn, getStockOut } from "../controllers/StockController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get('/stock/current', verifyToken, getCurrentStock);
router.get('/stockin', verifyToken, getStockIn);
router.get('/stockout', verifyToken, getStockOut);
router.post('/stockin', verifyToken, AddStockIn);
router.post('/stockout', verifyToken, AddStockOut);

export default router;
