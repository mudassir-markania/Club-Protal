'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Trophy,
  ArrowRight,
  LogIn,
  HelpCircle,
  X,
} from 'lucide-react';

interface QuickAccount {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'REFEREE';
  roleLabel: string;
  email: string;
  sports: string;
  icon: string;
  username: string;
}

const PRESET_ACCOUNTS: QuickAccount[] = [
  {
    id: 'admin',
    name: 'Championship Director',
    role: 'SUPER_ADMIN',
    roleLabel: 'League Admin',
    email: 'admin@sportsportal.com',
    username: 'admin',
    sports: 'Official Adjudication',
    icon: '👑',
  },
  {
    id: 'marcus',
    name: 'Marcus Sterling',
    role: 'REFEREE',
    roleLabel: 'Field Referee',
    email: 'ref.marcus@sportsportal.com',
    username: 'marcus',
    sports: 'BGMI • Cricket • Football',
    icon: '⚽',
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'REFEREE',
    roleLabel: 'Court Referee',
    email: 'ref.sarah@sportsportal.com',
    username: 'sarah',
    sports: 'Badminton • Carrom',
    icon: '🏸',
  },
  {
    id: 'david',
    name: 'David Okafor',
    role: 'REFEREE',
    roleLabel: 'Match Referee',
    email: 'ref.david@sportsportal.com',
    username: 'david',
    sports: 'Chess • BGMI • Football',
    icon: '♟️',
  },
];

export default function ProfessionalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'presets'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSelectPreset = (account: QuickAccount) => {
    setEmail(account.username);
    setPassword(account.role === 'SUPER_ADMIN' ? 'admin123' : 'referee123');
    setActiveTab('signin');
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#080d19] font-sans antialiased text-slate-100 selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* ================= LEFT BRANDED SHOWCASE PANEL (44% desktop) ================= */}
      <section className="relative w-full lg:w-[44%] min-h-[460px] lg:min-h-screen bg-gradient-to-br from-[#060b17] via-[#091124] to-[#040813] flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-rose-950/40 overflow-hidden">
        {/* Subtle Diagonal Red Accent Strip along the dividing edge */}
        <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[3px] bg-gradient-to-b from-rose-600 via-amber-500/80 to-blue-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]" />

        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Left: Navigation link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-amber-400" />
            <span>Tournament Home</span>
          </Link>

          <span className="text-[11px] font-bold text-amber-400/90 tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Official Portal
          </span>
        </div>

        {/* Center: Prestigious Emblem & Typography */}
        <div className="relative z-10 my-auto py-8 lg:py-0 flex flex-col items-center text-center">
          {/* Golden Trophy Emblem */}
          <div className="relative mb-5 flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-amber-400/20 via-amber-500/10 to-transparent p-0.5 border border-amber-400/30 flex items-center justify-center shadow-[0_10px_35px_rgba(245,158,11,0.15)] backdrop-blur-sm">
              <div className="w-full h-full rounded-[22px] bg-[#070e1e]/90 flex items-center justify-center">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] animate-pulse" />
              </div>
            </div>

            {/* APL Season 9 Mark */}
            <div className="mt-3 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase font-heading">
                A P L
              </span>
              <span className="text-[10px] font-black tracking-[0.3em] text-amber-300/80 uppercase">
                SEASON 9
              </span>
            </div>
          </div>

          {/* Heading Block */}
          <div className="space-y-2 max-w-md">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em] text-slate-400 block font-heading">
              WELCOME TO
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white capitalize font-serif leading-tight">
              Account Portal
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-amber-400 tracking-wide">
              Apex Arena Championship
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 max-w-sm mx-auto font-normal">
              One portal for Referees and Championship Admins — manage match results, official PDF points distribution, and approved house standings.
            </p>
          </div>

          {/* 5 Houses Badge Strip */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full max-w-xs flex items-center justify-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" /> Blue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" /> Red</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> Green</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" /> Purple</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" /> Yellow</span>
          </div>
        </div>

        {/* Bottom Left: Trust & Accreditation */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NexCore Institute of Technology</span>
          </span>
          <span className="text-slate-400 font-semibold">256-Bit SSL Encrypted</span>
        </div>
      </section>

      {/* ================= RIGHT AUTHENTICATION PANEL (56% desktop) ================= */}
      <main className="w-full lg:w-[56%] min-h-[540px] lg:min-h-screen bg-[#e8ecf4] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Floating Card */}
        <div className="w-full max-w-[460px] bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-300/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] p-7 sm:p-9 md:p-10 flex flex-col gap-6">
          {/* Card Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in with your Referee or Admin account
            </p>
          </div>

          {/* Segmented Pill Switcher */}
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[#6b1124] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-[#6b1124] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Role Presets</span>
            </button>
          </div>

          {/* Presets Tray (when tab is presets) */}
          {activeTab === 'presets' && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-top-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Select a test account to auto-fill:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-rose-700/60 hover:bg-rose-50/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{acc.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {acc.roleLabel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{acc.sports}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#6b1124] opacity-0 group-hover:opacity-100 transition-opacity">
                      Load &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form method="POST" onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username/Email Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email, Mobile, or Admin Username
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin or ref.marcus@sportsportal.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100/80 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#6b1124] focus:ring-4 focus:ring-rose-900/10 transition-all font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password
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
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-100/80 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#6b1124] focus:ring-4 focus:ring-rose-900/10 transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6b1124] rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sub-label helper & Forgot password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[11px] text-slate-500 font-medium">
                Referees: email • Admins: username
              </span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] font-bold text-[#6b1124] hover:text-rose-900 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#6b1124] hover:bg-[#83182d] active:bg-[#500c1a] text-white font-extrabold text-sm tracking-wide transition-all duration-150 shadow-md shadow-rose-950/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-3 group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Footer Links matching reference */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
            <Link
              href="/points-rules"
              className="hover:text-[#6b1124] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Scoring Rules (PDF)</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/leaderboard"
              className="hover:text-[#6b1124] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Leaderboards</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Mobile-only accreditation text */}
        <div className="lg:hidden text-center mt-6 text-xs text-slate-500">
          © 2026 NexCore Institute of Technology • APL Season 9
        </div>
      </main>

      {/* Forgot Password / Help Dialog */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#6b1124]" />
                <span>Default Access Credentials</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For security, credential resets must be requested through the Tournament Director. You can use the baseline tournament accounts:
            </p>
            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <strong>Super Admin:</strong>
                <code className="text-blue-700">admin / admin123</code>
              </div>
              <div className="flex justify-between">
                <strong>Referee Marcus:</strong>
                <code className="text-blue-700">marcus / referee123</code>
              </div>
              <div className="flex justify-between">
                <strong>Referee Sarah:</strong>
                <code className="text-blue-700">sarah / referee123</code>
              </div>
              <div className="flex justify-between">
                <strong>Referee David:</strong>
                <code className="text-blue-700">david / referee123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
