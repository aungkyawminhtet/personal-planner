import { Response } from 'express';
import Notification from '../models/Notification';
import Task from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const scanAndTriggerReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Find all projects belonging to user
    const projects = await Project.find({ userId });
    const projectIds = projects.map(p => p._id);

    const now = new Date();
    // Tasks overdue and not notified yet
    const overdueTasks = await Task.find({
      projectId: { $in: projectIds },
      deadline: { $lt: now },
      isCompleted: false,
      notified: false
    }).populate('projectId', 'title');

    const createdNotifications = [];

    for (const task of overdueTasks) {
      const message = `Mission "${task.title}" is overdue (deadline was ${task.deadline.toLocaleDateString()}). Please reschedule it or reduce its difficulty.`;
      
      // Save notification to DB
      const notification = await Notification.create({
        userId,
        taskId: task._id,
        message,
        type: 'overdue'
      });

      createdNotifications.push(notification);

      // Mark task as notified
      task.notified = true;
      await task.save();

      // Simulate sending email
      console.log(`
=========================================
[SIMULATED EMAIL DISPATCH]
To: ${user.email} (${user.name})
Subject: Action Required: Overdue Mission Alert!
Body:
Hello ${user.name},

Our AI system detected that you missed your target deadline for:
"${task.title}" in project "${(task.projectId as any).title}".

To stay on track, please visit your dashboard to:
1. Reschedule this mission
2. Ask your AI Mentor for guidance
3. Or select "Reduce Difficulty" to make it more achievable.

Stay focused!
- Personal Planner AI Mentor
=========================================
      `);
    }

    res.status(200).json({
      success: true,
      scannedCount: overdueTasks.length,
      notificationsCreated: createdNotifications
    });

  } catch (error: any) {
    console.error("Error triggering reminders:", error);
    res.status(500).json({ error: error.message });
  }
};
