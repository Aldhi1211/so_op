import express from "express";
import {
    getPenerimaan,
    getPenerimaanById,
    getNextNomorGRN,
    createPenerimaan,
    updateStatusPenerimaan,
    deletePenerimaan,
} from "../controllers/PenerimaanBarangController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/penerimaan",            verifyToken, getPenerimaan);
router.get("/penerimaan/next-nomor", verifyToken, getNextNomorGRN);
router.get("/penerimaan/:id",        verifyToken, getPenerimaanById);
router.post("/penerimaan",           verifyToken, createPenerimaan);
router.patch("/penerimaan/:id",      verifyToken, updateStatusPenerimaan);
router.delete("/penerimaan/:id",     verifyToken, deletePenerimaan);

export default router;
