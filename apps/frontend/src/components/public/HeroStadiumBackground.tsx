'use client';

import React from 'react';

/**
 * Premium Architectural Sports Arena Background - Clean Light Theme
 * High-end, architectural sports broadcast atmosphere with:
 * - Pure luminous daylight gradient
 * - Subtle geometric precision grid
 * - Architectural stadium canopy angles (crisp, straight technical lines)
 * - Zero squiggly curves or chaotic doodles
 */
export default function HeroStadiumBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Luminous Base Canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% -10%, #FFFFFF 0%, #F5F9FD 50%, #EDF4FB 100%)',
        }}
      />

      {/* 2. Soft Daylight Glow (Right Corner behind Showcase) */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '-5%',
          top: '-15%',
          width: '55%',
          height: '90%',
          background:
            'radial-gradient(circle at 60% 30%, rgba(254, 240, 138, 0.35) 0%, rgba(245, 158, 11, 0.08) 35%, rgba(2, 132, 199, 0.03) 70%, transparent 85%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 3. Subtle Athletic Cobalt Haze (Left Corner behind Typography) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-8%',
          top: '0%',
          width: '45%',
          height: '80%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(2, 132, 199, 0.07) 0%, rgba(14, 165, 233, 0.02) 50%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* 4. Fine Technical Grid Pattern (Athletic Field Matrix) */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 5. Crisp Architectural Stadium Vector Geometry (Strictly straight, technical lines — NO squiggly curves) */}
      <svg
        viewBox="0 0 1440 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35"
      >
        <defs>
          <linearGradient id="stadium-beam" x1="100%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="court-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0" />
            <stop offset="40%" stopColor="#0284C7" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#0369A1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Diagonal Soft Stadium Light Wash */}
        <polygon points="1100,-20 1440,-20 1200,700 950,700" fill="url(#stadium-beam)" />

        {/* Crisp Stadium Boundary Lines (Straight, technical) */}
        <line x1="0" y1="620" x2="1440" y2="620" stroke="url(#court-line)" strokeWidth="1.5" />
        <line x1="0" y1="626" x2="1440" y2="626" stroke="url(#court-line)" strokeWidth="1" strokeDasharray="6 6" />

        {/* Subtle Diagonal Athletic Speed Cuts */}
        <line x1="880" y1="0" x2="1380" y2="700" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.08" />
        <line x1="940" y1="0" x2="1440" y2="700" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.05" />
        <line x1="820" y1="0" x2="1320" y2="700" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="4 8" />
      </svg>
    </div>
  );
}
