'use client';

import { useEffect, useState } from 'react';

export interface PublicSide {
  id: string;
  name: string;
  players: string[];
  clubs: { id: string; name: string; code?: string }[];
  score: number | null;
  isWinner: boolean;
}

export interface PublicMatch {
  id: string;
  matchCode: string;
  sport: { id: string; name: string } | null;
  round: string;
  stageType: string;
  category: string;
  categoryLabel: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: string;
  sides: PublicSide[];
}

export interface HouseStanding {
  id: string;
  rank: number;
  points: number;
  club: { id: string; name: string; code?: string };
  sportBreakdown: Record<string, number>;
  transactionsCount?: number;
}

/** Start time of a match as a local Date. */
export function startsAt(m: PublicMatch): Date {
  const [y, mo, d] = m.date.split('-').map(Number);
  const [h, mi] = (m.time || '00:00').split(':').map(Number);
  return new Date(y, (mo || 1) - 1, d || 1, h || 0, mi || 0);
}

export const isLive = (m: PublicMatch) => m.status === 'IN_PROGRESS';
export const isDone = (m: PublicMatch) => m.status === 'COMPLETED';
export const isPending = (m: PublicMatch) => m.status === 'SUBMITTED'; // played, result waiting for approval
export const isUpcoming = (m: PublicMatch) => m.status === 'SCHEDULED' || m.status === 'AWAITING_RESULT' || m.status === 'IN_PROGRESS';

export function statusBadge(m: PublicMatch): { label: string; tone: 'live' | 'upcoming' | 'done' | 'pending' } {
  if (isLive(m)) return { label: 'LIVE NOW', tone: 'live' };
  if (isDone(m)) return { label: 'COMPLETED', tone: 'done' };
  if (isPending(m)) return { label: 'RESULT PENDING', tone: 'pending' };
  return { label: 'UPCOMING', tone: 'upcoming' };
}

const STAGE_LABELS: Record<string, string> = {
  QUARTER_FINAL: 'Quarter Final',
  SEMI_FINAL: 'Semi Final',
  FINAL: 'Championship Final',
  THIRD_PLACE: '3rd Place Playoff',
};

/** e.g. "Badminton • Men's Singles • Semi Final" */
export function matchTitle(m: PublicMatch): string {
  const parts = [m.sport?.name, m.categoryLabel && m.categoryLabel !== m.sport?.name ? m.categoryLabel : '', STAGE_LABELS[m.stageType] || ''].filter(Boolean);
  return parts.join(' • ');
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "Today • 17:30", "Tomorrow • 09:00", "Fri 20 Nov • 15:00" */
export function whenLabel(m: PublicMatch, now: Date = new Date()): string {
  const start = startsAt(m);
  const dayDiff = Math.round(
    (new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000
  );
  const time = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const day =
    dayDiff === 0 ? 'Today' : dayDiff === 1 ? 'Tomorrow' : dayDiff === -1 ? 'Yesterday' : start.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} • ${time}`;
}

/** "Starts in 2h 15m" / "Started 40m ago" */
export function countdownLabel(m: PublicMatch, now: Date = new Date()): string {
  const diffMin = Math.round((startsAt(m).getTime() - now.getTime()) / 60000);
  const abs = Math.abs(diffMin);
  const d = Math.floor(abs / 1440);
  const h = Math.floor((abs % 1440) / 60);
  const mi = abs % 60;
  const span = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${mi}m` : `${mi}m`;
  return diffMin >= 0 ? `Starts in ${span}` : `Started ${span} ago`;
}

/** The match viewers should look at next: a live one, else the soonest one still to be played. */
export function pickNext(matches: PublicMatch[], now: Date = new Date()): PublicMatch | null {
  const live = matches.find(isLive);
  if (live) return live;
  const open = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'AWAITING_RESULT').sort((a, b) => startsAt(a).getTime() - startsAt(b).getTime());
  return open.find((m) => startsAt(m).getTime() >= now.getTime() - 6 * 3600000) || open[0] || null;
}

const HOUSE_COLORS: Record<string, string> = { RED: '#ba1a1a', BLU: '#0051d5', GRN: '#1b7a3d', PUR: '#6b3fa0', YEL: '#b88a00' };
export const houseColor = (code?: string, name?: string): string => {
  if (code && HOUSE_COLORS[code.toUpperCase()]) return HOUSE_COLORS[code.toUpperCase()];
  const n = (name || '').toLowerCase();
  if (n.includes('red')) return HOUSE_COLORS.RED;
  if (n.includes('blue')) return HOUSE_COLORS.BLU;
  if (n.includes('green')) return HOUSE_COLORS.GRN;
  if (n.includes('purple')) return HOUSE_COLORS.PUR;
  if (n.includes('yellow')) return HOUSE_COLORS.YEL;
  return '#000f3f';
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

/** Re-renders every `ms` so countdowns stay fresh. */
export function useNow(ms = 60000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function usePolled<T>(url: string, pick: (json: any) => T, pollMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        if (!cancelled) {
          setData(pick(json));
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, pollMs]);

  return { data, loading, error };
}

/** Live public schedule (refreshes every minute). */
export const usePublicSchedule = (pollMs = 60000) =>
  usePolled<PublicMatch[]>('/api/public/schedule', (j) => (Array.isArray(j.matches) ? j.matches : []), pollMs);

/** Live overall house standings (refreshes every minute). */
export const useHouseStandings = (pollMs = 60000) =>
  usePolled<{ standings: HouseStanding[]; sports: { id: string; name: string }[] }>(
    '/api/leaderboard?type=overall',
    (j) => ({ standings: Array.isArray(j.standings) ? j.standings : [], sports: Array.isArray(j.sports) ? j.sports : [] }),
    pollMs
  );
