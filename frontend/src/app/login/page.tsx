'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '../actions/authActions';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await loginUser({ email, password });

    if (result.success) {
      await refreshUser();
      router.replace('/');
    } else {
      setError(result.error || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 shadow-2xl rounded-3xl p-8 space-y-8">
        
        <div className="text-center">
          <div className="w-12 h-12 bg-violet-600 text-white font-black rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 shadow">
            AI
          </div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-zinc-500 text-xs font-semibold mt-1.5">
            Log in to manage your goals and track achievements.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="border border-zinc-200 text-zinc-800 p-3 rounded-xl focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all placeholder:text-zinc-400 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-650 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="border border-zinc-200 text-zinc-800 p-3 rounded-xl focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all placeholder:text-zinc-400 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-150 text-red-650 p-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-555 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:bg-zinc-200 disabled:text-zinc-450 flex justify-center items-center gap-2 text-sm shadow-md shadow-violet-600/10 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6 font-semibold">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-violet-600 hover:underline">
            Sign Up
          </Link>
        </p>

      </div>
    </main>
  );
}
