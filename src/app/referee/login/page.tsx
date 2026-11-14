'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Swords,
  Medal,
} from 'lucide-react';
import { FootballIcon, BadmintonIcon } from '@/components/ui/icons';

export default function RefereeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefereeLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
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
        throw new Error(data.error || 'Referee authentication failed');
      }

      // If user is Admin, guide them to Admin portal
      if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }

      if (data.user.role !== 'REFEREE') {
        throw new Error('Access denied: You must be a certified referee to access the Referee Console.');
      }

      router.push('/referee/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFillRef = (refEmail: string) => {
    setEmail(refEmail);
    setPassword('referee123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col lg:flex-row selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Left Column: Hero & Official Referee Authority */}
      <div className="relative w-full lg:w-[44%] bg-gradient-to-b from-[#060D17] via-[#091526] to-[#040910] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden z-10 shrink-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header Row with Public Portal Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold backdrop-blur-md transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
            <span>Public Championship Portal</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <UserCheck className="w-3 h-3 text-amber-400" />
            Field Officials Only
          </span>
        </div>

        {/* Brand Showcase */}
        <div className="relative z-10 my-auto py-8 sm:py-12 flex flex-col items-center text-center max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="absolute -inset-6 bg-gradient-to-t from-amber-500/20 via-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <img
              src="/logo.png"
              alt="APL Season 9 Logo"
              className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 object-contain filter drop-shadow-[0_12px_32px_rgba(245,158,11,0.35)] transition-transform duration-500 hover:scale-105 select-none"
            />
          </div>

          <span className="text-[11px] font-bold tracking-[0.32em] text-amber-400 uppercase mb-2">
            Match Official Gateway
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[50px] font-bold text-white tracking-tight leading-[1.08]">
            Referee Portal
          </h1>

          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-amber-400 mt-2 tracking-wide">
            Result Submission Console
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-sm mx-auto mt-4 leading-relaxed opacity-90">
            Dedicated portal for certified field referees to access assigned tournament competitions, record verified final scores, and submit points for admin approval.
          </p>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/[0.06] pt-5">
          <span>APL Season 9 Field Officials</span>
          <span>Certified Referees Only</span>
        </div>

        {/* Angled Seam SVG */}
        <div className="hidden lg:block absolute top-0 bottom-0 -right-[50px] w-[50px] h-full overflow-hidden pointer-events-none z-30">
          <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="h-full w-full">
            <polygon points="0,0 80,0 20,1000 0,1000" fill="#040910" />
            <line x1="80" y1="0" x2="20" y2="1000" stroke="#F59E0B" strokeWidth="5" />
            <line x1="85" y1="0" x2="25" y2="1000" stroke="#1E3E62" strokeWidth="3" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Right Column: Referee Sign In Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 z-20">
        <div className="w-full max-w-[430px]">
          <div className="bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08)] border border-slate-200/70">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-2">
                Certified Official Login
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Referee Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your official referee email to submit match scores
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleRefereeLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Official Referee Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ref.marcus@sportsportal.com or marcus"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F0F4F9]/75 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Referee Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 bg-[#F0F4F9]/75 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-6 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white rounded-2xl text-sm font-bold shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2.5 transition disabled:opacity-70 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                    <span>Enter Referee Console</span>
                  </>
                )}
              </button>

              {/* Quick Fill Official Personas */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                  Select Certified Official:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => quickFillRef('ref.marcus@sportsportal.com')}
                    className="p-2 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate">Ref Marcus</span>
                    <FootballIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFillRef('ref.sarah@sportsportal.com')}
                    className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition font-semibold text-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate">Ref Sarah</span>
                    <BadmintonIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

