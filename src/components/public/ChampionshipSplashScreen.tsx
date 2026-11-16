'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Sun, Moon, Sparkles } from 'lucide-react';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 3400
  initialTheme?: 'white' | 'dark';
}

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 3400,
  initialTheme = 'white',
}: ChampionshipSplashScreenProps) {
  const [theme, setTheme] = useState<'white' | 'dark'>(initialTheme);
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('LOADING ARENA...');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle audio pulse using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.25);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Canvas floating golden particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // 55 floating golden particles
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: -Math.random() * 0.9 - 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.03 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme === 'white') {
        // Luxury luminous pearl-white background with golden center radiance
        const radial = ctx.createRadialGradient(
          width / 2,
          height / 2,
          20,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.65
        );
        radial.addColorStop(0, 'rgba(255, 252, 242, 0.95)');
        radial.addColorStop(0.45, 'rgba(248, 250, 252, 0.98)');
        radial.addColorStop(1, 'rgba(238, 242, 248, 1)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        // Warm gold embers on white
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.alpha += p.pulse;
          if (p.alpha > 0.85 || p.alpha < 0.15) p.pulse = -p.pulse;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(198, 160, 74, ${Math.max(0, p.alpha * 0.65)})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(198, 160, 74, 0.4)';
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else {
        // Dark gold nebula on black
        const radial = ctx.createRadialGradient(
          width / 2,
          height / 2,
          40,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.55
        );
        radial.addColorStop(0, 'rgba(198, 160, 74, 0.16)');
        radial.addColorStop(0.45, 'rgba(12, 17, 28, 0.6)');
        radial.addColorStop(1, 'rgba(5, 7, 11, 0.98)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.alpha += p.pulse;
          if (p.alpha > 0.85 || p.alpha < 0.15) p.pulse = -p.pulse;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(243, 215, 135, ${Math.max(0, p.alpha)})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#C6A04A';
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  // Sequence timings & progress
  useEffect(() => {
    const t1 = setTimeout(() => setStatusText('SYNCING HOUSES...'), 700);
    const t2 = setTimeout(() => setStatusText('8 SPORTS MATRIX...'), 1600);
    const t3 = setTimeout(() => {
      setStatusText('ARENA READY');
      if (audioEnabled) playChime();
    }, 2400);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 4);
      });
    }, 80);

    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(dismissTimer);
      clearInterval(interval);
    };
  }, [autoDismissDelay, audioEnabled]);

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 550);
  };

  const toggleSound = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) playChime();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'white' ? 'dark' : 'white'));
  };

  if (!visible) return null;

  const isWhite = theme === 'white';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-600 select-none ${
        isWhite ? 'bg-[#FAFBFC] text-slate-900' : 'bg-[#05070B] text-white'
      } ${!closing ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
    >
      {/* Background Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Subtle Pattern Grid */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 ${
          isWhite
            ? 'bg-[radial-gradient(circle_at_center,rgba(198,160,74,0.12)_1px,transparent_1px)] bg-[size:32px_32px]'
            : 'bg-[radial-gradient(circle_at_center,rgba(198,160,74,0.06)_1px,transparent_1px)] bg-[size:32px_32px]'
        }`}
      />

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        {/* White / Dark Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isWhite ? 'Switch to Dark Theme' : 'Switch to White Theme'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            isWhite
              ? 'bg-white/90 hover:bg-white border-slate-200 text-slate-700 shadow-sm'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300'
          }`}
        >
          {isWhite ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>White Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#C6A04A]" />
              <span>Dark Theme</span>
            </>
          )}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
          className={`p-2 rounded-xl border transition ${
            isWhite
              ? 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 shadow-sm'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-400 hover:text-[#C6A04A]'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-[#C6A04A]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Skip Button */}
        <button
          onClick={handleDismiss}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition group ${
            isWhite
              ? 'bg-white/90 hover:bg-white border-slate-200 text-slate-700 shadow-sm'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-400 hover:text-white'
          }`}
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* EXACT DEAD CENTER HERO STAGE */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto px-4 my-auto">
        {/* LOGO IN DEAD CENTER WITH WHITE PEDESTAL & GOLD RADIAL AURA */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
          {/* Ambient Golden Pulsing Halo */}
          <div
            className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full blur-3xl animate-pulse pointer-events-none ${
              isWhite ? 'bg-[#C6A04A]/25' : 'bg-[#C6A04A]/25'
            }`}
          />
          <div
            className={`absolute w-36 h-36 sm:w-52 sm:h-52 rounded-full blur-2xl pointer-events-none ${
              isWhite ? 'bg-amber-200/40' : 'bg-[#FFF2B2]/15'
            }`}
          />

          {/* Rotating Orbital Rings */}
          <div
            className={`absolute -inset-4 sm:-inset-6 rounded-full border border-t-[#C6A04A] animate-spin [animation-duration:9s] pointer-events-none ${
              isWhite ? 'border-[#C6A04A]/30' : 'border-[#C6A04A]/30'
            }`}
          />
          <div
            className={`absolute -inset-8 sm:-inset-10 rounded-full border border-b-[#C6A04A]/40 animate-spin [animation-duration:15s] [animation-direction:reverse] pointer-events-none ${
              isWhite ? 'border-slate-300/40' : 'border-white/5'
            }`}
          />

          {/* CRISP WHITE EMBLEM CONTAINER (Gives pristine white background directly to the logo) */}
          <div
            className={`relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full flex items-center justify-center p-5 sm:p-7 border-2 transition-all duration-500 animate-in zoom-in-75 duration-700 ${
              isWhite
                ? 'bg-white shadow-[0_25px_60px_rgba(198,160,74,0.35),0_10px_25px_rgba(0,0,0,0.06)] border-[#C6A04A]/50'
                : 'bg-white shadow-[0_20px_50px_rgba(198,160,74,0.5),0_0_80px_rgba(255,255,255,0.15)] border-[#C6A04A]'
            }`}
          >
            <img
              src="/logo.png"
              alt="APL Season 9 Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(198,160,74,0.45)] hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Cinematic Centered Typography */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#C6A04A]" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.35em] text-[#C6A04A]">
              APL SEASON 9
            </span>
            <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#C6A04A]" />
          </div>

          <h1
            className={`font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight transition-colors duration-500 ${
              isWhite
                ? 'text-slate-900 drop-shadow-xs'
                : 'text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#DFB85C] to-[#8C6D23] drop-shadow-[0_4px_24px_rgba(198,160,74,0.4)]'
            }`}
          >
            HOUSE CHAMPIONSHIP
          </h1>

          <p
            className={`text-[10px] sm:text-xs font-mono tracking-widest uppercase transition-colors ${
              isWhite ? 'text-slate-500 font-semibold' : 'text-slate-400'
            }`}
          >
            5 Houses • 8 Sports • 10 Teams • One Champion
          </p>
        </div>

        {/* Minimal Luxury Progress Bar */}
        <div className="w-52 sm:w-64 mt-6 sm:mt-7 space-y-1.5 animate-in fade-in duration-700 delay-300">
          <div
            className={`h-1.5 w-full rounded-full overflow-hidden p-0.5 border relative ${
              isWhite ? 'bg-slate-200/80 border-slate-300' : 'bg-white/[0.06] border-white/[0.08]'
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8C6D23] via-[#C6A04A] to-[#FFF2B2] transition-all duration-150 shadow-[0_0_12px_rgba(198,160,74,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className={`flex items-center justify-between text-[10px] font-mono px-0.5 ${
              isWhite ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span className="text-[#C6A04A] tracking-wider font-bold animate-pulse">
              {statusText}
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Direct Clickable Enter Button */}
        <div className="mt-5">
          <button
            onClick={handleDismiss}
            className={`px-7 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 ${
              isWhite
                ? 'bg-slate-900 hover:bg-slate-800 text-[#F3D787] border border-[#C6A04A]/60 shadow-slate-900/15'
                : 'bg-[#C6A04A] hover:bg-[#B38F3A] text-slate-950 shadow-[#C6A04A]/30'
            }`}
          >
            Enter Portal →
          </button>
        </div>
      </div>
    </div>
  );
}
