'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { usePlannerStore } from '@/store/usePlannerStore';
import {
  Sparkles,
  Calendar,
  Clock,
  Award,
  Activity,
  Target,
  Zap,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const goalSchema = z.object({
  title: z.string().min(3, 'Objective must be at least 3 characters'),
  description: z.string().min(5, 'Please provide a brief description'),
  deadline: z.string().min(1, 'Target deadline is required'),
  availableDailyTime: z.number().min(1).max(24),
  currentSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredLearningSpeed: z.enum(['slow', 'medium', 'fast']),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function CreateGoalPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const router = useRouter();
  const addProject = usePlannerStore((s) => s.addProject);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GoalFormValues>({
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      availableDailyTime: 2,
      currentSkillLevel: 'beginner',
      preferredLearningSpeed: 'medium',
    },
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

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: values.title,
          ...values,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      addProject(data.project, data.tasks);
      router.push(`/project/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate project roadmap.');
      setLoading(false);
    }
  };

  const titleValue = watch('title');
  const descriptionValue = watch('description');

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-fuchsia-200/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Hero */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-4 py-2 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by AI Mentor Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
            Design Your Next
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              {' '}Achievement
            </span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Describe your goal, set your pace, and let AI craft a personalized roadmap with daily missions.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-zinc-200/60 shadow-2xl shadow-zinc-200/40 rounded-3xl p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Goal Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-violet-500" /> What do you want to achieve?
              </label>
              <input
                className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 p-4 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all placeholder:text-zinc-400 text-sm font-medium"
                placeholder="e.g., Build a full-stack Next.js app, Learn Python for data science..."
                {...register('title')}
              />
              {errors.title && (
                <span className="text-xs text-red-500 font-semibold pl-1">
                  {errors.title.message}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Tell us more about your goal
              </label>
              <textarea
                rows={3}
                className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 p-4 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all placeholder:text-zinc-400 text-sm resize-none font-medium"
                placeholder="Background, constraints, why this matters to you..."
                {...register('description')}
              />
              {errors.description && (
                <span className="text-xs text-red-500 font-semibold pl-1">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Deadline & Daily Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-violet-500" /> Target Deadline
                </label>
                <input
                  type="date"
                  className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 p-4 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm cursor-pointer font-medium"
                  {...register('deadline')}
                />
                {errors.deadline && (
                  <span className="text-xs text-red-500 font-semibold pl-1">
                    {errors.deadline.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-500" /> Daily Time
                </label>
                <select
                  className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 p-4 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm cursor-pointer font-medium"
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

            {/* Skill Level & Speed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-violet-500" /> Skill Level
                </label>
                <select
                  className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 p-4 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm cursor-pointer font-medium"
                  {...register('currentSkillLevel')}
                >
                  <option value="beginner">Beginner — No experience</option>
                  <option value="intermediate">Intermediate — Some foundation</option>
                  <option value="advanced">Advanced — Strong knowledge</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-violet-500" /> Learning Speed
                </label>
                <select
                  className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 p-4 rounded-2xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm cursor-pointer font-medium"
                  {...register('preferredLearningSpeed')}
                >
                  <option value="slow">Slow & Steady</option>
                  <option value="medium">Balanced</option>
                  <option value="fast">Aggressive</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is crafting your roadmap...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate AI Study Plan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🎯', label: 'Smart Roadmaps' },
            { icon: '🤖', label: 'AI Mentor' },
            { icon: '📊', label: 'Progress Tracking' },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white/50 backdrop-blur-sm border border-zinc-200/40 rounded-2xl p-3 text-xs font-bold text-zinc-500"
            >
              <span className="text-lg block mb-1">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
