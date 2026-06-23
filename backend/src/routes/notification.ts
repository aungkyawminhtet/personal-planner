import express from 'express';
import { getNotifications, markNotificationsAsRead, scanAndTriggerReminders } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/notifications', authMiddleware as any, getNotifications as any);
router.post('/notifications/read', authMiddleware as any, markNotificationsAsRead as any);
router.post('/notifications/check-overdue', authMiddleware as any, scanAndTriggerReminders as any);

export default router;
