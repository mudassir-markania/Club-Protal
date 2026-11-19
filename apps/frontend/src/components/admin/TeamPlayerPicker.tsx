'use client';

import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';
import SearchableSelect, { SelectOption } from '@/components/ui/SearchableSelect';

export interface PickerProps {
  clubs: any[];
  sportId: string; // players must be registered for this sport; '' = not chosen yet
  slotCount: number;
  slots: string[]; // selected player ids ('' = empty)
  onSlotsChange: (slots: string[]) => void;
  clubIds: string[]; // selected clubs (multi-select)
  onClubIdsChange: (ids: string[]) => void;
  /** Optional per-slot gender restriction, e.g. ['MALE', 'FEMALE'] for mixed doubles */
  slotGenders?: (string | null)[];
  slotLabels?: string[];
  sportLabel?: string;
  minSlotsRequired?: number;
}

const selectCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400';

/**
 * Pick several clubs, then pick players from those clubs.
 * Eligible players per club come from /api/players?clubId&sportId (database-side filter).
 */
export default function TeamPlayerPicker({
  clubs,
  sportId,
  slotCount,
  slots,
  onSlotsChange,
  clubIds,
  onClubIdsChange,
  slotGenders,
  slotLabels,
  sportLabel = 'this sport',
  minSlotsRequired,
}: PickerProps) {
  const [byClub, setByClub] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!sportId) return;
    clubIds.forEach((cid) => {
      const key = `${cid}|${sportId}`;
      if (byClub[key]) return;
      fetch(`/api/players?clubId=${cid}&sportId=${sportId}`)
        .then((r) => r.json())
        .then((d) => setByClub((prev) => ({ ...prev, [key]: Array.isArray(d) ? d : [] })))
        .catch(() => setByClub((prev) => ({ ...prev, [key]: [] })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubIds.join(','), sportId]);

  const playersOf = (cid: string): any[] => byClub[`${cid}|${sportId}`] || [];
  const allEligible = clubIds.flatMap(playersOf);

  const toggleClub = (cid: string) => {
    const next = clubIds.includes(cid) ? clubIds.filter((c) => c !== cid) : [...clubIds, cid];
    onClubIdsChange(next);
    // drop players whose club was deselected
    const removedPlayers = new Set(playersOf(cid).map((p) => p.id));
    if (!next.includes(cid)) onSlotsChange(slots.map((s) => (removedPlayers.has(s) ? '' : s)));
  };

  const setSlot = (i: number, value: string) => onSlotsChange(slots.map((v, k) => (k === i ? value : v)));

  const selectedClubs = clubs.filter((c) => clubIds.includes(c.id));

  return (
    <div className="space-y-3">
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
          Clubs <span className="text-red-500">*</span>{' '}
          <span className="normal-case font-medium text-slate-400">(select one or more)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {clubs.map((c) => {
            const on = clubIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleClub(c.id)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                  on
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ClubBadge code={c.code} name={c.name} className="w-3.5 h-3.5" />
                {c.name}
                {on && <Check className="w-3 h-3 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
          {minSlotsRequired !== undefined && minSlotsRequired < slotCount ? (
            <>
              Players ({minSlotsRequired} to {slotCount} players) <span className="text-red-500">*</span>{' '}
              <span className="normal-case font-medium text-slate-400">(4 players not mandatory)</span>
            </>
          ) : (
            <>
              Players ({slotCount}) <span className="text-red-500">*</span>
            </>
          )}
        </label>
        {slots.slice(0, slotCount).map((value, i) => {
          const gender = slotGenders?.[i] || null;
          const disabled = clubIds.length === 0 || !sportId;
          const isOptional = minSlotsRequired !== undefined && i >= minSlotsRequired;
          const defaultPlaceholder = isOptional ? `Player ${i + 1} (Optional)` : `Player ${i + 1}`;
          const options: SelectOption[] = selectedClubs.flatMap((c) =>
            playersOf(c.id)
              .filter((p) => !gender || String(p.gender || '').toUpperCase() === gender)
              .map((p) => ({
                value: p.id,
                label: p.name,
                group: `${c.name} (${c.code})`,
                disabled: slots.includes(p.id) && p.id !== value,
                disabledReason: 'already in team',
              }))
          );
          return (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex-1">
                <SearchableSelect
                  disabled={disabled}
                  value={value}
                  onChange={(v) => setSlot(i, v)}
                  options={options}
                  placeholder={disabled ? 'Select sport and at least one club first' : slotLabels?.[i] || defaultPlaceholder}
                  searchPlaceholder="Search player name…"
                  emptyText="No players match your search"
                />
              </div>
              {value && (
                <button
                  type="button"
                  onClick={() => setSlot(i, '')}
                  title="Clear player slot"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
        {clubIds.length > 0 && sportId && allEligible.length < (minSlotsRequired ?? slotCount) && (
          <p className="text-[11px] text-amber-700 font-medium">
            Only {allEligible.length} player(s) in the selected clubs are registered for {sportLabel}. Select more clubs or
            register more players.
          </p>
        )}
      </div>
    </div>
  );
}
