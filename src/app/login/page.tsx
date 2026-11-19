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
  KeyRound,
  Crown,
  Sparkles,
} from 'lucide-react';

interface QuickAccount {
  id: string;
  name: string;
  role: 'SUPER_ADMIN' | 'REFEREE';
  roleLabel: string;
  email: string;
  icon: string;
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  { id: 'admin', name: 'Admin', role: 'SUPER_ADMIN', roleLabel: 'Super Admin', email: 'admin', icon: '👑' },
  { id: 'marcus', name: 'Marcus', role: 'REFEREE', roleLabel: 'Referee (BGMI/Cricket/Football)', email: 'ref.marcus@sportsportal.com', icon: '⚽' },
  { id: 'sarah', name: 'Sarah', role: 'REFEREE', roleLabel: 'Referee (Badminton/Carrom)', email: 'ref.sarah@sportsportal.com', icon: '🏸' },
  { id: 'david', name: 'David', role: 'REFEREE', roleLabel: 'Referee (Chess/BGMI/Football)', email: 'ref.david@sportsportal.com', icon: '♟️' },
];

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);
  const [selectedQuickId, setSelectedQuickId] = useState<string | null>(null);

  const handleSelectQuickAccount = (account: QuickAccount) => {
    setSelectedQuickId(account.id);
    setEmail(account.email);
    setPassword(account.role === 'SUPER_ADMIN' ? 'admin123' : 'referee123');
    setError(null);
    setForgotNotice(null);
  };

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
    <div
      className="h-screen max-h-screen w-full overflow-hidden bg-[#faf8ff] text-[#000f3f] flex flex-col justify-between relative select-none font-manrope antialiased"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 81, 213, 0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Ambient decorative lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[450px] bg-gradient-to-bl from-[#dae2fd]/50 via-[#dae2fd]/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[400px] bg-gradient-to-tr from-[#ffdbcb]/35 via-[#dae2fd]/15 to-transparent rounded-full blur-3xl pointer-events-none -ml-28 -mb-28" />

      {/* Top Header Navigation */}
      <header className="h-14 sm:h-16 shrink-0 z-20 bg-[#faf8ff]/85 backdrop-blur-xl border-b border-[#e2e7ff]/70 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            alt="Apex Arena Crest Logo"
            className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsYOXH0JYiyX1rmUrq9scGTZImP9xqWivkekIWmx1Ruo3otUd9tF9VRe8WIEtDDPKFqcNYPrtpXTIXrhPILhl9C2Uw5zIvtHrgYGOblFU_y9Yhx0x9Afb48VKHwvWODlmjYpYUyz_3yPcHKJKV9F_uUUhRi2EmHmOnbK1FUcl9_CtwK5i8ia2Y4vQEOzSc86Qw-nN0mJFIxB1L5GZVK5OaxLk0RGsSzIYuMPIrLWbc"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-manrope text-base sm:text-lg font-bold uppercase tracking-tight text-[#000f3f] leading-none">
                Apex Arena
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#dae2fd] text-[#000f3f] text-[9px] font-extrabold uppercase tracking-wider font-manrope">
                APL S9
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#45464f] tracking-wider uppercase font-manrope mt-0.5">
              NexCore Institute of Technology
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#000f3f] hover:text-[#0051d5] font-extrabold px-3 py-1.5 rounded-lg border border-[#c6c5d0]/50 hover:border-[#000f3f] bg-white/80 transition-all font-manrope shadow-2xs group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Arena</span>
        </Link>
      </header>

      {/* Main Form Center (Zero Scroll, Perfectly Centered) */}
      <main className="flex-1 min-h-0 z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-2xl rounded-2xl border border-[#c6c5d0]/40 shadow-[0_16px_50px_-10px_rgba(0,15,63,0.12)] p-6 sm:p-7 flex flex-col gap-3.5">
          {/* Card Header & Icon */}
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#000f3f] to-[#0051d5] flex items-center justify-center text-white shadow-md mx-auto mb-1.5">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#000f3f] tracking-tight uppercase leading-none font-manrope">
              Sign In
            </h1>
            <p className="text-xs text-[#45464f] max-w-xs mx-auto leading-relaxed">
              Sign in with your Referee or Admin account. Roles are authenticated and routed automatically.
            </p>
          </div>

          {/* Quick Account Selector Chips (Inspired by reference for fast 1-click test) */}
          <div className="p-2.5 rounded-xl bg-[#faf8ff] border border-[#e2e7ff] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#45464f] uppercase tracking-wider">
              <span className="flex items-center gap-1 text-[#0051d5]">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Quick Fill</span>
              </span>
              <span className="text-[9px] text-[#808dc2] font-semibold">1-Click Test Credentials</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_ACCOUNTS.map((acc) => {
                const isSelected = selectedQuickId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectQuickAccount(acc)}
                    className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center ${
                      isSelected
                        ? 'bg-[#000f3f] border-[#000f3f] text-white shadow-2xs'
                        : 'bg-white border-[#c6c5d0]/60 text-[#000f3f] hover:border-[#0051d5] hover:bg-blue-50/50'
                    }`}
                  >
                    <span className="text-xs leading-none mb-0.5">{acc.icon}</span>
                    <span className="text-[10px] font-extrabold truncate w-full">{acc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Forgot Password Notice */}
          {forgotNotice && (
            <div
              role="status"
              aria-live="polite"
              className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2 animate-in fade-in"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
              <span className="leading-tight">{forgotNotice}</span>
            </div>
          )}

          {/* Form */}
          <form method="POST" onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-extrabold text-[#000f3f] uppercase tracking-wider mb-1 font-manrope"
              >
                Email / Username
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#faf8ff] border border-[#c6c5d0]/70 text-[#000f3f] text-xs placeholder:text-[#808dc2] outline-none focus:bg-white focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/15 transition-all font-medium font-manrope"
                />
                <Mail className="w-4 h-4 text-[#808dc2] absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-extrabold text-[#000f3f] uppercase tracking-wider mb-1 font-manrope"
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
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#faf8ff] border border-[#c6c5d0]/70 text-[#000f3f] text-xs placeholder:text-[#808dc2] outline-none focus:bg-white focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/15 transition-all font-medium font-manrope"
                />
                <Lock className="w-4 h-4 text-[#808dc2] absolute left-3 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#808dc2] hover:text-[#000f3f] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Helper row: Referees: email • Admins: username + Forgot password? */}
            <div className="flex items-center justify-between text-[11px] text-[#45464f] pt-0.5">
              <span className="text-[10px] text-[#808dc2]">
                Referees: email • Admins: username
              </span>
              <button
                type="button"
                onClick={() =>
                  setForgotNotice(
                    'Default passwords are admin123 and referee123. To reset, contact the Championship Director.'
                  )
                }
                className="text-[10px] font-bold text-[#0051d5] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Remember Me & Accreditation badge */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[#45464f] hover:text-[#000f3f] transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#c6c5d0] text-[#0051d5] focus:ring-[#0051d5] accent-[#0051d5] cursor-pointer"
                />
                <span className="text-[11px] font-semibold">Remember me</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] font-bold text-[#0051d5]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Portal</span>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#000f3f] hover:bg-[#0051d5] active:bg-[#000a28] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-150 shadow-md shadow-[#000f3f]/15 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-manrope mt-2 group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Under Card Quick Links */}
          <div className="pt-2 border-t border-[#e2e7ff]/70 flex items-center justify-between text-[11px] font-bold text-[#45464f]">
            <Link href="/" className="hover:text-[#0051d5] transition-colors flex items-center gap-1 group">
              <span>Championship Arena</span>
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
            <Link href="/leaderboard" className="hover:text-[#0051d5] transition-colors flex items-center gap-1 group">
              <span>Leaderboards</span>
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer (Compact 40px, Non-scrollable) */}
      <footer className="h-10 shrink-0 z-20 border-t border-[#e2e7ff]/70 bg-[#faf8ff]/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between text-[10px] text-[#45464f] font-medium font-manrope">
        <span>© 2026 NexCore Institute of Technology • APL Season 9</span>
        <div className="flex items-center gap-1.5 text-[#000f3f] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Authentication</span>
        </div>
      </footer>
    </div>
  );
}
