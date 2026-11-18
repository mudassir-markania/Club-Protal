'use client';

import React from 'react';

interface HouseCrestProps {
  name: string;
  className?: string;
}

/**
 * 100% Pure Code SVG House Crests for the 5 Championship Houses
 * Zero external asset dependencies — guaranteed crisp, radiant, and reliable.
 */
export default function HouseCrest({ name, className = 'w-8 h-8' }: HouseCrestProps) {
  const n = (name || '').toLowerCase();

  // 1. MAVERICKS (Crimson & Gold - Falcon / Speed)
  if (n.includes('mav')) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} select-none shrink-0 drop-shadow-xs`}
      >
        <defs>
          <linearGradient id="mav-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="45%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="mav-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Shield Outer Body */}
        <path
          d="M 50 6 C 68 6, 88 14, 88 28 C 88 62, 70 82, 50 94 C 30 82, 12 62, 12 28 C 12 14, 32 6, 50 6 Z"
          fill="url(#mav-shield)"
          stroke="url(#mav-gold)"
          strokeWidth="3.5"
        />
        {/* Inner Border */}
        <path
          d="M 50 12 C 65 12, 82 18, 82 30 C 82 58, 66 76, 50 86 C 34 76, 18 58, 18 30 C 18 18, 35 12, 50 12 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        {/* Soaring Winged Falcon / M Motif */}
        <path
          d="M 50 26 L 68 44 L 56 46 L 66 60 L 50 52 L 34 60 L 44 46 L 32 44 Z"
          fill="url(#mav-gold)"
        />
        <path
          d="M 50 32 L 60 44 L 50 48 L 40 44 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        {/* Text Monogram */}
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          MAV
        </text>
      </svg>
    );
  }

  // 2. DOMINATORS (Royal Navy & Electric Cyan - Crowned Fortress / Lion)
  if (n.includes('dom')) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} select-none shrink-0 drop-shadow-xs`}
      >
        <defs>
          <linearGradient id="dom-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F2444" />
          </linearGradient>
          <linearGradient id="dom-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        {/* Shield Body */}
        <path
          d="M 50 6 C 68 6, 88 14, 88 28 C 88 62, 70 82, 50 94 C 30 82, 12 62, 12 28 C 12 14, 32 6, 50 6 Z"
          fill="url(#dom-shield)"
          stroke="url(#dom-cyan)"
          strokeWidth="3.5"
        />
        {/* Inner Border */}
        <path
          d="M 50 12 C 65 12, 82 18, 82 30 C 82 58, 66 76, 50 86 C 34 76, 18 58, 18 30 C 18 18, 35 12, 50 12 Z"
          fill="none"
          stroke="#93C5FD"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        {/* Crown & Fortress Battlement */}
        <path
          d="M 32 46 L 36 28 L 44 36 L 50 24 L 56 36 L 64 28 L 68 46 L 62 52 L 38 52 Z"
          fill="url(#dom-cyan)"
        />
        <circle cx="50" cy="24" r="2.5" fill="#FFFFFF" />
        <circle cx="36" cy="28" r="2" fill="#FFFFFF" />
        <circle cx="64" cy="28" r="2" fill="#FFFFFF" />
        {/* Text Monogram */}
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          DOM
        </text>
      </svg>
    );
  }

  // 3. ALPHAS (Imperial Violet / Purple - Wolf / Prime Strike)
  if (n.includes('alp')) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} select-none shrink-0 drop-shadow-xs`}
      >
        <defs>
          <linearGradient id="alp-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="alp-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>
        {/* Shield Body */}
        <path
          d="M 50 6 C 68 6, 88 14, 88 28 C 88 62, 70 82, 50 94 C 30 82, 12 62, 12 28 C 12 14, 32 6, 50 6 Z"
          fill="url(#alp-shield)"
          stroke="url(#alp-gold)"
          strokeWidth="3.5"
        />
        {/* Inner Border */}
        <path
          d="M 50 12 C 65 12, 82 18, 82 30 C 82 58, 66 76, 50 86 C 34 76, 18 58, 18 30 C 18 18, 35 12, 50 12 Z"
          fill="none"
          stroke="#E9D5FF"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        {/* Alpha Symbol & Wolf Jaw */}
        <path
          d="M 50 25 L 66 54 L 58 54 L 54 46 L 46 46 L 42 54 L 34 54 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 50 34 L 47 41 L 53 41 Z"
          fill="#7C3AED"
        />
        {/* Text Monogram */}
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          ALP
        </text>
      </svg>
    );
  }

  // 4. SPARTANS (Imperial Amber / Bronze - Spartan Helmet & Spear)
  if (n.includes('spa')) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} select-none shrink-0 drop-shadow-xs`}
      >
        <defs>
          <linearGradient id="spa-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="spa-bronze" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        {/* Shield Body */}
        <path
          d="M 50 6 C 68 6, 88 14, 88 28 C 88 62, 70 82, 50 94 C 30 82, 12 62, 12 28 C 12 14, 32 6, 50 6 Z"
          fill="url(#spa-shield)"
          stroke="url(#spa-bronze)"
          strokeWidth="3.5"
        />
        {/* Inner Border */}
        <path
          d="M 50 12 C 65 12, 82 18, 82 30 C 82 58, 66 76, 50 86 C 34 76, 18 58, 18 30 C 18 18, 35 12, 50 12 Z"
          fill="none"
          stroke="#FEF3C7"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        {/* Spartan Helmet Silhouette */}
        <path
          d="M 50 24 C 42 24, 38 30, 38 38 L 38 46 L 44 46 L 44 54 L 48 54 L 48 40 L 52 40 L 52 54 L 56 54 L 56 46 L 62 46 L 62 38 C 62 30, 58 24, 50 24 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 46 22 L 54 22 L 52 28 L 48 28 Z"
          fill="#FEF3C7"
        />
        {/* Text Monogram */}
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          SPA
        </text>
      </svg>
    );
  }

  // 5. PHOENIX (Solar Orange & Fire Gold - Rising Bird of Fire)
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none shrink-0 drop-shadow-xs`}
    >
      <defs>
        <linearGradient id="phx-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="phx-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Shield Body */}
      <path
        d="M 50 6 C 68 6, 88 14, 88 28 C 88 62, 70 82, 50 94 C 30 82, 12 62, 12 28 C 12 14, 32 6, 50 6 Z"
        fill="url(#phx-shield)"
        stroke="url(#phx-gold)"
        strokeWidth="3.5"
      />
      {/* Inner Border */}
      <path
        d="M 50 12 C 65 12, 82 18, 82 30 C 82 58, 66 76, 50 86 C 34 76, 18 58, 18 30 C 18 18, 35 12, 50 12 Z"
        fill="none"
        stroke="#FFEDD5"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      {/* Rising Phoenix Flame Bird */}
      <path
        d="M 50 22 C 54 26, 56 32, 52 38 C 58 34, 64 36, 66 42 C 60 44, 56 48, 56 54 C 50 48, 48 42, 50 36 C 44 42, 42 48, 44 54 C 44 46, 38 42, 34 42 C 38 36, 44 34, 48 38 C 46 32, 48 26, 50 22 Z"
        fill="url(#phx-gold)"
      />
      <circle cx="50" cy="30" r="2" fill="#FFFFFF" />
      {/* Text Monogram */}
      <text
        x="50"
        y="74"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        PHX
      </text>
    </svg>
  );
}
