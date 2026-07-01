'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, BarChart2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Create Goal', href: '/', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col shrink-0 border-r border-zinc-100 shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-500 text-white font-black rounded-xl flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">
            AI
          </div>
          <div>
            <span className="text-zinc-900 font-extrabold text-sm tracking-tight block">
              Study Planner
            </span>
            <span className="text-zinc-400 text-[10px] uppercase font-bold block tracking-widest">
              AI Mentor
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 text-violet-700 shadow-sm'
                    : 'border border-transparent hover:bg-zinc-50 hover:text-zinc-900 text-zinc-500'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 text-center font-medium">
            Data resets on refresh
          </p>
        </div>
      </aside>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto min-w-0">{children}</div>
    </div>
  );
}
