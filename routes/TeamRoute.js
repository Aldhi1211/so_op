import express from "express";
import { AddTeams, deleteTeam, getTeamById, getTeams, updateTeams, uploadPhoto } from '../controllers/TeamController.js'
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";


const router = express.Router();


router.get('/teams', getTeams);
router.get('/teams/:id', getTeamById);
router.post('/teams', uploadPhoto, AddTeams);
router.patch('/teams/:id', uploadPhoto, updateTeams);
router.delete('/teams/:id', deleteTeam);

export default router;