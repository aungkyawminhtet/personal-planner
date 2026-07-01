import { create } from 'zustand';
import type { Project, Task, Notification, ChatMessage } from '@/types';

interface PlannerState {
  projects: Project[];
  tasks: Record<string, Task[]>;
  notifications: Notification[];
  chatHistory: Record<string, ChatMessage[]>;
  taskChatHistory: Record<string, ChatMessage[]>;

  // Project actions
  addProject: (project: Project, tasks: Task[]) => void;
  getProject: (id: string) => Project | undefined;
  getProjectTasks: (projectId: string) => Task[];
  completeProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Task actions
  toggleTask: (taskId: string, projectId: string) => void;
  rescheduleTask: (taskId: string, projectId: string, deadline: string) => void;
  addTaskNotes: (taskId: string, projectId: string, notes: string) => void;
  updateTask: (taskId: string, projectId: string, updates: Partial<Task>) => void;
  getOverdueTasks: () => Task[];

  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationsRead: () => void;
  scanOverdueMissions: () => void;

  // Chat actions
  addChatMessage: (projectId: string, message: ChatMessage) => void;
  getChatHistory: (projectId: string) => ChatMessage[];
  addTaskChatMessage: (taskId: string, message: ChatMessage) => void;
  getTaskChatHistory: (taskId: string) => ChatMessage[];

  // Analytics
  getAnalytics: () => {
    activeGoalsCount: number;
    completedGoalsCount: number;
    completionRate: number;
    todayMissions: (Task & { projectTitle: string })[];
    upcomingMissions: (Task & { projectTitle: string })[];
    accomplishments: { id: string; title: string; description: string; difficulty: string; completedAt: string }[];
    completionTrends: { date: string; count: number }[];
    totalTasks: number;
    completedTasks: number;
  };
}

function generateId(): string {
  return crypto.randomUUID();
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  projects: [],
  tasks: {},
  notifications: [],
  chatHistory: {},
  taskChatHistory: {},

  addProject: (project, tasks) => {
    set((state) => ({
      projects: [...state.projects, project],
      tasks: { ...state.tasks, [project.id]: tasks },
    }));
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  getProjectTasks: (projectId) => {
    return get().tasks[projectId] || [];
  },

  completeProject: (id) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: 'completed' as const } : p
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[id];
      return {
        projects: state.projects.filter((p) => p.id !== id),
        tasks: newTasks,
      };
    });
  },

  toggleTask: (taskId, projectId) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      },
    }));
  },

  rescheduleTask: (taskId, projectId, deadline) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map((t) =>
          t.id === taskId
            ? {
                ...t,
                deadline,
                statusHistory: [
                  ...t.statusHistory,
                  { action: 'rescheduled', timestamp: new Date().toISOString() },
                ],
              }
            : t
        ),
      },
    }));
  },

  addTaskNotes: (taskId, projectId, notes) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, notes } : t
        ),
      },
    }));
  },

  updateTask: (taskId, projectId, updates) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map((t) =>
          t.id === taskId ? { ...t, ...updates } : t
        ),
      },
    }));
  },

  getOverdueTasks: () => {
    const { projects, tasks } = get();
    const overdue: Task[] = [];
    for (const project of projects) {
      for (const task of tasks[project.id] || []) {
        if (!task.isCompleted && isOverdue(task.deadline)) {
          overdue.push(task);
        }
      }
    }
    return overdue;
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  markNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  scanOverdueMissions: () => {
    const overdue = get().getOverdueTasks();
    if (overdue.length > 0) {
      const notification: Notification = {
        id: generateId(),
        message: `You have ${overdue.length} overdue mission(s). Consider rescheduling or asking your AI Mentor for help.`,
        type: 'overdue',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      get().addNotification(notification);
    }
  },

  addChatMessage: (projectId, message) => {
    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [projectId]: [...(state.chatHistory[projectId] || []), message],
      },
    }));
  },

  getChatHistory: (projectId) => {
    return get().chatHistory[projectId] || [];
  },

  addTaskChatMessage: (taskId, message) => {
    set((state) => ({
      taskChatHistory: {
        ...state.taskChatHistory,
        [taskId]: [...(state.taskChatHistory[taskId] || []), message],
      },
    }));
  },

  getTaskChatHistory: (taskId) => {
    return get().taskChatHistory[taskId] || [];
  },

  getAnalytics: () => {
    const { projects, tasks } = get();
    const active = projects.filter((p) => p.status === 'active');
    const completed = projects.filter((p) => p.status === 'completed');

    const allTasks: (Task & { projectTitle: string })[] = [];
    for (const project of projects) {
      for (const task of tasks[project.id] || []) {
        allTasks.push({ ...task, projectTitle: project.title });
      }
    }

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const todayMissions = allTasks.filter((t) => isToday(t.deadline) && !t.isCompleted);
    const upcomingMissions = allTasks
      .filter((t) => !t.isCompleted && !isToday(t.deadline) && !isOverdue(t.deadline))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 10);

    const accomplishments = completed.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      difficulty: p.overallDifficulty,
      completedAt: p.createdAt,
    }));

    // Completion trends: last 7 days
    const trends: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const count = allTasks.filter(
        (t) =>
          t.isCompleted &&
          t.statusHistory.some(
            (h) =>
              h.action === 'created' &&
              new Date(h.timestamp).toDateString() === d.toDateString()
          )
      ).length;
      trends.push({ date: dateStr, count });
    }

    return {
      activeGoalsCount: active.length,
      completedGoalsCount: completed.length,
      completionRate,
      todayMissions,
      upcomingMissions,
      accomplishments,
      completionTrends: trends,
      totalTasks,
      completedTasks,
    };
  },
}));
