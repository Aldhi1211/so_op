import express from "express";
import { AddGallery, deleteGallery, getGallery, getGalleryById, updateGallery, uploadPhoto } from '../controllers/GalleryController.js'
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";


const router = express.Router();


router.get('/gallery', getGallery);
router.get('/gallery/:id', getGalleryById);
router.post('/gallery', uploadPhoto, AddGallery);
router.patch('/gallery/:id', uploadPhoto, updateGallery);
router.delete('/gallery/:id', deleteGallery);

export default router;