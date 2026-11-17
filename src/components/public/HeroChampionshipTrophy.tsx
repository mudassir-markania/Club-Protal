'use client';

import React from 'react';

/**
 * High-Precision Pure SVG & CSS 3D Championship Trophy
 * 100% PURE CODE — ZERO RASTER IMAGES.
 * Features:
 * - Turned-metal multi-stop cylindrical gold gradients with ray-traced highlights
 * - 10-facet 3D beveled gold star with specular reflections and diamond star flare
 * - Aerodynamic soaring twin golden wing blades with beveled ridge lines
 * - Fluted central chalice cup with elliptical perspective interior
 * - Olympic-grade golden laurel wreaths with two-tone faceted leaves
 * - Beveled navy obsidian plinth with embossed metallic gold "APL SEASON 9"
 * - Multi-tiered circular stadium stage with illuminated cyan/blue lighting
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
      title="🏆 Click to Celebrate Championship Glory!"
    >
      <svg
        viewBox="0 0 500 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_25px_45px_rgba(2,132,199,0.22)] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      >
        <defs>
          {/* 1. Core Metallic Gold Gradients */}
          <linearGradient id="gold-bright" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF0" />
            <stop offset="12%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="60%" stopColor="#EAB308" />
            <stop offset="82%" stopColor="#A16207" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Cylindrical Turned-Metal Gold Gradient */}
          <linearGradient id="gold-cylinder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5A2E05" />
            <stop offset="8%" stopColor="#92400E" />
            <stop offset="22%" stopColor="#FDE047" />
            <stop offset="38%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FACC15" />
            <stop offset="76%" stopColor="#B45309" />
            <stop offset="90%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#3B1C05" />
          </linearGradient>

          {/* Left Wing Outer Shaded Facet */}
          <linearGradient id="wing-left-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#EAB308" />
            <stop offset="55%" stopColor="#B45309" />
            <stop offset="85%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Left Wing Inner Reflective Facet */}
          <linearGradient id="wing-left-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#FFFDE0" />
            <stop offset="45%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Right Wing Outer Shaded Facet */}
          <linearGradient id="wing-right-outer" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#EAB308" />
            <stop offset="55%" stopColor="#B45309" />
            <stop offset="85%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Right Wing Inner Reflective Facet */}
          <linearGradient id="wing-right-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#FFFDE0" />
            <stop offset="45%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* 3D Star Facet Gradients */}
          <linearGradient id="star-facet-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FEF08A" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="star-facet-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CA8A04" />
            <stop offset="45%" stopColor="#92400E" />
            <stop offset="85%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Laurel Leaf Two-Tone Gradients */}
          <linearGradient id="laurel-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDE0" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="80%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="laurel-dark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="55%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Plinth Navy Obsidian Texture */}
          <linearGradient id="plinth-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0E2B54" />
            <stop offset="30%" stopColor="#081E3D" />
            <stop offset="70%" stopColor="#041228" />
            <stop offset="100%" stopColor="#020914" />
          </linearGradient>

          {/* Circular Stage Dais Gradients */}
          <linearGradient id="stage-top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E0F2FE" />
            <stop offset="80%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>

          <linearGradient id="stage-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B2344" />
            <stop offset="25%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="75%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#081A33" />
          </linearGradient>

          {/* Radiant Aura Behind Trophy */}
          <radialGradient id="trophy-aura" cx="50%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.65" />
            <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.30" />
            <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="stage-ground-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#0284C7" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </radialGradient>

          {/* Embossed Drop Shadow for Gold Inscriptions */}
          <filter id="gold-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.95" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 0: RADIANT BACKLIGHT AURA BEHIND THE CUP                */}
        {/* ------------------------------------------------------------- */}
        <circle cx="250" cy="180" r="160" fill="url(#trophy-aura)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 1: MULTI-TIERED CIRCULAR STADIUM STAGE DAIS             */}
        {/* ------------------------------------------------------------- */}
        {/* Ground ambient light pool */}
        <ellipse cx="250" cy="520" rx="220" ry="42" fill="url(#stage-ground-glow)" />

        {/* Stage Bottom Platform Rim (Perspective Depth) */}
        <path
          d="M 50 505 C 50 542, 450 542, 450 505 L 450 525 C 450 562, 50 562, 50 525 Z"
          fill="url(#stage-rim)"
        />
        {/* Stage Bottom Platform Top Disc */}
        <ellipse cx="250" cy="505" rx="200" ry="32" fill="url(#stage-top)" stroke="#38BDF8" strokeWidth="2.5" />
        <ellipse cx="250" cy="505" rx="188" ry="26" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.75" />

        {/* Stage Middle Tier Rim */}
        <path
          d="M 95 474 C 95 504, 405 504, 405 474 L 405 488 C 405 518, 95 518, 95 488 Z"
          fill="url(#gold-cylinder)"
        />
        {/* Stage Middle Tier Top Disc */}
        <ellipse cx="250" cy="474" rx="155" ry="23" fill="#0C2548" stroke="url(#gold-bright)" strokeWidth="2.5" />

        {/* Stage Top Dais Ring */}
        <ellipse cx="250" cy="454" rx="130" ry="16" fill="url(#gold-cylinder)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 2: THE BEVELED NAVY OBSIDIAN PLINTH                     */}
        {/* ------------------------------------------------------------- */}
        {/* Lower gold moulding of plinth */}
        <path
          d="M 132 454 L 368 454 L 358 440 L 142 440 Z"
          fill="url(#gold-bright)"
        />

        {/* Main Plinth Body (Trapezoidal Obsidian Block) */}
        <path
          d="M 142 440 L 358 440 L 338 335 L 162 335 Z"
          fill="url(#plinth-body)"
          stroke="url(#gold-bright)"
          strokeWidth="1.5"
        />

        {/* Plinth Subtle Side Facets for 3D Bevel Depth */}
        {/* Left bevel facet */}
        <path
          d="M 142 440 L 164 440 L 178 335 L 162 335 Z"
          fill="#1E3A8A"
          fillOpacity="0.45"
        />
        {/* Right bevel facet */}
        <path
          d="M 358 440 L 336 440 L 322 335 L 338 335 Z"
          fill="#000000"
          fillOpacity="0.45"
        />

        {/* Plinth Inner Recessed Display Panel */}
        <rect
          x="170"
          y="346"
          width="160"
          height="80"
          rx="5"
          fill="#051326"
          stroke="url(#gold-bright)"
          strokeWidth="1"
          strokeOpacity="0.8"
        />

        {/* Top gold moulding of plinth */}
        <path
          d="M 162 335 L 338 335 L 326 320 L 174 320 Z"
          fill="url(#gold-bright)"
        />

        {/* Plinth Crown Ring */}
        <ellipse cx="250" cy="320" rx="80" ry="10" fill="url(#gold-cylinder)" />

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
          fill="#2B1502"
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
          y="411"
          textAnchor="middle"
          fontSize="13"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          letterSpacing="5"
          fill="#2B1502"
        >
          SEASON 9
        </text>
        <text
          x="250"
          y="410"
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
        <line x1="195" y1="416" x2="305" y2="416" stroke="url(#gold-bright)" strokeWidth="1" strokeOpacity="0.8" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 4: GOLDEN LAUREL WREATH (FLANKING THE PLINTH)           */}
        {/* ------------------------------------------------------------- */}
        {/* Left Laurel Branch Stem */}
        <path
          d="M 148 438 C 118 418, 105 378, 118 335 C 122 320, 130 310, 138 300"
          fill="none"
          stroke="url(#gold-bright)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Right Laurel Branch Stem */}
        <path
          d="M 352 438 C 382 418, 395 378, 382 335 C 378 320, 370 310, 362 300"
          fill="none"
          stroke="url(#gold-bright)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Left Laurel Leaves (Two-tone faceted gold) */}
        {[
          { x: 144, y: 430, rot: -25 },
          { x: 132, y: 406, rot: -35 },
          { x: 122, y: 380, rot: -45 },
          { x: 116, y: 352, rot: -55 },
          { x: 118, y: 326, rot: -70 },
          { x: 126, y: 303, rot: -85 },
          { x: 136, y: 290, rot: -95 },
        ].map((leaf, idx) => (
          <g key={`l-leaf-${idx}`} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot})`}>
            <path d="M 0 0 C -6 -8, -14 -12, -18 -8 C -14 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
            <path d="M 0 0 C -4 4, -12 6, -18 -8 C -10 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
            <path d="M 0 0 C 6 -8, 14 -12, 18 -8 C 14 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
            <path d="M 0 0 C 4 4, 12 6, 18 -8 C 10 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          </g>
        ))}

        {/* Right Laurel Leaves (Symmetrical) */}
        {[
          { x: 356, y: 430, rot: 25 },
          { x: 368, y: 406, rot: 35 },
          { x: 378, y: 380, rot: 45 },
          { x: 384, y: 352, rot: 55 },
          { x: 382, y: 326, rot: 70 },
          { x: 374, y: 303, rot: 85 },
          { x: 364, y: 290, rot: 95 },
        ].map((leaf, idx) => (
          <g key={`r-leaf-${idx}`} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rot})`}>
            <path d="M 0 0 C 6 -8, 14 -12, 18 -8 C 14 -2, 6 0, 0 0 Z" fill="url(#laurel-light)" />
            <path d="M 0 0 C 4 4, 12 6, 18 -8 C 10 -4, 4 -1, 0 0 Z" fill="url(#laurel-dark)" />
            <path d="M 0 0 C -6 -8, -14 -12, -18 -8 C -14 -2, -6 0, 0 0 Z" fill="url(#laurel-light)" />
            <path d="M 0 0 C -4 4, -12 6, -18 -8 C -10 -4, -4 -1, 0 0 Z" fill="url(#laurel-dark)" />
          </g>
        ))}

        {/* ------------------------------------------------------------- */}
        {/* LAYER 5: TROPHY STEM & STEPPED RINGS                          */}
        {/* ------------------------------------------------------------- */}
        {/* Stem Base Ring */}
        <ellipse cx="250" cy="314" rx="58" ry="8" fill="url(#gold-cylinder)" />
        {/* Lower Neck */}
        <path
          d="M 218 314 C 218 285, 232 272, 236 262 L 264 262 C 268 272, 282 285, 282 314 Z"
          fill="url(#gold-cylinder)"
        />
        {/* Mid-Stem Knurled Collar */}
        <ellipse cx="250" cy="276" rx="36" ry="6" fill="url(#gold-bright)" stroke="#78350F" strokeWidth="0.8" />
        <ellipse cx="250" cy="262" rx="32" ry="5" fill="url(#gold-cylinder)" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 6: THE CENTRAL CHALICE CUP                             */}
        {/* ------------------------------------------------------------- */}
        {/* Chalice Goblet Body (Smooth Fluted Curve) */}
        <path
          d="M 208 155 C 208 210, 228 252, 236 262 L 264 262 C 272 252, 292 210, 292 155 Z"
          fill="url(#gold-cylinder)"
        />
        {/* Chalice Lip Rim Ellipse (Top Edge) */}
        <ellipse cx="250" cy="155" rx="42" ry="9" fill="#5A2E05" stroke="url(#gold-bright)" strokeWidth="2" />
        {/* Interior Cup Shading (Perspective Hollow Depth) */}
        <ellipse cx="250" cy="156" rx="39" ry="7" fill="#2E1502" />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 7: AERODYNAMIC SOARING TWIN GOLDEN WINGS / BLADES       */}
        {/* ------------------------------------------------------------- */}
        {/* LEFT SOARING BLADE */}
        {/* Outer Shaded Facet */}
        <path
          d="M 224 264 C 196 276, 160 252, 138 200 C 118 154, 124 102, 148 62 C 160 42, 174 34, 186 32 C 180 62, 184 100, 196 142 C 208 184, 222 232, 224 264 Z"
          fill="url(#wing-left-outer)"
          stroke="#78350F"
          strokeWidth="1.2"
        />
        {/* Inner Reflective Specular Facet */}
        <path
          d="M 186 32 C 192 52, 198 90, 204 135 C 210 180, 220 228, 224 264 C 230 254, 234 220, 230 180 C 224 140, 208 85, 186 32 Z"
          fill="url(#wing-left-inner)"
          stroke="#FDE047"
          strokeWidth="0.8"
        />
        {/* Beveled Center Ridge Line */}
        <path
          d="M 186 32 C 194 65, 198 105, 204 145 C 212 188, 220 234, 224 264"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* RIGHT SOARING BLADE (Symmetrical Mirror) */}
        {/* Outer Shaded Facet */}
        <path
          d="M 276 264 C 304 276, 340 252, 362 200 C 382 154, 376 102, 352 62 C 340 42, 326 34, 314 32 C 320 62, 316 100, 304 142 C 292 184, 278 232, 276 264 Z"
          fill="url(#wing-right-outer)"
          stroke="#78350F"
          strokeWidth="1.2"
        />
        {/* Inner Reflective Specular Facet */}
        <path
          d="M 314 32 C 308 52, 302 90, 296 135 C 290 180, 280 228, 276 264 C 270 254, 266 220, 270 180 C 276 140, 292 85, 314 32 Z"
          fill="url(#wing-right-inner)"
          stroke="#FDE047"
          strokeWidth="0.8"
        />
        {/* Beveled Center Ridge Line */}
        <path
          d="M 314 32 C 306 65, 302 105, 296 145 C 288 188, 280 234, 276 264"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* ------------------------------------------------------------- */}
        {/* LAYER 8: CENTRAL FLOATING 10-FACET 3D GOLDEN STAR             */}
        {/* Center: (250, 135), R=34, r=15                                */}
        {/* ------------------------------------------------------------- */}
        <g id="central-3d-star" filter="drop-shadow(0 6px 12px rgba(120,53,15,0.45))">
          {/* 10 Triangular Beveled Facets */}
          {/* Top Tip (250, 101) */}
          <polygon points="250,135 250,101 258.8,122.9" fill="url(#star-facet-shadow)" />
          <polygon points="250,135 250,101 241.2,122.9" fill="url(#star-facet-light)" />

          {/* Top-Right Tip (282.3, 124.5) */}
          <polygon points="250,135 282.3,124.5 258.8,122.9" fill="url(#star-facet-light)" />
          <polygon points="250,135 282.3,124.5 264.3,139.6" fill="url(#star-facet-shadow)" />

          {/* Bottom-Right Tip (270.0, 162.5) */}
          <polygon points="250,135 270.0,162.5 264.3,139.6" fill="url(#star-facet-light)" />
          <polygon points="250,135 270.0,162.5 250,150" fill="url(#star-facet-shadow)" />

          {/* Bottom-Left Tip (230.0, 162.5) */}
          <polygon points="250,135 230.0,162.5 250,150" fill="url(#star-facet-light)" />
          <polygon points="250,135 230.0,162.5 235.7,139.6" fill="url(#star-facet-shadow)" />

          {/* Top-Left Tip (217.7, 124.5) */}
          <polygon points="250,135 217.7,124.5 235.7,139.6" fill="url(#star-facet-shadow)" />
          <polygon points="250,135 217.7,124.5 241.2,122.9" fill="url(#star-facet-light)" />

          {/* Center Specular Glint Core */}
          <circle cx="250" cy="135" r="2.5" fill="#FFFFFF" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 9: SPECULAR LENS FLARE / STARBURST                      */}
        {/* ------------------------------------------------------------- */}
        <g transform="translate(235, 116)" className="animate-pulse">
          {/* Diamond Flare Shape */}
          <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#FFFFFF" opacity="0.95" />
          <circle cx="0" cy="0" r="5" fill="#FEF08A" filter="blur(2px)" />
        </g>

        {/* Secondary Flare on Right Wing Tip */}
        <g transform="translate(314, 34)" className="animate-pulse">
          <polygon points="0,-10 2.5,-2.5 10,0 2.5,2.5 0,10 -2.5,2.5 -10,0 -2.5,-2.5" fill="#FFFFFF" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
