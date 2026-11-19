'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Trophy,
  Sparkles,
  Users,
  Target,
  Gamepad2,
  Zap,
} from 'lucide-react';

interface QuickAccount {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'REFEREE';
  roleLabel: string;
  email: string;
  sports: string;
  icon: string;
  targetRoute: string;
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    id: 'admin',
    name: 'Championship Director',
    role: 'SUPER_ADMIN',
    roleLabel: 'Admin Portal',
    email: 'admin@sportsportal.com',
    sports: 'All Sports & Rules',
    icon: '👑',
    targetRoute: '/admin/dashboard',
  },
  {
    id: 'marcus',
    name: 'Marcus Sterling',
    role: 'REFEREE',
    roleLabel: 'Referee Portal',
    email: 'ref.marcus@sportsportal.com',
    sports: 'BGMI • Cricket • Football',
    icon: '⚽',
    targetRoute: '/referee/dashboard',
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'REFEREE',
    roleLabel: 'Referee Portal',
    email: 'ref.sarah@sportsportal.com',
    sports: 'Badminton • Carrom',
    icon: '🏸',
    targetRoute: '/referee/dashboard',
  },
  {
    id: 'david',
    name: 'David Okafor',
    role: 'REFEREE',
    roleLabel: 'Referee Portal',
    email: 'ref.david@sportsportal.com',
    sports: 'Chess • BGMI • Football',
    icon: '♟️',
    targetRoute: '/referee/dashboard',
  },
];

const HOUSES_PREVIEW = [
  { name: 'Blue', code: 'MAV', bg: 'bg-blue-600', ring: 'ring-blue-400' },
  { name: 'Red', code: 'DOM', bg: 'bg-rose-600', ring: 'ring-rose-400' },
  { name: 'Green', code: 'ALP', bg: 'bg-emerald-600', ring: 'ring-emerald-400' },
  { name: 'Purple', code: 'RYL', bg: 'bg-purple-600', ring: 'ring-purple-400' },
  { name: 'Yellow', code: 'CRW', bg: 'bg-amber-500', ring: 'ring-amber-300' },
];

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuickId, setSelectedQuickId] = useState<string | null>(null);

  const handleSelectQuickAccount = (account: QuickAccount) => {
    setSelectedQuickId(account.id);
    setEmail(account.email);
    setPassword(account.role === 'SUPER_ADMIN' ? 'admin123' : 'referee123');
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
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Automatic role-based routing from database
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
    <div className="min-h-screen w-full bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <header className="h-16 shrink-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#000f3f] to-[#0051d5] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#000f3f] leading-none uppercase">
                APEX ARENA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                APL Season 9
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
              NexCore Institute of Technology
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Arena</span>
        </Link>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Championship Showcase (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between rounded-3xl bg-gradient-to-br from-[#000f3f] via-[#071746] to-[#0b192c] text-white p-8 xl:p-10 shadow-2xl relative overflow-hidden border border-blue-900/40 min-h-[620px]">
            {/* Background Decorative Light Beams */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand & Badge */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Scoring & House Portal</span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight uppercase font-heading">
                Enter The House Arena
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                The centralized portal for championship match officiating, sports point distributions, and live house standings.
              </p>
            </div>

            {/* Middle Feature Highlights */}
            <div className="relative z-10 my-8 space-y-4">
              {/* 5 Houses Pill Row */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>The 5 Houses</span>
                  </span>
                  <span className="text-[11px] text-amber-300 font-extrabold">10 Teams</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {HOUSES_PREVIEW.map((h) => (
                    <div
                      key={h.code}
                      className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/10 border border-white/10 text-center"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${h.bg} mb-1`} />
                      <span className="text-[11px] font-black">{h.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{h.code}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6 Championship Sports Matrix */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>6 Official Sports</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">PDF Rules Active</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-300 font-semibold pt-1">
                  <span className="px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1.5">⚽ Football</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1.5">🏏 Cricket</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1.5">🏸 Badminton</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1.5">🎯 Carrom</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1.5"><Gamepad2 className="w-3 h-3 text-cyan-400" /> BGMI</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 flex items-center gap-1.5">♟️ Chess</span>
                </div>
              </div>

              {/* Automatic Calculation Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-100 leading-snug">
                  <strong>Automatic Point Engine:</strong> Match results calculate unique-club splits and individual player awards instantly upon submission.
                </p>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified SSL 256-bit Session</span>
              </span>
              <span>APL Season 9</span>
            </div>
          </div>

          {/* Right Column: Unified Authentication Form */}
          <div className="lg:col-span-7 w-full max-w-xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,15,63,0.12)] p-6 sm:p-9 md:p-10 relative overflow-hidden">
              {/* Subtle top accent gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500" />

              {/* Form Title & Introduction */}
              <div className="space-y-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-black uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Authorized Personnel Sign In</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#000f3f] tracking-tight uppercase">
                  Welcome to Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Referees and Tournament Directors sign in here. The portal automatically detects your role and navigates to your workspace.
                </p>
              </div>

              {/* Quick Sign-In Preset Selector (Fast Testing & Referees) */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Sign-In Selector (1-Click Test)</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-600">Select any user:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_ACCOUNTS.map((acc) => {
                    const isSelected = selectedQuickId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectQuickAccount(acc)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base">{acc.icon}</span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : acc.role === 'SUPER_ADMIN'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {acc.role === 'SUPER_ADMIN' ? 'Admin' : 'Referee'}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-black truncate">{acc.name.split(' ')[0]}</div>
                          <div
                            className={`text-[9px] truncate font-medium ${
                              isSelected ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {acc.sports}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedQuickId && (
                  <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-blue-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Credentials loaded for {QUICK_ACCOUNTS.find((a) => a.id === selectedQuickId)?.name}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Routes to {QUICK_ACCOUNTS.find((a) => a.id === selectedQuickId)?.roleLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Semantic Form compliant with Modern Web Guidance */}
              <form method="POST" onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Username / Email field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5 font-heading"
                  >
                    Email / Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      spellCheck="false"
                      autoCapitalize="none"
                      inputMode="email"
                      enterKeyHint="next"
                      required
                      aria-invalid={!!error}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSelectedQuickId(null);
                      }}
                      placeholder="e.g. admin or ref.marcus@sportsportal.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-black text-slate-800 uppercase tracking-wider font-heading"
                    >
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Default: admin123 / referee123</span>
                  </div>
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 transition-all font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Security Status */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                    />
                    <span className="font-semibold text-xs">Remember this device</span>
                  </label>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Encrypted Session</span>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#000f3f] to-[#0051d5] hover:from-[#00175a] hover:to-[#0042b3] active:from-[#000a28] active:to-[#003185] text-white font-black text-sm uppercase tracking-wider transition-all duration-150 shadow-lg shadow-blue-950/20 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer mt-3 group"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Arena</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Portal Roles Guide */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Administrators</strong>
                    <span>Full match fixture control, rule tuning & point approvals.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Referees</strong>
                    <span>Officiate assigned games and submit match scores & awards.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="h-12 shrink-0 z-20 border-t border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>© 2026 NexCore Institute of Technology • APL Season 9 House Championship</span>
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Role-Based Authentication Engine</span>
        </div>
      </footer>
    </div>
  );
}
