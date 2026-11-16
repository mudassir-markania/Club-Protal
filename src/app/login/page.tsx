'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Scale, ArrowLeft, Crown, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

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
      setPassword('ref123');
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#EDEDED] flex flex-col justify-between selection:bg-[#C6A04A] selection:text-[#0A0D14] antialiased">
      {/* Top Header */}
      <header className="border-b border-white/[0.08] px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#C6A04A]/40 p-1 flex items-center justify-center group-hover:border-[#C6A04A] transition">
            <img src="/logo.png" alt="APL Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif font-black text-base tracking-tight text-white block leading-tight">
              APL <span className="text-[#C6A04A]">SEASON 9</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Inter-Club House Championship
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C6A04A]" />
          <span>Public Viewer Portal</span>
        </Link>
      </header>

      {/* Main Single Sign In Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#C6A04A]">
            <Crown className="w-3.5 h-3.5 text-[#C6A04A]" />
            <span>Staff & Officials Unified Login</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Championship Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Single sign in for both <span className="text-[#F3D787] font-semibold">Admin Panel</span> and{' '}
            <span className="text-emerald-400 font-semibold">Referee Panel</span>. The system automatically detects your role.
          </p>
        </div>

        {/* Single Unified Sign In Card */}
        <div className="rounded-2xl bg-[#141822] border border-white/[0.1] shadow-2xl p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email / Official Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sportsportal.com or ref.marcus@..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0D14] border border-white/[0.12] text-white text-xs placeholder:text-slate-500 outline-none focus:border-[#C6A04A] focus:ring-1 focus:ring-[#C6A04A] transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0A0D14] border border-white/[0.12] text-white text-xs placeholder:text-slate-500 outline-none focus:border-[#C6A04A] focus:ring-1 focus:ring-[#C6A04A] transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C6A04A] to-[#D4AF37] hover:from-[#B89438] hover:to-[#C6A04A] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Sign In Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickLogin('ADMIN')}
                className="p-2.5 rounded-xl bg-[#0A0D14] border border-[#C6A04A]/30 hover:border-[#C6A04A] text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-[#F3D787] font-bold text-xs mb-0.5">
                  <Shield className="w-3.5 h-3.5 text-[#C6A04A]" />
                  <span>Admin Role</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickLogin('REFEREE')}
                className="p-2.5 rounded-xl bg-[#0A0D14] border border-emerald-500/30 hover:border-emerald-500 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-0.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Referee Role</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">ref123</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-white/[0.08] py-4 px-4 text-center text-xs text-slate-500">
        APL Season 9 House Championship • Single Sign In for Admin & Referee
      </footer>
    </div>
  );
}
