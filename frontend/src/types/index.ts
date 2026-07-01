export interface Project {
  id: string;
  title: string;
  goal: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  deadline: string;
  availableDailyTime: number;
  currentSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLearningSpeed: 'slow' | 'medium' | 'fast';
  roadmap: string;
  estimatedDurationDays: number;
  overallDifficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  estimatedHours: number;
  deadline: string;
  isCompleted: boolean;
  notes: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  statusHistory: { action: string; timestamp: string }[];
  notified: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'overdue' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'mentor';
  message: string;
  createdAt: string;
  taskId?: string;
}

export interface DashboardAnalytics {
  activeGoalsCount: number;
  completedGoalsCount: number;
  completionRate: number;
  todayMissions: Task[];
  upcomingMissions: Task[];
  accomplishments: { id: string; title: string; description: string; difficulty: string; completedAt: string }[];
  completionTrends: { date: string; count: number }[];
  totalTasks: number;
  completedTasks: number;
}
