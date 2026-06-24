'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Sparkles, BarChart2, LogOut, User as UserIcon } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isPublicPage = ['/login', '/register'].includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-zinc-500 font-semibold text-sm">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext handles redirection to /login
  }

  const navItems = [
    { name: 'Generate Goal', href: '/', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white text-zinc-650 hidden md:flex flex-col justify-between shrink-0 border-r border-zinc-200/80 shadow-xs">
        
        {/* Top Section */}
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-zinc-200/80">
            <div className="w-8 h-8 bg-violet-600 text-white font-black rounded-lg flex items-center justify-center text-sm shadow">
              AI
            </div>
            <div>
              <span className="text-zinc-900 font-extrabold text-sm tracking-tight block">AI Task Planner</span>
              <span className="text-zinc-455 text-[10px] uppercase font-bold block tracking-wider">Your Mentor</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-violet-50 border-violet-100 text-violet-600 shadow-xs'
                      : 'border-transparent hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50">
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-750 font-bold flex items-center justify-center text-xs uppercase shrink-0">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="overflow-hidden min-w-0">
              <span className="font-bold text-zinc-900 text-xs truncate block">{user.name}</span>
              <span className="text-[10px] text-zinc-450 truncate block">{user.email}</span>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-zinc-200/80 px-6 flex justify-between items-center shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <div className="w-7 h-7 bg-violet-650 text-white font-black rounded-lg flex items-center justify-center text-xs">
                AI
              </div>
            </div>
            <span className="text-zinc-500 text-xs font-semibold md:block hidden">
              Welcome back, <strong className="text-zinc-850 font-bold">{user.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex md:hidden gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
                    pathname === item.href 
                      ? 'bg-violet-600 text-white border-violet-600' 
                      : 'bg-white text-zinc-650 border-zinc-200/80'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <span className="text-zinc-450 text-xs hidden md:block font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page Content Panel */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}
