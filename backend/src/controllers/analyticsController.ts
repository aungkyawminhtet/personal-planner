import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const projects = await Project.find({ userId });
    const projectIds = projects.map(p => p._id);

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    // Today's Missions
    const todayMissions = await Task.find({
      projectId: { $in: projectIds },
      deadline: { $gte: todayStart, $lte: todayEnd }
    }).populate('projectId', 'title');

    // Upcoming Missions (due tomorrow or later)
    const upcomingMissions = await Task.find({
      projectId: { $in: projectIds },
      deadline: { $gt: todayEnd },
      isCompleted: false
    }).sort({ deadline: 1 }).limit(10).populate('projectId', 'title');

    // Completed Missions count
    const totalMissions = await Task.countDocuments({ projectId: { $in: projectIds } });
    const completedMissionsCount = await Task.countDocuments({ projectId: { $in: projectIds }, isCompleted: true });

    // Completed Goals (Projects)
    const activeGoalsCount = projects.filter(p => p.status === 'active').length;
    const completedGoalsCount = projects.filter(p => p.status === 'completed').length;

    // Achievement History (List of completed goals)
    const accomplishments = projects
      .filter(p => p.status === 'completed')
      .map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        difficulty: p.overallDifficulty,
        completedAt: (p as any).updatedAt
      }));

    // Productivity Analytics (Tasks completed by date in last 7 days)
    const completedTasksLastWeek = await Task.find({
      projectId: { $in: projectIds },
      isCompleted: true,
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const completionTrends: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      completionTrends[dateStr] = 0;
    }

    completedTasksLastWeek.forEach(task => {
      const dateStr = new Date((task as any).updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (completionTrends[dateStr] !== undefined) {
        completionTrends[dateStr]++;
      }
    });

    res.status(200).json({
      activeGoalsCount,
      completedGoalsCount,
      completionRate: totalMissions > 0 ? Math.round((completedMissionsCount / totalMissions) * 100) : 0,
      todayMissions,
      upcomingMissions,
      accomplishments,
      completionTrends: Object.entries(completionTrends).map(([date, count]) => ({ date, count })),
      totalTasks: totalMissions,
      completedTasks: completedMissionsCount
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
