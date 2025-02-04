import express from "express";
import { AddCustom, AddProduct, AddSpecs, deleteCustom, deleteProduct, deleteSpecs, getCustom, getCustomById, getProduct, getProductById, getSpecs, getSpecsById, updateCustom, updateProduct, updateSpecs, uploadPhoto } from "../controllers/ProductController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";


const router = express.Router();


router.get('/product', getProduct);
router.get('/product/:id', getProductById);
router.post('/product', uploadPhoto, AddProduct);
router.patch('/product/:id', uploadPhoto, updateProduct);
router.delete('/product/:id', deleteProduct);

router.get('/specs', getSpecs);
router.get('/specs/:id', getSpecsById);
router.post('/specs', AddSpecs);
router.patch('/specs/:id', updateSpecs);
router.delete('/specs/:id', deleteSpecs);

router.get('/custom', getCustom);
router.get('/custom/:id', getCustomById);
router.post('/custom', AddCustom);
router.patch('/custom/:id', updateCustom);
router.delete('/custom/:id', deleteCustom);


export default router;
