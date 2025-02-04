import express from "express";
import { register, deleteUser, getUsers, getUsersById, updateUser, login, logout, searchEmail, editProfile, uploadPhoto } from "../controllers/UserController.js"
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";


const router = express.Router();

router.get('/users', verifyToken, getUsers, searchEmail);
router.get('/search', searchEmail);
router.get('/users/:id', getUsersById);
router.post('/users', register);
router.post('/users/profile', uploadPhoto, editProfile);
router.post('/login', login);
router.get('/token', refreshToken);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.delete('/logout', logout);


export default router;

