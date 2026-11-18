'use client';

import React from 'react';

/**
 * Dark Cinematic Arena Night Background
 * 100% PURE CODE — ZERO RASTER IMAGES.
 * Features:
 * - Deep navy/black arena night atmosphere with volumetric fog
 * - Dramatic stadium floodlight towers with blinding white beams on dark
 * - Golden particle dust & lens flare effects
 * - Sweeping gold/amber + navy ribbon swooshes (cinematic sports broadcast style)
 * - Atmospheric glow rings and crowd silhouette base
 */
export default function HeroStadiumBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Deep Dark Arena Base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 130% 100% at 65% 0%, #0D1F3C 0%, #060E1E 40%, #030812 75%, #020609 100%)',
        }}
      />

      {/* 2. Right-side gold atmospheric haze (behind trophy) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '-5%',
          top: '-10%',
          width: '70%',
          height: '110%',
          background: 'radial-gradient(ellipse 70% 80% at 70% 40%, rgba(245,158,11,0.13) 0%, rgba(234,179,8,0.07) 35%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* 3. Left cyan accent glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-10%',
          top: '0%',
          width: '55%',
          height: '70%',
          background: 'radial-gradient(ellipse 60% 70% at 25% 30%, rgba(14,165,233,0.09) 0%, rgba(2,132,199,0.05) 45%, transparent 75%)',
          filter: 'blur(25px)',
        }}
      />

      {/* 4. Full SVG Layer: Towers, Beams, Swooshes, Architecture */}
      <svg
        viewBox="0 0 1440 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Floodlight beam — cool white on dark */}
          <linearGradient id="beam-left" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#BAE6FD" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#7DD3FC" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="beam-right" x1="100%" y1="0%" x2="20%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="25%" stopColor="#FEF9C3" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#BAE6FD" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>

          {/* Gold ribbon gradient */}
          <linearGradient id="ribbon-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="15%" stopColor="#B45309" />
            <stop offset="38%" stopColor="#F59E0B" />
            <stop offset="55%" stopColor="#FDE68A" />
            <stop offset="72%" stopColor="#F59E0B" />
            <stop offset="90%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Deep navy accent ribbon */}
          <linearGradient id="ribbon-navy" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="25%" stopColor="#0C1A36" />
            <stop offset="55%" stopColor="#0F2655" />
            <stop offset="85%" stopColor="#091A3A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Orange flame ribbon */}
          <linearGradient id="ribbon-orange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C2D12" />
            <stop offset="20%" stopColor="#C2410C" />
            <stop offset="45%" stopColor="#F97316" />
            <stop offset="65%" stopColor="#FB923C" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>

          {/* Tower steel gradient */}
          <linearGradient id="tower-steel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="30%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#334155" />
            <stop offset="85%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Banner cloth */}
          <linearGradient id="banner-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2B5C" />
            <stop offset="50%" stopColor="#071E42" />
            <stop offset="100%" stopColor="#04122A" />
          </linearGradient>

          <linearGradient id="banner-gold-trim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Crowd silhouette */}
          <linearGradient id="crowd-dark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A1628" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#020609" stopOpacity="0.5" />
          </linearGradient>

          <filter id="glow-lamp">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ------------------------------------------------------------------ */}
        {/* A. DARK GRANDSTAND SILHOUETTE (bottom crowd shape)                  */}
        {/* ------------------------------------------------------------------ */}
        <path
          d="M -20 640 L -20 310 Q 180 290 360 300 Q 540 310 720 295 Q 900 280 1080 295 Q 1260 310 1460 290 L 1460 640 Z"
          fill="url(#crowd-dark)"
          opacity="0.6"
        />
        {/* Row lines to suggest stadium seating */}
        {[320, 340, 360, 380, 400].map((y, i) => (
          <path
            key={i}
            d={`M -20 ${y} Q 360 ${y - 15} 720 ${y + 5} Q 1080 ${y + 20} 1460 ${y - 10}`}
            stroke="#0F2655"
            strokeWidth="1.2"
            strokeOpacity={0.4 - i * 0.06}
            fill="none"
          />
        ))}

        {/* ------------------------------------------------------------------ */}
        {/* B. LEFT FLOODLIGHT TOWER                                            */}
        {/* ------------------------------------------------------------------ */}
        <g id="left-tower" transform="translate(28, 80)">
          <rect x="31" y="0" width="18" height="250" rx="2" fill="url(#tower-steel)" />
          <line x1="31" y1="60" x2="49" y2="60" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="110" x2="49" y2="110" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="165" x2="49" y2="165" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="215" x2="49" y2="215" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="60" x2="49" y2="110" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="49" y1="60" x2="31" y2="110" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="31" y1="110" x2="49" y2="165" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.6" />
          <line x1="49" y1="110" x2="31" y2="165" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.6" />
          <rect x="-5" y="-8" width="90" height="22" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" transform="rotate(-12, 40, 6)" />
          {[0,1,2,3].map(col => (
            <React.Fragment key={col}>
              <circle cx={8 + col * 18} cy={3} r={5} fill="#FFFDE0" filter="url(#glow-lamp)" />
              <circle cx={8 + col * 18} cy={14} r={5} fill="#FFFDE0" filter="url(#glow-lamp)" />
            </React.Fragment>
          ))}
          <ellipse cx="40" cy="8" rx="70" ry="28" fill="#FFFDE0" fillOpacity="0.18" style={{filter:'blur(14px)'}} />
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* C. RIGHT FLOODLIGHT TOWER                                           */}
        {/* ------------------------------------------------------------------ */}
        <g id="right-tower" transform="translate(1360, 70)">
          <rect x="31" y="0" width="18" height="250" rx="2" fill="url(#tower-steel)" />
          <line x1="31" y1="60" x2="49" y2="60" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="110" x2="49" y2="110" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="165" x2="49" y2="165" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="215" x2="49" y2="215" stroke="#334155" strokeWidth="1.5" />
          <line x1="31" y1="60" x2="49" y2="110" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="49" y1="60" x2="31" y2="110" stroke="#1E293B" strokeWidth="1" strokeOpacity="0.8" />
          <rect x="-5" y="-8" width="90" height="22" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" transform="rotate(12, 40, 6)" />
          {[0,1,2,3].map(col => (
            <React.Fragment key={col}>
              <circle cx={8 + col * 18} cy={3} r={5} fill="#FFFDE0" filter="url(#glow-lamp)" />
              <circle cx={8 + col * 18} cy={14} r={5} fill="#FFFDE0" filter="url(#glow-lamp)" />
            </React.Fragment>
          ))}
          <ellipse cx="40" cy="8" rx="70" ry="28" fill="#FFFDE0" fillOpacity="0.18" style={{filter:'blur(14px)'}} />
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* D. VOLUMETRIC FLOODLIGHT BEAMS (dramatic on dark)                   */}
        {/* ------------------------------------------------------------------ */}
        <path d="M 100 95 L 480 420 L 540 420 L 115 95 Z" fill="url(#beam-left)" opacity="0.5" />
        <path d="M 90 92 L 300 450 L 360 450 L 110 92 Z" fill="url(#beam-left)" opacity="0.3" />
        <path d="M 1385 88 L 950 400 L 900 400 L 1370 88 Z" fill="url(#beam-right)" opacity="0.55" />
        <path d="M 1395 90 L 1150 460 L 1100 460 L 1375 90 Z" fill="url(#beam-right)" opacity="0.28" />

        {/* ------------------------------------------------------------------ */}
        {/* E. NT TOURNAMENT PENNANTS                                            */}
        {/* ------------------------------------------------------------------ */}
        <g transform="translate(26, 220)">
          <line x1="0" y1="0" x2="66" y2="0" stroke="url(#banner-gold-trim)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="4" fill="#F59E0B" />
          <circle cx="66" cy="0" r="4" fill="#F59E0B" />
          <path d="M 6 0 L 60 0 L 60 90 L 33 112 L 6 90 Z" fill="url(#banner-dark)" stroke="url(#banner-gold-trim)" strokeWidth="1.8" />
          <text x="33" y="60" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="27" fontStyle="italic" letterSpacing="1" fill="url(#banner-gold-trim)">NT</text>
        </g>
        <g transform="translate(1356, 210)">
          <line x1="0" y1="0" x2="66" y2="0" stroke="url(#banner-gold-trim)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="4" fill="#F59E0B" />
          <circle cx="66" cy="0" r="4" fill="#F59E0B" />
          <path d="M 6 0 L 60 0 L 60 90 L 33 112 L 6 90 Z" fill="url(#banner-dark)" stroke="url(#banner-gold-trim)" strokeWidth="1.8" />
          <text x="33" y="60" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="27" fontStyle="italic" letterSpacing="1" fill="url(#banner-gold-trim)">NT</text>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* F. CINEMATIC GOLD + NAVY SWOOSH RIBBONS (bottom)                    */}
        {/* ------------------------------------------------------------------ */}
        <path d="M -60 500 C 200 455, 480 510, 720 540 C 960 570, 1240 525, 1500 460 L 1500 660 L -60 660 Z" fill="url(#ribbon-navy)" opacity="0.95" />
        <path d="M -60 528 C 180 480, 440 532, 720 558 C 1000 584, 1280 540, 1500 480 L 1500 548 C 1280 608, 1000 652, 720 626 C 440 600, 180 548, -60 596 Z" fill="url(#ribbon-gold)" opacity="0.85" />
        <path d="M -60 528 C 180 480, 440 532, 720 558 C 1000 584, 1280 540, 1500 480" stroke="#FEF08A" strokeWidth="2" strokeOpacity="0.7" fill="none" />
        <path d="M -80 560 C 160 510, 400 558, 720 582 C 1040 606, 1300 562, 1520 505 L 1520 660 L -80 660 Z" fill="url(#ribbon-orange)" opacity="0.9" />
        <path d="M -80 560 C 160 510, 400 558, 720 582 C 1040 606, 1300 562, 1520 505" stroke="#FED7AA" strokeWidth="2" strokeOpacity="0.75" fill="none" />

        {/* ------------------------------------------------------------------ */}
        {/* G. GOLDEN PARTICLE DUST (scattered dots)                             */}
        {/* ------------------------------------------------------------------ */}
        {[
          {cx:320,cy:120,r:1.8,op:0.6},{cx:450,cy:85,r:1.2,op:0.4},{cx:600,cy:140,r:2.0,op:0.5},
          {cx:200,cy:200,r:1.5,op:0.35},{cx:380,cy:60,r:1.0,op:0.5},{cx:520,cy:170,r:1.6,op:0.45},
          {cx:160,cy:300,r:1.2,op:0.3},{cx:700,cy:50,r:1.4,op:0.55},{cx:880,cy:80,r:1.8,op:0.4},
          {cx:1100,cy:130,r:1.5,op:0.5},{cx:1200,cy:60,r:1.2,op:0.35},{cx:1050,cy:200,r:1.6,op:0.45},
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#FDE68A" opacity={p.op} />
        ))}
      </svg>

      {/* 5. Central arena floodlight glow point (pure CSS, behind trophy) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '25%',
          top: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle at center, rgba(255,250,205,0.07) 0%, rgba(245,158,11,0.05) 25%, transparent 65%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 6. Bottom vignette to blend into page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(2,6,9,0.6) 100%)',
        }}
      />
    </div>
  );
}
