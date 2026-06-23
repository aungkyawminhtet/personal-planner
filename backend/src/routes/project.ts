import express from 'express';
import { getProjects, getProjectById, completeProject, deleteProject } from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware as any);

router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);
router.patch('/projects/:id/complete', completeProject);
router.delete('/projects/:id', deleteProject);

export default router;
