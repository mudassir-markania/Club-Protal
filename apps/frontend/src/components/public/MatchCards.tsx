'use client';

import React from 'react';
import {
  PublicMatch,
  PublicSide,
  countdownLabel,
  houseColor,
  initials,
  isDone,
  isLive,
  matchTitle,
  statusBadge,
  whenLabel,
} from './matchView';

const TONE: Record<string, string> = {
  live: 'bg-[#ffdad6]/70 text-[#ba1a1a]',
  upcoming: 'bg-[#e2e7ff] text-[#000f3f]',
  done: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
};

export function StatusPill({ match }: { match: PublicMatch }) {
  const b = statusBadge(match);
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-black flex items-center gap-1.5 font-manrope ${TONE[b.tone]}`}>
      {b.tone === 'live' && <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />}
      {b.label}
    </span>
  );
}

function ClubChips({ side }: { side: PublicSide }) {
  if (side.clubs.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5">
      {side.clubs.map((c) => (
        <span
          key={c.id}
          className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase text-white"
          style={{ backgroundColor: houseColor(c.code, c.name) }}
          title={c.name}
        >
          {c.code || c.name}
        </span>
      ))}
    </div>
  );
}

/** One side of a two-sided match, large (used in the featured card). */
function DuelSide({ side, match, align }: { side: PublicSide; match: PublicMatch; align: 'left' | 'right' }) {
  const color = houseColor(side.clubs[0]?.code, side.clubs[0]?.name);
  const done = isDone(match);
  return (
    <div className="col-span-2 flex flex-col items-center text-center min-w-0">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-manrope text-xl font-black mb-2 shadow-inner text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials(side.name)}
      </div>
      <h4 className="text-sm sm:text-lg font-bold text-[#000f3f] uppercase font-manrope break-words max-w-full">{side.name}</h4>
      {side.players.length > 0 && (
        <span className="text-[11px] text-[#45464f] mt-0.5 max-w-full break-words">{side.players.join(' & ')}</span>
      )}
      <ClubChips side={side} />
      {done && (
        <span className={`font-manrope text-3xl sm:text-4xl font-black mt-2 ${side.isWinner ? 'text-emerald-700' : 'text-[#45464f]'}`} data-align={align}>
          {side.score}
          {side.isWinner && <span className="ml-1 text-sm align-middle">🏆</span>}
        </span>
      )}
    </div>
  );
}

/** Featured "next match" card with full details. */
export function FeaturedMatch({ match, now, onLiveStream }: { match: PublicMatch; now: Date; onLiveStream?: () => void }) {
  const twoSided = match.sides.length === 2;
  const live = isLive(match);
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between border border-[#e2e7ff] h-full">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ba1a1a] via-[#eb6905] to-[#0051d5]" />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#e2e7ff]">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusPill match={match} />
          <span className="text-[11px] text-[#45464f] uppercase font-bold font-manrope">{matchTitle(match)}</span>
        </div>
        <span className="text-xs text-[#45464f] font-medium font-manrope">{match.matchCode}</span>
      </div>

      {twoSided ? (
        <div className="py-8 grid grid-cols-5 items-start gap-1">
          <DuelSide side={match.sides[0]} match={match} align="left" />
          <div className="col-span-1 flex flex-col items-center justify-center self-center">
            <span className="text-lg font-black text-[#45464f] font-manrope">VS</span>
          </div>
          <DuelSide side={match.sides[1]} match={match} align="right" />
        </div>
      ) : (
        <div className="py-6">
          <p className="text-[11px] text-[#45464f] uppercase tracking-wider font-bold font-manrope mb-3">{match.sides.length} teams in this match</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {match.sides.map((s, i) => (
              <div key={s.id} className={`p-3 rounded-lg border ${s.isWinner ? 'border-emerald-300 bg-emerald-50/60' : 'border-[#e2e7ff] bg-[#f2f3ff]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-manrope font-bold text-sm text-[#000f3f] uppercase break-words">
                    {i + 1}. {s.name}
                  </span>
                  {isDone(match) && <span className="font-mono font-black text-sm text-[#000f3f]">{s.score}</span>}
                </div>
                {s.players.length > 0 && <span className="text-[11px] text-[#45464f] block mt-0.5">{s.players.join(', ')}</span>}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {s.clubs.map((c) => (
                    <span key={c.id} className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase text-white" style={{ backgroundColor: houseColor(c.code, c.name) }}>
                      {c.code || c.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#f2f3ff] p-4 rounded-lg flex items-center justify-between gap-3 border border-[#e2e7ff]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[#0051d5] text-xl shrink-0">schedule</span>
          <p className="text-xs sm:text-sm text-[#131b2e]">
            <span className="font-black text-[#000f3f]">{whenLabel(match, now)}</span>
            {!isDone(match) && <span className="text-[#45464f]"> • {countdownLabel(match, now)}</span>}
          </p>
        </div>
        {live && onLiveStream && (
          <button
            onClick={onLiveStream}
            className="px-4 py-1.5 rounded bg-[#000f3f] hover:bg-[#0051d5] text-white text-xs uppercase tracking-wider font-extrabold shrink-0 transition-colors font-manrope cursor-pointer"
          >
            Live Stream
          </button>
        )}
      </div>
    </div>
  );
}

/** Compact match card for lists. `expanded` shows every side with its players and clubs. */
export function MatchCard({ match, now, expanded = false, onToggle }: { match: PublicMatch; now: Date; expanded?: boolean; onToggle?: () => void }) {
  const done = isDone(match);
  const many = match.sides.length > 2;
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-[#e2e7ff] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
        <span className="px-2 py-0.5 rounded bg-[#e2e7ff] text-[#000f3f] text-[10px] uppercase font-black font-manrope">{whenLabel(match, now)}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#45464f] uppercase font-bold font-manrope">{matchTitle(match)}</span>
          <StatusPill match={match} />
        </div>
      </div>

      {many && !expanded ? (
        <p className="text-sm font-bold text-[#000f3f] font-manrope uppercase py-1">
          {match.sides.length} teams: <span className="font-semibold normal-case text-[#45464f]">{match.sides.map((s) => s.name).join(', ')}</span>
        </p>
      ) : (
        <div className={many ? 'space-y-1.5' : 'space-y-2'}>
          {match.sides.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 font-manrope"
                  style={{ backgroundColor: houseColor(s.clubs[0]?.code, s.clubs[0]?.name) }}
                >
                  {initials(s.name)}
                </span>
                <div className="min-w-0">
                  <span className={`block text-sm font-bold uppercase font-manrope truncate ${done && !s.isWinner ? 'text-[#45464f]' : 'text-[#000f3f]'}`}>{s.name}</span>
                  <span className="block text-[11px] text-[#45464f] truncate">
                    {s.players.length > 0 ? s.players.join(', ') : s.clubs.map((c) => c.name).join(', ')}
                    {expanded && s.players.length > 0 && s.clubs.length > 0 && ` • ${s.clubs.map((c) => c.code || c.name).join(' / ')}`}
                  </span>
                </div>
              </div>
              {done && (
                <span className={`font-mono font-black text-sm shrink-0 ${s.isWinner ? 'text-emerald-700' : 'text-[#45464f]'}`}>
                  {s.isWinner ? '🏆 ' : ''}
                  {s.score}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#e2e7ff] text-xs text-[#45464f]">
        <span className="text-[11px] font-mono">{match.matchCode}</span>
        {many && onToggle && (
          <button onClick={onToggle} className="text-[11px] text-[#0051d5] uppercase font-bold font-manrope hover:underline cursor-pointer">
            {expanded ? 'Hide teams' : 'Show teams'}
          </button>
        )}
      </div>
    </div>
  );
}
