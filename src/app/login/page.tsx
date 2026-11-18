'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Scale, ArrowLeft, Crown, Lock, Mail, AlertCircle, ArrowRight, Trophy } from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Automatic role-based routing
      if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'REFEREE') {
        router.push('/referee/matches');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (role: 'ADMIN' | 'REFEREE') => {
    setError(null);
    if (role === 'ADMIN') {
      setEmail('admin@sportsportal.com');
      setPassword('admin123');
    } else {
      setEmail('ref.marcus@sportsportal.com');
      setPassword('referee123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-[#0284C7] selection:text-white antialiased">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
            <Trophy className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-[#0B2545] block leading-tight">
              APEX<span className="text-[#0284C7]">ARENA</span>
            </span>
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
              APL SEASON 9 CHAMPIONSHIP
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0284C7] transition font-bold px-3 py-1.5 rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Back to Public Portal</span>
        </Link>
      </header>

      {/* Main Single Sign In Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-[#0284C7] font-bold shadow-2xs">
            <Crown className="w-3.5 h-3.5" />
            <span>Staff &amp; Officials Unified Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B2545] tracking-tight">
            Championship Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            Single sign-in for <strong className="text-slate-800">Admin Oversight</strong> and{' '}
            <strong className="text-slate-800">Match Officials</strong>. Role is detected automatically.
          </p>
        </div>

        {/* Single Unified Sign In Card */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sportsportal.com or ref.marcus@sportsportal.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Role Selectors */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              1-Click Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillQuickLogin('ADMIN')}
                className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 hover:border-[#0284C7] text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[#0284C7] font-bold text-xs mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickLogin('REFEREE')}
                className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-600 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-0.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Referee Marcus</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">referee123</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200/80 py-4 px-4 text-center text-xs text-slate-500 bg-white/50">
        APL Season 9 House Championship • Unified Authentication Gate
      </footer>
    </div>
  );
}
