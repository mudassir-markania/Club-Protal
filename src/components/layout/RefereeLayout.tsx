'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Swords,
  BarChart3,
  Calendar,
  Menu,
  X,
  LogOut,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface RefereeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  refereeId?: string | null;
  referee?: {
    id: string;
    refereeCode: string;
    availability: string;
  };
}

export default function RefereeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<RefereeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    verifyRefereeAuth();
  }, [pathname]);

  const verifyRefereeAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated || data.user?.role !== 'REFEREE') {
        router.push('/referee/login');
        return;
      }
      setUser(data.user);
    } catch (err) {
      router.push('/referee/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/referee/login');
  };

  const refereeNav = [
    { name: 'Referee Console', href: '/referee/dashboard', icon: BarChart3 },
    { name: 'Assigned Competitions', href: '/referee/matches', icon: Swords },
    { name: 'House Standings', href: '/referee/leaderboard', icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <span className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Authenticating Referee Credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Referee Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-navy-800 bg-navy-950/60">
          <Link href="/referee/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-navy-800/90 border border-amber-400/40 flex items-center justify-center p-1 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm tracking-tight text-white block truncate">APL Season 9</span>
              <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block truncate">Referee Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-navy-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Referee Official Status Badge */}
        <div className="px-4 py-3 border-b border-navy-800/80 bg-navy-900/50">
          <div className="bg-navy-800/70 border border-navy-700/60 rounded-lg p-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-navy-300">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                OFFICIAL REFEREE
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">CERTIFIED</span>
            </div>
            <p className="text-[11px] text-navy-300 font-medium truncate">{user?.name || 'Assigned Official'}</p>
            <span className="text-[10px] text-slate-400 block font-mono">
              Code: {user?.referee?.refereeCode || 'REF-001'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {refereeNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/referee/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                    : 'text-navy-300 hover:bg-navy-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-navy-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Referee User Footer & Logout */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-navy-950 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.[0] || 'R'}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate">{user?.name}</span>
              <span className="block text-[10px] text-amber-400 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out of Referee Portal"
            className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Referee View Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Nov 25 - 28, 2026</span>
              </span>
              <span className="text-xs font-bold text-slate-700 hidden md:inline">
                APL Season 9 • Match Official Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Referee Mode</span>
            </span>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Referee Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

