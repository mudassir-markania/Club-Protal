'use client';

import React, { useState, useEffect } from 'react';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 2200ms
}

const REGIMENTAL_HOUSES = [
  { name: 'Blue Club', color: '#0051d5' },
  { name: 'Green Club', color: '#10b981' },
  { name: 'Yellow Club', color: '#f59e0b' },
  { name: 'Purple Club', color: '#9333ea' },
  { name: 'Red Club', color: '#dc2626' },
];

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 2200,
}: ChampionshipSplashScreenProps) {
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Smooth, refined progress fill
  useEffect(() => {
    const startTime = Date.now();
    const duration = autoDismissDelay - 300;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        handleDismiss();
      }
    }, 20);

    return () => clearInterval(timer);
  }, [autoDismissDelay]);

  // Keyboard shortcut (Escape or Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismiss = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  };

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-[#020713] text-white select-none cursor-pointer transition-all duration-500 ease-out ${
        closing ? 'opacity-0 scale-[1.02] blur-xs pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. CINEMATIC STADIUM ATMOSPHERE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft, desaturated stadium floodlight background with dark vignette */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-sm scale-105"
          style={{ backgroundImage: `url('/cricket.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020713] via-[#020713]/85 to-[#020713]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />

        {/* Anamorphic Golden Light Streak across center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-md" />
      </div>

      {/* 2. TOP INSTITUTIONAL BAR */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-manrope font-extrabold uppercase tracking-[0.25em] text-[#dce1ff]">
            NexCore Institute of Technology
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] sm:text-[11px] font-manrope font-semibold uppercase tracking-wider text-[#93a4d4] hover:text-white transition-all cursor-pointer"
        >
          Skip Intro
        </button>
      </header>

      {/* 3. HERO CENTER: PRESTIGE GLASS EMBLEM & MONUMENTAL TYPOGRAPHY */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto px-6 text-center max-w-xl">
        {/* Glassmorphic Illuminated Trophy Stage */}
        <div className="relative mb-7">
          {/* Ambient Specular Halo */}
          <div className="absolute inset-0 -m-6 rounded-full bg-radial from-amber-400/20 via-blue-500/10 to-transparent blur-2xl pointer-events-none" />

          {/* Frosted Acrylic Shield Pedestal */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center p-5 group transition-transform duration-500 hover:scale-105">
            <img
              src="/logo.png"
              alt="APL Season 9 Trophy"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.35)]"
            />
          </div>
        </div>

        {/* 5-House Collegiate Regimental Ribbon */}
        <div className="flex items-center gap-1.5 mb-5 p-1 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md">
          {REGIMENTAL_HOUSES.map((h) => (
            <span
              key={h.name}
              title={h.name}
              className="w-5 sm:w-6 h-1 rounded-full transition-opacity"
              style={{ backgroundColor: h.color }}
            />
          ))}
        </div>

        {/* Monumental Tournament Typography */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-manrope font-extrabold uppercase tracking-[0.3em] text-amber-400">
              Season 9 • Official Championship
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-manrope leading-none">
            Athletic Premier League
          </h1>

          <p className="text-xs sm:text-sm text-[#a8b8ea] font-sans tracking-wide max-w-md mx-auto mt-1">
            Five Houses. Six Disciplines. One Collegiate Legacy.
          </p>
        </div>

        {/* Luxury Precision Telemetry Progress Line */}
        <div className="w-56 sm:w-64 mt-9 space-y-2">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#0051d5] via-amber-400 to-[#eb6905] rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#8091be] uppercase">
            <span>Synchronizing Rosters</span>
            <span className="font-bold text-amber-400">{progress}%</span>
          </div>
        </div>
      </main>

      {/* 4. FOOTER CREDENTIALS */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-8 flex items-center justify-between text-[10px] text-[#6d7fae] font-manrope uppercase tracking-[0.2em]">
        <span>5 Competing Houses • 94 Varsity Contenders</span>
        <span className="hidden sm:inline">Certified Athletics Commission</span>
      </footer>
    </div>
  );
}
