'use client';

import React from 'react';

/**
 * Pure SVG & CSS High-Precision Arena Stadium Background
 * NO RASTER IMAGES USED.
 * Features:
 * - Radiant daylight arena sky with sunbeam flare
 * - Realistic steel floodlight towers with 12-lamp matrix and volumetric light cones
 * - Architectural stadium grandstand tiers and spectator seating curves
 * - Nexcore Institute "NT" heraldic tournament banners with gold trim
 * - Dynamic fluid athletic ribbons in cyan/azure and sports flame orange
 */
export default function HeroStadiumBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Daylight Atmosphere Base Gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 75% 15%, #FFFFFF 0%, #E8F4FD 40%, #D8ECF9 75%, #F0F6FC 100%)',
        }}
      />

      {/* 2. Top-Right Stadium Floodlight Flare & Ambient Sun Glow */}
      <div
        className="absolute -top-24 right-[-5%] w-[650px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(254,240,138,0.45) 30%, rgba(56,189,248,0.2) 60%, transparent 80%)',
          filter: 'blur(35px)',
        }}
      />

      {/* 3. Left Ambient Cyan Flare */}
      <div
        className="absolute -top-16 -left-20 w-[480px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(56,189,248,0.3) 0%, rgba(2,132,199,0.12) 45%, transparent 75%)',
          filter: 'blur(40px)',
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
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#BAE6FD" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="light-beam-right" x1="100%" y1="0%" x2="30%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#FEF08A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0" />
          </linearGradient>

          {/* Grandstand Tier Gradients */}
          <linearGradient id="grandstand-tier-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="grandstand-tier-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.08" />
          </linearGradient>

          {/* Pennant Banners Gradient */}
          <linearGradient id="banner-navy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B2754" />
            <stop offset="50%" stopColor="#0A3A7E" />
            <stop offset="100%" stopColor="#051A3B" />
          </linearGradient>

          <linearGradient id="banner-gold-trim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Dynamic Aerodynamic Ribbons */}
          <linearGradient id="swoosh-cyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#0EA5E9" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="swoosh-blue-deep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0369A1" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#025492" />
          </linearGradient>

          <linearGradient id="swoosh-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA114" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Soft Shadow for Ribbons */}
          <filter id="ribbon-shadow" x="-5%" y="-10%" width="115%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0C2548" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* A. DISTANT ARCHITECTURAL GRANDSTAND & SEATING CURVES          */}
        {/* ------------------------------------------------------------- */}
        {/* Distant Stadium Roof Canopy Curve */}
        <path
          d="M -100 280 Q 720 180 1540 280 L 1540 420 Q 720 320 -100 420 Z"
          fill="url(#grandstand-tier-2)"
        />
        {/* Mid-tier seating deck curve */}
        <path
          d="M -100 340 Q 720 250 1540 340 L 1540 460 Q 720 370 -100 460 Z"
          fill="url(#grandstand-tier-1)"
        />
        {/* Seating Raker Accent Lines */}
        <path
          d="M 120 330 Q 720 260 1320 330"
          stroke="#93C5FD"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeDasharray="6 4"
        />
        <path
          d="M 60 370 Q 720 295 1380 370"
          stroke="#60A5FA"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          strokeDasharray="8 5"
        />
        <path
          d="M 0 410 Q 720 330 1440 410"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />

        {/* ------------------------------------------------------------- */}
        {/* B. VOLUMETRIC FLOODLIGHT LIGHT CONES                          */}
        {/* ------------------------------------------------------------- */}
        {/* Left Floodlight Cones washing across arena */}
        <polygon points="50,110 520,380 380,480 35,130" fill="url(#light-beam-left)" />
        <polygon points="50,110 750,420 580,520 35,130" fill="url(#light-beam-left)" opacity="0.6" />

        {/* Right Floodlight Cones washing down towards Trophy */}
        <polygon points="1390,95 860,340 760,490 1410,120" fill="url(#light-beam-right)" />
        <polygon points="1390,95 1060,440 920,560 1410,120" fill="url(#light-beam-right)" opacity="0.75" />

        {/* ------------------------------------------------------------- */}
        {/* C. LEFT STADIUM FLOODLIGHT TOWER                              */}
        {/* ------------------------------------------------------------- */}
        <g id="left-floodlight-tower" transform="translate(18, 65)">
          {/* Steel Pylon Lattice Mast */}
          <path d="M 32 60 L 22 240 M 48 60 L 58 240" stroke="#94A3B8" strokeWidth="2.5" />
          <line x1="28" y1="95" x2="52" y2="95" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="26" y1="135" x2="54" y2="135" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="24" y1="175" x2="56" y2="175" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="22" y1="215" x2="58" y2="215" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="28" y1="95" x2="54" y2="135" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="52" y1="95" x2="26" y2="135" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="26" y1="135" x2="56" y2="175" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="54" y1="135" x2="24" y2="175" stroke="#CBD5E1" strokeWidth="1" />

          {/* Lamp Bank Head Mounting Bar (Angled down ~15°) */}
          <rect x="0" y="30" width="80" height="24" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" transform="rotate(12, 40, 42)" />
          {/* 12 High-Power LED Floodlight Lamps (4x3 array) */}
          {[0, 1, 2, 3].map((col) => (
            <React.Fragment key={col}>
              <circle cx={14 + col * 17} cy={37} r={4.5} fill="#FFFFFF" filter="drop-shadow(0 0 6px #BAE6FD)" />
              <circle cx={14 + col * 17} cy={47} r={4.5} fill="#FFFFFF" filter="drop-shadow(0 0 6px #BAE6FD)" />
            </React.Fragment>
          ))}
          {/* Overpowering Glow Flare on Bank */}
          <ellipse cx="40" cy="42" rx="48" ry="24" fill="#FFFFFF" fillOpacity="0.45" filter="blur(8px)" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* D. RIGHT STADIUM FLOODLIGHT TOWER                             */}
        {/* ------------------------------------------------------------- */}
        <g id="right-floodlight-tower" transform="translate(1342, 50)">
          {/* Steel Pylon Lattice Mast */}
          <path d="M 48 60 L 58 240 M 32 60 L 22 240" stroke="#94A3B8" strokeWidth="2.5" />
          <line x1="28" y1="95" x2="52" y2="95" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="26" y1="135" x2="54" y2="135" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="24" y1="175" x2="56" y2="175" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="22" y1="215" x2="58" y2="215" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Lamp Bank Head Mounting Bar (Angled down ~15° towards trophy) */}
          <rect x="0" y="30" width="80" height="24" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" transform="rotate(-15, 40, 42)" />
          {[0, 1, 2, 3].map((col) => (
            <React.Fragment key={col}>
              <circle cx={14 + col * 17} cy={37} r={4.5} fill="#FFFBEB" filter="drop-shadow(0 0 7px #FEF08A)" />
              <circle cx={14 + col * 17} cy={47} r={4.5} fill="#FFFBEB" filter="drop-shadow(0 0 7px #FEF08A)" />
            </React.Fragment>
          ))}
          <ellipse cx="40" cy="42" rx="55" ry="28" fill="#FFFBEB" fillOpacity="0.55" filter="blur(9px)" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* E. NEXCORE "NT" HERALDIC TOURNAMENT PENNANTS                  */}
        {/* ------------------------------------------------------------- */}
        {/* Left Pennant Banner */}
        <g id="left-pennant" transform="translate(18, 225)">
          {/* Hanging Rod & Finials */}
          <line x1="0" y1="0" x2="65" y2="0" stroke="url(#banner-gold-trim)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
          <circle cx="65" cy="0" r="3.5" fill="#F59E0B" />
          {/* Pennant Cloth with Chevron Swallowtail */}
          <path
            d="M 6 0 L 59 0 L 59 85 L 32.5 105 L 6 85 Z"
            fill="url(#banner-navy)"
            stroke="url(#banner-gold-trim)"
            strokeWidth="1.8"
            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.25))"
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
        <g id="right-pennant" transform="translate(1357, 215)">
          <line x1="0" y1="0" x2="65" y2="0" stroke="url(#banner-gold-trim)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
          <circle cx="65" cy="0" r="3.5" fill="#F59E0B" />
          <path
            d="M 6 0 L 59 0 L 59 85 L 32.5 105 L 6 85 Z"
            fill="url(#banner-navy)"
            stroke="url(#banner-gold-trim)"
            strokeWidth="1.8"
            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.25))"
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
        {/* F. DYNAMIC FLUID ATHLETIC SWOOSH RIBBONS                      */}
        {/* ------------------------------------------------------------- */}
        {/* 1. Upper Sky Ambient Cyan Ribbon */}
        <path
          d="M -50 120 C 320 60, 680 180, 1100 110 C 1250 85, 1400 95, 1500 120"
          fill="none"
          stroke="url(#swoosh-cyan)"
          strokeWidth="38"
          strokeLinecap="round"
          strokeOpacity="0.32"
          filter="blur(3px)"
        />

        {/* 2. Bold Lower-Third Royal/Azure Blue Speed Sweep */}
        <path
          d="M -100 560 C 150 510, 420 540, 680 500 C 950 455, 1200 420, 1550 540 L 1550 660 L -100 660 Z"
          fill="url(#swoosh-blue-deep)"
          filter="url(#ribbon-shadow)"
        />
        {/* Bright Cyan Highlight Crest along the Blue Sweep */}
        <path
          d="M -100 560 C 150 510, 420 540, 680 500 C 950 455, 1200 420, 1550 540"
          fill="none"
          stroke="url(#swoosh-cyan)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* 3. Dynamic Sports Flame Orange Acceleration Ribbon */}
        <path
          d="M -80 620 C 220 570, 480 610, 750 560 C 1020 510, 1280 470, 1520 510"
          fill="none"
          stroke="url(#swoosh-orange)"
          strokeWidth="24"
          strokeLinecap="round"
          filter="drop-shadow(0 6px 12px rgba(234,88,12,0.4))"
        />
        {/* Crisp Golden Highlight on the Orange Ribbon */}
        <path
          d="M -80 614 C 220 564, 480 604, 750 554 C 1020 504, 1280 464, 1520 504"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
      </svg>
    </div>
  );
}
