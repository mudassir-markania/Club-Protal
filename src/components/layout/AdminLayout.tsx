'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Shield,
  Medal,
  Users,
  UserCheck,
  Calendar,
  ClipboardList,
  FileText,
  BarChart3,
  Bell,
  Menu,
  X,
  LogOut,
  History,
  Sparkles,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    verifyAdminAuth();
    fetchNotifications();
  }, [pathname]);

  const verifyAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated || (data.user?.role !== 'SUPER_ADMIN' && data.user?.role !== 'ADMIN')) {
        router.push('/admin/login');
        return;
      }
      setUser(data.user);
    } catch (err) {
      router.push('/admin/login');
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
    } catch (err) {}
  };

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const adminNav = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Matches & Fixtures', href: '/admin/matches', icon: Calendar },
    { name: 'Clubs & Cricket Teams', href: '/admin/clubs', icon: Shield },
    { name: 'Sports & Scoring', href: '/admin/sports', icon: Medal },
    { name: 'Player Rosters', href: '/admin/players', icon: Users },
    { name: 'Referee Management', href: '/admin/referees', icon: UserCheck },
    { name: 'Points History', href: '/admin/points-history', icon: History },
    { name: 'House Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { name: 'Reports & Export', href: '/admin/reports', icon: FileText },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Authenticating Administrator Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-navy-800 bg-navy-950/60">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-xl bg-navy-800/90 border border-amber-400/40 flex items-center justify-center p-1 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.png" alt="APL Season 9" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm tracking-tight text-white block truncate">APL Season 9</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase block truncate">Admin Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-navy-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Championship Tag */}
        <div className="px-4 py-3 border-b border-navy-800/80 bg-navy-900/50">
          <div className="bg-navy-800/70 border border-navy-700/60 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs text-navy-300 mb-1">
              <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                CHAMPIONSHIP ACTIVE
              </span>
              <span className="text-[10px] text-amber-400 font-mono">5 Houses</span>
            </div>
            <p className="text-[11px] text-navy-400">Restricted Admin Oversight & Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-navy-300 hover:bg-navy-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-navy-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footer & Logout */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate">{user?.name || 'Tournament Director'}</span>
              <span className="block text-[10px] text-blue-400 uppercase font-semibold">Super Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out of Admin Portal"
            className="p-2 text-navy-400 hover:text-red-400 hover:bg-navy-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin View Container */}
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
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Nov 25 - 28, 2026</span>
              </span>
              <span className="text-xs font-bold text-slate-700 hidden md:inline">
                APL Season 9 • Tournament Administration
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Mode</span>
            </span>

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
                        <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

