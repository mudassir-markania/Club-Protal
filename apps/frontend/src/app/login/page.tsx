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
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function UnifiedOfficialLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ email: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#050a14] font-sans antialiased text-slate-100 selection:bg-[#0051d5] selection:text-white">
      {/* ================= LEFT BRANDED SHOWCASE PANEL (44% desktop) ================= */}
      <section className="relative w-full lg:w-[44%] min-h-[460px] lg:min-h-screen bg-gradient-to-br from-[#040812] via-[#060e20] to-[#02050e] flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
        {/* Subtle Ambient Blue Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Left Nav & Top Right Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-blue-400" />
            <span>Public Championship Portal</span>
          </Link>

          <span className="text-[11px] font-bold text-blue-300 tracking-wider uppercase px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Authorized Officials</span>
          </span>
        </div>

        {/* Center: Prestigious Emblem & Typography */}
        <div className="relative z-10 my-auto py-8 lg:py-0 flex flex-col items-center text-center">
          {/* Official APL Season 9 Trophy Logo */}
          <div className="relative mb-5 flex flex-col items-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 relative flex items-center justify-center">
              <img
                src="/logo.png"
                alt="APL Season 9 Official Trophy Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(0,81,213,0.35)]"
              />
            </div>
          </div>

          {/* Heading Block */}
          <div className="space-y-2 max-w-md">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em] text-slate-400 block font-heading">
              CHAMPIONSHIP ACCESS GATEWAY
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white capitalize font-serif leading-tight">
              Official Portal
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-blue-400 tracking-wide">
              Administration & Match Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 max-w-sm mx-auto font-normal">
              Dedicated portal for tournament administrators and certified field referees to access assigned competitions, record verified final scores, and submit points for official approval.
            </p>
          </div>
        </div>

        {/* Bottom Left: Trust & Accreditation */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="text-slate-400">APL Season 9 Field Officials</span>
          <span className="text-slate-400 font-semibold">Certified Officials Only</span>
        </div>
      </section>

      {/* ================= RIGHT AUTHENTICATION PANEL (56% desktop) ================= */}
      <main className="w-full lg:w-[56%] min-h-[540px] lg:min-h-screen bg-[#dce1e9] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Floating Card exactly matching the reference */}
        <div className="w-full max-w-[440px] bg-[#edf2f7] rounded-3xl border border-slate-300/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.16)] p-7 sm:p-9 flex flex-col gap-5">
          {/* Top Badge in Portal Blue */}
          <div>
            <span className="inline-block px-3 py-1 rounded-md bg-[#dae2fd] border border-[#b4c5ff] text-[10px] font-black tracking-wider text-[#000f3f] uppercase">
              CERTIFIED OFFICIAL LOGIN
            </span>
          </div>

          {/* Card Title */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Official Sign In
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your official credentials or choose your assigned profile below:
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Semantic Form */}
          <form method="POST" onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username/Email Input */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5"
              >
                Official Username or Email
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
                  placeholder="admin@sportsportal.com or official username"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#cdd5e0]/70 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:bg-white focus:border-[#0051d5] focus:ring-3 focus:ring-[#0051d5]/20 transition-all font-medium"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5"
              >
                Official Password
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
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#cdd5e0]/70 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-500 outline-none focus:bg-white focus:border-[#0051d5] focus:ring-3 focus:ring-[#0051d5]/20 transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-800 transition-colors p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0051d5] rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button (Portal Blue Gradient) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#000f3f] to-[#0051d5] hover:from-[#00175a] hover:to-[#0042b3] active:from-[#000a28] active:to-[#003185] text-white font-extrabold text-sm tracking-wide transition-all duration-150 shadow-md shadow-[#000f3f]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2 group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span>Enter Official Console</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Security / Copyright Note */}
        <div className="text-center mt-5 text-[11px] text-slate-500 font-medium">
          NexCore Institute of Technology • Encrypted Session
        </div>
      </main>
    </div>
  );
}
