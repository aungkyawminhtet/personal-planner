'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlannerStore } from '@/store/usePlannerStore';
import TaskChatDrawer from '@/components/TaskChatDrawer';
import {
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  Trash2,
  TrendingUp,
  Award,
  Clock,
  CheckSquare,
  Sparkles,
  RefreshCw,
  Target,
  ArrowRight,
  X,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    notifications,
    markNotificationsRead,
    scanOverdueMissions,
    getAnalytics,
    toggleTask,
    addTaskNotes,
    deleteProject,
  } = usePlannerStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotesTaskId, setExpandedNotesTaskId] = useState<string | null>(null);
  const [taskNotesInput, setTaskNotesInput] = useState('');
  const [activeDrawerTask, setActiveDrawerTask] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const data = getAnalytics();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const overdueMissions = notifications.filter((n) => n.type === 'overdue' && !n.isRead);

  const handleToggleTask = (taskId: string, projectId: string) => {
    toggleTask(taskId, projectId);
  };

  const handleSaveNotes = (taskId: string, projectId: string) => {
    addTaskNotes(taskId, projectId, taskNotesInput);
    setExpandedNotesTaskId(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!confirm('Delete this goal and all its missions?')) return;
    deleteProject(projectId);
  };

  const handleTriggerScan = () => {
    scanOverdueMissions();
  };

  // Empty state
  if (data.activeGoalsCount === 0 && data.completedGoalsCount === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-violet-200/20 blur-[100px] pointer-events-none" />
        <div className="text-center space-y-6 relative z-10 max-w-md">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center">
            <Target className="w-10 h-10 text-violet-500" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900">No Goals Yet</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Create your first learning goal and let AI build a personalized roadmap for you.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Your First Goal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-200/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/15 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-500" /> Dashboard
            </h1>
            <p className="text-zinc-400 text-sm mt-1 font-medium">
              Track your progress and manage your learning missions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markNotificationsRead();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  unreadCount > 0
                    ? 'bg-violet-50 border-violet-200 text-violet-600'
                    : 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-violet-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xl z-40 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                      Notifications
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-400 text-xs text-center py-4">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            n.type === 'overdue'
                              ? 'bg-red-50 border-red-100 text-red-700'
                              : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                          } ${!n.isRead ? 'border-l-4 border-l-violet-500' : ''}`}
                        >
                          {n.message}
                          <span className="block text-[10px] text-zinc-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleTriggerScan}
              className="p-3 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
              title="Scan for overdue tasks"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              href="/"
              className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Goal
            </Link>
          </div>
        </header>

        {/* Overdue alert */}
        {overdueMissions.length > 0 && (
          <section className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h2 className="text-red-700 font-bold text-sm">
                Overdue Missions ({overdueMissions.length})
              </h2>
              <p className="text-xs text-red-600">
                You have tasks past their deadline. Reschedule them or ask your AI Mentor to re-pace your roadmap.
              </p>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: <Clock className="w-6 h-6" />,
              label: 'Active Goals',
              value: data.activeGoalsCount,
              color: 'violet',
              bg: 'from-violet-50 to-indigo-50',
              border: 'border-violet-100',
              text: 'text-violet-600',
            },
            {
              icon: <Award className="w-6 h-6" />,
              label: 'Accomplished',
              value: data.completedGoalsCount,
              color: 'emerald',
              bg: 'from-emerald-50 to-teal-50',
              border: 'border-emerald-100',
              text: 'text-emerald-600',
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              label: 'Completion Rate',
              value: `${data.completionRate}%`,
              color: 'sky',
              bg: 'from-sky-50 to-blue-50',
              border: 'border-sky-100',
              text: 'text-sky-600',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.bg} p-5 rounded-2xl border ${stat.border} flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white ${stat.text} flex items-center justify-center shadow-sm`}>
                {stat.icon}
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-2xl font-black text-zinc-900 block mt-0.5">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Today's Missions + Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Missions */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-violet-500" /> Today's Missions
              </h2>
              {data.todayMissions.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-sm bg-zinc-50 border border-zinc-100 border-dashed rounded-2xl">
                  No missions scheduled for today. Take a rest or check upcoming steps!
                </div>
              ) : (
                <div className="space-y-2">
                  {data.todayMissions.map((task) => (
                    <div
                      key={task.id}
                      className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                        task.isCompleted
                          ? 'bg-zinc-50 border-zinc-100 opacity-60'
                          : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleToggleTask(task.id, task.projectId)}
                          className="mt-0.5 h-5 w-5 rounded-md border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-bold flex items-center gap-2 ${
                              task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-800'
                            }`}
                          >
                            {task.title}
                            {task.isCompleted && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
                                Done
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium block mt-0.5">
                            {task.projectTitle}
                          </span>
                          {task.notes && (
                            <div className="bg-zinc-50 border border-zinc-100 p-2 rounded-lg text-[11px] text-zinc-500 mt-2 font-mono">
                              {task.notes}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => {
                                setExpandedNotesTaskId(
                                  expandedNotesTaskId === task.id ? null : task.id
                                );
                                setTaskNotesInput(task.notes || '');
                              }}
                              className="text-[11px] text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer transition-colors"
                            >
                              {task.notes ? 'Edit Note' : '+ Note'}
                            </button>
                            <button
                              onClick={() => {
                                setActiveDrawerTask(task);
                                setIsDrawerOpen(true);
                              }}
                              className="text-[11px] text-violet-600 hover:text-violet-800 font-bold cursor-pointer transition-colors bg-violet-50 px-2 py-1 rounded-lg"
                            >
                              Study Help
                            </button>
                          </div>
                        </div>
                        <span className="text-xs bg-zinc-100 text-zinc-500 font-bold px-3 py-1 rounded-full shrink-0">
                          {task.estimatedHours}h
                        </span>
                      </div>
                      {expandedNotesTaskId === task.id && (
                        <div className="w-full bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-2">
                          <textarea
                            value={taskNotesInput}
                            onChange={(e) => setTaskNotesInput(e.target.value)}
                            className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 p-3 rounded-xl focus:outline-none focus:border-violet-400 resize-none h-16"
                            placeholder="Jot down notes..."
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSaveNotes(task.id, task.projectId)}
                              className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Completion Trends */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-500" /> Weekly Progress
              </h2>
              <div className="flex items-end justify-between gap-3 pt-4 h-40">
                {data.completionTrends.map((trend) => {
                  const maxVal = Math.max(
                    ...data.completionTrends.map((t) => t.count),
                    1
                  );
                  const heightPercent = Math.round((trend.count / maxVal) * 100);
                  return (
                    <div
                      key={trend.date}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <span className="text-xs font-bold text-zinc-600">
                        {trend.count}
                      </span>
                      <div className="w-full bg-zinc-50 h-28 rounded-xl relative overflow-hidden flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-violet-500 to-indigo-400 rounded-xl transition-all duration-700 ease-out"
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {trend.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Active Goals + Accomplishments */}
          <div className="space-y-6">
            {/* Active Goals */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                Active Paths
              </h2>
              {data.activeGoalsCount === 0 ? (
                <p className="text-zinc-400 text-xs text-center py-4">
                  Create a new goal to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const activeProjects = usePlannerStore.getState().projects.filter(
                      (p) => p.status === 'active'
                    );
                    return activeProjects.map((proj) => {
                      const projTasks = usePlannerStore.getState().tasks[proj.id] || [];
                      const completed = projTasks.filter((t) => t.isCompleted).length;
                      const total = projTasks.length;
                      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return (
                        <div
                          key={proj.id}
                          className="group bg-zinc-50 border border-zinc-100 p-4 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all"
                        >
                          <Link
                            href={`/project/${proj.id}`}
                            className="flex items-center justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-bold text-zinc-800 group-hover:text-violet-600 transition-colors truncate block">
                                {proj.title}
                              </span>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-violet-500 transition-colors ml-3" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="mt-2 text-[10px] text-zinc-400 hover:text-red-500 font-bold cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </section>

            {/* Accomplishments */}
            <section className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-violet-500" /> Accomplishments
              </h2>
              {data.accomplishments.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs border border-zinc-100 border-dashed rounded-2xl">
                  Complete your first goal to earn a badge!
                </div>
              ) : (
                <div className="space-y-3">
                  {data.accomplishments.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 text-lg">
                        🏆
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-emerald-800 truncate block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
                          Achieved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <TaskChatDrawer
        task={activeDrawerTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </main>
  );
}
