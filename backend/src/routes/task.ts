import express from 'express';
import { 
  updateTask, 
  toggleTask, 
  getOverdueTasks, 
  rescheduleTask, 
  addTaskNotes, 
  reduceTaskDifficulty,
  getTaskChatHistory,
  askTaskAssistant
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware as any);

router.get('/tasks/overdue', getOverdueTasks);
router.put('/tasks/:id', updateTask);
router.patch('/tasks/:id/toggle', toggleTask);
router.patch('/tasks/:id/reschedule', rescheduleTask);
router.patch('/tasks/:id/notes', addTaskNotes);
router.patch('/tasks/:id/reduce-difficulty', reduceTaskDifficulty);
router.get('/tasks/:id/chat-history', getTaskChatHistory as any);
router.post('/tasks/:id/ask', askTaskAssistant as any);

export default router;
