'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, ChevronRight } from 'lucide-react';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 3400
}

const HOUSE_NODES = [
  { name: 'BLUE', color: '#0051d5', label: 'COBALT' },
  { name: 'GREEN', color: '#10b981', label: 'EMERALD' },
  { name: 'GOLD', color: '#f59e0b', label: 'SOLAR' },
  { name: 'PURPLE', color: '#a855f7', label: 'IMPERIAL' },
  { name: 'RED', color: '#ef4444', label: 'CRIMSON' },
];

const HUD_MESSAGES = [
  'INITIALIZING NEXCORE TOURNAMENT ENGINE...',
  'SYNCHRONIZING 5 HOUSE ROSTERS & CRESTS...',
  'CALIBRATING 6 CHAMPIONSHIP ARENAS...',
  'VERIFYING 94 ATHLETES & SCORING MATRIX...',
  'ENGAGING STADIUM FLOODLIGHTS • SYSTEM LIVE',
];

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 3200,
}: ChampionshipSplashScreenProps) {
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hudIndex, setHudIndex] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Dynamic HUD Status Ticker
  useEffect(() => {
    const hudInterval = setInterval(() => {
      setHudIndex((prev) => (prev + 1) % HUD_MESSAGES.length);
    }, 600);
    return () => clearInterval(hudInterval);
  }, []);

  // 2. High-Tech Smooth Progress Counter
  useEffect(() => {
    const startTime = Date.now();
    const duration = autoDismissDelay - 400;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        handleDismiss();
      }
    }, 30);

    return () => clearInterval(timer);
  }, [autoDismissDelay]);

  // 3. Keyboard Escape / Spacebar Listener
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

  // 4. Crazy Particle Vortex Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Setup
    const particlesCount = 90;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 1000 + 100,
      size: Math.random() * 2 + 1,
      color: HOUSE_NODES[Math.floor(Math.random() * HOUSE_NODES.length)].color,
      speed: Math.random() * 4 + 2,
    }));

    // Beams of Light
    let sweepAngle = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw sweeping spotlight cones
      sweepAngle += 0.015;
      const grad1 = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(width, height) * 0.7);
      grad1.addColorStop(0, 'rgba(0, 81, 213, 0.15)');
      grad1.addColorStop(0.5, 'rgba(235, 105, 5, 0.06)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Draw 3D hyperspace stars rushing outward
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.z -= p.speed * (closing ? 5 : 1);

        if (p.z <= 0) {
          p.z = 1000;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 250 / p.z;
        const px = p.x * k + cx;
        const py = p.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (1000 - p.z) / 400);
          const rad = p.size * k;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, rad), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.fill();

          // Particle streak
          const prevK = 250 / (p.z + p.speed * 2.5);
          const prevPx = p.x * prevK + cx;
          const prevPy = p.y * prevK + cy;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(prevPx, prevPy);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.4, rad * 0.7);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [closing]);

  const handleDismiss = () => {
    if (closing) return;
    setIsWarping(true);
    setClosing(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 550);
  };

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-[#000511] text-white select-none cursor-pointer transition-all duration-500 ${
        isWarping ? 'scale-110 opacity-0 blur-md pointer-events-none' : 'scale-100 opacity-100'
      }`}
    >
      {/* 1. Interactive 3D Cosmic Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* 2. Top Broadcast Status Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between text-xs tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-amber-400 font-extrabold uppercase tracking-widest text-[11px]">APL//S9</span>
            <span className="text-white/40">•</span>
            <span className="text-[#a5b4fc] text-[10px] hidden sm:inline uppercase">NexCore Inter-House Championship</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-md"
        >
          <span>Skip Intro</span>
          <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">⚡</span>
          <span className="hidden sm:inline text-white/50 text-[9px]">[ESC]</span>
        </button>
      </header>

      {/* 3. Central Holographic Arena Stage */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto px-4 max-w-xl text-center">
        {/* Holographic Concentric Shockwave Rings */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Rotating Outer Tech Compass Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_24s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-sky-500/20 animate-[spin_16s_linear_infinite_reverse]" />
          <div className="absolute inset-8 rounded-full border border-white/10 animate-ping opacity-25" />

          {/* 5 Orbiting House Energy Nodes */}
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
            {HOUSE_NODES.map((h, i) => {
              const angle = (i * 360) / HOUSE_NODES.length;
              return (
                <div
                  key={h.name}
                  className="absolute top-1/2 left-1/2 w-3.5 h-3.5 -mt-1.75 -ml-1.75 rounded-full shadow-[0_0_12px_currentColor]"
                  style={{
                    color: h.color,
                    backgroundColor: h.color,
                    transform: `rotate(${angle}deg) translate(128px) rotate(-${angle}deg)`,
                  }}
                />
              );
            })}
          </div>

          {/* Glowing Ambient Core Radial Aura */}
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-amber-500/25 via-blue-600/30 to-purple-600/25 blur-2xl animate-pulse" />

          {/* Central Golden APL Trophy Logo */}
          <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-105">
            <img
              src="/logo.png"
              alt="APL Season 9 Crest"
              className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(245,158,11,0.65)] animate-[bounce_4s_easeInOut_infinite]"
            />
          </div>

          {/* Equalizer Sound Frequency Bars under Trophy */}
          <div className="absolute -bottom-2 flex items-end gap-1.5 h-6">
            <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3" />
            <span className="w-1 bg-amber-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-5" />
            <span className="w-1 bg-sky-400 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-4" />
            <span className="w-1 bg-sky-300 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-6" />
            <span className="w-1 bg-purple-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3" />
          </div>
        </div>

        {/* Cinematic Headline & Subtitle */}
        <div className="mt-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest font-extrabold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Collegiate Arena Championship</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-manrope leading-none">
            <span>APL</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              SEASON 9
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-medium tracking-wide text-[#b7c4fd] font-sans max-w-md mx-auto">
            Five Regimental Houses. Six Historic Sports. One Collegiate Legacy.
          </p>
        </div>

        {/* High-Tech Telemetry Loading HUD */}
        <div className="w-full max-w-sm mt-8 space-y-3">
          {/* Progress Bar Container */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60 tracking-wider">SYSTEM INITIALIZATION</span>
              <span className="text-amber-400 font-bold">{progress}%</span>
            </div>

            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Cycling Live Telemetry Subtext */}
          <div className="h-6 flex items-center justify-center font-mono text-[10px] text-amber-300/80 tracking-widest uppercase truncate animate-pulse">
            <span>&gt; {HUD_MESSAGES[hudIndex]}</span>
          </div>
        </div>
      </main>

      {/* 4. Bottom Interactive Arena Enter Pill */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>BROADCAST NETWORK CONNECTED</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="group px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#eb6905] to-amber-500 hover:from-amber-500 hover:to-[#eb6905] text-white font-black text-xs uppercase tracking-wider font-manrope shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>ENTER THE ARENA</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
}
