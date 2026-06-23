import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const generatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      goal,
      description,
      deadline,
      availableDailyTime,
      currentSkillLevel,
      preferredLearningSpeed
    } = req.body;
    
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Missing user credentials' });
      return;
    }

    const mainGoal = goal || title;
    if (!mainGoal || !deadline) {
      res.status(400).json({ error: 'Goal title and deadline are required' });
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const now = new Date();
    const startDateStr = now.toISOString().split('T')[0];

    const prompt = `
      You are an expert personal mentor and project planner.
      The user wants to achieve this goal: "${mainGoal}".
      Context/Description: "${description || 'No additional details provided.'}"
      Project timeline starts today: ${startDateStr}.
      The final deadline is: ${deadline}.
      
      User configurations:
      - Available daily time: ${availableDailyTime || 2} hours
      - Current skill level: ${currentSkillLevel || 'beginner'}
      - Preferred learning speed: ${preferredLearningSpeed || 'medium'}

      Break this goal down into a logical sequence of step-by-step daily missions.
      Make sure to distribute the deadlines of these tasks chronologically from ${startDateStr} to ${deadline}.
      Acknowledge that they can spend at most ${availableDailyTime || 2} hours per day on it, so each day's estimated hours should not exceed this constraint.

      Return ONLY a valid JSON object matching the following structure:
      {
        "roadmap": "A high-level explanation of the plan milestones and learning strategy.",
        "estimatedDurationDays": 15,
        "overallDifficulty": "easy", // 'easy' or 'medium' or 'hard' based on goal and user skill level
        "tasks": [
          {
            "title": "Task title",
            "description": "Step-by-step task checklist and specific outcomes.",
            "estimatedHours": 1.5,
            "difficultyLevel": "easy", // 'easy', 'medium', or 'hard'
            "deadline": "YYYY-MM-DD" // Must be between ${startDateStr} and ${deadline} inclusive, ordered chronologically
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text();
    
    // Clean up markdown formatting if the model wraps the JSON
    aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedPlan = JSON.parse(aiResponseText);

    const newProject = await Project.create({
      userId,
      title: mainGoal,
      goal: mainGoal,
      description: description || '',
      deadline: new Date(deadline),
      availableDailyTime: availableDailyTime || 2,
      currentSkillLevel: currentSkillLevel || 'beginner',
      preferredLearningSpeed: preferredLearningSpeed || 'medium',
      roadmap: parsedPlan.roadmap || '',
      estimatedDurationDays: parsedPlan.estimatedDurationDays || 10,
      overallDifficulty: parsedPlan.overallDifficulty || 'medium'
    });

    const tasksToInsert = (parsedPlan.tasks || []).map((task: any) => ({
      projectId: newProject._id,
      title: task.title,
      description: task.description,
      estimatedHours: task.estimatedHours || 1,
      difficultyLevel: task.difficultyLevel || 'medium',
      deadline: new Date(task.deadline),
      statusHistory: [{ action: 'created', timestamp: new Date() }]
    }));

    const savedTasks = await Task.insertMany(tasksToInsert);

    res.status(201).json({ project: newProject, tasks: savedTasks });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: "Failed to generate plan" });
  }
};
