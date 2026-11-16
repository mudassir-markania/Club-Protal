'use client';

import React, { useState, useEffect } from 'react';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 1800
}

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 1900,
}: ChampionshipSplashScreenProps) {
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar fill
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 6;
      });
    }, 60);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDelay);

    // Escape key skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(dismissTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoDismissDelay]);

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  };

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-slate-900 select-none cursor-pointer transition-opacity duration-500 ${
        !closing ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Clean Centered Brand Presentation */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-sm mx-auto">
        {/* The Pure APL Season 9 Logo */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center animate-in zoom-in-95 duration-500">
          <img
            src="/logo.png"
            alt="APL Season 9 Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(198,160,74,0.3)]"
          />
        </div>

        {/* Clean Modern Athletic Subtitle */}
        <div className="mt-4 space-y-1 animate-in fade-in duration-500 delay-150">
          <h1 className="text-base sm:text-lg font-black uppercase tracking-[0.3em] text-slate-900 font-sans">
            HOUSE CHAMPIONSHIP
          </h1>
          <p className="text-[11px] font-mono tracking-widest text-[#C6A04A] font-semibold uppercase">
            5 Houses • 8 Sports • One Champion
          </p>
        </div>

        {/* Minimalist Golden Progress Line */}
        <div className="w-36 sm:w-44 mt-6">
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#DFB85C] via-[#C6A04A] to-[#B38F3A] rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(198,160,74,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="text-[10px] text-slate-300 font-mono mt-4 tracking-wider">
          Tap anywhere to continue
        </span>
      </div>
    </div>
  );
}
