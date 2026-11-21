'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import TeamPlayerPicker from '@/components/admin/TeamPlayerPicker';
import { usePreventScroll } from '@/hooks/usePreventScroll';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (team: any, wasEdit: boolean) => void;
  clubs: any[];
  sports: any[]; // doubles-capable sports to choose from
  category: 'DOUBLES' | 'MIXED_DOUBLES';
  fixedSportId?: string; // when set (e.g. from Schedule Match) the sport can't be changed
  fixedGender?: 'MALE' | 'FEMALE'; // preselect (and lock) men's / women's doubles
  editing?: any | null;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500';

/** Create / edit a doubles or mixed-doubles team. Shared by the Teams page and the Schedule Match modal. */
export default function DoublesTeamFormModal({ open, onClose, onSaved, clubs, sports, category, fixedSportId, fixedGender, editing = null }: Props) {
  usePreventScroll(open);
  const isMixed = category === 'MIXED_DOUBLES';
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const label = isMixed ? 'Mixed Doubles Team' : gender === 'FEMALE' ? "Women's Doubles Team" : "Men's Doubles Team";

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [sportId, setSportId] = useState('');
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name || '');
    setSportId(editing?.sportId || fixedSportId || '');
    setGender(editing?.gender === 'FEMALE' ? 'FEMALE' : fixedGender || 'MALE');
    setClubIds(editing?.clubIds?.length ? editing.clubIds : editing?.clubId ? [editing.clubId] : []);
    setSlots([editing?.playerIds?.[0] || '', editing?.playerIds?.[1] || '']);
    setError(null);
    setSaving(false);
  }, [open, editing, fixedSportId, fixedGender]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Esc inside an open dropdown only closes the dropdown
      if ((e.target as HTMLElement | null)?.closest?.('[data-searchable-panel]')) return;
      if (e.key === 'Escape' && !saving) {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, saving, onClose]);

  if (!mounted || !open) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    if (!name.trim()) return setError('Enter a team name.');
    if (!sportId) return setError('Select a sport.');
    if (clubIds.length === 0) return setError('Select at least one club.');
    if (slots.some((s) => !s)) return setError('Select both players.');
    if (slots[0] === slots[1]) return setError('A player cannot be added twice.');

    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/doubles-teams/${editing.id}` : '/api/doubles-teams', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), sportId, category, playerIds: slots }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save team');
      onSaved(data, !!editing);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sport = sports.find((s) => s.id === sportId);

  return createPortal(
    <div
      className="fixed inset-0 !m-0 z-[10000] bg-navy-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 overscroll-none touch-none"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !saving) onClose();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <form
        onSubmit={save}
        noValidate
        className="bg-white sm:rounded-2xl rounded-t-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl touch-auto"
      >
        <div className="p-4 bg-navy-950 text-white flex items-center justify-between">
          <h3 className="font-extrabold text-sm">{editing ? `Edit ${label}` : `New ${label}`}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
              Team name <span className="text-red-500">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Smash Duo" />
          </div>
          {!isMixed && (
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Section <span className="text-red-500">*</span>
              </label>
              <div className="inline-flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                {[
                  { v: 'MALE' as const, l: "Men's Doubles" },
                  { v: 'FEMALE' as const, l: "Women's Doubles" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    disabled={!!fixedGender && fixedGender !== o.v}
                    onClick={() => {
                      if (gender !== o.v) {
                        setGender(o.v);
                        setSlots(['', '']); // players must match the section
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${
                      gender === o.v ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-500 disabled:opacity-40'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
              Sport <span className="text-red-500">*</span>
            </label>
            <select
              value={sportId}
              disabled={!!fixedSportId}
              onChange={(e) => {
                setSportId(e.target.value);
                setSlots(['', '']);
              }}
              className={inputCls}
            >
              <option value="">Select sport</option>
              {sports.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>
          <TeamPlayerPicker
            clubs={clubs}
            sportId={sportId}
            slotCount={2}
            slots={slots}
            onSlotsChange={setSlots}
            clubIds={clubIds}
            onClubIdsChange={setClubIds}
            slotGenders={isMixed ? ['MALE', 'FEMALE'] : [gender, gender]}
            slotLabels={isMixed ? ['Male player', 'Female player'] : gender === 'FEMALE' ? ['Female player 1', 'Female player 2'] : ['Male player 1', 'Male player 2']}
            sportLabel={sport?.name}
          />
        </div>
        <div className="p-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-navy-950 hover:bg-navy-900 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Saving…' : editing ? 'Save Team' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
