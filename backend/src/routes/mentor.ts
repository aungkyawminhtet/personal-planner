import express from 'express';
import { askMentor, getMentorHistory, analyzeProgressAndAdjust } from '../controllers/mentorController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/mentor/ask', authMiddleware as any, askMentor as any);
router.get('/mentor/history/:projectId', authMiddleware as any, getMentorHistory as any);
router.post('/mentor/analyze', authMiddleware as any, analyzeProgressAndAdjust as any);

export default router;
