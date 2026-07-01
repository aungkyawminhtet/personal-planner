'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlannerStore } from '@/store/usePlannerStore';
import TaskChatDrawer from '@/components/TaskChatDrawer';
import {
  Sparkles,
  Calendar,
  Clock,
  Award,
  Activity,
  MessageSquare,
  Send,
  HelpCircle,
  Save,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Zap,
  RotateCcw,
  X,
  Database,
  BookOpen,
  Server,
  Code,
  Lock,
  Play,
} from 'lucide-react';

const getX = (idx: number) => {
  const mod = idx % 4;
  if (mod === 1) return 110;
  if (mod === 3) return 290;
  return 200;
};

const getLeftPercent = (idx: number) => {
  const mod = idx % 4;
  if (mod === 1) return '27.5%';
  if (mod === 3) return '72.5%';
  return '50%';
};

const getPathString = (limit: number, totalTasks: number) => {
  if (totalTasks === 0) return '';
  let d = `M ${getX(0)},70`;
  const end = Math.min(limit, totalTasks);
  for (let i = 0; i < end - 1; i++) {
    const x1 = getX(i);
    const y1 = i * 140 + 70;
    const x2 = getX(i + 1);
    const y2 = (i + 1) * 140 + 70;
    const y_mid = (y1 + y2) / 2;
    d += ` C ${x1},${y_mid} ${x2},${y_mid} ${x2},${y2}`;
  }
  return d;
};

const getPopoverClasses = (idx: number) => {
  const mod = idx % 4;
  if (mod === 1) {
    return "absolute z-30 w-76 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl text-left transition-all duration-200 animate-in fade-in zoom-in-95 top-22 left-1/2 -translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:left-22 sm:translate-x-0 sm:ml-2";
  }
  if (mod === 3) {
    return "absolute z-30 w-76 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl text-left transition-all duration-200 animate-in fade-in zoom-in-95 top-22 left-1/2 -translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:right-22 sm:left-auto sm:translate-x-0 sm:mr-2";
  }
  return "absolute z-30 w-76 bg-white border border-zinc-200 rounded-3xl p-5 shadow-2xl text-left transition-all duration-200 animate-in fade-in zoom-in-95 top-22 left-1/2 -translate-x-1/2 mt-2";
};

