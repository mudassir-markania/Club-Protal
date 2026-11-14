'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Trophy,
  Shield,
  Medal,
  Users,
  Calendar,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
  FileText,
  History,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Swords,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  refereeId?: string | null;
  referee?: any;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        // Fallback for seamless demo: default to Super Admin
        setUser({
          id: 'admin-default',
          name: 'Tournament Director',
          email: 'admin@sportsportal.com',
          role: 'SUPER_ADMIN',
        });
      }
    } catch (err) {
      setUser({
        id: 'admin-default',
        name: 'Tournament Director',
        email: 'admin@sportsportal.com',
        role: 'SUPER_ADMIN',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
    } catch (err) {}
  };

  const switchRole = async (roleType: 'ADMIN' | 'REFEREE') => {
    try {
      const email = roleType === 'ADMIN' ? 'admin@sportsportal.com' : 'ref.marcus@sportsportal.com';
      const password = roleType === 'ADMIN' ? 'admin123' : 'referee123';
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (roleType === 'REFEREE') {
          router.push('/referee/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const adminNav = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Club Management', href: '/admin/clubs', icon: Shield },
    { name: 'Sports & Scoring', href: '/admin/sports', icon: Medal },
    { name: 'Player Roster', href: '/admin/players', icon: Users },
    { name: 'Referee Management', href: '/admin/referees', icon: UserCheck },
    { name: 'Matches & Fixtures', href: '/admin/matches', icon: Calendar },
    { name: 'Google Forms / Sync', href: '/admin/registrations', icon: FileSpreadsheet },
    { name: 'Leaderboard Rankings', href: '/admin/leaderboard', icon: Trophy },
    { name: 'Reports & Exports', href: '/admin/reports', icon: FileText },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  const refereeNav = [
    { name: 'Referee Dashboard', href: '/referee/dashboard', icon: BarChart3 },
    { name: 'My Assigned Matches', href: '/referee/matches', icon: Swords },
    { name: 'Tournament Leaderboard', href: '/admin/leaderboard', icon: Trophy },
  ];

  const navItems = isAdmin ? adminNav : refereeNav;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-navy-800 bg-navy-950/60">
          <Link href={isAdmin ? '/admin/dashboard' : '/referee/dashboard'} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">ApexArena</span>
              <span className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">Championship 2026</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-navy-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tournament Info Pill */}
        <div className="px-4 py-3 border-b border-navy-800/80 bg-navy-900/50">
          <div className="bg-navy-800/70 border border-navy-700/60 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs text-navy-300 mb-1">
              <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE TOURNAMENT
              </span>
              <span className="text-[11px] text-navy-400">Nov 25 - 28</span>
            </div>
            <p className="text-[11px] text-navy-300 truncate font-medium">Inter-Club Championship</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-navy-400 uppercase">
            {isAdmin ? 'Tournament Operations' : 'Field Operations'}
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/referee/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-navy-300 hover:text-white hover:bg-navy-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-navy-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile & Quick Role Switcher */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/60">
          <div className="px-2 py-2 mb-2 bg-navy-800/40 rounded-lg border border-navy-800">
            <div className="text-[10px] text-navy-400 uppercase font-semibold tracking-wider mb-1.5 flex items-center justify-between">
              <span>Switch Testing Role</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => switchRole('ADMIN')}
                className={`text-[11px] py-1 px-2 rounded font-medium border text-center transition-all ${
                  isAdmin
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-navy-900 text-navy-300 border-navy-700 hover:text-white'
                }`}
              >
                Admin Panel
              </button>
              <button
                onClick={() => switchRole('REFEREE')}
                className={`text-[11px] py-1 px-2 rounded font-medium border text-center transition-all ${
                  !isAdmin
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-navy-900 text-navy-300 border-navy-700 hover:text-white'
                }`}
              >
                Referee Panel
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center font-bold text-xs text-blue-300">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Loading...'}</p>
                <span className="inline-block text-[10px] text-blue-400 font-medium tracking-tight">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Nov 25 - 28, 2026</span>
              </span>
              <span className="text-xs font-medium text-slate-500 hidden md:inline">
                Inter-Club Sports Championship
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Panel Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-amber-600'}`}></span>
              <span className="text-slate-700 font-semibold">{isAdmin ? 'Admin View' : 'Referee View'}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen && unreadCount > 0) markNotificationsRead();
                }}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    <button
                      onClick={markNotificationsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="p-1 rounded bg-blue-100 text-blue-700 mt-0.5 flex items-center justify-center">
                              <Bell className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100 text-center">
                    <Link
                      href={isAdmin ? '/admin/matches' : '/referee/matches'}
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      View Tournament Operations
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-tight">{user?.name}</span>
                <span className="block text-[10px] text-slate-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

