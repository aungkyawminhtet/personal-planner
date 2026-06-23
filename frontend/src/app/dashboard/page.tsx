'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardAnalytics } from '../actions/analyticsActions';
import { deleteProject, toggleTask, addTaskNotes } from '../actions/projectActions';
import { usePlannerStore } from '@/store/usePlannerStore';
import { 
  Plus, Bell, CheckCircle2, AlertCircle, Trash2, Calendar, 
  TrendingUp, Award, Clock, ChevronRight, CheckSquare, Sparkles, RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotesTaskId, setExpandedNotesTaskId] = useState<string | null>(null);
  const [taskNotesInput, setTaskNotesInput] = useState('');

  // Zustand Store
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markNotificationsRead, 
    scanOverdueMissions 
  } = usePlannerStore();

  const fetchAllData = async () => {
    try {
      const res = await getDashboardAnalytics();
      if (res) {
        setData(res);
      } else {
        setError('Failed to fetch dashboard metrics.');
      }
    } catch (err) {
      setError('An error occurred loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchNotifications();
  }, []);

  const handleToggleTask = async (taskId: string, projectId: string) => {
    setData((prev: any) => {
      if (!prev) return prev;
      const updatedToday = prev.todayMissions.map((t: any) => 
        t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      );
      let newlyCompleted = prev.completedTasks;
      const wasCompleted = prev.todayMissions.find((t: any) => t._id === taskId)?.isCompleted;
      if (wasCompleted) {
        newlyCompleted--;
      } else {
        newlyCompleted++;
      }
      return {
        ...prev,
        todayMissions: updatedToday,
        completedTasks: newlyCompleted,
        completionRate: prev.totalTasks > 0 ? Math.round((newlyCompleted / prev.totalTasks) * 100) : 0
      };
    });

    const res = await toggleTask(taskId, projectId);
    if (!res.success) {
      alert('Failed to update task: ' + res.error);
      fetchAllData();
    }
  };

  const handleSaveNotes = async (taskId: string, projectId: string) => {
    setData((prev: any) => {
      if (!prev) return prev;
      const updatedToday = prev.todayMissions.map((t: any) => 
        t._id === taskId ? { ...t, notes: taskNotesInput } : t
      );
      return {
        ...prev,
        todayMissions: updatedToday
      };
    });
    setExpandedNotesTaskId(null);

    const res = await addTaskNotes(taskId, projectId, taskNotesInput);
    if (!res.success) {
      alert('Failed to save task note: ' + res.error);
      fetchAllData();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this goal and all of its missions?')) return;
    
    const res = await deleteProject(projectId);
    if (res.success) {
      fetchAllData();
    } else {
      alert('Failed to delete goal: ' + res.error);
    }
  };

  const handleTriggerScan = async () => {
    setLoading(true);
    await scanOverdueMissions();
    await fetchAllData();
    setLoading(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-zinc-500 font-semibold text-sm">Synchronizing Planner...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="bg-white border border-zinc-200 p-8 rounded-3xl text-center max-w-sm shadow-xl">
          <h2 className="text-red-650 font-bold text-lg mb-2">Error</h2>
          <p className="text-zinc-500 text-sm mb-6">{error || 'Failed to load'}</p>
          <button onClick={fetchAllData} className="bg-violet-600 hover:bg-violet-550 text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition-all cursor-pointer">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const overdueMissions = notifications.filter(n => n.type === 'overdue' && !n.isRead);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-800 py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background glow blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-650" /> Mentor Dashboard
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5 font-medium">Welcome back! Review your active paths and missions.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markNotificationsRead();
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  unreadCount > 0 
                    ? 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-violet-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-85 bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xl z-30 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-400">Notifications</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-zinc-500 hover:text-zinc-900 text-xs cursor-pointer font-bold"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-400 text-xs text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n._id} 
                          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
                            n.type === 'overdue' 
                              ? 'bg-red-50 border-red-100 text-red-800' 
                              : 'bg-zinc-50 border-zinc-150 text-zinc-650'
                          } ${!n.isRead ? 'border-l-4 border-l-violet-600' : ''}`}
                        >
                          {n.message}
                          <span className="block text-[9px] text-zinc-400 font-semibold mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Run overdue scan button */}
            <button
              onClick={handleTriggerScan}
              className="p-3 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Trigger Scan for Overdue Tasks & Emails"
            >
              <RefreshCw className="w-4 h-4 text-zinc-500" /> Check Overdue
            </button>

            <Link 
              href="/" 
              className="bg-violet-600 hover:bg-violet-550 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-violet-600/10 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Goal
            </Link>
          </div>
        </header>

        {/* Alerts / Warnings Banner */}
        {overdueMissions.length > 0 && (
          <section className="bg-red-50 border border-red-150 rounded-3xl p-5 shadow-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h2 className="text-red-750 font-extrabold text-sm flex items-center gap-1.5">
                Overdue Missions Detected ({overdueMissions.length})
              </h2>
              <p className="text-xs text-red-650 leading-relaxed font-medium">
                You have pending goals with elapsed deadlines. An email summary report has been compiled. You can reschedule these tasks or ask your AI Mentor to re-pace your roadmap.
              </p>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-650 border border-violet-100 flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Active Goals</span>
              <span className="text-2xl font-black text-zinc-900 block mt-0.5">{data.activeGoalsCount}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-650 border border-emerald-100 flex items-center justify-center shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Accomplished</span>
              <span className="text-2xl font-black text-zinc-900 block mt-0.5">{data.completedGoalsCount}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-650 border border-sky-100 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Completion Rate</span>
              <span className="text-2xl font-black text-zinc-900 block mt-0.5">{data.completionRate}%</span>
            </div>
          </div>
        </section>

        {/* Dashboard Split Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Side - Checklist & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Missions */}
            <section className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-violet-650" /> Today's Missions
              </h2>

              {data.todayMissions.length === 0 ? (
                <div className="text-center py-8 text-zinc-450 text-xs bg-zinc-50 border border-zinc-200/60 border-dashed rounded-2xl">
                  No missions scheduled for today. Take a rest or inspect upcoming steps!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.todayMissions.map((task: any) => (
                    <div 
                      key={task._id} 
                      className={`flex flex-col gap-2.5 p-3.5 rounded-2xl border transition-all ${
                        task.isCompleted 
                          ? 'bg-zinc-50 border-zinc-200 opacity-60' 
                          : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <input 
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleToggleTask(task._id, task.projectId?._id || task.projectId)}
                          className="mt-0.5 h-4.5 w-4.5 rounded border-zinc-300 bg-white text-violet-650 focus:ring-violet-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${task.isCompleted ? 'text-zinc-400' : 'text-zinc-800'}`}>
                            {task.title}
                            {task.isCompleted && (
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                Completed
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-zinc-450 font-medium block truncate">
                            Goal: {task.projectId?.title || 'Unknown Project'}
                          </span>

                          {/* Notes Preview */}
                          {task.notes && (
                            <div className="bg-zinc-50 border border-zinc-150 p-2 rounded-xl text-[9px] text-zinc-550 mt-1.5 font-mono leading-normal">
                              <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[8px] mb-0.5">Note:</span>
                              {task.notes}
                            </div>
                          )}

                          {/* Note Action Trigger */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => {
                                setExpandedNotesTaskId(expandedNotesTaskId === task._id ? null : task._id);
                                setTaskNotesInput(task.notes || '');
                              }}
                              className="text-[9px] text-zinc-500 hover:text-zinc-900 font-extrabold flex items-center gap-0.5 cursor-pointer transition-colors"
                            >
                              📝 {task.notes ? 'Edit Note' : 'Add Note'}
                            </button>
                          </div>
                        </div>
                        <span className="text-[10px] bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full text-zinc-650 font-bold shrink-0">
                          {task.estimatedHours} hrs
                        </span>
                      </div>

                      {/* Expandable Notes Editor */}
                      {expandedNotesTaskId === task._id && (
                        <div className="w-full bg-zinc-50 p-3 rounded-2xl border border-zinc-200 space-y-2 mt-1">
                          <textarea
                            value={taskNotesInput}
                            onChange={(e) => setTaskNotesInput(e.target.value)}
                            className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 p-2.5 rounded-xl focus:outline-none focus:border-violet-500 resize-none h-14 shadow-xs"
                            placeholder="Jot down notes, links, or progress thoughts..."
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSaveNotes(task._id, task.projectId?._id || task.projectId)}
                              className="bg-violet-650 hover:bg-violet-555 text-white font-bold text-[9px] py-1.5 px-3.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Productivity Analytics charts */}
            <section className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-650" /> Productivity Analytics
              </h2>
              <div className="flex items-end justify-between gap-2.5 pt-4 h-36">
                {data.completionTrends.map((trend: any) => {
                  const maxVal = Math.max(...data.completionTrends.map((t: any) => t.count), 1);
                  const heightPercent = Math.round((trend.count / maxVal) * 100);
                  return (
                    <div key={trend.date} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full bg-zinc-50 h-24 rounded-lg relative overflow-hidden flex items-end">
                        <div 
                          className="w-full bg-linear-to-t from-violet-500 to-indigo-400 rounded-lg transition-all duration-500" 
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{trend.date}</span>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Right Side - Active Goals & Accomplishments */}
          <div className="space-y-6">
            
            {/* Active Goals List */}
            <section className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Active Paths</h2>
              
              {data.activeGoalsCount === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs">
                  Create a new study goal to get started!
                </div>
              ) : (
                <div className="space-y-3.5">
                  {data.todayMissions.reduce((acc: any[], item: any) => {
                    if (item.projectId && !acc.some(p => p._id === item.projectId._id)) {
                      acc.push(item.projectId);
                    }
                    return acc;
                  }, []).map((proj: any) => (
                    <div key={proj._id} className="group bg-zinc-50 border border-zinc-150 p-3 rounded-2xl flex items-center justify-between hover:border-zinc-250 transition-colors">
                      <Link href={`/project/${proj._id}`} className="flex-1 min-w-0 pr-2">
                        <span className="text-xs font-bold text-zinc-800 group-hover:text-violet-650 transition-colors truncate block">
                          {proj.title}
                        </span>
                        <span className="text-[9px] text-zinc-450 font-bold block uppercase tracking-wider">
                          View Roadmap →
                        </span>
                      </Link>
                      <button 
                        onClick={() => handleDeleteProject(proj._id)}
                        className="text-zinc-400 hover:text-red-650 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {data.todayMissions.length === 0 && (
                    <p className="text-zinc-455 text-xs italic text-center py-2">
                      Please enter a goal to plan.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Achievements Gallery */}
            <section className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-violet-650" /> Accomplishments
              </h2>

              {data.accomplishments.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-xs border border-zinc-150 border-dashed rounded-2xl">
                  Complete your first goal to earn your first accomplishment badge!
                </div>
              ) : (
                <div className="space-y-3.5">
                  {data.accomplishments.map((item: any) => (
                    <div key={item.id} className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                        🏆
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-emerald-800 block truncate leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[9px] text-zinc-450 font-medium block uppercase tracking-wider mt-0.5">
                          Achieved: {new Date(item.completedAt).toLocaleDateString()}
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
    </main>
  );
}
