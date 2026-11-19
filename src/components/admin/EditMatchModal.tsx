'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, Pencil, X } from 'lucide-react';
import { STAGE_OPTIONS } from '@/lib/match-scheduling';

interface Props {
  match: any | null;
  venues: any[];
  referees: any[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600';

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
    {children} {required ? <span className="text-red-500">*</span> : <span className="normal-case font-medium text-slate-400">(optional)</span>}
  </label>
);

/** Edit the schedule details of a match that has no result yet. Participants are fixed once scheduled. */
export default function EditMatchModal({ match, venues, referees, onClose, onSaved }: Props) {
  const [mounted, setMounted] = useState(false);
  const [stageType, setStageType] = useState('NORMAL');
  const [round, setRound] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [venueId, setVenueId] = useState('');
  const [refereeId, setRefereeId] = useState('');
  const [status, setStatus] = useState('SCHEDULED');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!match) return;
    setStageType(match.stageType || 'NORMAL');
    setRound(match.round || '');
    setMatchDate(match.matchDate || '');
    setMatchTime(match.matchTime || '');
    setVenueId(match.venueId || '');
    setRefereeId(match.referees?.[0]?.refereeId || '');
    setStatus(match.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'SCHEDULED');
    setNotes(match.notes || '');
    setError(null);
    setSaving(false);
  }, [match]);

  useEffect(() => {
    if (!match) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [match, saving, onClose]);

  if (!mounted || !match) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!round.trim()) return setError('Enter a match title.');
    if (!matchDate) return setError('Select a match date.');
    if (!matchTime) return setError('Select a start time.');
    if (!venueId) return setError('Select a venue.');

    setSaving(true);
    try {
      const res = await fetch(`/api/matches/${match.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageType,
          round: round.trim(),
          matchDate,
          matchTime,
          venueId,
          status,
          notes: notes.trim(),
          refereeIds: refereeId ? [refereeId] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update match');
      onSaved(`Match ${match.matchCode} updated.`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sides = (match.participants || []).map((p: any, i: number) => p.cricketTeam?.name || p.player?.name || p.teamName || p.club?.name || `Entry ${i + 1}`);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form
        onSubmit={save}
        noValidate
        className="bg-white sm:rounded-2xl rounded-t-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 bg-navy-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Pencil className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm">Edit Match {match.matchCode}</h3>
              <p className="text-xs text-blue-300 truncate">
                {match.sport?.name} • {sides.join(' vs ')}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" disabled={saving}>
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
            <Label required>Stage</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {STAGE_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStageType(st.id)}
                  className={`py-2 px-1.5 rounded-lg text-[10px] font-extrabold border transition truncate ${
                    stageType === st.id ? 'bg-navy-950 text-white border-navy-950' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label required>Match title</Label>
            <input value={round} onChange={(e) => setRound(e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label required>Date</Label>
              <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label required>Start time</Label>
              <input type="time" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <Label required>Venue</Label>
              <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className={inputCls}>
                <option value="">Select venue</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Referee</Label>
              <select value={refereeId} onChange={(e) => setRefereeId(e.target.value)} className={inputCls}>
                <option value="">Unassigned</option>
                {referees.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label required>Status</Label>
            <div className="inline-flex gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[
                { v: 'SCHEDULED', l: 'Scheduled' },
                { v: 'IN_PROGRESS', l: 'In progress' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setStatus(o.v)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition ${status === o.v ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-500'}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Instructions for the referee" />
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            The teams or players are fixed once a match is scheduled. To change them, delete this match and schedule it again.
          </p>
        </div>

        <div className="p-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
