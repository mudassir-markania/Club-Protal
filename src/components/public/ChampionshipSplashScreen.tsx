'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 3200
  forceShow?: boolean;
}

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 3200,
}: ChampionshipSplashScreenProps) {
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

  // Canvas floating golden embers background
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

    // 50 floating golden particles
    const particles = Array.from({ length: 50 }, () => ({
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

      // Deep dark vignette with center golden radial glow
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

      // Particles
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

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

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

    const dismiss = setTimeout(() => {
      handleDismiss();
    }, autoDismissDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(dismissTimer);
      clearInterval(interval);
    };
  }, [autoDismissDelay]);

  const dismissTimer = setTimeout(() => {}, 0);

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

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05070B] text-white overflow-hidden transition-all duration-600 select-none ${
        !closing ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
      }`}
    >
      {/* Background Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Subtle Circular Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,160,74,0.06)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Top Right Controls (Quietly placed so they don't break center symmetry) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleSound}
          title={audioEnabled ? 'Mute' : 'Sound'}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-[#C6A04A] transition"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-[#C6A04A]" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDismiss}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-400 hover:text-white transition group"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* EXACT DEAD CENTER HERO STAGE */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto px-4">
        {/* LOGO IN DEAD CENTER WITH GOLD PULSING AURA */}
        <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
          {/* Radiant Ambient Back-glow */}
          <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#C6A04A]/25 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[#FFF2B2]/15 blur-2xl pointer-events-none" />

          {/* Elegant Rotating Orbital Rings */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-full border border-[#C6A04A]/30 border-t-[#FFF2B2] animate-spin [animation-duration:9s] pointer-events-none" />
          <div className="absolute -inset-8 sm:-inset-10 rounded-full border border-white/5 border-b-[#C6A04A]/40 animate-spin [animation-duration:15s] [animation-direction:reverse] pointer-events-none" />

          {/* Centered High-Res APL Logo */}
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 flex items-center justify-center animate-in zoom-in-75 duration-700">
            <img
              src="/logo.png"
              alt="APL Season 9 Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(198,160,74,0.65)] hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Cinematic Centered Typography */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#C6A04A]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#C6A04A]">
              APL SEASON 9
            </span>
            <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#C6A04A]" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2B2] via-[#DFB85C] to-[#8C6D23] drop-shadow-[0_4px_24px_rgba(198,160,74,0.4)]">
            HOUSE CHAMPIONSHIP
          </h1>

          <p className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-widest uppercase">
            5 Houses • 8 Sports • 10 Teams • One Champion
          </p>
        </div>

        {/* Minimal Luxury Progress Bar */}
        <div className="w-52 sm:w-64 mt-6 sm:mt-8 space-y-1.5 animate-in fade-in duration-700 delay-300">
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.08] relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8C6D23] via-[#C6A04A] to-[#FFF2B2] transition-all duration-150 shadow-[0_0_12px_rgba(198,160,74,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-0.5">
            <span className="text-[#F3D787] tracking-wider font-semibold animate-pulse">
              {statusText}
            </span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Direct Clickable Enter Button */}
        <div className="mt-5">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 rounded-full bg-[#C6A04A] hover:bg-[#B38F3A] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#C6A04A]/30 hover:scale-105 active:scale-95"
          >
            Enter Portal →
          </button>
        </div>
      </div>
    </div>
  );
}
