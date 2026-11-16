'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trophy, Zap, Shield, Sparkles, Volume2, VolumeX, ArrowRight, X } from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';

interface ChampionshipSplashScreenProps {
  onComplete?: () => void;
  autoDismissDelay?: number; // ms, default 3600
  forceShow?: boolean;
}

const HOUSES = [
  { code: 'MAV', name: 'Blue', color: '#3B82F6', team: 'Mavericks', glow: 'rgba(59, 130, 246, 0.5)' },
  { code: 'DOM', name: 'Red', color: '#EF4444', team: 'Dominator', glow: 'rgba(239, 68, 68, 0.5)' },
  { code: 'ALP', name: 'Green', color: '#10B981', team: 'Alpha', glow: 'rgba(16, 185, 129, 0.5)' },
  { code: 'RYL', name: 'Purple', color: '#A855F7', team: 'Royal Force', glow: 'rgba(168, 85, 247, 0.5)' },
  { code: 'CRW', name: 'Yellow', color: '#F59E0B', team: 'Crown Crushers', glow: 'rgba(245, 158, 11, 0.5)' },
];

export default function ChampionshipSplashScreen({
  onComplete,
  autoDismissDelay = 3800,
  forceShow = false,
}: ChampionshipSplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'ignite' | 'reveal' | 'houses' | 'ready'>('ignite');
  const [statusText, setStatusText] = useState('INITIALIZING ARENA...');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play cinematic sub-bass whoosh using native browser Web Audio API
  const playCinematicSound = (type: 'whoosh' | 'chime' | 'bass') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'whoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
      } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 harmonic
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Canvas golden particle starfield effect
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

    // Create 70 floating golden sparks & stars
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -Math.random() * 1.2 - 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * 0.05 + 0.02,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radial dark gold ambient glow in center
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6
      );
      gradient.addColorStop(0, 'rgba(198, 160, 74, 0.12)');
      gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.3)');
      gradient.addColorStop(1, 'rgba(5, 7, 11, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render golden particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += p.pulse;
        if (p.alpha > 0.9 || p.alpha < 0.2) p.pulse = -p.pulse;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 215, 135, ${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#C6A04A';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Choreographed splash sequence timer
  useEffect(() => {
    // 0ms: ignite
    setPhase('ignite');

    // 400ms: reveal text & play audio if allowed
    const t1 = setTimeout(() => {
      setPhase('reveal');
      playCinematicSound('whoosh');
      setStatusText('SYNCING THE 5 HOUSES...');
    }, 500);

    // 1200ms: houses illuminate
    const t2 = setTimeout(() => {
      setPhase('houses');
      setStatusText('CONNECTING 8 SPORTS MATRIX...');
    }, 1300);

    // 2200ms: ready
    const t3 = setTimeout(() => {
      setPhase('ready');
      playCinematicSound('chime');
      setStatusText('ARENA READY • ENTER CHAMPIONSHIP');
    }, 2300);

    // Progress bar counter 0 -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 3);
      });
    }, 70);

    // Auto dismiss after delay
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
  }, [autoDismissDelay]);

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 600);
  };

  const handleToggleSound = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    if (nextState) {
      playCinematicSound('chime');
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#05070B] text-white overflow-hidden transition-all duration-700 select-none ${
        !closing ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
      }`}
    >
      {/* Dynamic Starfield & Nebula Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#C6A04A08_1px,transparent_1px),linear-gradient(to_bottom,#C6A04A08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Top Bar: Edition tag & Skip button */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-[#C6A04A]/30 text-[11px] font-mono tracking-widest text-[#F3D787]">
          <span className="w-2 h-2 rounded-full bg-[#C6A04A] animate-ping" />
          <span>OFFICIAL APL SEASON 9 ARENA</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-[#C6A04A] transition"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-[#C6A04A]" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm group"
          >
            <span>Skip Intro</span>
            <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Stage */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 flex flex-col items-center text-center space-y-6 sm:space-y-8 my-auto">
        {/* Animated Trophy & Crest Glow */}
        <div className="relative">
          {/* Pulsing Concentric Golden Rings */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-[#C6A04A]/20 via-[#F3D787]/30 to-transparent blur-2xl animate-pulse pointer-events-none" />
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#0E131C] border-2 border-[#C6A04A]/60 flex items-center justify-center p-3 shadow-[0_0_50px_rgba(198,160,74,0.35)] relative overflow-hidden group">
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <img
              src="/logo.png"
              alt="APL Trophy"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(198,160,74,0.5)] transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-[#C6A04A] text-slate-950 text-[10px] font-black font-mono tracking-tighter shadow-md">
            S9
          </div>
        </div>

        {/* Hero Championship Title with Sweeping Metallic Gold */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] font-bold text-[#C6A04A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inter - Club Showdown</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-[#FFF3B0] via-[#F3D787] to-[#C6A04A] bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(198,160,74,0.4)]">
            HOUSE CHAMPIONSHIP
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-mono tracking-widest uppercase">
            5 Houses • 8 Sports • 10 Teams • One Champion
          </p>
        </div>

        {/* The 5 Houses Sequential Neon Badges */}
        <div
          className={`flex items-center justify-center gap-2 sm:gap-4 flex-wrap transition-all duration-700 ${
            phase === 'ignite' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {HOUSES.map((h, idx) => (
            <div
              key={h.code}
              style={{
                transitionDelay: `${idx * 120}ms`,
                boxShadow: phase === 'houses' || phase === 'ready' ? `0 0 16px ${h.glow}` : 'none',
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D121C] border border-white/[0.12] transition-all hover:scale-105"
            >
              <div
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: h.color, animationDuration: `${2 + idx * 0.4}s` }}
              />
              <span className="font-bold text-xs text-white">{h.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({h.team})</span>
            </div>
          ))}
        </div>

        {/* Cyber Progress Indicator & Status Log */}
        <div className="w-full max-w-md space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-[#F3D787]">
              <Zap className="w-3.5 h-3.5 text-[#C6A04A] animate-pulse" />
              <span>{statusText}</span>
            </span>
            <span className="font-bold text-white">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.1] relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#997328] via-[#C6A04A] to-[#FFF3B0] transition-all duration-150 relative shadow-[0_0_12px_rgba(198,160,74,0.7)]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-ping" />
            </div>
          </div>
        </div>

        {/* Interactive Enter Arena CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleDismiss}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#C6A04A] via-[#E2C36E] to-[#C6A04A] text-slate-950 font-bold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(198,160,74,0.4)] hover:shadow-[0_0_45px_rgba(198,160,74,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>ENTER THE ARENA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-6 flex items-center justify-between text-[11px] text-slate-500 font-mono relative z-10">
        <span>APL SEASON 9 • MAIN SPORTS COMPLEX</span>
        <span>LIVE TELEMETRY & CERTIFIED POINTS</span>
      </div>
    </div>
  );
}