const getPointerClasses = (idx: number) => {
  const mod = idx % 4;
  if (mod === 1) {
    return "absolute w-3 h-3 bg-white border-zinc-200 border-l border-t top-[-6px] left-1/2 -translate-x-1/2 rotate-[45deg] sm:top-1/2 sm:-translate-y-1/2 sm:left-[-6px] sm:translate-x-0 sm:rotate-[-45deg]";
  }
  if (mod === 3) {
    return "absolute w-3 h-3 bg-white border-zinc-200 border-l border-t top-[-6px] left-1/2 -translate-x-1/2 rotate-[45deg] sm:top-1/2 sm:-translate-y-1/2 sm:right-[-6px] sm:left-auto sm:translate-x-0 sm:rotate-[135deg]";
  }
  return "absolute w-3 h-3 bg-white border-zinc-200 border-l border-t top-[-6px] left-1/2 -translate-x-1/2 rotate-[45deg]";
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    getProject,
    getProjectTasks,
    toggleTask,
    rescheduleTask,
    addTaskNotes,
    updateTask,
    completeProject,
    deleteProject,
    getChatHistory,
    addChatMessage,
  } = usePlannerStore();

  const project = getProject(projectId);
  const tasks = getProjectTasks(projectId);

  const [expandedNotesTaskId, setExpandedNotesTaskId] = useState<string | null>(null);
  const [expandedRescheduleTaskId, setExpandedRescheduleTaskId] = useState<string | null>(null);
  const [taskNotesInput, setTaskNotesInput] = useState('');
  const [taskRescheduleInput, setTaskRescheduleInput] = useState('');
  const [activeDrawerTask, setActiveDrawerTask] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [mentorError, setMentorError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [activePopoverTaskId, setActivePopoverTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    const history = getChatHistory(projectId);
    setChatMessages(history);
  }, [projectId]);

  if (!project) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-zinc-100 text-center max-w-sm shadow-xl space-y-4">
          <h2 className="text-zinc-900 font-bold text-lg">Project Not Found</h2>
          <p className="text-zinc-400 text-sm">
            This project doesn't exist or was cleared. Remember, data resets on refresh.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-500 text-white py-2.5 px-5 rounded-xl text-sm font-bold transition-all"
          >
            Create a New Goal
          </Link>
        </div>
      </main>
    );
  }

  const progressPercent =
    tasks.length > 0
      ? Math.round((tasks.filter((t) => t.isCompleted).length / tasks.length) * 100)
      : 0;

  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId, projectId);
  };

  const handleSaveNotes = (taskId: string) => {
    addTaskNotes(taskId, projectId, taskNotesInput);
    setExpandedNotesTaskId(null);
  };

  const handleReschedule = (taskId: string) => {
    if (!taskRescheduleInput) return;
    rescheduleTask(taskId, projectId, taskRescheduleInput);
    setExpandedRescheduleTaskId(null);
  };

  const handleReduceDifficulty = async (taskId: string) => {
    if (!confirm('Let AI simplify this mission?')) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setIsPending(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/reduce-difficulty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, project }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      updateTask(taskId, projectId, {
        title: data.title,
        description: data.description,
        estimatedHours: data.estimatedHours,
        difficultyLevel: data.difficultyLevel,
        statusHistory: [
          ...task.statusHistory,
          { action: 'difficulty_reduced', timestamp: new Date().toISOString() },
        ],
      });
    } catch (err: any) {
      alert('AI failed to simplify: ' + err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleCompleteProject = () => {
    if (!confirm('Mark this goal as completed?')) return;
    completeProject(projectId);
    router.push('/dashboard');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatLoading(true);
    setMentorError('');

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      message: userMsg,
      createdAt: new Date().toISOString(),
    };
    addChatMessage(projectId, userMessage);
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch('/api/mentor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: userMsg,
          project,
          tasks,
          chatHistory: [...chatMessages, userMessage],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const mentorMessage = {
        id: crypto.randomUUID(),
        role: 'mentor' as const,
        message: data.reply,
        createdAt: new Date().toISOString(),
      };
      addChatMessage(projectId, mentorMessage);
      setChatMessages((prev) => [...prev, mentorMessage]);
    } catch (err: any) {
      setMentorError('Mentor is offline. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleAnalyzePacing = async () => {
    setChatLoading(true);
    setMentorError('');

    try {
      const res = await fetch('/api/mentor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, project, tasks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const mentorMessage = {
        id: crypto.randomUUID(),
        role: 'mentor' as const,
        message: data.adjusted
          ? `Pacing analysis complete: ${data.message}`
          : data.message || 'Everything is on track!',
        createdAt: new Date().toISOString(),
      };
      addChatMessage(projectId, mentorMessage);
      setChatMessages((prev) => [...prev, mentorMessage]);

      // Apply deadline adjustments
      if (data.adjusted && data.adjustments) {
        for (const adj of data.adjustments) {
          const task = tasks.find((t) => t.id === adj.id);
          if (task) {
            rescheduleTask(adj.id, projectId, adj.newDeadline);
          }
        }
      }
    } catch (err: any) {
      setMentorError('Failed to analyze pacing.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-200/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/15 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          {project.status !== 'completed' && (
            <button
              onClick={handleCompleteProject}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Complete
            </button>
          )}
        </div>

        {/* Project Header */}
        <div className="bg-white/70 backdrop-blur-xl border border-zinc-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                {project.title}
              </h1>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold py-2 px-4 rounded-full shrink-0 uppercase tracking-wider ${
                project.status === 'completed'
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                  : 'bg-violet-50 border border-violet-100 text-violet-600'
              }`}
            >
              {project.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>

          <hr className="border-zinc-100" />

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Activity className="w-4 h-4" />, label: 'Speed', value: project.preferredLearningSpeed },
              { icon: <Award className="w-4 h-4" />, label: 'Skill', value: project.currentSkillLevel },
              { icon: <HelpCircle className="w-4 h-4" />, label: 'Difficulty', value: project.overallDifficulty },
              { icon: <Calendar className="w-4 h-4" />, label: 'Deadline', value: project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A' },
            ].map((m) => (
              <div key={m.label} className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  {m.label}
                </span>
                <span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5">
                  <span className="text-violet-500">{m.icon}</span>
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-zinc-500">
              <span className="font-medium">Progress</span>
              <span className="font-bold text-zinc-800">
                {progressPercent}% ({tasks.filter((t) => t.isCompleted).length}/{tasks.length})
              </span>
            </div>
            <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Roadmap */}
          {project.roadmap && (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-violet-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI Roadmap
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{project.roadmap}</p>
            </div>
          )}
        </div>

        {/* Tasks + Mentor Chat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks Block */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* View Mode Toggle Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-150 p-4 rounded-2xl shadow-xs">
              <div>
                <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-500" /> Missions Roadmap
                </h2>
                <p className="text-zinc-500 text-xs mt-0.5">Toggle between map layout and details checklist</p>
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setViewMode('map')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  🗺️ Map Path
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  📋 Checklist
                </button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <div className="bg-zinc-50/20 border border-zinc-150 rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col items-center relative overflow-hidden">
                
                {tasks.length === 0 ? (
                  <div className="text-center py-16 text-zinc-400 text-sm relative z-10">
                    No missions generated for this project.
                  </div>
                ) : (
                  (() => {
                    const containerHeight = tasks.length * 140;
                    const firstIncompleteIndex = tasks.findIndex(t => !t.isCompleted);
                    
                    return (
                      <div 
                        className="relative w-full max-w-sm sm:max-w-md mx-auto py-8"
                        style={{ height: `${containerHeight}px` }}
                      >
                        {/* SVG Winding Curved Pathway */}
                        <svg 
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ height: `${containerHeight}px` }}
                          viewBox={`0 0 400 ${containerHeight}`}
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="road-completed" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                          </defs>

                          {/* Gray base path */}
                          <path
                            d={getPathString(tasks.length, tasks.length)}
                            stroke="#e4e4e7"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Colored progress path */}
                          {firstIncompleteIndex !== 0 && (
                            <path
                              d={getPathString(firstIncompleteIndex === -1 ? tasks.length : firstIncompleteIndex, tasks.length)}
                              stroke="url(#road-completed)"
                              strokeWidth="10"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="transition-all duration-1000 ease-in-out"
                            />
                          )}
                        </svg>

                        {/* Absolute Positioned Circular Milestones */}
                        {tasks.map((task, index) => {
                          const isOverdue = new Date(task.deadline) < new Date() && !task.isCompleted;
                          const showNotes = expandedNotesTaskId === task.id;
                          const showReschedule = expandedRescheduleTaskId === task.id;
                          const isLocked = firstIncompleteIndex !== -1 && index > firstIncompleteIndex;
                          
                          const leftPercent = getLeftPercent(index);
                          const topPx = index * 140 + 70;
                          const isActivePopover = activePopoverTaskId === task.id;

                          const getTaskIcon = (title: string) => {
                            const t = title.toLowerCase();
                            if (t.includes('code') || t.includes('implement') || t.includes('build') || t.includes('write') || t.includes('develop') || t.includes('programming') || t.includes('javascript') || t.includes('typescript') || t.includes('react') || t.includes('next.js')) {
                              return <Code className="w-5 h-5" />;
                            }
                            if (t.includes('database') || t.includes('mongo') || t.includes('sql') || t.includes('schema') || t.includes('model') || t.includes('data')) {
                              return <Database className="w-5 h-5" />;
                            }
                            if (t.includes('test') || t.includes('verify') || t.includes('check') || t.includes('lint') || t.includes('spec') || t.includes('debug')) {
                              return <CheckCircle2 className="w-5 h-5" />;
                            }
                            if (t.includes('deploy') || t.includes('setup') || t.includes('install') || t.includes('configure') || t.includes('server') || t.includes('env') || t.includes('hosting')) {
                              return <Server className="w-5 h-5" />;
                            }
                            if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('css') || t.includes('style') || t.includes('theme') || t.includes('layout')) {
                              return <Sparkles className="w-5 h-5" />;
                            }
                            if (t.includes('learn') || t.includes('read') || t.includes('study') || t.includes('understand') || t.includes('research') || t.includes('course') || t.includes('watch') || t.includes('docs')) {
                              return <BookOpen className="w-5 h-5" />;
                            }
                            return <Award className="w-5 h-5" />;
                          };

                          return (
                            <div 
                              key={task.id} 
                              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                                isActivePopover ? 'z-[40]' : 'z-10'
                              }`}
                              style={{ left: leftPercent, top: `${topPx}px` }}
                            >
                              {/* Step circle milestone */}
                              <button
                                onClick={() => {
                                  if (activePopoverTaskId === task.id) {
                                    setActivePopoverTaskId(null);
                                  } else {
                                    setActivePopoverTaskId(task.id);
                                    setExpandedNotesTaskId(null);
                                    setExpandedRescheduleTaskId(null);
                                  }
                                }}
                                className={`w-14 h-14 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all duration-300 relative select-none hover:scale-115 ${
                                  task.isCompleted
                                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                    : isLocked
                                      ? 'bg-zinc-200 border-zinc-300 text-zinc-400 cursor-not-allowed shadow-inner'
                                      : 'bg-violet-600 border-violet-700 text-white shadow-lg shadow-violet-600/30 ring-4 ring-violet-200/80 animate-pulse'
                                }`}
                              >
                                {task.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : isLocked ? (
                                  <Lock className="w-4.5 h-4.5 text-zinc-450" />
                                ) : (
                                  getTaskIcon(task.title)
                                )}

                                {!task.isCompleted && !isLocked && (
                                  <span className="absolute -top-1 -right-1 bg-violet-600 border border-white text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs">
                                    ⭐
                                  </span>
                                )}
                              </button>

                              {/* Index label below */}
                              <span className="absolute left-1/2 -translate-x-1/2 top-15 text-[8px] font-extrabold uppercase text-zinc-400 tracking-wider whitespace-nowrap bg-white/90 px-1.5 py-0.5 rounded-md border border-zinc-150">
                                Step {index + 1}
                              </span>

                              {/* Speech Bubble Popover */}
                              {isActivePopover && (
                                <div 
                                  className={getPopoverClasses(index)}
                                  style={{ minWidth: '280px' }}
                                >
                                  {/* Pointer arrow */}
                                  <div className={getPointerClasses(index)} />

                                  {/* Close X */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActivePopoverTaskId(null);
                                    }}
                                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 hover:bg-zinc-100 rounded-xl cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>

                                  {!showNotes && !showReschedule ? (
                                    <div className="space-y-3.5 relative z-10">
                                      <div>
                                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-widest ${
                                          task.isCompleted 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : isLocked
                                              ? 'bg-zinc-100 border-zinc-200 text-zinc-455'
                                              : 'bg-violet-50 border-violet-100 text-violet-655 ring-2 ring-violet-100/50'
                                        }`}>
                                          {task.isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Active Mission'}
                                        </span>
                                        <h4 className="font-extrabold text-zinc-900 text-sm mt-2 leading-snug">{task.title}</h4>
                                      </div>

                                      {task.description && (
                                        <p className="text-zinc-550 text-xs leading-relaxed">{task.description}</p>
                                      )}

                                      {task.notes && (
                                        <div className="bg-zinc-55/50 border border-zinc-150 p-2.5 rounded-xl text-[10px] text-zinc-550 leading-normal font-mono">
                                          <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[8px] mb-0.5">Notes:</span>
                                          {task.notes}
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500 bg-zinc-50/50 p-2.5 rounded-2xl border border-zinc-150">
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-zinc-455" />
                                          <span>{task.estimatedHours} hrs</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <Award className="w-3.5 h-3.5 text-zinc-455" />
                                          <span className="uppercase">{task.difficultyLevel}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1.5 pt-1.5 border-t border-zinc-150">
                                          <Calendar className="w-3.5 h-3.5 text-zinc-455" />
                                          <span>Due: {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                      </div>

                                      <div className="space-y-2 pt-2 border-t border-zinc-100">
                                        {isLocked ? (
                                          <button 
                                            disabled 
                                            className="w-full bg-zinc-100 text-zinc-400 border border-zinc-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                                          >
                                            <Lock className="w-3.5 h-3.5" /> Complete previous steps
                                          </button>
                                        ) : (
                                          <button 
                                            onClick={() => {
                                              handleToggleTask(task.id);
                                              setActivePopoverTaskId(null);
                                            }}
                                            className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                              task.isCompleted
                                                ? 'bg-zinc-105 hover:bg-zinc-205 text-zinc-655 border border-zinc-200'
                                                : 'bg-emerald-600 hover:bg-emerald-555 text-white shadow-md shadow-emerald-600/10'
                                            }`}
                                          >
                                            {task.isCompleted ? (
                                              <>
                                                <RotateCcw className="w-3.5 h-3.5" /> Reset Progress
                                              </>
                                            ) : (
                                              <>
                                                <Play className="w-3.5 h-3.5" /> Complete Mission
                                              </>
                                            )}
                                          </button>
                                        )}

                                        <div className="grid grid-cols-2 gap-2">
                                          <button
                                            onClick={() => {
                                              setActiveDrawerTask(task);
                                              setIsDrawerOpen(true);
                                              setActivePopoverTaskId(null);
                                            }}
                                            className="bg-violet-50 hover:bg-violet-100 text-violet-655 border border-violet-100 text-[10px] font-extrabold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                          >
                                            🎓 Study Help
                                          </button>

                                          {!task.isCompleted && task.difficultyLevel !== 'easy' ? (
                                            <button
                                              onClick={() => {
                                                handleReduceDifficulty(task.id);
                                                setActivePopoverTaskId(null);
                                              }}
                                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-150 text-[10px] font-extrabold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                            >
                                              ⚡ Simplify
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setExpandedNotesTaskId(task.id);
                                                setTaskNotesInput(task.notes || '');
                                              }}
                                              className="bg-zinc-50 hover:bg-zinc-100 text-zinc-655 border border-zinc-200 text-[10px] font-extrabold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                            >
                                              📝 Add Note
                                            </button>
                                          )}
                                        </div>

                                        {!task.isCompleted && (
                                          <button
                                            onClick={() => {
                                              setExpandedRescheduleTaskId(task.id);
                                              setTaskRescheduleInput(new Date(task.deadline).toISOString().split('T')[0]);
                                            }}
                                            className="w-full bg-zinc-55 hover:bg-zinc-105 text-zinc-550 border border-zinc-200 text-[10px] font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                          >
                                            📅 Reschedule Date
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : null}

                                  {showNotes && (
                                    <div className="space-y-3 pt-2">
                                      <h4 className="font-extrabold text-zinc-955 text-xs uppercase tracking-wider">Add Task Note</h4>
                                      <textarea
                                        value={taskNotesInput}
                                        onChange={(e) => setTaskNotesInput(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-2.5 rounded-xl focus:outline-none focus:border-violet-500 resize-none h-20 shadow-inner"
                                        placeholder="Type notes, references, or links..."
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => setExpandedNotesTaskId(null)}
                                          className="text-[10px] font-bold text-zinc-500 px-3 py-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleSaveNotes(task.id);
                                            setExpandedNotesTaskId(null);
                                            setActivePopoverTaskId(task.id);
                                          }}
                                          className="bg-violet-600 hover:bg-violet-555 text-white font-bold text-[10px] py-1.5 px-3.5 rounded-lg cursor-pointer"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {showReschedule && (
                                    <div className="space-y-3 pt-2">
                                      <h4 className="font-extrabold text-zinc-955 text-xs uppercase tracking-wider">Reschedule Deadline</h4>
                                      <input
                                        type="date"
                                        value={taskRescheduleInput}
                                        onChange={(e) => setTaskRescheduleInput(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-2.5 rounded-xl focus:outline-none focus:border-violet-500 cursor-pointer shadow-inner"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => setExpandedRescheduleTaskId(null)}
                                          className="text-[10px] font-bold text-zinc-500 px-3 py-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleReschedule(task.id);
                                            setExpandedRescheduleTaskId(null);
                                            setActivePopoverTaskId(task.id);
                                          }}
                                          className="bg-violet-600 hover:bg-violet-555 text-white font-bold text-[10px] py-1.5 px-3.5 rounded-lg cursor-pointer"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              /* Traditional List View Mode (Optimized & Verified) */
              <div className="space-y-3 w-full">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm">
                    No missions generated.
                  </div>
                ) : (
                  tasks.map((task) => {
                    const isOverdue = new Date(task.deadline) < new Date() && !task.isCompleted;
                    const showNotes = expandedNotesTaskId === task.id;
                    const showReschedule = expandedRescheduleTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white border rounded-2xl p-5 transition-all duration-200 ${
                          task.isCompleted
                            ? 'border-emerald-100 bg-emerald-50/10'
                            : isOverdue
                              ? 'border-red-200 bg-red-50/30'
                              : 'border-zinc-150 hover:border-zinc-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => handleToggleTask(task.id)}
                            className="mt-1 h-5 w-5 rounded-md border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-655"
                          />
                          <div className="flex-1 space-y-2 min-w-0">
                            {/* Title + Meta */}
                            <div className="flex justify-between items-start gap-3">
                              <h3
                                className={`font-bold text-sm leading-snug ${
                                  task.isCompleted ? 'text-zinc-500' : 'text-zinc-800'
                                }`}
                              >
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] bg-zinc-50 border border-zinc-100 text-zinc-500 font-bold px-2.5 py-0.5 rounded-full">
                                  {task.estimatedHours}h
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                                    task.difficultyLevel === 'easy'
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                      : task.difficultyLevel === 'hard'
                                        ? 'bg-red-50 border-red-100 text-red-500'
                                        : 'bg-amber-50 border-amber-100 text-amber-605 font-bold'
                                  }`}
                                >
                                  {task.difficultyLevel}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            {task.description && (
                              <p
                                className={`text-xs leading-relaxed ${
                                  task.isCompleted ? 'text-zinc-400' : 'text-zinc-550'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}

                            {/* Notes */}
                            {task.notes && (
                              <div className="bg-zinc-50/50 border border-zinc-150 p-2.5 rounded-xl text-[10px] text-zinc-550 font-mono">
                                <span className="font-bold text-zinc-400 text-[8px] uppercase tracking-wider block mb-0.5">
                                  Notes
                                </span>
                                {task.notes}
                              </div>
                            )}

                            {/* Actions bar */}
                            <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-bold text-zinc-455">
                              <span
                                className={`py-0.5 px-2 rounded border ${
                                  task.isCompleted
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 font-extrabold'
                                    : isOverdue
                                      ? 'bg-red-50 text-red-550 border-red-100 font-extrabold animate-pulse'
                                      : 'bg-zinc-50 border-zinc-150 text-zinc-500'
                                }`}
                              >
                                {isOverdue ? 'Overdue' : 'Due'}:{' '}
                                {new Date(task.deadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>

                              {!task.isCompleted && (
                                <button
                                  onClick={() => {
                                    setExpandedRescheduleTaskId(showReschedule ? null : task.id);
                                    setExpandedNotesTaskId(null);
                                    setTaskRescheduleInput(
                                      new Date(task.deadline).toISOString().split('T')[0]
                                    );
                                  }}
                                  className="text-zinc-450 hover:text-zinc-700 cursor-pointer transition-colors"
                                >
                                  📅 Reschedule
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setExpandedNotesTaskId(showNotes ? null : task.id);
                                  setExpandedRescheduleTaskId(null);
                                  setTaskNotesInput(task.notes || '');
                                }}
                                className="text-zinc-455 hover:text-zinc-750 cursor-pointer transition-colors"
                              >
                                {showNotes ? 'Cancel' : task.notes ? '📝 Edit Notes' : '📝 + Note'}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveDrawerTask(task);
                                  setIsDrawerOpen(true);
                                }}
                                className="text-violet-600 hover:text-violet-800 transition-colors bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100 text-[10px]"
                              >
                                🎓 Study Help
                              </button>

                              {!task.isCompleted && task.difficultyLevel !== 'easy' && (
                                <button
                                  onClick={() => handleReduceDifficulty(task.id)}
                                  className="text-violet-500 hover:text-violet-700 transition-colors flex items-center gap-0.5"
                                >
                                  <Sparkles className="w-3 h-3" /> Simplify
                                </button>
                              )}
                            </div>

                            {/* Expandable: Notes */}
                            {showNotes && (
                              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 space-y-2 mt-2">
                                <textarea
                                  value={taskNotesInput}
                                  onChange={(e) => setTaskNotesInput(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 p-2.5 rounded-lg focus:outline-none focus:border-violet-400 resize-none h-16 shadow-inner"
                                  placeholder="Jot down notes..."
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleSaveNotes(task.id)}
                                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Save className="w-3 h-3" /> Save Note
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Expandable: Reschedule */}
                            {showReschedule && (
                              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 space-y-2 mt-2 flex items-center gap-3">
                                <div className="flex-1">
                                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                    New Deadline
                                  </label>
                                  <input
                                    type="date"
                                    value={taskRescheduleInput}
                                    onChange={(e) => setTaskRescheduleInput(e.target.value)}
                                    className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 p-2.5 rounded-lg cursor-pointer focus:outline-none"
                                  />
                                </div>
                                <button
                                  onClick={() => handleReschedule(task.id)}
                                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg shrink-0 cursor-pointer self-end transition-colors"
                                >
                                  Save Date
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* AI Mentor Chat */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-500" /> AI Mentor
            </h2>
            <div className="bg-white border border-zinc-100 shadow-sm rounded-2xl p-5 flex flex-col h-[550px]">
              {/* Actions */}
              <div className="border-b border-zinc-100 pb-3 mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Mentor Console
                </span>
                <button
                  onClick={handleAnalyzePacing}
                  className="bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Analyze Pacing
                </button>
              </div>

              {/* Chat */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3 text-zinc-400">
                    <Sparkles className="w-8 h-8 text-violet-300" />
                    <p className="text-xs">
                      Ask for advice or click "Analyze Pacing" to check your deadlines.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 text-zinc-800 self-end rounded-br-md'
                          : 'bg-zinc-50 border border-zinc-100 text-zinc-700 self-start rounded-bl-md'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {msg.role === 'user' ? 'You' : 'AI Mentor'}
                      </span>
                      <p className="whitespace-pre-line leading-relaxed text-xs">
                        {msg.message}
                      </p>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-2xl text-zinc-400 self-start animate-pulse text-[10px]">
                    Mentor is thinking...
                  </div>
                )}
                {mentorError && (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-500 text-[10px]">
                    {mentorError}
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 pt-3 border-t border-zinc-100">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for advice..."
                  disabled={chatLoading}
                  className="flex-1 bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-3 rounded-xl focus:outline-none focus:border-violet-400 transition-all placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-3 bg-gradient-to-r from-violet-600 to-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-violet-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
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
