import express from 'express';
import { generatePlan } from '../controllers/aiController';

import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/generate-plan', authMiddleware as any, generatePlan as any);

export default router;
