'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Crown,
  Trophy,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';

interface RefereePreset {
  id: string;
  name: string;
  username: string;
  sports: string;
  avatar: string;
}

const REFEREE_PRESETS: RefereePreset[] = [
  { id: 'marcus', name: 'Marcus Sterling', username: 'marcus', sports: 'BGMI • Cricket • Football', avatar: '⚽' },
  { id: 'sarah', name: 'Sarah Jenkins', username: 'sarah', sports: 'Badminton • Carrom', avatar: '🏸' },
  { id: 'david', name: 'David Okafor', username: 'david', sports: 'Chess • BGMI • Football', avatar: '♟️' },
];

const HOUSES_TICKER = [
  { name: 'Blue', code: 'MAV', color: 'from-blue-500 to-indigo-600', dot: 'bg-blue-400' },
  { name: 'Red', code: 'DOM', color: 'from-rose-500 to-red-600', dot: 'bg-rose-400' },
  { name: 'Green', code: 'ALP', color: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-400' },
  { name: 'Purple', code: 'RYL', color: 'from-purple-500 to-indigo-600', dot: 'bg-purple-400' },
  { name: 'Yellow', code: 'CRW', color: 'from-amber-400 to-yellow-600', dot: 'bg-amber-400' },
];

export default function ProfessionalChampionshipLoginPage() {
  const router = useRouter();
  const [roleMode, setRoleMode] = useState<'admin' | 'referee'>('admin');
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchRole = (mode: 'admin' | 'referee') => {
    setRoleMode(mode);
    setError(null);
    if (mode === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
    } else {
      setIdentifier('marcus');
      setPassword('referee123');
    }
  };

  const handleSelectReferee = (ref: RefereePreset) => {
    setIdentifier(ref.username);
    setPassword('referee123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Role-based routing
      const userRole = data.user?.role;
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (userRole === 'REFEREE') {
        router.push('/referee/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Stadium Floodlight & Atmospheric Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top Centered Golden Floodlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-600/18 via-indigo-600/8 to-transparent rounded-full blur-[140px]" />
        {/* Secondary Warm Stadium Halos */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        {/* Subtle Athletic Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="relative z-20 h-20 w-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-[1px] shadow-lg shadow-blue-900/30">
            <div className="w-full h-full rounded-[11px] bg-[#070e20] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white uppercase font-heading">
                APEX ARENA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                APL S9
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              NexCore Institute of Technology
            </span>
          </div>
        </Link>

        {/* Quick Nav Action Pills */}
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
          >
            <span>Standings</span>
          </Link>
          <Link
            href="/points-rules"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
          >
            <span>PDF Rules</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-900/20 transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Public Arena</span>
          </Link>
        </div>
      </header>

      {/* ================= MAIN CENTRAL CONSOLE ================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px]">
          {/* Main Card with Premium Frosted Glassmorphism */}
          <div className="rounded-3xl bg-slate-900/65 backdrop-blur-2xl border border-slate-700/60 shadow-[0_30px_90px_rgba(0,0,0,0.65)] p-7 sm:p-10 relative overflow-hidden">
            {/* Top Glowing Trim */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

            {/* Header Badge & Title */}
            <div className="text-center space-y-2 mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 text-[11px] font-extrabold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Official Access Gateway</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-heading">
                Sign In to Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Authorized tournament portal for Championship Directors and Match Referees.
              </p>
            </div>

            {/* Modern Segmented Role Selector */}
            <div className="mb-6 p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  roleMode === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Tournament Admin</span>
              </button>

              <button
                type="button"
                onClick={() => switchRole('referee')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  roleMode === 'referee'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Match Referee</span>
              </button>
            </div>

            {/* Role Context Bar */}
            {roleMode === 'admin' ? (
              <div className="mb-6 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-between text-xs text-blue-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold">Super Admin Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => switchRole('admin')}
                  className="text-[11px] font-extrabold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  admin / admin123
                </button>
              </div>
            ) : (
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Quick-select official referee:</span>
                  <span className="text-amber-400 text-[10px]">Pass: referee123</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {REFEREE_PRESETS.map((ref) => {
                    const isSelected = identifier === ref.username;
                    return (
                      <button
                        key={ref.id}
                        type="button"
                        onClick={() => handleSelectReferee(ref)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white ring-1 ring-blue-400'
                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-base mb-0.5">{ref.avatar}</span>
                        <span className="text-[11px] font-black truncate w-full">{ref.name.split(' ')[0]}</span>
                        <span className="text-[9px] text-slate-400 truncate w-full">{ref.username}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Form */}
            <form method="POST" onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Username or Official Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="identifier"
                    name="username"
                    type="text"
                    autoComplete="username"
                    spellCheck="false"
                    autoCapitalize="none"
                    inputMode="email"
                    enterKeyHint="next"
                    required
                    aria-invalid={!!error}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleMode === 'admin' ? 'admin or admin@sportsportal.com' : 'marcus / sarah / david'}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 outline-none focus:bg-slate-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    enterKeyHint="done"
                    required
                    aria-invalid={!!error}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white text-sm placeholder:text-slate-500 outline-none focus:bg-slate-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Session Security Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer bg-slate-900"
                  />
                  <span className="font-semibold text-[11px]">Keep session active</span>
                </label>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted 256-Bit</span>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-black text-sm uppercase tracking-wider transition-all duration-150 shadow-xl shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-3 group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <>
                    <span>Enter {roleMode === 'admin' ? 'Championship Control' : 'Match Center'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Footnote */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Automatic Role-Based Adjudication</span>
              <span className="text-amber-400 font-bold">APL Season 9</span>
            </div>
          </div>

          {/* 5 Houses Status Bar Beneath Card */}
          <div className="mt-6 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">The 5 Houses:</span>
            <div className="flex items-center gap-3">
              {HOUSES_TICKER.map((h) => (
                <span key={h.code} className="flex items-center gap-1.5 font-bold text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${h.dot} shadow-[0_0_6px_currentColor]`} />
                  <span>{h.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ================= BOTTOM FOOTER ================= */}
      <footer className="relative z-10 h-14 w-full max-w-7xl mx-auto px-4 sm:px-8 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>© 2026 NexCore Institute of Technology • APL Season 9 House Championship</span>
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Scoring Engine Active</span>
        </div>
      </footer>
    </div>
  );
}
