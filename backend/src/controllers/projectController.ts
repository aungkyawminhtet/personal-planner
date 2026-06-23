import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    
    // Enrich with task completion count
    const enrichedProjects = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      return {
        ...project.toJSON(),
        totalTasks,
        completedTasks
      };
    }));

    res.status(200).json(enrichedProjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const project = await Project.findOne({ _id: id, userId });
    if (!project) {
      res.status(404).json({ error: 'Project not found or access denied' });
      return;
    }

    const tasks = await Task.find({ projectId: project._id }).sort({ deadline: 1 });
    res.status(200).json({ project, tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId }, 
      { status: 'completed' }, 
      { new: true }
    );
    if (!project) {
      res.status(404).json({ error: 'Project not found or access denied' });
      return;
    }
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const project = await Project.findOneAndDelete({ _id: id, userId });
    if (!project) {
      res.status(404).json({ error: 'Project not found or access denied' });
      return;
    }

    await Task.deleteMany({ projectId: id });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
