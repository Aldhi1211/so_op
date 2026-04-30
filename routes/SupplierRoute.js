import express from "express";
import { getSuppliers, getSupplierById, addSupplier, updateSupplier, deleteSupplier } from "../controllers/SupplierController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/suppliers",      verifyToken, getSuppliers);
router.get("/suppliers/:id",  verifyToken, getSupplierById);
router.post("/suppliers",     verifyToken, addSupplier);
router.patch("/suppliers/:id", verifyToken, updateSupplier);
router.put("/suppliers/:id",   verifyToken, updateSupplier);
router.delete("/suppliers/:id",verifyToken, deleteSupplier);

export default router;
