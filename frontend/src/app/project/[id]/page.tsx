'use client'

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getProject, toggleTask, completeProject, 
  rescheduleTask, reduceTaskDifficulty, addTaskNotes 
} from '../../actions/projectActions';
import { askMentorAdvice, getMentorHistory, analyzeAndAdjustPlan } from '../../actions/mentorActions';
import { 
  Sparkles, Calendar, Clock, Award, Activity, MessageSquare, 
  Send, HelpCircle, AlertCircle, Edit, Trash2, CheckCircle2, ChevronDown, ChevronUp, Save
} from 'lucide-react';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Tasks local custom states
  const [expandedNotesTaskId, setExpandedNotesTaskId] = useState<string | null>(null);
  const [expandedRescheduleTaskId, setExpandedRescheduleTaskId] = useState<string | null>(null);
  const [taskNotesInput, setTaskNotesInput] = useState('');
  const [taskRescheduleInput, setTaskRescheduleInput] = useState('');

  // AI Mentor Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [mentorError, setMentorError] = useState('');

  const projectId = params.id as string;

  useEffect(() => {
    fetchProjectDetails();
    fetchMentorChat();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const data = await getProject(projectId);
      if (data) {
        setProject(data.project);
        setTasks(data.tasks);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorChat = async () => {
    try {
      const history = await getMentorHistory(projectId);
      setChatMessages(history);
    } catch (err) {
      console.error('Failed to load mentor chat logs:', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));

    const res = await toggleTask(taskId, projectId);
    if (!res.success) {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
      alert('Error updating task: ' + res.error);
    } else {
      fetchProjectDetails();
    }
  };

  const handleSaveNotes = async (taskId: string) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, notes: taskNotesInput } : t));
    setExpandedNotesTaskId(null);

    const res = await addTaskNotes(taskId, projectId, taskNotesInput);
    if (!res.success) {
      alert('Failed to save notes: ' + res.error);
      fetchProjectDetails();
    }
  };

  const handleReschedule = async (taskId: string) => {
    if (!taskRescheduleInput) return;
    
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, deadline: new Date(taskRescheduleInput) } : t));
    setExpandedRescheduleTaskId(null);

    const res = await rescheduleTask(taskId, projectId, taskRescheduleInput);
    if (!res.success) {
      alert('Failed to reschedule mission: ' + res.error);
      fetchProjectDetails();
    }
  };

  const handleReduceDifficulty = async (taskId: string) => {
    if (!confirm('Let our AI Mentor simplify this mission and re-write the instructions?')) return;
    
    setLoading(true);
    const res = await reduceTaskDifficulty(taskId, projectId);
    if (res.success) {
      await fetchProjectDetails();
    } else {
      alert('AI Mentor failed to reduce difficulty: ' + res.error);
      setLoading(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!confirm('Mark this goal as completed and archive it?')) return;
    startTransition(async () => {
      const res = await completeProject(projectId);
      if (res.success) {
        router.push('/dashboard');
      } else {
        alert('Failed to finish project: ' + res.error);
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatLoading(true);
    setMentorError('');

    setChatMessages(prev => [...prev, { role: 'user', message: userMsg, createdAt: new Date() }]);

    const res = await askMentorAdvice(projectId, userMsg);
    if (res && res.reply) {
      setChatMessages(prev => [...prev, res.chat || { role: 'mentor', message: res.reply, createdAt: new Date() }]);
    } else {
      setMentorError('Mentor is currently offline. Please try again.');
    }
    setChatLoading(false);
  };

  const handleAnalyzePacing = async () => {
    setChatLoading(true);
    setMentorError('');
    
    const res = await analyzeAndAdjustPlan(projectId);
    if (res.adjusted) {
      setChatMessages(prev => [
        ...prev, 
        { role: 'mentor', message: `🔍 Pacing analysis complete: ${res.message}`, createdAt: new Date() }
      ]);
      await fetchProjectDetails();
    } else {
      setChatMessages(prev => [
        ...prev,
        { role: 'mentor', message: res.message || 'Checked your pacing: everything is currently on track!', createdAt: new Date() }
      ]);
    }
    setChatLoading(false);
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-zinc-500 font-semibold text-sm">Consulting AI Mentor...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-55 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 text-center max-w-sm shadow-xl">
          <h2 className="text-red-650 font-bold text-lg mb-2">Error</h2>
          <p className="text-zinc-500 text-sm mb-6">{error || 'Project not found'}</p>
          <Link href="/dashboard" className="bg-violet-650 hover:bg-violet-550 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-700 py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background glow blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <Link href="/dashboard" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5">
            ← Dashboard
          </Link>
          {project.status !== 'completed' && (
            <button
              onClick={handleCompleteProject}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isPending ? 'Completing...' : '🎉 Accomplished Goal'}
            </button>
          )}
        </div>

        {/* Project Roadmap Header Meta Card */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight sm:text-3xl">{project.title}</h1>
              <p className="text-zinc-550 text-sm mt-1">{project.description || 'No description provided.'}</p>
            </div>
            <span className={`text-[10px] font-bold py-1.5 px-3 rounded-full shrink-0 uppercase border tracking-wider ${
              project.status === 'completed' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-violet-50 border-violet-100 text-violet-650'
            }`}>
              {project.status === 'completed' ? 'Accomplished' : 'In Progress'}
            </span>
          </div>

          <hr className="border-zinc-150" />

          {/* Details / Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pacing Speed</span>
              <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-violet-500" /> {project.preferredLearningSpeed || 'medium'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Skill Level</span>
              <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-violet-500" /> {project.currentSkillLevel || 'beginner'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Difficulty</span>
              <span className="text-xs font-extrabold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-violet-500" /> {project.overallDifficulty || 'medium'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Final Deadline</span>
              <span className="text-xs font-extrabold text-zinc-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-violet-500" /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Goal Pacing Percentage</span>
              <span className="font-bold text-zinc-800">{progressPercent}% ({tasks.filter(t => t.isCompleted).length} / {tasks.length} missions completed)</span>
            </div>
            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200/60">
              <div className="bg-linear-to-r from-violet-500 to-indigo-400 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* AI Roadmap Overview Text */}
          {project.roadmap && (
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl mt-4">
              <h3 className="text-xs font-bold text-violet-600 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Mentor Roadmap Overview
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-mono">{project.roadmap}</p>
            </div>
          )}
        </div>

        {/* Main Grid: Tasks checklist & AI Mentor Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tasks checklist */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              Checklist Missions
            </h2>
            
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-10 bg-white border border-dashed border-zinc-200 rounded-3xl text-zinc-400 text-sm">
                  No missions generated. Something went wrong during plan creation.
                </div>
              ) : (
                tasks.map((task: any) => {
                  const isOverdue = new Date(task.deadline) < new Date() && !task.isCompleted;
                  const showNotes = expandedNotesTaskId === task._id;
                  const showReschedule = expandedRescheduleTaskId === task._id;

                  return (
                    <div 
                      key={task._id} 
                      className={`bg-white border rounded-3xl p-5 transition-all shadow-xs ${
                        task.isCompleted ? 'border-zinc-200 bg-zinc-50/50 opacity-65' : 'border-zinc-200/80 hover:border-zinc-300 shadow-xs'
                      } ${isOverdue ? 'border-red-200 bg-red-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleToggleTask(task._id)}
                          className="mt-1 h-5 w-5 rounded border-zinc-300 bg-white text-violet-650 focus:ring-violet-500 cursor-pointer"
                        />
                        
                        {/* Task Information */}
                        <div className="flex-1 space-y-2 min-w-0">
                          
                          {/* Title and Hours */}
                          <div className="flex justify-between items-start gap-3">
                            <h3 className={`font-bold text-sm leading-snug wrap-break-word flex items-center gap-1.5 ${task.isCompleted ? 'text-zinc-400 font-medium' : 'text-zinc-800'}`}>
                              {task.title}
                              {task.isCompleted && (
                                <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                  Completed
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-550 font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                {task.estimatedHours} hrs
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border whitespace-nowrap ${
                                task.difficultyLevel === 'easy' 
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                  : task.difficultyLevel === 'hard' 
                                    ? 'bg-red-50 border-red-100 text-red-650'
                                    : 'bg-amber-50 border-amber-100 text-amber-600'
                              }`}>
                                {task.difficultyLevel}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className={`text-xs leading-relaxed ${task.isCompleted ? 'text-zinc-400' : 'text-zinc-550'}`}>
                              {task.description}
                            </p>
                          )}

                          {/* Task Notes Display */}
                          {task.notes && (
                            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl text-[10px] text-zinc-550 leading-normal font-mono">
                              <span className="font-bold text-zinc-450 block uppercase tracking-wider mb-0.5">Notes:</span>
                              {task.notes}
                            </div>
                          )}

                          {/* Deadline Metadata & Actions Trigger Bar */}
                          <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px]">
                            
                            {/* Deadline label */}
                            <span className={`font-semibold py-0.5 px-2 rounded border ${
                              task.isCompleted 
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-400' 
                                : isOverdue 
                                  ? 'bg-red-50 text-red-650 border-red-100' 
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-550'
                            }`}>
                              {isOverdue ? '⚠️ Overdue' : 'Due'}: {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>

                            {/* Reschedule Button */}
                            {!task.isCompleted && (
                              <button 
                                onClick={() => {
                                  setExpandedRescheduleTaskId(showReschedule ? null : task._id);
                                  setExpandedNotesTaskId(null);
                                  setTaskRescheduleInput(new Date(task.deadline).toISOString().split('T')[0]);
                                }}
                                className="text-zinc-450 hover:text-zinc-900 font-bold cursor-pointer transition-colors"
                              >
                                {showReschedule ? 'Cancel' : 'Reschedule'}
                              </button>
                            )}

                            {/* Add Notes Button */}
                            <button 
                              onClick={() => {
                                setExpandedNotesTaskId(showNotes ? null : task._id);
                                setExpandedRescheduleTaskId(null);
                                setTaskNotesInput(task.notes || '');
                              }}
                              className="text-zinc-455 hover:text-zinc-900 font-bold cursor-pointer transition-colors"
                            >
                              {showNotes ? 'Cancel Notes' : task.notes ? 'Edit Notes' : '+ Add Notes'}
                            </button>

                            {/* Simplify / Reduce Difficulty (AI feature) */}
                            {!task.isCompleted && task.difficultyLevel !== 'easy' && (
                              <button 
                                onClick={() => handleReduceDifficulty(task._id)}
                                className="text-violet-600 hover:text-violet-500 font-extrabold flex items-center gap-0.5 cursor-pointer"
                                title="Use AI Mentor to simplify instructions and reduce difficulty"
                              >
                                <Sparkles className="w-3 h-3" /> Simplify
                              </button>
                            )}
                          </div>

                          {/* Expandable Section: Notes Form */}
                          {showNotes && (
                            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 space-y-2 mt-2">
                              <textarea
                                value={taskNotesInput}
                                onChange={(e) => setTaskNotesInput(e.target.value)}
                                className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 p-2.5 rounded-xl focus:outline-none focus:border-violet-500 resize-none h-16 shadow-xs"
                                placeholder="Jot down notes, links, or progress thoughts..."
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleSaveNotes(task._id)}
                                  className="bg-violet-600 hover:bg-violet-550 text-white font-bold text-[10px] py-1.5 px-3.5 rounded-lg flex items-center gap-1 cursor-pointer"
                                >
                                  <Save className="w-3 h-3" /> Save Notes
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Expandable Section: Reschedule Form */}
                          {showReschedule && (
                            <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 space-y-2 mt-2 flex items-center gap-3">
                              <div className="flex-1 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">New Deadline Date</label>
                                <input
                                  type="date"
                                  value={taskRescheduleInput}
                                  onChange={(e) => setTaskRescheduleInput(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 p-2 rounded-lg cursor-pointer"
                                />
                              </div>
                              <button
                                onClick={() => handleReschedule(task._id)}
                                className="bg-violet-600 hover:bg-violet-550 text-white font-bold text-[10px] py-2 px-3.5 rounded-lg shrink-0 cursor-pointer self-end"
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
          </div>

          {/* AI Mentor Advice Chat Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-violet-650" /> AI Mentor advice
            </h2>

            <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-5 flex flex-col h-[500px]">
              
              {/* Mentoring Actions Banner */}
              <div className="border-b border-zinc-150 pb-3 mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Mentor Console</span>
                <button
                  onClick={handleAnalyzePacing}
                  className="bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 text-[9px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Check if tasks are overdue and redistribute deadlines"
                >
                  <Sparkles className="w-3 h-3 text-violet-500" /> Analyze Pacing
                </button>
              </div>

              {/* Chat history logs */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-zinc-400">
                    <Sparkles className="w-8 h-8 text-violet-600/20" />
                    <p className="text-xs">Ask advice on how to start, or click "Analyze Pacing" to verify your target deadlines.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                        msg.role === 'user' 
                          ? 'bg-violet-50 border border-violet-100 text-zinc-850 self-end rounded-br-none' 
                          : 'bg-zinc-50 border border-zinc-200 text-zinc-800 self-start rounded-bl-none'
                      }`}
                    >
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        {msg.role === 'user' ? 'You' : 'AI Mentor'}
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                    </div>
                  ))
                )}
                
                {chatLoading && (
                  <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-2xl text-zinc-400 self-start animate-pulse text-[10px]">
                    Mentor is typing...
                  </div>
                )}
                {mentorError && (
                  <div className="bg-red-50 border border-red-150 p-2.5 rounded-xl text-red-650 text-[10px]">
                    {mentorError}
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="flex gap-2.5 mt-4 pt-3 border-t border-zinc-150">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for advice or study tips..."
                  disabled={chatLoading}
                  className="flex-1 bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 p-3 rounded-xl focus:outline-none focus:border-violet-500 transition-all placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-3 bg-violet-600 hover:bg-violet-550 text-white rounded-xl flex items-center justify-center transition-all disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer shadow-md shadow-violet-600/10 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
