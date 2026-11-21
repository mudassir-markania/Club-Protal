'use client';

import React, { useState, useEffect } from 'react';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 2100ms
}

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 2100,
}: ChampionshipSplashScreenProps) {
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  usePreventScroll(!closing);

  // 1. Smooth Linear Progress Bar
  useEffect(() => {
    const startTime = Date.now();
    const duration = autoDismissDelay - 350;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        handleDismiss();
      }
    }, 25);

    return () => clearInterval(timer);
  }, [autoDismissDelay]);

  // 2. Keyboard Dismiss Listener
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
    }, 400);
  };

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 !m-0 z-[99999] flex flex-col items-center justify-between bg-[#000a20] text-white select-none cursor-pointer overscroll-none touch-none transition-opacity duration-400 ease-out ${
        closing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Collegiate Arena Gradient Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft stadium overhead spotlight */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-radial from-[#0051d5]/20 via-[#001b5e]/10 to-transparent blur-3xl opacity-80" />
        {/* Warm golden trophy glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full" />
        {/* Subtle athletic grid line texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Header: Institution & Skip Action */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-7 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] sm:text-[11px] font-manrope font-bold uppercase tracking-[0.2em] text-[#dce1ff]">
            NexCore Institute of Technology
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-[11px] font-manrope font-semibold uppercase tracking-wider text-[#93a4d4] hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-md hover:bg-white/5"
        >
          Skip
        </button>
      </header>

      {/* Center: Prestigious Emblem & Typography */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto px-6 text-center max-w-lg">
        {/* Championship Trophy Crest */}
        <div className="relative mb-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center">
            <img
              src="/logo.png"
              alt="APL Season 9 Crest"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(245,158,11,0.25)]"
            />
          </div>
        </div>

        {/* Tournament Brand Presentation */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] sm:text-[11px] font-manrope font-extrabold uppercase tracking-[0.25em] text-amber-400">
              Season 9 • 2026
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-manrope">
            Athletic Premier League
          </h1>

          <p className="text-xs sm:text-sm text-[#b7c4fd] font-sans tracking-wide max-w-sm mx-auto">
            Official Inter-House Sports Championship
          </p>
        </div>

        {/* Hairline Loading Indicator */}
        <div className="w-48 sm:w-56 mt-8 space-y-2">
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0051d5] via-amber-400 to-amber-300 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#93a4d4] uppercase tracking-wider">
            <span>Loading Portal</span>
            <span>{progress}%</span>
          </div>
        </div>
      </main>

      {/* Footer: Official Accreditation */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-7 flex items-center justify-between text-[10px] text-[#8091be] font-manrope">
        <span className="uppercase tracking-widest">
          5 Houses • 6 Disciplines • 94 Contenders
        </span>
        <span className="hidden sm:inline uppercase tracking-widest">
          Directorate of Physical Education
        </span>
      </footer>
    </div>
  );
}
