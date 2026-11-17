'use client';

import React from 'react';

/**
 * Pure SVG & CSS High-Precision Arena Stadium Background
 * 100% PURE CODE — ZERO RASTER IMAGES.
 * Features:
 * - Radiant daylight arena sky with multi-stop volumetric sunbeam flare
 * - Architectural stadium steel floodlight towers with 16-lamp matrix and realistic volumetric light cones
 * - Spectator seating grandstand tiers with architectural seating raker curves
 * - Nexcore Institute "NT" heraldic tournament pennants with metallic gold trim
 * - Dynamic fluid athletic 3D swooshes in cyan/azure and sports flame orange
 */
export default function HeroStadiumBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Daylight Atmosphere Base Gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 95% 75% at 75% 15%, #FFFFFF 0%, #EBF4FC 35%, #D9ECFA 70%, #EFF6FC 100%)',
        }}
      />

      {/* 2. Top-Right Stadium Floodlight Flare & Ambient Sun Glow */}
      <div
        className="absolute -top-32 right-[-5%] w-[750px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.98) 0%, rgba(254,240,138,0.5) 25%, rgba(56,189,248,0.22) 55%, transparent 75%)',
          filter: 'blur(40px)',
        }}
      />

      {/* 3. Left Ambient Cyan Flare */}
      <div
        className="absolute -top-20 -left-20 w-[550px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(56,189,248,0.35) 0%, rgba(2,132,199,0.14) 40%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />

      {/* 4. Full SVG Stadium Architecture, Floodlights, Pennants & Ribbons */}
      <svg
        viewBox="0 0 1440 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Volumetric Floodlight Beams */}
          <linearGradient id="light-beam-left" x1="0%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#BAE6FD" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="light-beam-right" x1="100%" y1="0%" x2="30%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="30%" stopColor="#FEF08A" stopOpacity="0.3" />
            <stop offset="65%" stopColor="#BAE6FD" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
          </linearGradient>

          {/* Grandstand Seating Tiers */}
          <linearGradient id="grandstand-tier-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBE4F9" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#B3D7F5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D5E8F8" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="grandstand-tier-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B9DCF7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E2F0FB" stopOpacity="0.1" />
          </linearGradient>

          {/* Pennant Cloth Gradients */}
          <linearGradient id="banner-navy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2B5C" />
            <stop offset="50%" stopColor="#071E42" />
            <stop offset="100%" stopColor="#04122A" />
          </linearGradient>

          <linearGradient id="banner-gold-trim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Aerodynamic 3D Sports Swooshes */}
          <linearGradient id="swoosh-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#0284C7" />
            <stop offset="70%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#012B68" />
          </linearGradient>

          <linearGradient id="swoosh-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA216" />
            <stop offset="45%" stopColor="#F97316" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>

          {/* Realistic Soft Drop Shadow for Swooshes */}
          <filter id="ribbon-shadow" x="-5%" y="-10%" width="115%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#06214A" floodOpacity="0.22" />
          </filter>

          <filter id="pennant-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#041633" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* A. DISTANT ARCHITECTURAL GRANDSTAND & SEATING CURVES          */}
        {/* ------------------------------------------------------------- */}
        {/* Distant Stadium Roof Canopy Curve */}
        <path
          d="M -100 280 Q 720 170 1540 280 L 1540 430 Q 720 320 -100 430 Z"
          fill="url(#grandstand-tier-2)"
        />
        {/* Mid-tier seating deck curve */}
        <path
          d="M -100 340 Q 720 240 1540 340 L 1540 470 Q 720 370 -100 470 Z"
          fill="url(#grandstand-tier-1)"
        />
        {/* Seating Raker Accent Lines for architectural realism */}
        <path
          d="M 100 325 Q 720 250 1340 325"
          stroke="#93C5FD"
          strokeWidth="1.5"
          strokeOpacity="0.45"
          strokeDasharray="6 4"
        />
        <path
          d="M 50 365 Q 720 285 1390 365"
          stroke="#60A5FA"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          strokeDasharray="8 5"
        />
        <path
          d="M 0 405 Q 720 325 1440 405"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        {/* ------------------------------------------------------------- */}
        {/* B. VOLUMETRIC FLOODLIGHT LIGHT BEAMS                          */}
        {/* ------------------------------------------------------------- */}
        {/* Left Floodlight Cones washing across arena */}
        <polygon points="50,110 540,390 400,500 35,130" fill="url(#light-beam-left)" />
        <polygon points="50,110 770,430 600,530 35,130" fill="url(#light-beam-left)" opacity="0.65" />

        {/* Right Floodlight Cones washing down towards Trophy */}
        <polygon points="1390,95 840,340 730,500 1410,120" fill="url(#light-beam-right)" />
        <polygon points="1390,95 1060,450 900,580 1410,120" fill="url(#light-beam-right)" opacity="0.8" />

        {/* ------------------------------------------------------------- */}
        {/* C. LEFT STADIUM FLOODLIGHT TOWER                              */}
        {/* ------------------------------------------------------------- */}
        <g id="left-floodlight-tower" transform="translate(18, 65)">
          {/* Steel Pylon Lattice Mast */}
          <path d="M 32 60 L 22 240 M 48 60 L 58 240" stroke="#64748B" strokeWidth="2.5" />
          <line x1="28" y1="95" x2="52" y2="95" stroke="#64748B" strokeWidth="1.5" />
          <line x1="26" y1="135" x2="54" y2="135" stroke="#64748B" strokeWidth="1.5" />
          <line x1="24" y1="175" x2="56" y2="175" stroke="#64748B" strokeWidth="1.5" />
          <line x1="22" y1="215" x2="58" y2="215" stroke="#64748B" strokeWidth="1.5" />
          <line x1="28" y1="95" x2="54" y2="135" stroke="#94A3B8" strokeWidth="1" />
          <line x1="52" y1="95" x2="26" y2="135" stroke="#94A3B8" strokeWidth="1" />
          <line x1="26" y1="135" x2="56" y2="175" stroke="#94A3B8" strokeWidth="1" />
          <line x1="54" y1="135" x2="24" y2="175" stroke="#94A3B8" strokeWidth="1" />

          {/* Lamp Bank Head Mounting Bar (Angled down ~12°) */}
          <rect x="0" y="30" width="82" height="24" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1.5" transform="rotate(12, 40, 42)" />
          {/* 12 High-Power LED Floodlight Lamps (4x3 array) */}
          {[0, 1, 2, 3].map((col) => (
            <React.Fragment key={col}>
              <circle cx={14 + col * 17} cy={37} r={4.5} fill="#FFFFFF" filter="drop-shadow(0 0 8px #38BDF8)" />
              <circle cx={14 + col * 17} cy={47} r={4.5} fill="#FFFFFF" filter="drop-shadow(0 0 8px #38BDF8)" />
            </React.Fragment>
          ))}
          {/* Overpowering Glow Flare on Bank */}
          <ellipse cx="40" cy="42" rx="55" ry="26" fill="#FFFFFF" fillOpacity="0.5" filter="blur(8px)" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* D. RIGHT STADIUM FLOODLIGHT TOWER                             */}
        {/* ------------------------------------------------------------- */}
        <g id="right-floodlight-tower" transform="translate(1342, 50)">
          {/* Steel Pylon Lattice Mast */}
          <path d="M 48 60 L 58 240 M 32 60 L 22 240" stroke="#64748B" strokeWidth="2.5" />
          <line x1="28" y1="95" x2="52" y2="95" stroke="#64748B" strokeWidth="1.5" />
          <line x1="26" y1="135" x2="54" y2="135" stroke="#64748B" strokeWidth="1.5" />
          <line x1="24" y1="175" x2="56" y2="175" stroke="#64748B" strokeWidth="1.5" />
          <line x1="22" y1="215" x2="58" y2="215" stroke="#64748B" strokeWidth="1.5" />

          {/* Lamp Bank Head Mounting Bar (Angled down ~15° towards trophy) */}
          <rect x="0" y="30" width="82" height="24" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1.5" transform="rotate(-15, 40, 42)" />
          {[0, 1, 2, 3].map((col) => (
            <React.Fragment key={col}>
              <circle cx={14 + col * 17} cy={37} r={4.5} fill="#FFFBEB" filter="drop-shadow(0 0 9px #FEF08A)" />
              <circle cx={14 + col * 17} cy={47} r={4.5} fill="#FFFBEB" filter="drop-shadow(0 0 9px #FEF08A)" />
            </React.Fragment>
          ))}
          <ellipse cx="40" cy="42" rx="60" ry="30" fill="#FFFBEB" fillOpacity="0.6" filter="blur(9px)" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* E. NEXCORE "NT" HERALDIC TOURNAMENT PENNANTS                  */}
        {/* ------------------------------------------------------------- */}
        {/* Left Pennant Banner */}
        <g id="left-pennant" transform="translate(18, 225)" filter="url(#pennant-shadow)">
          <line x1="0" y1="0" x2="65" y2="0" stroke="url(#banner-gold-trim)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
          <circle cx="65" cy="0" r="3.5" fill="#F59E0B" />
          {/* Pennant Cloth with Chevron Swallowtail */}
          <path
            d="M 6 0 L 59 0 L 59 85 L 32.5 105 L 6 85 Z"
            fill="url(#banner-navy)"
            stroke="url(#banner-gold-trim)"
            strokeWidth="1.8"
          />
          {/* "NT" Monogram */}
          <text
            x="32.5"
            y="56"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="26"
            fontStyle="italic"
            letterSpacing="1"
            fill="url(#banner-gold-trim)"
          >
            NT
          </text>
        </g>

        {/* Right Pennant Banner */}
        <g id="right-pennant" transform="translate(1357, 215)" filter="url(#pennant-shadow)">
          <line x1="0" y1="0" x2="65" y2="0" stroke="url(#banner-gold-trim)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
          <circle cx="65" cy="0" r="3.5" fill="#F59E0B" />
          <path
            d="M 6 0 L 59 0 L 59 85 L 32.5 105 L 6 85 Z"
            fill="url(#banner-navy)"
            stroke="url(#banner-gold-trim)"
            strokeWidth="1.8"
          />
          <text
            x="32.5"
            y="56"
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="26"
            fontStyle="italic"
            letterSpacing="1"
            fill="url(#banner-gold-trim)"
          >
            NT
          </text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* F. SWEEPING 3D ATHLETIC SWOOSHES / RIBBONS                    */}
        {/* ------------------------------------------------------------- */}
        {/* Top-Left Corner Fluid Azure Arch */}
        <path
          d="M -40 -10 C 60 40, 180 80, 310 50 C 380 30, 420 10, 480 -30 L -40 -30 Z"
          fill="url(#swoosh-cyan)"
          opacity="0.85"
        />

        {/* Primary Bottom Azure Swoosh with Drop Shadow */}
        <path
          d="M -60 520 C 180 470, 420 540, 720 580 C 1020 620, 1280 570, 1500 480 L 1500 660 L -60 660 Z"
          fill="url(#swoosh-cyan)"
          filter="url(#ribbon-shadow)"
        />

        {/* Gloss Specular Highlight Line on Azure Swoosh */}
        <path
          d="M -60 520 C 180 470, 420 540, 720 580 C 1020 620, 1280 570, 1500 480"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeOpacity="0.75"
          fill="none"
        />

        {/* Dynamic Sports Flame Orange Sweeping Ribbon */}
        <path
          d="M -80 570 C 160 515, 380 565, 680 600 C 980 635, 1260 595, 1520 520 L 1520 660 L -80 660 Z"
          fill="url(#swoosh-orange)"
          opacity="0.95"
        />

        {/* Orange Ribbon Top Accent Highlight */}
        <path
          d="M -80 570 C 160 515, 380 565, 680 600 C 980 635, 1260 595, 1520 520"
          stroke="#FED7AA"
          strokeWidth="2"
          strokeOpacity="0.85"
          fill="none"
        />
      </svg>
    </div>
  );
}
