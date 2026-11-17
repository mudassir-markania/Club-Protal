'use client';

import React from 'react';

/**
 * Pure SVG & CSS High-Precision 3D Championship Trophy
 * NO RASTER IMAGES USED.
 * Features:
 * - Multi-stop cylindrical gold gradients for realistic turned-metal curvature
 * - 10-facet 3D beveled gold star with specular reflections
 * - Sweeping aerodynamic championship handles/wings with beveled ridge lines
 * - Fluted chalice cup with elliptical perspective interior
 * - Olympic-grade golden laurel wreaths with two-tone faceted leaves
 * - Beveled navy obsidian plinth with embossed metallic gold "APL SEASON 9"
 * - Multi-tiered circular stadium stage with illuminated blue/gold lighting
 */
export default function HeroChampionshipTrophy({
  className = 'w-full h-auto',
  onCelebrate,
}: {
  className?: string;
  onCelebrate?: () => void;
}) {
  return (
    <div
      onClick={onCelebrate}
      className={`relative select-none cursor-pointer group ${className}`}
      title="Click to Celebrate Championship Glory!"
    >
      <svg
        viewBox="0 0 500 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(2,132,199,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      >
        <defs>
          {/* 1. Core Metallic Gold Gradients */}
          <linearGradient id="gold-bright" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="15%" stopColor="#FEF08A" />
            <stop offset="38%" stopColor="#FACC15" />
            <stop offset="60%" stopColor="#EAB308" />
            <stop offset="82%" stopColor="#A16207" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Cylindrical Gold Gradient for Curved Turnings (Chalice, Stem, Rings) */}
          <linearGradient id="gold-cylinder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="12%" stopColor="#B45309" />
            <stop offset="26%" stopColor="#FDE047" />
            <stop offset="42%" stopColor="#FFFFFF" />
            <stop offset="56%" stopColor="#FACC15" />
            <stop offset="78%" stopColor="#CA8A04" />
            <stop offset="92%" stopColor="#854D0E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Left Wing Sweep Gradient */}
          <linearGradient id="gold-wing-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="20%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="88%" stopColor="#854D0E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Right Wing Sweep Gradient */}
          <linearGradient id="gold-wing-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="20%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="88%" stopColor="#854D0E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* 3D Star Facet Gradients */}
          <linearGradient id="star-facet-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="star-facet-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CA8A04" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Laurel Leaf Two-Tone Gradients */}
          <linearGradient id="laurel-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="laurel-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="60%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Plinth Navy Obsidian Texture */}
          <linearGradient id="plinth-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0E2B54" />
            <stop offset="35%" stopColor="#081E3D" />
            <stop offset="75%" stopColor="#041228" />
            <stop offset="100%" stopColor="#020914" />
          </linearGradient>

          {/* Circular Stage Dais Gradients */}
          <linearGradient id="stage-top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="stage-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F2B48" />
            <stop offset="25%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="75%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0C1E36" />
          </linearGradient>

          {/* Radial Bloom & Backlight Auras */}
          <radialGradient id="trophy-aura" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#0284C7" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="stage-ground-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#0284C7" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>

          {/* Embossed Drop Shadow for Gold Inscriptions */}
          <filter id="gold-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 0: RADIANT BACKLIGHT AURA BEHIND THE CUP                */}
        {/* ------------------------------------------------------------- */}
        <circle cx="250" cy="190" r="150" fill="url(#trophy-aura)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 1: MULTI-TIERED STADIUM STAGE DAIS                      */}
        {/* ------------------------------------------------------------- */}
        {/* Ground ambient light pool */}
        <ellipse cx="250" cy="515" rx="210" ry="42" fill="url(#stage-ground-glow)" />

        {/* Stage Bottom Platform Rim (Perspective Depth) */}
        <path
          d="M 60 500 C 60 535, 440 535, 440 500 L 440 518 C 440 553, 60 553, 60 518 Z"
          fill="url(#stage-rim)"
        />
        {/* Stage Bottom Platform Top Disc */}
        <ellipse cx="250" cy="500" rx="190" ry="32" fill="url(#stage-top)" stroke="#38BDF8" strokeWidth="2" />
        <ellipse cx="250" cy="500" rx="180" ry="26" fill="none" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.6" />

        {/* Stage Middle Tier Rim */}
        <path
          d="M 105 470 C 105 498, 395 498, 395 470 L 395 482 C 395 510, 105 510, 105 482 Z"
          fill="url(#gold-cylinder)"
        />
        {/* Stage Middle Tier Top Disc */}
        <ellipse cx="250" cy="470" rx="145" ry="22" fill="#0C2548" stroke="url(#gold-bright)" strokeWidth="2.5" />

        {/* Stage Top Dais Ring */}
        <ellipse cx="250" cy="452" rx="125" ry="16" fill="url(#gold-cylinder)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 2: THE BEVELED NAVY PLINTH (CENTRAL BLOCK)              */}
        {/* ------------------------------------------------------------- */}
        {/* Lower gold moulding of plinth */}
        <path
          d="M 130 452 L 370 452 L 360 440 L 140 440 Z"
          fill="url(#gold-bright)"
        />

        {/* Main Plinth Body (Octagonal / Beveled Obsidian Block) */}
        <path
          d="M 140 440 L 360 440 L 340 335 L 160 335 Z"
          fill="url(#plinth-body)"
          stroke="url(#gold-bright)"
          strokeWidth="1.5"
        />

        {/* Plinth Subtle Side Facets for 3D Bevel Depth */}
        {/* Left bevel facet */}
        <path
          d="M 140 440 L 160 440 L 175 335 L 160 335 Z"
          fill="#1E3A8A"
          fillOpacity="0.45"
        />
        {/* Right bevel facet */}
        <path
          d="M 360 440 L 340 440 L 325 335 L 340 335 Z"
          fill="#000000"
          fillOpacity="0.4"
        />

        {/* Plinth Inner Recessed Display Panel */}
        <rect
          x="168"
          y="345"
          width="164"
          height="82"
          rx="4"
          fill="#051326"
          stroke="url(#gold-bright)"
          strokeWidth="1"
          strokeOpacity="0.75"
        />

        {/* Top gold moulding of plinth */}
        <path
          d="M 160 335 L 340 335 L 330 322 L 170 322 Z"
          fill="url(#gold-bright)"
        />

        {/* Plinth Crown Ring */}
        <ellipse cx="250" cy="322" rx="80" ry="10" fill="url(#gold-cylinder)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 3: EMBOSSED GOLD INSCRIPTIONS ON PLINTH                 */}
        {/* ------------------------------------------------------------- */}
        {/* "APL" Title with 3D drop highlight */}
        <text
          x="250"
          y="386"
          textAnchor="middle"
          fontSize="36"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="4"
          fill="#3B1C05"
        >
          APL
        </text>
        <text
          x="250"
          y="384"
          textAnchor="middle"
          fontSize="36"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="4"
          fill="url(#gold-bright)"
          filter="url(#gold-shadow)"
        >
          APL
        </text>

        {/* "SEASON 9" Subtitle with gold metallic sheen */}
        <text
          x="250"
          y="412"
          textAnchor="middle"
          fontSize="13"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          letterSpacing="5"
          fill="#3B1C05"
        >
          SEASON 9
        </text>
        <text
          x="250"
          y="411"
          textAnchor="middle"
          fontSize="13"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          letterSpacing="5"
          fill="url(#gold-bright)"
        >
          SEASON 9
        </text>

        {/* Decorative pinstripe divider under SEASON 9 */}
        <line x1="195" y1="418" x2="305" y2="418" stroke="url(#gold-bright)" strokeWidth="1" strokeOpacity="0.8" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 4: GOLDEN LAUREL WREATH (FLANKING THE PLINTH)           */}
        {/* ------------------------------------------------------------- */}
        {/* Left Laurel Branch Stem */}
        <path
          d="M 148 440 C 120 420, 105 380, 118 335 C 122 320, 130 310, 138 300"
          fill="none"
          stroke="url(#gold-bright)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Right Laurel Branch Stem */}
        <path
          d="M 352 440 C 380 420, 395 380, 382 335 C 378 320, 370 310, 362 300"
          fill="none"
          stroke="url(#gold-bright)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Left Laurel Leaves (7 Pairs with two-tone faceted gold) */}
        {/* Pair 1 */}
        <g transform="translate(144, 432) rotate(-25)">
          <path d="M 0 0 C -6 -8, -14 -12, -18 -8 C -14 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 4, -12 6, -18 -8 C -10 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C 6 -8, 14 -12, 18 -8 C 14 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 4, 12 6, 18 -8 C 10 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 2 */}
        <g transform="translate(132, 408) rotate(-35)">
          <path d="M 0 0 C -6 -9, -15 -14, -20 -9 C -15 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 4, -13 7, -20 -9 C -11 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C 6 -9, 15 -14, 20 -9 C 15 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 4, 13 7, 20 -9 C 11 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 3 */}
        <g transform="translate(122, 382) rotate(-45)">
          <path d="M 0 0 C -6 -9, -16 -15, -22 -10 C -16 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 5, -14 8, -22 -10 C -12 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C 6 -9, 16 -15, 22 -10 C 16 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 5, 14 8, 22 -10 C 12 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 4 */}
        <g transform="translate(116, 354) rotate(-55)">
          <path d="M 0 0 C -6 -9, -16 -15, -22 -10 C -16 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 5, -14 8, -22 -10 C -12 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C 6 -9, 16 -15, 22 -10 C 16 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 5, 14 8, 22 -10 C 12 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 5 */}
        <g transform="translate(118, 328) rotate(-70)">
          <path d="M 0 0 C -6 -9, -15 -14, -20 -9 C -15 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 4, -13 7, -20 -9 C -11 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C 6 -9, 15 -14, 20 -9 C 15 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 4, 13 7, 20 -9 C 11 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 6 */}
        <g transform="translate(126, 305) rotate(-85)">
          <path d="M 0 0 C -5 -8, -13 -12, -18 -8 C -13 -2, -5 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -3 4, -11 6, -18 -8 C -10 -4, -3 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C 5 -8, 13 -12, 18 -8 C 13 -2, 5 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 3 4, 11 6, 18 -8 C 10 -4, 3 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Tip Leaf */}
        <g transform="translate(136, 292) rotate(-95)">
          <path d="M 0 0 C -4 -10, -10 -16, -14 -12 C -10 -2, -4 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 2, 8 4, -14 -12 C -6 -4, -2 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>

        {/* Right Laurel Leaves (7 Pairs symmetrical) */}
        {/* Pair 1 */}
        <g transform="translate(356, 432) rotate(25)">
          <path d="M 0 0 C 6 -8, 14 -12, 18 -8 C 14 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 4, 12 6, 18 -8 C 10 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C -6 -8, -14 -12, -18 -8 C -14 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 4, -12 6, -18 -8 C -10 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 2 */}
        <g transform="translate(368, 408) rotate(35)">
          <path d="M 0 0 C 6 -9, 15 -14, 20 -9 C 15 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 4, 13 7, 20 -9 C 11 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C -6 -9, -15 -14, -20 -9 C -15 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 4, -13 7, -20 -9 C -11 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 3 */}
        <g transform="translate(378, 382) rotate(45)">
          <path d="M 0 0 C 6 -9, 16 -15, 22 -10 C 16 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 5, 14 8, 22 -10 C 12 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C -6 -9, -16 -15, -22 -10 C -16 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 5, -14 8, -22 -10 C -12 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 4 */}
        <g transform="translate(384, 354) rotate(55)">
          <path d="M 0 0 C 6 -9, 16 -15, 22 -10 C 16 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 5, 14 8, 22 -10 C 12 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C -6 -9, -16 -15, -22 -10 C -16 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 5, -14 8, -22 -10 C -12 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 5 */}
        <g transform="translate(382, 328) rotate(70)">
          <path d="M 0 0 C 6 -9, 15 -14, 20 -9 C 15 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 4 4, 13 7, 20 -9 C 11 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C -6 -9, -15 -14, -20 -9 C -15 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 4, -13 7, -20 -9 C -11 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Pair 6 */}
        <g transform="translate(374, 305) rotate(85)">
          <path d="M 0 0 C 5 -8, 13 -12, 18 -8 C 13 -2, 5 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C 3 4, 11 6, 18 -8 C 10 -4, 3 -1, 0 0 Z" fill="url(#laurel-dark)" />
          <path d="M 0 0 C -5 -8, -13 -12, -18 -8 C -13 -2, -5 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -3 4, -11 6, -18 -8 C -10 -4, -3 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>
        {/* Tip Leaf */}
        <g transform="translate(364, 292) rotate(95)">
          <path d="M 0 0 C 4 -10, 10 -16, 14 -12 C 10 -2, 4 0, 0 0 Z" fill="url(#laurel-light)" />
          <path d="M 0 0 C -4 2, -8 4, 14 -12 C 6 -4, 2 -1, 0 0 Z" fill="url(#laurel-dark)" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 5: TROPHY STEM & STEPPED RINGS                          */}
        {/* ------------------------------------------------------------- */}
        {/* Stem Base Ring */}
        <ellipse cx="250" cy="316" rx="60" ry="8" fill="url(#gold-cylinder)" />
        {/* Lower Neck */}
        <path
          d="M 215 316 C 215 285, 230 270, 235 260 L 265 260 C 270 270, 285 285, 285 316 Z"
          fill="url(#gold-cylinder)"
        />
        {/* Mid-Stem Knurled Ring */}
        <ellipse cx="250" cy="275" rx="35" ry="6" fill="url(#gold-bright)" stroke="#78350F" strokeWidth="0.8" />
        <ellipse cx="250" cy="260" rx="30" ry="5" fill="url(#gold-cylinder)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 6: THE CENTRAL CHALICE / CUP BODY                       */}
        {/* ------------------------------------------------------------- */}
        {/* Chalice Goblet Body (Smooth Fluted Curve) */}
        <path
          d="M 205 160 C 205 210, 225 250, 235 260 L 265 260 C 275 250, 295 210, 295 160 Z"
          fill="url(#gold-cylinder)"
        />
        {/* Chalice Lip Rim Ellipse (Top Edge) */}
        <ellipse cx="250" cy="160" rx="45" ry="9" fill="#5A2E05" stroke="url(#gold-bright)" strokeWidth="2" />
        {/* Interior Cup Shading (Perspective Hollow Depth) */}
        <ellipse cx="250" cy="161" rx="42" ry="7" fill="#2E1502" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 7: DRAMATIC SWEEPING WINGS / HANDLES                    */}
        {/* ------------------------------------------------------------- */}
        {/* LEFT WING */}
        {/* Main outer wing shape */}
        <path
          d="M 220 265 C 190 275, 150 250, 115 210 C 85 170, 88 120, 110 80 C 122 58, 140 45, 158 55 C 172 65, 175 85, 152 105 C 130 125, 122 155, 142 190 C 160 220, 192 240, 215 248 Z"
          fill="url(#gold-wing-left)"
          stroke="#92400E"
          strokeWidth="1.5"
        />
        {/* Left Wing Inner Beveled Highlight Ridge */}
        <path
          d="M 215 258 C 185 266, 148 244, 120 206 C 94 170, 96 126, 116 90 C 126 72, 140 60, 154 68 C 164 76, 162 90, 146 108 C 128 128, 122 155, 140 186 C 158 214, 188 232, 210 242"
          fill="none"
          stroke="#FFFDE0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* RIGHT WING (Symmetrical Mirror Across X=250) */}
        {/* Main outer wing shape */}
        <path
          d="M 280 265 C 310 275, 350 250, 385 210 C 415 170, 412 120, 390 80 C 378 58, 360 45, 342 55 C 328 65, 325 85, 348 105 C 370 125, 378 155, 358 190 C 340 220, 308 240, 285 248 Z"
          fill="url(#gold-wing-right)"
          stroke="#92400E"
          strokeWidth="1.5"
        />
        {/* Right Wing Inner Beveled Highlight Ridge */}
        <path
          d="M 285 258 C 315 266, 352 244, 380 206 C 406 170, 404 126, 384 90 C 374 72, 360 60, 346 68 C 336 76, 338 90, 354 108 C 372 128, 378 155, 360 186 C 342 214, 312 232, 290 242"
          fill="none"
          stroke="#FFFDE0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 8: 10-FACET 3D BEVELED GOLD CHAMPIONSHIP STAR           */}
        {/* ------------------------------------------------------------- */}
        {/* Center: (250, 138), Outer R=34, Inner r=13 */}
        <g id="championship-star" className="filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.65)]">
          {/* Facet 1: Top Point Right Side (Light) */}
          <polygon points="250,138 250,104 257.6,127.5" fill="url(#star-facet-light)" />
          {/* Facet 2: Upper Right Valley to Point (Shadow) */}
          <polygon points="250,138 257.6,127.5 282.3,127.5" fill="url(#star-facet-shadow)" />
          {/* Facet 3: Upper Right Point to Valley (Light) */}
          <polygon points="250,138 282.3,127.5 262.8,142" fill="url(#star-facet-light)" />
          {/* Facet 4: Lower Right Valley to Point (Shadow) */}
          <polygon points="250,138 262.8,142 270,165.5" fill="url(#star-facet-shadow)" />
          {/* Facet 5: Lower Right Point to Bottom Valley (Light) */}
          <polygon points="250,138 270,165.5 250,151" fill="url(#star-facet-light)" />
          {/* Facet 6: Bottom Valley to Lower Left Point (Shadow) */}
          <polygon points="250,138 250,151 230,165.5" fill="url(#star-facet-shadow)" />
          {/* Facet 7: Lower Left Point to Valley (Light) */}
          <polygon points="250,138 230,165.5 237.2,142" fill="url(#star-facet-light)" />
          {/* Facet 8: Valley to Upper Left Point (Shadow) */}
          <polygon points="250,138 237.2,142 217.7,127.5" fill="url(#star-facet-shadow)" />
          {/* Facet 9: Upper Left Point to Valley (Light) */}
          <polygon points="250,138 217.7,127.5 242.4,127.5" fill="url(#star-facet-light)" />
          {/* Facet 10: Valley to Top Point Left Side (Shadow) */}
          <polygon points="250,138 242.4,127.5 250,104" fill="url(#star-facet-shadow)" />

          {/* Golden Star Specular Diamond Glint at the Center & Tip */}
          <circle cx="250" cy="138" r="2.5" fill="#FFFFFF" />
          <path d="M 250 96 L 252 104 L 250 112 L 248 104 Z" fill="#FFFFFF" />
          <path d="M 242 104 L 250 106 L 258 104 L 250 102 Z" fill="#FFFFFF" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 9: SPECULAR SPARKLE ACCENTS & LIGHT FLARES              */}
        {/* ------------------------------------------------------------- */}
        {/* Left Wing Tip Sparkle */}
        <g transform="translate(158, 55) scale(0.7)">
          <path d="M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z" fill="#FFFDE0" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>
        {/* Right Wing Tip Sparkle */}
        <g transform="translate(342, 55) scale(0.7)">
          <path d="M 0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z" fill="#FFFDE0" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>
        {/* Plinth Gold Corner Glint */}
        <g transform="translate(142, 440) scale(0.5)">
          <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
          <path d="M 0 -10 L 2 -2 L 10 0 L 2 2 L 0 10 L -2 2 L -10 0 L -2 -2 Z" fill="#FEF08A" />
        </g>
        <g transform="translate(358, 440) scale(0.5)">
          <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
          <path d="M 0 -10 L 2 -2 L 10 0 L 2 2 L 0 10 L -2 2 L -10 0 L -2 -2 Z" fill="#FEF08A" />
        </g>
      </svg>
    </div>
  );
}
