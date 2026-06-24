import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Task from '../models/Task';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import MentorAdvice from '../models/MentorAdvice';

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, description, estimatedHours, deadline, difficultyLevel, notes } = req.body;

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = task.projectId as any;
    if (!project || project.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        estimatedHours, 
        deadline: deadline ? new Date(deadline) : undefined,
        difficultyLevel,
        notes
      },
      { new: true }
    );

    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = task.projectId as any;
    if (!project || project.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }

    task.isCompleted = !task.isCompleted;
    await task.save();

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOverdueTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projects = await Project.find({ userId });
    const projectIds = projects.map(p => p._id);

    const now = new Date();
    const tasks = await Task.find({
      projectId: { $in: projectIds },
      deadline: { $lt: now },
      isCompleted: false
    }).populate('projectId', 'title');

    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rescheduleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deadline } = req.body;
    const userId = req.user?.id;

    if (!deadline) {
      res.status(400).json({ error: 'Deadline is required' });
      return;
    }

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = task.projectId as any;
    if (!project || project.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }

    task.deadline = new Date(deadline);
    task.statusHistory.push({ action: 'rescheduled', timestamp: new Date() });
    await task.save();

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addTaskNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user?.id;

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = task.projectId as any;
    if (!project || project.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }

    task.notes = notes || '';
    await task.save();

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reduceTaskDifficulty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findById(id).populate('projectId');
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = task.projectId as any;
    if (!project || project.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an AI Mentor helping a user who finds this task too difficult:
      Project: "${project.title}"
      Task Title: "${task.title}"
      Task Description: "${task.description || 'No description'}"
      Current Estimated Hours: ${task.estimatedHours}
      Current Difficulty: ${task.difficultyLevel}

      Simplify this task. Rewrite it to make it more achievable and less intimidating.
      You can break it down, reduce scope, or recommend a simpler approach.
      Make sure to reduce the estimated hours if appropriate.

      Return ONLY a valid JSON object matching the following structure:
      {
        "title": "Simplified task title",
        "description": "Simplified explanation of what to do, listing small steps.",
        "estimatedHours": 1.0,
        "difficultyLevel": "easy" // Must be 'easy' or a difficulty level lower or equal to current difficulty
      }
    `;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedTask = JSON.parse(aiResponseText);

    task.title = parsedTask.title || task.title;
    task.description = parsedTask.description || task.description;
    task.estimatedHours = parsedTask.estimatedHours || task.estimatedHours;
    task.difficultyLevel = parsedTask.difficultyLevel || 'easy';
    task.statusHistory.push({ action: 'difficulty_reduced', timestamp: new Date() });
    
    await task.save();

    res.status(200).json(task);
  } catch (error: any) {
    console.error("Error reducing difficulty:", error);
    res.status(500).json({ error: error.message || "Failed to reduce task difficulty" });
  }
};

export const getTaskChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chatHistory = await MentorAdvice.find({ taskId: id, userId }).sort({ createdAt: 1 });
    res.status(200).json(chatHistory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const askTaskAssistant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { message, projectId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message || !projectId) {
      res.status(400).json({ error: 'Message and projectId are required' });
      return;
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const chatHistory = await MentorAdvice.find({ taskId: id, userId }).sort({ createdAt: 1 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    let historyContext = chatHistory.map((chat: any) => `${chat.role === 'user' ? 'User' : 'Assistant'}: ${chat.message}`).join('\n');

    const prompt = `
      You are an expert AI Study Assistant. Your role is to help the user complete their specific task: "${task.title}".
      This task is part of the project: "${project.title}".
      
      Task Context:
      - Description: ${task.description || 'No description provided.'}
      - Difficulty Level: ${task.difficultyLevel || 'medium'}
      - Estimated Duration: ${task.estimatedHours || 1} hours
      - Notes from User: ${task.notes || 'None'}
      - Status: ${task.isCompleted ? 'Completed' : 'In Progress'}
      
      Here is the dialogue history for this task:
      ${historyContext}
      
      User's new message/question about this task: "${message}"
      
      Provide highly specific, practical advice, step-by-step guidance, code skeletons, or conceptual explanations to help the user master and complete this exact task. Be direct, technical, encouraging, and clear. Do not use markdown syntax in JSON fields.
    `;

    const result = await model.generateContent(prompt);
    const assistantReply = result.response.text().trim();

    // Log the messages
    await MentorAdvice.create({ userId, projectId: projectId as any, taskId: id as any, role: 'user', message });
    const savedAdvice = await MentorAdvice.create({ userId, projectId: projectId as any, taskId: id as any, role: 'mentor', message: assistantReply });

    res.status(200).json({ reply: assistantReply, chat: savedAdvice });
  } catch (error: any) {
    console.error("Error in askTaskAssistant:", error);
    res.status(500).json({ error: error.message || "Failed to get advice from task assistant" });
  }
};
