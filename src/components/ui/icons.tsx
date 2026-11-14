import React from 'react';
import {
  Trophy,
  Shield,
  Medal,
  Award,
  Zap,
  Flame,
  Rocket,
  Crown,
  Activity,
  Target,
  Flag,
  CircleDot,
  Gamepad2,
  Swords,
  Sparkles,
} from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

// Crisp Vector SVG for Football / Soccer
export function FootballIcon({ className = 'w-4 h-4', size }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 15 9.5 14 13.5 10 13.5 9 9.5 12 7" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="21.5" y1="9" x2="15" y2="9.5" />
      <line x1="18" y1="20" x2="14" y2="13.5" />
      <line x1="6" y1="20" x2="10" y2="13.5" />
      <line x1="2.5" y1="9" x2="9" y2="9.5" />
    </svg>
  );
}

// Crisp Vector SVG for Cricket
export function CricketIcon({ className = 'w-4 h-4', size }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
    >
      <path d="M4 20l10-10" />
      <path d="M12 8l4-4 4 4-4 4" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="19" cy="5" r="1" />
      <line x1="3" y1="21" x2="5" y2="19" />
    </svg>
  );
}

// Crisp Vector SVG for Badminton
export function BadmintonIcon({ className = 'w-4 h-4', size }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="12" cy="18" r="2" />
      <path d="M10 16l-3-8h10l-3 8z" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="12" y1="16" x2="12" y2="8" />
    </svg>
  );
}

// Crisp Vector SVG for Table Tennis
export function TableTennisIcon({ className = 'w-4 h-4', size }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="11" cy="10" r="7" />
      <line x1="16" y1="15" x2="21" y2="20" strokeWidth="3" />
      <circle cx="19" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}

// Crisp Vector SVG for Basketball
export function BasketballIcon({ className = 'w-4 h-4', size }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M4.93 4.93c4.24 3.53 4.24 10.6 0 14.14" />
      <path d="M19.07 4.93c-4.24 3.53-4.24 10.6 0 14.14" />
    </svg>
  );
}

// Dynamic Sport Icon Resolver
export function SportIcon({
  name,
  className = 'w-4 h-4',
}: {
  name?: string;
  className?: string;
}) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('football') || lower.includes('soccer')) {
    return <FootballIcon className={className} />;
  }
  if (lower.includes('cricket')) {
    return <CricketIcon className={className} />;
  }
  if (lower.includes('badminton')) {
    return <BadmintonIcon className={className} />;
  }
  if (lower.includes('table tennis') || lower.includes('tt') || lower.includes('tennis')) {
    return <TableTennisIcon className={className} />;
  }
  if (lower.includes('basketball')) {
    return <BasketballIcon className={className} />;
  }
  if (lower.includes('bgmi') || lower.includes('esport') || lower.includes('game') || lower.includes('pubg')) {
    return <Gamepad2 className={className} />;
  }
  if (lower.includes('chess')) {
    return <Crown className={className} />;
  }
  if (lower.includes('carrom')) {
    return <Target className={className} />;
  }
  return <Medal className={className} />;
}

// Dynamic Club Crest / Logo Badge
export function ClubBadge({
  name,
  code,
  className = 'w-5 h-5',
}: {
  name?: string;
  code?: string;
  className?: string;
}) {
  const c = (code || name || '').toUpperCase();
  if (c.includes('APX') || c.includes('APEX')) {
    return <Crown className={`${className} text-amber-500`} />;
  }
  if (c.includes('TTN') || c.includes('TITAN')) {
    return <Zap className={`${className} text-blue-500`} />;
  }
  if (c.includes('VLS') || c.includes('VELOCITY')) {
    return <Rocket className={`${className} text-cyan-500`} />;
  }
  if (c.includes('PHX') || c.includes('PHOENIX')) {
    return <Flame className={`${className} text-rose-500`} />;
  }
  return <Shield className={`${className} text-indigo-500`} />;
}

// Podium Medal Icon Component
export function MedalBadge({
  type,
  className = 'w-4 h-4',
}: {
  type: 'gold' | 'silver' | 'bronze' | 1 | 2 | 3;
  className?: string;
}) {
  if (type === 'gold' || type === 1) {
    return <Trophy className={`${className} text-amber-500 drop-shadow-xs`} />;
  }
  if (type === 'silver' || type === 2) {
    return <Award className={`${className} text-slate-400 drop-shadow-xs`} />;
  }
  return <Medal className={`${className} text-amber-700 drop-shadow-xs`} />;
}
