'use client';

import React from 'react';
import { MATCH_FORMAT_FILTERS, MatchFormatKey, matchFormatKey } from '@club-portal/shared';

interface Props {
  value: MatchFormatKey | '';
  onChange: (value: MatchFormatKey | '') => void;
  matches: any[]; // matches already narrowed by the sport filter (used for the counts)
}

/** Format tabs for racket-style sports: Singles / Men's Doubles / Women's Doubles / Mixed Doubles. */
export default function MatchFormatFilter({ value, onChange, matches }: Props) {
  const counts: Record<string, number> = {};
  matches.forEach((m) => {
    const k = matchFormatKey(m.matchCategory);
    if (k) counts[k] = (counts[k] || 0) + 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 text-xs">
      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">Format:</span>
      <button
        type="button"
        onClick={() => onChange('')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
          value === '' ? 'bg-navy-950 text-white shadow-2xs' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
        }`}
      >
        All formats ({total})
      </button>
      {MATCH_FORMAT_FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
            value === f.key ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          {f.label} ({counts[f.key] || 0})
        </button>
      ))}
    </div>
  );
}
