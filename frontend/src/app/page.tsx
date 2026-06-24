'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { generateProjectPlan } from './actions/planActions';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, Clock, Award, Activity, MessageSquarePlus } from 'lucide-react';

const goalSchema = z.object({
  title: z.string().min(3, 'Objective must be at least 3 characters long'),
  description: z.string().min(5, 'Please provide a brief description (at least 5 characters)'),
  deadline: z.string().min(1, 'Target deadline date is required'),
  availableDailyTime: z.number().min(1, 'Must be at least 1 hour').max(24, 'Max is 24 hours'),
  currentSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredLearningSpeed: z.enum(['slow', 'medium', 'fast']),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function CreateGoalPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<GoalFormValues>({
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      availableDailyTime: 2,
      currentSkillLevel: 'beginner',
      preferredLearningSpeed: 'medium'
    }
  });

  const onSubmit = async (values: GoalFormValues) => {
    setError('');
    setLoading(true);
    
    const validation = goalSchema.safeParse(values);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    const result = await generateProjectPlan({
      goal: values.title,
      maxTasksPerDay: values.preferredLearningSpeed === 'slow' ? 2 : values.preferredLearningSpeed === 'medium' ? 3 : 5,
      ...values
    } as any);
    
    if (result.success && result.data?.project?._id) {
      router.push(`/project/${result.data.project._id}`);
    } else {
      setError(result.error || 'Failed to generate project roadmap.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-50">
        <svg className="animate-spin h-6 w-6 text-violet-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200/50 flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-3xl p-6 sm:p-10 space-y-8 relative z-10">

        <header className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" /> AI Mentor Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Design Your Next Achievement
          </h2>
          <p className="text-zinc-550 text-sm max-w-md mx-auto leading-relaxed">
            Outline your goal, set your daily schedule, and let our mentor construct a tailored, sequential path.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Goal Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5" htmlFor="title">
              <MessageSquarePlus className="w-4 h-4 text-violet-500" /> Goal / Project Title
            </label>
            <input 
              id="title"
              className="bg-white border border-zinc-200/80 text-zinc-800 p-3.5 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all placeholder:text-zinc-400 text-sm shadow-xs"
              placeholder="e.g., Build a full-stack Next.js app or learn Spanish"
              required
              {...register('title')}
            />
            {errors.title && <span className="text-xs text-red-500 font-semibold">{errors.title.message}</span>}
          </div>

          {/* Goal Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider" htmlFor="description">
              Goal Description & Details
            </label>
            <textarea 
              id="description"
              rows={3}
              className="bg-white border border-zinc-200/80 text-zinc-800 p-3.5 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all placeholder:text-zinc-400 text-sm resize-none shadow-xs"
              placeholder="Explain the background, constraints, and why this goal is important to you."
              required
              {...register('description')}
            />
            {errors.description && <span className="text-xs text-red-555 font-semibold">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Target Deadline */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5" htmlFor="deadline">
                <Calendar className="w-4 h-4 text-violet-500" /> Target Deadline
              </label>
              <input 
                id="deadline"
                type="date"
                className="bg-white border border-zinc-200/80 text-zinc-800 p-3.5 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all text-sm shadow-xs cursor-pointer"
                required
                {...register('deadline')}
              />
              {errors.deadline && <span className="text-xs text-red-550 font-semibold">{errors.deadline.message}</span>}
            </div>

            {/* Daily Hours */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5" htmlFor="availableDailyTime">
                <Clock className="w-4 h-4 text-violet-500" /> Available Daily Time
              </label>
              <select
                id="availableDailyTime"
                className="bg-white border border-zinc-200/80 text-zinc-800 p-3.5 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all text-sm shadow-xs cursor-pointer"
                required
                {...register('availableDailyTime', { valueAsNumber: true })}
              >
                <option value={1}>1 hour / day</option>
                <option value={2}>2 hours / day</option>
                <option value={3}>3 hours / day</option>
                <option value={4}>4 hours / day</option>
                <option value={6}>6+ hours / day</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Skill Level */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5" htmlFor="currentSkillLevel">
                <Award className="w-4 h-4 text-violet-500" /> Current Skill Level
              </label>
              <select
                id="currentSkillLevel"
                className="bg-white border border-zinc-200/80 text-zinc-800 p-3.5 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all text-sm shadow-xs cursor-pointer"
                required
                {...register('currentSkillLevel')}
              >
                <option value="beginner">Beginner (No experience)</option>
                <option value="intermediate">Intermediate (Some foundation)</option>
                <option value="advanced">Advanced (High knowledge)</option>
              </select>
            </div>

            {/* Learning Speed */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider flex items-center gap-1.5" htmlFor="preferredLearningSpeed">
                <Activity className="w-4 h-4 text-violet-500" /> Learning Speed
              </label>
              <select
                id="preferredLearningSpeed"
                className="bg-white border border-zinc-200/80 text-zinc-800 p-3.5 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all text-sm shadow-xs cursor-pointer"
                required
                {...register('preferredLearningSpeed')}
              >
                <option value="slow">Slow & Steady (Relaxed)</option>
                <option value="medium">Balanced (Moderate)</option>
                <option value="fast">Aggressive (Speed run)</option>
              </select>
            </div>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-150 text-red-650 p-4 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-555 active:bg-violet-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:bg-zinc-200 disabled:text-zinc-400 flex justify-center items-center gap-2 text-sm shadow-lg shadow-violet-600/15 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Mentor is generating roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate AI Study Plan
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
