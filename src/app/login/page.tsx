'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Shield, UserCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertTriangle, Crown } from 'lucide-react';
import { FootballIcon, BadmintonIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role === 'REFEREE') {
        router.push('/referee/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    handleLogin(undefined, userEmail, userPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        {/* Top Header Banner */}
        <div className="bg-navy-900 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ApexArena Portal</h1>
          <p className="text-xs text-blue-300 font-medium tracking-wide mt-1 uppercase">
            Inter-Club Sports Championship • Nov 25 - 28, 2026
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sportsportal.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-sm font-semibold shadow-md shadow-navy-900/20 flex items-center justify-center gap-2 transition disabled:opacity-70"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick 1-Click Demo Access
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@sportsportal.com', 'admin123')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <Crown className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Super Admin (Director)
                    </span>
                    <span className="block text-[11px] text-slate-400">admin@sportsportal.com</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Admin Panel
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('ref.marcus@sportsportal.com', 'referee123')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    <FootballIcon className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-amber-700">
                      Referee Marcus (Football/Cricket)
                    </span>
                    <span className="block text-[11px] text-slate-400">ref.marcus@sportsportal.com</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Referee Panel
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('ref.sarah@sportsportal.com', 'referee123')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <BadmintonIcon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      Referee Sarah (Badminton/TT)
                    </span>
                    <span className="block text-[11px] text-slate-400">ref.sarah@sportsportal.com</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Referee Panel
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

