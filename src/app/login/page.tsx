'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Crown,
  CheckCircle2,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface QuickAccount {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'REFEREE';
  roleLabel: string;
  email: string;
  sports: string;
  icon: string;
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    id: 'admin',
    name: 'Championship Director',
    role: 'SUPER_ADMIN',
    roleLabel: 'Admin Portal',
    email: 'admin',
    sports: 'All Sports & Rules',
    icon: '👑',
  },
  {
    id: 'marcus',
    name: 'Marcus Sterling',
    role: 'REFEREE',
    roleLabel: 'Referee Portal',
    email: 'ref.marcus@sportsportal.com',
    sports: 'BGMI • Cricket • Football',
    icon: '⚽',
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'REFEREE',
    roleLabel: 'Referee Portal',
    email: 'ref.sarah@sportsportal.com',
    sports: 'Badminton • Carrom',
    icon: '🏸',
  },
  {
    id: 'david',
    name: 'David Okafor',
    role: 'REFEREE',
    roleLabel: 'Referee Portal',
    email: 'ref.david@sportsportal.com',
    sports: 'Chess • BGMI • Football',
    icon: '♟️',
  },
];

export default function AccountPortalLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'quick'>('signin');
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotNotice(null);
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

      // Automatic role-based routing
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

  const selectQuickAccount = (acc: QuickAccount) => {
    setEmail(acc.email);
    setPassword(acc.role === 'SUPER_ADMIN' ? 'admin123' : 'referee123');
    setActiveTab('signin');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-x-hidden font-sans select-none bg-[#090b11]">
      {/* =========================================================================
          LEFT PANEL: Dark Diagonal Section with Golden Trophy & League Branding
          ========================================================================= */}
      <div className="relative w-full lg:w-[46%] xl:w-[44%] min-h-[380px] lg:min-h-screen shrink-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 z-20 overflow-hidden bg-[#07090e]">
        {/* Angled Red/Crimson Accent Stripe on the right edge */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#8f1624] via-[#6f111c] to-[#3a080f] pointer-events-none hidden lg:block z-0"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 86% 100%, 0 100%)',
          }}
        />

        {/* Dark Interior Fill overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#090b11] via-[#07090e] to-[#040508] pointer-events-none hidden lg:block z-10"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 5px) 0, calc(86% - 5px) 100%, 0 100%)',
          }}
        />

        {/* Top Header Link */}
        <div className="relative z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-300/80 hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tournament Home</span>
          </Link>
        </div>

        {/* Center Hero: Trophy + Gold Branding */}
        <div className="relative z-20 my-auto py-8 text-center flex flex-col items-center">
          {/* Golden Trophy with Star Emblem */}
          <div className="relative mb-3 flex flex-col items-center group">
            <svg
              className="w-16 h-16 xl:w-20 xl:h-20 drop-shadow-[0_10px_25px_rgba(217,119,6,0.35)] transition-transform duration-300 group-hover:scale-105"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#fbbf24" />
                  <stop offset="70%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="innerGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
              {/* Handles */}
              <path
                d="M30 24C18 24 16 38 24 48C30 55 38 56 40 56M70 24C82 24 84 38 76 48C70 55 62 56 60 56"
                stroke="url(#trophyGold)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Cup Body */}
              <path
                d="M32 20C32 20 28 50 50 62C72 50 68 20 68 20L32 20Z"
                fill="url(#trophyGold)"
              />
              {/* Star inside cup */}
              <polygon
                points="50,28 53,37 62,37 55,42 58,51 50,46 42,51 45,42 38,37 47,37"
                fill="#fef08a"
              />
              {/* Cup Stem & Base */}
              <path d="M47 62L45 74L55 74L53 62Z" fill="url(#trophyGold)" />
              <path d="M38 74H62L66 84H34L38 74Z" fill="url(#innerGold)" />
              <rect x="30" y="84" width="40" height="4" rx="2" fill="url(#trophyGold)" />
            </svg>

            {/* APL SEASON 9 Gold Label */}
            <div className="mt-2 text-center">
              <span className="block text-sm xl:text-base font-black tracking-[0.3em] text-[#d4af37] leading-none uppercase">
                A P L
              </span>
              <span className="block text-[9px] xl:text-[10px] font-extrabold tracking-[0.25em] text-[#d4af37]/75 uppercase mt-1">
                SEASON 9
              </span>
            </div>
          </div>

          {/* Subtitle Tracking */}
          <span className="text-[10px] xl:text-[11px] font-extrabold tracking-[0.28em] text-[#d4af37]/70 uppercase mt-4 block">
            WELCOME TO
          </span>

          {/* Main Account Portal Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl font-medium tracking-wide text-white mt-1 leading-tight">
            Account Portal
          </h1>

          {/* Alliance Premier League Sub-heading */}
          <h2 className="font-serif text-lg sm:text-xl xl:text-2xl text-[#d4af37] font-normal tracking-wide mt-1">
            Alliance Premier League
          </h2>

          {/* Descriptive text */}
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-4 leading-relaxed font-normal">
            One portal for Players, Referees and League Admins — manage live scoring, squads, and house points distribution.
          </p>
        </div>

        {/* Bottom Silhouette / House Badges */}
        <div className="relative z-20 pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5">
          <span className="tracking-wide text-slate-400">APL Season 9 • Official House Championship</span>
          <span className="text-[#d4af37]/80 font-semibold tracking-wider">NexCore</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Clean Silver/Warm Gray Background with Modern Floating Card
          ========================================================================= */}
      <div className="flex-1 w-full min-h-screen bg-gradient-to-br from-[#dfe3e8] via-[#d5d9df] to-[#c9ced6] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          {/* Floating Authentication Card */}
          <div className="w-full bg-[#f4f6f8]/95 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/70 relative">
            {/* Title & Subtitle */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Sign in with your Player, Referee or Admin account
              </p>
            </div>

            {/* Segmented Pill Toggle: [Sign In] [Quick Accounts] */}
            <div className="bg-[#d3d8df] p-1 rounded-2xl flex items-center mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'signin'
                    ? 'bg-[#500c16] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'quick'
                    ? 'bg-[#500c16] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Quick Accounts</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Forgot Password Notice */}
            {forgotNotice && (
              <div
                role="status"
                aria-live="polite"
                className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2 animate-in fade-in"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="leading-snug">{forgotNotice}</span>
              </div>
            )}

            {/* TAB 1: Main Sign In Form (Matching the Reference UI) */}
            {activeTab === 'signin' && (
              <form method="POST" onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Username Input */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-[11px] font-bold text-slate-700 tracking-wide mb-1.5"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#cdd2da]/55 border border-[#bcc2cb] text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:bg-white focus:border-[#500c16] focus:ring-2 focus:ring-[#500c16]/15 transition-all font-medium"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold text-slate-700 tracking-wide mb-1.5"
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#cdd2da]/55 border border-[#bcc2cb] text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:bg-white focus:border-[#500c16] focus:ring-2 focus:ring-[#500c16]/15 transition-all font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer p-0.5 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Helper text row */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-500 font-medium">
                    Players: email or mobile • Admins: username
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForgotNotice(
                        'To reset credentials, please contact the Championship Director or Super Admin (admin@sportsportal.com).'
                      )
                    }
                    className="font-bold text-[#6f111c] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Pill Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#500c16] via-[#5a0e1a] to-[#6d1020] hover:from-[#620f1b] hover:to-[#781223] active:from-[#450a13] text-white font-extrabold text-sm tracking-wide transition-all shadow-md shadow-[#500c16]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: Quick Accounts (1-Click Fill for Easy Testing) */}
            {activeTab === 'quick' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 font-medium mb-2">
                  Click any account below to instantly pre-fill credentials and sign in:
                </p>

                {QUICK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => selectQuickAccount(acc)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white hover:border-[#500c16] hover:bg-slate-50 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{acc.icon}</span>
                      <div>
                        <div className="text-xs font-black text-slate-900 group-hover:text-[#500c16]">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{acc.sports}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-[#500c16] group-hover:text-white transition-colors">
                      {acc.roleLabel}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="w-full mt-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 text-center block"
                >
                  &larr; Back to standard form
                </button>
              </div>
            )}
          </div>

          {/* Under Card Links (Matching Reference UI) */}
          <div className="w-full mt-6 px-2 flex items-center justify-between text-xs font-bold text-slate-600">
            <Link
              href="/"
              className="hover:text-[#500c16] transition-colors flex items-center gap-1 group"
            >
              <span>Watch Cricket Live</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>

            <Link
              href="/leaderboard"
              className="hover:text-[#500c16] transition-colors flex items-center gap-1 group"
            >
              <span>Leaderboards</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
