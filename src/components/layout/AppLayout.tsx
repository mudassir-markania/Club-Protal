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
        // Fallback for seamless demo
        if (pathname?.startsWith('/referee')) {
          setUser({
            id: 'ref-marcus-default',
            name: 'Marcus Sterling',
            email: 'ref.marcus@sportsportal.com',
            role: 'REFEREE',
            refereeId: 'ca701ecb-f512-45a3-b651-600b4d45f965',
            referee: { refereeCode: 'REF-001', name: 'Marcus Sterling' },
          });
        } else {
          setUser({
            id: 'admin-default',
            name: 'Tournament Director',
            email: 'admin@sportsportal.com',
            role: 'SUPER_ADMIN',
          });
        }
      }
    } catch (err) {
      if (pathname?.startsWith('/referee')) {
        setUser({
          id: 'ref-marcus-default',
          name: 'Marcus Sterling',
          email: 'ref.marcus@sportsportal.com',
          role: 'REFEREE',
          refereeId: 'ca701ecb-f512-45a3-b651-600b4d45f965',
          referee: { refereeCode: 'REF-001', name: 'Marcus Sterling' },
        });
      } else {
        setUser({
          id: 'admin-default',
          name: 'Tournament Director',
          email: 'admin@sportsportal.com',
          role: 'SUPER_ADMIN',
        });
      }
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

  const switchRole = async (roleType: 'ADMIN' | 'REFEREE', customEmail?: string) => {
    try {
      const email =
        roleType === 'ADMIN'
          ? 'admin@sportsportal.com'
          : customEmail || 'ref.marcus@sportsportal.com';
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

  const isRefereeMode = pathname?.startsWith('/referee') || user?.role === 'REFEREE';
  const isAdmin = !isRefereeMode && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN');

  const adminNav = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Club Management', href: '/admin/clubs', icon: Shield },
    { name: 'Sports & Scoring', href: '/admin/sports', icon: Medal },
    { name: 'Player Roster', href: '/admin/players', icon: Users },
    { name: 'Referee Management', href: '/admin/referees', icon: UserCheck },
    { name: 'Matches & Fixtures', href: '/admin/matches', icon: Calendar },
    { name: 'Points History', href: '/admin/points-history', icon: History },
    { name: 'House Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { name: 'Reports & Exports', href: '/admin/reports', icon: FileText },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  ];

  const refereeNav = [
    { name: 'Referee Console', href: '/referee/dashboard', icon: BarChart3 },
    { name: 'Assigned Competitions', href: '/referee/matches', icon: Swords },
    { name: 'House Leaderboard', href: '/admin/leaderboard', icon: Trophy },
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
        <div className="h-16 px-4 flex items-center justify-between border-b border-navy-800 bg-navy-950/60">
          <Link href={isAdmin ? '/admin/dashboard' : '/referee/dashboard'} className="flex items-center gap-2.5 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-navy-800/90 border border-amber-400/40 flex items-center justify-center p-1 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm tracking-tight text-white block truncate">APL Season 9</span>
              <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block truncate">House Championship</span>
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
                className={`text-[11px] py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                  isAdmin
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-navy-900 text-navy-300 border-navy-700 hover:text-white hover:bg-navy-800'
                }`}
              >
                Admin Panel
              </button>
              <button
                onClick={() => switchRole('REFEREE')}
                className={`text-[11px] py-1.5 px-2 rounded-lg font-semibold border text-center transition-all ${
                  isRefereeMode
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-navy-900 text-navy-300 border-navy-700 hover:text-white hover:bg-navy-800'
                }`}
              >
                Referee Panel
              </button>
            </div>
            {isRefereeMode && (
              <div className="mt-2 pt-2 border-t border-navy-800/80">
                <span className="text-[9px] text-navy-400 uppercase tracking-wider block mb-1">
                  Active Official Persona:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => switchRole('REFEREE', 'ref.marcus@sportsportal.com')}
                    title="Football & Cricket (REF-001)"
                    className={`py-1 px-1 rounded text-center truncate font-medium border ${
                      user?.email === 'ref.marcus@sportsportal.com'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-navy-900/60 text-navy-400 border-navy-800 hover:text-navy-200'
                    }`}
                  >
                    Marcus
                  </button>
                  <button
                    onClick={() => switchRole('REFEREE', 'ref.sarah@sportsportal.com')}
                    title="Badminton & TT (REF-002)"
                    className={`py-1 px-1 rounded text-center truncate font-medium border ${
                      user?.email === 'ref.sarah@sportsportal.com'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-navy-900/60 text-navy-400 border-navy-800 hover:text-navy-200'
                    }`}
                  >
                    Sarah
                  </button>
                  <button
                    onClick={() => switchRole('REFEREE', 'ref.david@sportsportal.com')}
                    title="Basketball & Football (REF-003)"
                    className={`py-1 px-1 rounded text-center truncate font-medium border ${
                      user?.email === 'ref.david@sportsportal.com'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-navy-900/60 text-navy-400 border-navy-800 hover:text-navy-200'
                    }`}
                  >
                    David
                  </button>
                </div>
              </div>
            )}
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

            <div className="flex items-center gap-2.5">
              <Link href={isAdmin ? '/admin/dashboard' : '/referee/dashboard'} className="flex items-center gap-2 lg:hidden">
                <img src="/logo.png" alt="APL Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-xs text-navy-950">APL 9</span>
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Nov 25 - 28, 2026</span>
              </span>
              <span className="text-xs font-semibold text-slate-700 hidden md:inline">
                APL Season 9 • House Championship
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Panel Switcher matching attachment styling */}
            {isAdmin ? (
              <button
                onClick={() => switchRole('REFEREE')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0B1528] text-white border border-[#243552] hover:bg-[#13233f] hover:border-amber-500/50 shadow-sm transition-all group"
                title="Switch to Referee Console"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Referee Panel</span>
              </button>
            ) : (
              <button
                onClick={() => switchRole('ADMIN')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0B1528] text-white border border-[#243552] hover:bg-[#13233f] hover:border-blue-500/50 shadow-sm transition-all group"
                title="Switch to Tournament Admin Panel"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Admin Panel</span>
              </button>
            )}

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

