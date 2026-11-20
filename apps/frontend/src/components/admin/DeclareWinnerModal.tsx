'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, Trophy, X } from 'lucide-react';
import { ClubBadge } from '@/components/ui/icons';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { awardFieldsFor, hasTournamentPlacements } from '@club-portal/shared';

interface Props {
  match: any | null;
  participant: any | null; // the participant that won
  onClose: () => void;
  onDone: (message: string) => void;
  forReferee?: boolean; // referee: the result is sent to the admin for approval
}

export const participantName = (p: any, idx = 0) =>
  p?.cricketTeam?.name || p?.player?.name || p?.teamName || p?.club?.name || `Entry ${idx + 1}`;

/** Confirm a win. Shows the points the scoring rules will award, and how they are split across clubs. */
export default function DeclareWinnerModal({ match, participant, onClose, onDone, forReferee = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calc, setCalc] = useState<any | null>(null);
  const [eventScored, setEventScored] = useState(false);
  const [rankedSport, setRankedSport] = useState(false);
  // optional extras: individual award winners and BGMI tournament placements
  const [awards, setAwards] = useState<Record<string, string>>({});
  const [tournament, setTournament] = useState(false);
  const [places, setPlaces] = useState<string[]>(['', '', '']);
  const [pool, setPool] = useState<any[]>([]); // players that can receive an award

  const fields = awardFieldsFor(match?.sport?.name);
  const canTournament = hasTournamentPlacements(match?.sport?.name);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setAwards({});
    setTournament(false);
    setPlaces(['', '', '']);
    if (!match?.sportId || !awardFieldsFor(match.sport?.name).length) {
      setPool([]);
      return;
    }
    // players of the clubs in this match who are registered for the sport (rosters when the sides are teams)
    const clubIds = new Set<string>();
    const rosterIds = new Set<string>();
    (match.participants || []).forEach((p: any) => {
      if (p.clubId) clubIds.add(p.clubId);
      (p.players || []).forEach((mpp: any) => {
        if (mpp.clubId) clubIds.add(mpp.clubId);
        if (mpp.playerId) rosterIds.add(mpp.playerId);
      });
    });
    let cancelled = false;
    fetch(`/api/players?sportId=${match.sportId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !Array.isArray(d)) return;
        setPool(d.filter((pl: any) => (rosterIds.size ? rosterIds.has(pl.id) : clubIds.has(pl.clubId))));
      })
      .catch(() => !cancelled && setPool([]));
    return () => {
      cancelled = true;
    };
  }, [match, participant]);

  // the chosen extras as the request payload
  const awardsPayload = () => {
    const out: Record<string, any> = {};
    Object.entries(awards).forEach(([k, v]) => v && (out[k] = v));
    if (canTournament && tournament) {
      out.isTournamentPlacement = true;
      if (places[0]) out.firstPlaceParticipantId = places[0];
      if (places[1]) out.secondPlaceParticipantId = places[1];
      if (places[2]) out.thirdPlaceParticipantId = places[2];
    }
    return out;
  };
  const awardsKey = JSON.stringify(awardsPayload());

  useEffect(() => {
    if (!match || !participant) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCalc(null);
    setEventScored(false);
    setRankedSport(false);
    fetch(`/api/matches/${match.id}/declare-winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerParticipantId: participant.id, preview: true, awards: JSON.parse(awardsKey) }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Could not calculate points');
        return d;
      })
      .then((d) => {
        if (cancelled) return;
        setCalc(d.calculation);
        setEventScored(Boolean(d.eventScored));
        setRankedSport(Boolean(d.rankedSport));
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [match, participant, awardsKey]);

  useEffect(() => {
    if (!participant) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [participant, saving, onClose]);

  if (!mounted || !match || !participant) return null;

  const confirm = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${match.id}/declare-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerParticipantId: participant.id, awards: awardsPayload() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to declare winner');
      onDone(data.message);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const winnerName = participantName(participant);
  const winnerDist = calc?.calculatedDistributions?.find((d: any) => d.participantId === participant.id);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div className="bg-white sm:rounded-2xl rounded-t-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 bg-navy-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Declare Winner</h3>
              <p className="text-xs text-blue-300">
                {match.matchCode} • {match.sport?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" disabled={saving}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto text-xs">
          <p className="text-slate-700 text-sm">
            Mark <strong className="text-navy-950">{winnerName}</strong> as the winner.{' '}
            {eventScored
              ? `No points are awarded for this match. ${match.sport?.name} points are given when the event is finalized from the standings (1st, 2nd and 3rd place).`
              : forReferee
              ? 'Points are calculated automatically from the Scoring Rules and sent to the admin for approval. Clubs are credited once it is approved.'
              : 'Points are awarded automatically from the Scoring Rules and credited to the clubs.'}
          </p>

          {rankedSport && !eventScored && (
            <p className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-900">
              This match pays its win points now. The overall winner, runner-up and third place points are paid later from the team ranking, on the
              <strong> Event Standings</strong> page.
            </p>
          )}

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!eventScored && (fields.length > 0 || canTournament) && (
            <details className="rounded-xl border border-slate-200 bg-slate-50/60 group" open={Object.keys(awardsPayload()).length > 0}>
              <summary className="cursor-pointer select-none px-3 py-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Awards &amp; placements <span className="normal-case font-medium text-slate-400">(optional)</span>
              </summary>
              <div className="px-3 pb-3 space-y-2.5">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="block font-bold text-slate-600 mb-1 text-[10px] uppercase tracking-wider">{f.label}</label>
                    <SearchableSelect
                      value={awards[f.key] || ''}
                      onChange={(v) => setAwards((prev) => ({ ...prev, [f.key]: v }))}
                      placeholder="No award"
                      searchPlaceholder="Search player…"
                      emptyText="No eligible players"
                      options={pool
                        .filter((pl) => !f.gender || String(pl.gender || '').toUpperCase() === f.gender)
                        .map((pl) => ({ value: pl.id, label: pl.name, hint: pl.club?.code }))}
                    />
                  </div>
                ))}
                {canTournament && (
                  <div className="pt-1 space-y-2">
                    <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={tournament} onChange={(e) => setTournament(e.target.checked)} className="rounded border-slate-300" />
                      This result also decides the tournament placements
                    </label>
                    {tournament &&
                      ['1st place (overall winner)', '2nd place (runner-up)', '3rd place'].map((label, i) => (
                        <div key={label}>
                          <label className="block font-bold text-slate-600 mb-1 text-[10px] uppercase tracking-wider">{label}</label>
                          <SearchableSelect
                            value={places[i]}
                            onChange={(v) => setPlaces((prev) => prev.map((x, k) => (k === i ? v : x)))}
                            placeholder="Not awarded"
                            options={(match.participants || []).map((p: any, idx: number) => ({
                              value: p.id,
                              label: participantName(p, idx),
                              disabled: places.includes(p.id) && places[i] !== p.id,
                              disabledReason: 'already placed',
                            }))}
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </details>
          )}

          {loading ? (
            <p className="py-6 text-center text-slate-400">Calculating points…</p>
          ) : calc && eventScored ? (
            <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/60 text-blue-900">
              The win is recorded and counts toward the event standings. Finalize the event under <strong>Event Standings</strong> to award the placement points.
            </div>
          ) : calc ? (
            <>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Points from the scoring rules
                </div>
                {calc.teamPoints.map((t: any) => (
                  <div key={t.participantId} className="px-3 py-2 flex items-center justify-between gap-3 border-b last:border-0 border-slate-100">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{t.teamName}</span>
                      <span className="text-[11px] text-slate-500">{t.reason}</span>
                    </div>
                    <span
                      style={{ whiteSpace: 'nowrap', display: 'inline-flex', flexShrink: 0 }}
                      className={`inline-flex items-center font-mono font-extrabold px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${t.isWinner ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {t.points}&nbsp;pts
                    </span>
                  </div>
                ))}
              </div>

              {calc.individualAwards?.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Individual awards</span>
                  {calc.individualAwards.map((a: any) => (
                    <div key={a.awardKey} className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        {a.awardTitle}: {a.playerName} <span className="text-slate-500">({a.clubName})</span>
                      </span>
                      <span className="font-mono font-extrabold text-emerald-700 shrink-0">+{a.points} pts</span>
                    </div>
                  ))}
                </div>
              )}

              {calc.calculatedDistributions?.filter((d: any) => d.originalPoints > 0).map((dist: any) => (
                <div key={dist.participantId} className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Club credit for {dist.teamName}
                    {dist.allocations.reduce((n: number, a: any) => n + a.playersContributed, 0) > 1 ? ' (split equally between its players, credited to their clubs)' : ''}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dist.allocations.map((a: any) => (
                      <span key={a.clubId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 font-bold text-slate-800">
                        <ClubBadge code={a.clubCode} name={a.clubName} className="w-3.5 h-3.5" />
                        {a.clubName}
                        <span className="font-mono text-emerald-700">+{a.pointsFormatted}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>

        <div className="p-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={saving || loading || !calc}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {saving ? (forReferee ? 'Submitting…' : eventScored ? 'Saving…' : 'Awarding…') : forReferee ? 'Confirm Win & Submit' : eventScored ? 'Confirm Win' : 'Confirm Win & Award Points'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
