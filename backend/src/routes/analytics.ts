import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/analytics', authMiddleware as any, getDashboardAnalytics as any);

export default router;
