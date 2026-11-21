'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { BGMI_TEAM_SIZE } from '@club-portal/shared';
import TeamPlayerPicker from '@/components/admin/TeamPlayerPicker';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (team: any, wasEdit: boolean) => void;
  clubs: any[];
  bgmiSportId: string;
  editing?: any | null; // existing team when editing
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600';

/** Create / edit a BGMI team. Shared by the Teams page and the Schedule Match modal. */
export default function BgmiTeamFormModal({ open, onClose, onSaved, clubs, bgmiSportId, editing = null }: Props) {
  usePreventScroll(open);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>(Array(BGMI_TEAM_SIZE).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name || '');
    setClubIds(editing?.clubIds?.length ? editing.clubIds : editing?.clubId ? [editing.clubId] : []);
    setSlots(Array.from({ length: BGMI_TEAM_SIZE }, (_, i) => editing?.playerIds?.[i] || ''));
    setError(null);
    setSaving(false);
  }, [open, editing]);

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
    if (clubIds.length === 0) return setError('Select at least one club.');
    const activePlayerIds = slots.filter(Boolean);
    if (activePlayerIds.length === 0) return setError('Select at least 1 player for the BGMI team.');
    if (new Set(activePlayerIds).size !== activePlayerIds.length) return setError('A player cannot be added twice.');

    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/bgmi-teams/${editing.id}` : '/api/bgmi-teams', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), playerIds: activePlayerIds }),
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
          <h3 className="font-extrabold text-sm">{editing ? 'Edit BGMI Team' : 'New BGMI Team'}</h3>
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
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Alpha Squad" />
          </div>
          <TeamPlayerPicker
            clubs={clubs}
            sportId={bgmiSportId}
            slotCount={BGMI_TEAM_SIZE}
            minSlotsRequired={1}
            slots={slots}
            onSlotsChange={setSlots}
            clubIds={clubIds}
            onClubIdsChange={setClubIds}
            sportLabel="BGMI"
            slotLabels={[
              'Player 1 (Required)',
              'Player 2 (Optional)',
              'Player 3 (Optional)',
              'Player 4 (Optional)',
            ]}
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
