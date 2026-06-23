import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Project from '../models/Project';
import Task from '../models/Task';
import MentorAdvice from '../models/MentorAdvice';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const askMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!projectId || !message) {
      res.status(400).json({ error: 'Project ID and message are required' });
      return;
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const tasks = await Task.find({ projectId });
    const chatHistory = await MentorAdvice.find({ projectId, userId }).sort({ createdAt: 1 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Build context
    const completedTasks = tasks.filter(t => t.isCompleted);
    const incompleteTasks = tasks.filter(t => !t.isCompleted);
    
    let historyContext = chatHistory.map(chat => `${chat.role === 'user' ? 'User' : 'Mentor'}: ${chat.message}`).join('\n');

    const prompt = `
      You are an encouraging and highly skilled personal mentor.
      The user is working on the project: "${project.title}"
      Roadmap: "${project.roadmap}"
      Current Skill Level: ${project.currentSkillLevel}
      Available Daily Hours: ${project.availableDailyTime} hours/day
      Pacing / Learning Speed: ${project.preferredLearningSpeed}
      
      Progress report:
      - Completed Missions: ${completedTasks.length}/${tasks.length}
      - Remaining Missions: ${incompleteTasks.length}
      
      Here is the dialogue history:
      ${historyContext}
      
      User's new message: "${message}"
      
      Provide a helpful, motivational, and technical response. Guide them step-by-step or solve their concerns inline. Do not use markdown syntax in JSON fields, keep it direct.
    `;

    const result = await model.generateContent(prompt);
    const mentorReply = result.response.text().trim();

    // Log the messages
    await MentorAdvice.create({ userId, projectId, role: 'user', message });
    const savedAdvice = await MentorAdvice.create({ userId, projectId, role: 'mentor', message: mentorReply });

    res.status(200).json({ reply: mentorReply, chat: savedAdvice });
  } catch (error: any) {
    console.error("Error asking mentor:", error);
    res.status(500).json({ error: error.message || "Failed to get advice from mentor" });
  }
};

export const getMentorHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chatHistory = await MentorAdvice.find({ projectId, userId }).sort({ createdAt: 1 });
    res.status(200).json(chatHistory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeProgressAndAdjust = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const now = new Date();
    const overdueTasks = await Task.find({
      projectId,
      deadline: { $lt: now },
      isCompleted: false
    });

    if (overdueTasks.length === 0) {
      res.status(200).json({
        adjusted: false,
        message: "You are fully on track! Keep up the good work. No adjustments needed."
      });
      return;
    }

    // Adjust plans: redistribution of deadlines using Gemini
    const incompleteTasks = await Task.find({ projectId, isCompleted: false }).sort({ deadline: 1 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const tasksSummary = incompleteTasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      currentDeadline: t.deadline.toISOString().split('T')[0]
    }));

    const startDateStr = now.toISOString().split('T')[0];

    const prompt = `
      You are an AI Mentor adjusting a user's study/project plan.
      The user is falling behind. They have ${overdueTasks.length} overdue tasks out of ${incompleteTasks.length} remaining tasks.
      Project: "${project.title}"
      Available Hours: ${project.availableDailyTime} hours/day
      Final Project Deadline: ${project.deadline?.toISOString().split('T')[0]}
      
      Here are the remaining tasks:
      ${JSON.stringify(tasksSummary, null, 2)}

      Please redistribute the deadlines of these remaining tasks starting from today (${startDateStr}) up to the project deadline.
      Return ONLY a JSON object containing:
      - "message": A polite explanation from the AI Mentor explaining why and how the plan was adjusted (e.g. padding deadlines, grouping similar tasks).
      - "adjustments": A list of tasks with updated deadlines:
        [
          { "id": "task_id_string", "newDeadline": "YYYY-MM-DD" }
        ]
    `;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedAdjustments = JSON.parse(aiResponseText);

    // Apply adjustments
    const updatedTasks: any[] = [];
    for (const adj of parsedAdjustments.adjustments || []) {
      const task = await Task.findOneAndUpdate(
        { _id: adj.id, projectId },
        { 
          deadline: new Date(adj.newDeadline),
          $push: { statusHistory: { action: 'ai_adjusted', timestamp: new Date() } }
        },
        { new: true }
      );
      if (task) {
        updatedTasks.push(task);
      }
    }

    // Create Notification
    await Notification.create({
      userId,
      message: `AI Mentor adjusted ${overdueTasks.length} overdue tasks to balance your roadmap pacing.`,
      type: 'system'
    });

    // Store Mentor advice comment
    await MentorAdvice.create({
      userId,
      projectId,
      role: 'mentor',
      message: parsedAdjustments.message
    });

    res.status(200).json({
      adjusted: true,
      message: parsedAdjustments.message,
      updatedTasks
    });

  } catch (error: any) {
    console.error("Error adjusting progress:", error);
    res.status(500).json({ error: error.message || "Failed to adjust progress plan" });
  }
};
