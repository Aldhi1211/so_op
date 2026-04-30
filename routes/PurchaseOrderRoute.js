import express from "express";
import {
    getPurchaseOrders,
    getPurchaseOrderById,
    getNextNomorPO,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
} from "../controllers/PurchaseOrderController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/purchase-orders",           verifyToken, getPurchaseOrders);
router.get("/purchase-orders/next-nomor",verifyToken, getNextNomorPO);
router.get("/purchase-orders/:id",       verifyToken, getPurchaseOrderById);
router.post("/purchase-orders",          verifyToken, createPurchaseOrder);
router.patch("/purchase-orders/:id",     verifyToken, updatePurchaseOrder);
router.delete("/purchase-orders/:id",    verifyToken, deletePurchaseOrder);

export default router;
