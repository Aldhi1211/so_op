import express from "express";
import {
    getContacts,
    getContactById,
    createContact,
    markAsRead,
    deleteContact,
    getUnreadCount,
} from "../controllers/ContactController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get('/contacts', verifyToken, getContacts);
router.get('/contacts/unread', verifyToken, getUnreadCount);
router.get('/contacts/:id', verifyToken, getContactById);
router.post('/contacts', createContact);
router.patch('/contacts/:id/read', verifyToken, markAsRead);
router.delete('/contacts/:id', verifyToken, deleteContact);

export default router;
