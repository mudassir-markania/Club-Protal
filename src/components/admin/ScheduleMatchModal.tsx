'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Calendar, Check, Plus, Trash2, Users, X } from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import { STAGE_OPTIONS, defaultRoundFor, getScheduleConfig, PlayFormat } from '@/lib/match-scheduling';
import BgmiTeamFormModal from '@/components/admin/BgmiTeamFormModal';
import DoublesTeamFormModal from '@/components/admin/DoublesTeamFormModal';
import SearchableSelect from '@/components/ui/SearchableSelect';

interface Side {
  clubId: string;
  teamId: string; // cricket team
  playerIds: string[]; // fixed-length slots, '' = empty
}

export interface ScheduleMatchModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled: (match: any) => void;
  sports: any[];
  clubs: any[];
  cricketTeams: any[];
  bgmiTeams?: any[];
  onTeamCreated?: (team: any) => void;
  venues: any[];
  referees: any[];
  players: any[];
}

type Errors = Record<string, string>;

const todayStr = () => new Date().toISOString().slice(0, 10);
const emptySide = (size = 1): Side => ({ clubId: '', teamId: '', playerIds: Array(size).fill('') });
const inputCls =
  'w-full px-3 py-2 border rounded-lg bg-white font-semibold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400';

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center justify-between font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
        <span>
          {label} {required ? <span className="text-red-500">*</span> : <span className="text-slate-400 normal-case font-medium">(optional)</span>}
        </span>
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

const borderFor = (err?: string) => (err ? 'border-red-400' : 'border-slate-200');

export default function ScheduleMatchModal({
  open,
  onClose,
  onScheduled,
  sports,
  clubs,
  cricketTeams,
  bgmiTeams = [],
  onTeamCreated,
  venues,
  referees,
  players,
}: ScheduleMatchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [sportId, setSportId] = useState('');
  const [category, setCategory] = useState('');
  const [format, setFormat] = useState<PlayFormat>('SINGLES');
  const [stageType, setStageType] = useState('NORMAL');
  const [round, setRound] = useState('');
  const [matchDate, setMatchDate] = useState(todayStr());
  const [matchTime, setMatchTime] = useState('15:00');
  const [venueId, setVenueId] = useState('');
  const [refereeId, setRefereeId] = useState('');
  const [notes, setNotes] = useState('');
  const [sides, setSides] = useState<[Side, Side]>([emptySide(), emptySide()]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamClub, setTeamClub] = useState('');
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [doublesFormOpen, setDoublesFormOpen] = useState(false);
  const [doublesTeams, setDoublesTeams] = useState<any[]>([]);
  const [eligible, setEligible] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  const sport = sports.find((s) => s.id === sportId);
  const config = useMemo(() => getScheduleConfig(sport?.name, sport?.sportType), [sport]);
  const categoryOpt = config.categories.find((c) => c.code === category);
  const hasFormats = config.mode === 'PLAYER_SIDES' && config.formats.length > 0;
  const formatOpt = config.formats.find((f) => f.id === format);
  const categoryGender = formatOpt?.options.find((o) => o.code === category)?.gender || 'MIXED';
  const effectiveDoubles = hasFormats && format !== 'SINGLES';
  const sideSize = config.mode === 'PLAYER_SIDES' ? (effectiveDoubles ? 2 : 1) : 1;
  const doublesCategory: 'DOUBLES' | 'MIXED_DOUBLES' = format === 'MIXED_DOUBLES' ? 'MIXED_DOUBLES' : 'DOUBLES';
  const autoRound = defaultRoundFor(stageType, config, formatOpt?.options.find((o) => o.code === category)?.label || categoryOpt?.label);

  // Reset whenever the modal opens
  useEffect(() => {
    if (!open) return;
    setSportId('');
    setCategory('');
    setFormat('SINGLES');
    setStageType('NORMAL');
    setRound('');
    setMatchDate(todayStr());
    setMatchTime('15:00');
    setVenueId(venues[0]?.id || '');
    setRefereeId('');
    setNotes('');
    setSides([emptySide(), emptySide()]);
    setTeamIds([]);
    setTeamSearch('');
    setTeamClub('');
    setTeamFormOpen(false);
    setDoublesFormOpen(false);
    setDoublesTeams([]);
    setEligible({});
    setErrors({});
    setServerError(null);
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !submitting && !teamFormOpen && !doublesFormOpen && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, submitting, teamFormOpen, doublesFormOpen, onClose]);

  const resetForSport = (newId: string) => {
    const sp = sports.find((s) => s.id === newId);
    const cfg = getScheduleConfig(sp?.name, sp?.sportType);
    setSportId(newId);
    setCategory(cfg.formats[0]?.options[0]?.code || cfg.categories[0]?.code || '');
    setFormat('SINGLES');
    setRound('');
    setSides([emptySide(), emptySide()]);
    setTeamIds([]);
    setTeamSearch('');
    setTeamClub('');
    setEligible({});
    setErrors({});
    setServerError(null);
  };

  const pickCategory = (code: string) => {
    setCategory(code);
  };

  /** Switching format (Singles / Doubles / Mixed Doubles) picks that format's first category and resets the sides. */
  const pickFormat = (f: PlayFormat) => {
    const opt = config.formats.find((x) => x.id === f);
    if (!opt) return;
    setFormat(f);
    setCategory(opt.options[0].code);
    setSides([emptySide(opt.size), emptySide(opt.size)]);
    setErrors({});
  };

  const resize = (arr: string[], size: number) => Array.from({ length: size }, (_, i) => arr[i] || '');

  const updateSide = (idx: 0 | 1, patch: Partial<Side>) =>
    setSides((prev) => {
      const copy: [Side, Side] = [{ ...prev[0] }, { ...prev[1] }];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });

  const setSidePlayer = (idx: 0 | 1, slot: number, playerId: string) => {
    const ids = [...sides[idx].playerIds];
    ids[slot] = playerId;
    updateSide(idx, { playerIds: ids });
  };

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const getClub = (id: string) => clubs.find((c) => c.id === id);
  const getTeam = (id: string) => cricketTeams.find((t) => t.id === id);

  // Eligible players for (club, sport) come from the API, which queries PlayerSport in the database.
  const sideClubKey = sides.map((x) => x.clubId).join(',');
  useEffect(() => {
    if (!open || !sportId || config.mode !== 'PLAYER_SIDES' || effectiveDoubles) return;
    sides.forEach((side) => {
      const key = `${side.clubId}|${sportId}`;
      if (!side.clubId || eligible[key]) return;
      fetch(`/api/players?clubId=${side.clubId}&sportId=${sportId}`)
        .then((r) => r.json())
        .then((d) => setEligible((prev) => ({ ...prev, [key]: Array.isArray(d) ? d : [] })))
        .catch(() => setEligible((prev) => ({ ...prev, [key]: [] })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sportId, config.mode, sideClubKey]);

  const genderOk = (g: unknown) => categoryGender === 'MIXED' || String(g || '').toUpperCase() === categoryGender;
  const playersOfClub = (clubId: string) => (eligible[`${clubId}|${sportId}`] || []).filter((p) => genderOk(p.gender));
  const eligibleLoaded = (clubId: string) => !!eligible[`${clubId}|${sportId}`];

  const usedPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    if (config.mode === 'PLAYER_SIDES') sides.forEach((s) => s.playerIds.filter(Boolean).forEach((i) => ids.add(i)));
    return ids;
  }, [config.mode, sides]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!sportId) e.sportId = 'Choose a sport to continue.';
    if (!matchDate) e.matchDate = 'Select a match date.';
    else if (matchDate < todayStr()) e.matchDate = 'Date is in the past. Choose today or a future date.';
    if (!matchTime) e.matchTime = 'Select a start time.';
    if (!venueId) e.venueId = 'Select a venue.';

    if (config.mode === 'CLUBS') {
      if (!sides[0].clubId) e.sideA = 'Select the first club.';
      if (!sides[1].clubId) e.sideB = 'Select the second club.';
      if (sides[0].clubId && sides[0].clubId === sides[1].clubId) e.sideB = 'Both sides cannot be the same club.';
    } else if (config.mode === 'CRICKET_TEAMS') {
      if (!sides[0].teamId) e.sideA = 'Select the first team.';
      if (!sides[1].teamId) e.sideB = 'Select the second team.';
      if (sides[0].teamId && sides[0].teamId === sides[1].teamId) e.sideB = 'Both sides cannot be the same team.';
    } else if (config.mode === 'PLAYER_SIDES' && effectiveDoubles) {
      if (!sides[0].teamId) e.sideA = 'Select a doubles team.';
      if (!sides[1].teamId) e.sideB = 'Select the opposing doubles team.';
      if (sides[0].teamId && sides[0].teamId === sides[1].teamId) e.sideB = 'Both sides cannot be the same team.';
    } else if (config.mode === 'PLAYER_SIDES') {
      (['sideA', 'sideB'] as const).forEach((k, i) => {
        const s = sides[i];
        if (!s.clubId) e[k] = 'Select a club first.';
        else if (s.playerIds.some((p) => !p))
          e[k] = sideSize === 2 ? 'Select both players.' : 'Select a player.';
      });
    } else if (config.mode === 'SQUADS') {
      if (teamIds.length < config.minSquads) e.teams = `Select at least ${config.minSquads} teams.`;
    }
    return e;
  };

  const buildParticipants = (): any[] => {
    if (config.mode === 'CLUBS') {
      return sides.map((s) => {
        const c = getClub(s.clubId);
        return { clubId: c?.id, teamName: c?.name };
      });
    }
    if (config.mode === 'CRICKET_TEAMS') {
      return sides.map((s) => {
        const t = getTeam(s.teamId);
        return { cricketTeamId: t?.id, clubId: t?.clubId, teamName: t?.name };
      });
    }
    if (config.mode === 'PLAYER_SIDES' && effectiveDoubles) {
      return sides.map((s) => {
        const t = doublesTeams.find((x) => x.id === s.teamId);
        return { doublesTeamId: s.teamId, teamName: t?.name, playerIds: t?.playerIds || [] };
      });
    }
    if (config.mode === 'PLAYER_SIDES') {
      return sides.map((s) => {
        const ps = s.playerIds.map(getPlayer);
        if (sideSize === 1) {
          return { playerId: ps[0]?.id, clubId: ps[0]?.clubId, teamName: ps[0]?.name, playerIds: [ps[0]?.id] };
        }
        return { teamName: ps.map((p) => p?.name || 'Player').join(' & '), playerIds: s.playerIds };
      });
    }
    return teamIds.map((id) => {
      const t = bgmiTeams.find((x) => x.id === id);
      return { bgmiTeamId: id, teamName: t?.name, playerIds: t?.playerIds || [] };
    });
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportId,
          matchCategory: category || 'Singles',
          stageType,
          round: round.trim() || autoRound,
          stageName: 'Championship Round',
          matchDate,
          matchTime,
          venueId,
          notes: notes.trim(),
          participants: buildParticipants(),
          refereeIds: refereeId ? [refereeId] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule match');
      onScheduled(data);
      onClose();
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- sub-renderers ---------- */

  const playerOptions = (clubId: string, currentId: string) =>
    playersOfClub(clubId).map((p) => (
      <option key={p.id} value={p.id} disabled={usedPlayerIds.has(p.id) && p.id !== currentId}>
        {p.name}
        {!clubId ? ` (${p.club?.code || ''})` : ''}
        {usedPlayerIds.has(p.id) && p.id !== currentId ? ' — already selected' : ''}
      </option>
    ));

  const clubSelect = (value: string, onChange: (v: string) => void, error?: string) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${borderFor(error)}`}>
      <option value="">Select club</option>
      {clubs.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} ({c.code})
        </option>
      ))}
    </select>
  );

  const sideCard = (idx: 0 | 1) => {
    const s = sides[idx];
    const err = errors[idx === 0 ? 'sideA' : 'sideB'];
    const label = config.sideLabels[idx];
    const club = getClub(s.clubId);

    return (
      <div className={`p-3.5 rounded-xl border space-y-2.5 bg-slate-50/70 ${err ? 'border-red-300' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase">{label}</span>
          {club && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600">
              <ClubBadge code={club.code} name={club.name} className="w-3.5 h-3.5" />
              {club.code}
            </span>
          )}
        </div>

        {config.mode === 'CRICKET_TEAMS' ? (
          <select
            value={s.teamId}
            onChange={(e) => updateSide(idx, { teamId: e.target.value })}
            className={`${inputCls} ${borderFor(err)}`}
          >
            <option value="">Select team</option>
            {cricketTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({getClub(t.clubId)?.code || 'club'})
              </option>
            ))}
          </select>
        ) : config.mode === 'CLUBS' ? (
          clubSelect(s.clubId, (v) => updateSide(idx, { clubId: v }), err)
        ) : (
          <>
            {clubSelect(
              s.clubId,
              (v) => updateSide(idx, { clubId: v, playerIds: Array(sideSize).fill('') }),
              err && !s.clubId ? err : undefined
            )}
            {Array.from({ length: sideSize }, (_, slot) => (
              <SearchableSelect
                key={slot}
                disabled={!s.clubId}
                invalid={!!(err && s.clubId)}
                value={s.playerIds[slot] || ''}
                onChange={(v) => setSidePlayer(idx, slot, v)}
                placeholder={s.clubId ? (sideSize === 2 ? `Select player ${slot + 1}` : 'Select player') : 'Select a club first'}
                searchPlaceholder="Search player name…"
                emptyText="No players match your search"
                options={playersOfClub(s.clubId).map((p) => ({
                  value: p.id,
                  label: p.name,
                  disabled: usedPlayerIds.has(p.id) && p.id !== s.playerIds[slot],
                  disabledReason: 'already selected',
                }))}
              />
            ))}
            {s.clubId && eligibleLoaded(s.clubId) && playersOfClub(s.clubId).length === 0 && (
              <p className="text-[11px] text-amber-700 font-medium">
                No players in this club are registered for {sport?.name}. Register them under Players first.
              </p>
            )}
          </>
        )}
        {err && <p className="text-[11px] font-semibold text-red-600">{err}</p>}
      </div>
    );
  };

  // Registered doubles / mixed doubles teams for this sport (database-side filter)
  const [doublesTeamsLoaded, setDoublesTeamsLoaded] = useState(false);
  useEffect(() => {
    if (!open || !sportId || config.mode !== 'PLAYER_SIDES' || !effectiveDoubles) {
      setDoublesTeamsLoaded(false);
      return;
    }
    let cancelled = false;
    setDoublesTeamsLoaded(false);
    setSides((prev) => [{ ...prev[0], teamId: '' }, { ...prev[1], teamId: '' }] as [Side, Side]);
    fetch(`/api/doubles-teams?sportId=${sportId}&category=${doublesCategory}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setDoublesTeams(Array.isArray(d) ? d : []))
      .catch(() => !cancelled && setDoublesTeams([]))
      .finally(() => !cancelled && setDoublesTeamsLoaded(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sportId, effectiveDoubles, doublesCategory]);

  const doublesSideCard = (idx: 0 | 1) => {
    const s = sides[idx];
    const other = sides[idx === 0 ? 1 : 0];
    const otherTeam = doublesTeams.find((t) => t.id === other.teamId);
    const otherPlayers = new Set<string>(otherTeam?.playerIds || []);
    const err = errors[idx === 0 ? 'sideA' : 'sideB'];
    const team = doublesTeams.find((t) => t.id === s.teamId);

    return (
      <div className={`p-3.5 rounded-xl border space-y-2.5 bg-slate-50/70 ${err ? 'border-red-300' : 'border-slate-200'}`}>
        <span className="text-[11px] font-extrabold text-slate-700 uppercase">{idx === 0 ? 'Side A' : 'Side B'}</span>
        <SearchableSelect
          value={s.teamId}
          onChange={(v) => updateSide(idx, { teamId: v })}
          invalid={!!err}
          placeholder="Select team"
          searchPlaceholder="Search team or player…"
          emptyText="No teams match your search"
          options={doublesTeams
            .filter((t) => t.status === 'ACTIVE' && (t.players || []).every((p: any) => genderOk(p.gender)))
            .map((t) => {
              const clash = t.id !== s.teamId && (t.id === other.teamId || (t.playerIds || []).some((p: string) => otherPlayers.has(p)));
              return {
                value: t.id,
                label: t.name,
                hint: (t.players || []).map((p: any) => p.name).join(' & '),
                disabled: clash,
                disabledReason: 'on the other side',
              };
            })}
        />
        {team && (
          <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-bold text-slate-600">
              {(team.clubs || []).map((c: any) => (
                <span key={c.id} className="inline-flex items-center gap-1">
                  <ClubBadge code={c.code} name={c.name} className="w-3 h-3" />
                  {c.name}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {(team.players || []).map((p: any) => (
                <span key={p.id} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                  {p.name} {p.clubCode && <span className="text-slate-400">({p.clubCode})</span>}
                </span>
              ))}
            </div>
          </div>
        )}
        {err && <p className="text-[11px] font-semibold text-red-600">{err}</p>}
      </div>
    );
  };

  const teamPicker = () => {
    const q = teamSearch.trim().toLowerCase();
    const active = bgmiTeams.filter((t) => t.status === 'ACTIVE');
    const selected = teamIds.map((id) => bgmiTeams.find((t) => t.id === id)).filter(Boolean);
    const selectedPlayers = new Map<string, string>(); // playerId -> team name
    selected.forEach((t: any) => (t.playerIds || []).forEach((pid: string) => selectedPlayers.set(pid, t.name)));

    const visible = active.filter((t) => {
      if (teamClub && !(t.clubIds?.length ? t.clubIds : [t.clubId]).includes(teamClub)) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.clubs || []).some((c: any) => c.name.toLowerCase().includes(q)) ||
        (t.players || []).some((p: any) => p.name.toLowerCase().includes(q))
      );
    });

    const toggle = (id: string) =>
      setTeamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="search"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder="Search team, club or player"
            className={`${inputCls} border-slate-200 flex-1`}
          />
          <select
            value={teamClub}
            onChange={(e) => setTeamClub(e.target.value)}
            className={`${inputCls} border-slate-200 sm:w-48`}
            aria-label="Filter teams by club"
          >
            <option value="">All clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className={`font-bold ${errors.teams ? 'text-red-600' : 'text-slate-600'}`}>
            {selected.length} team{selected.length !== 1 ? 's' : ''} selected (minimum {config.minSquads})
          </span>
          <div className="flex items-center gap-3">
            {selected.length > 0 && (
              <button type="button" onClick={() => setTeamIds([])} className="font-bold text-slate-500 hover:text-red-600">
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setTeamFormOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition"
            >
              <Plus className="w-3 h-3" /> Create team
            </button>
          </div>
        </div>
        {errors.teams && <p className="text-[11px] font-semibold text-red-600">{errors.teams}</p>}

        {active.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            No BGMI teams yet. Use <strong>Create team</strong> above to add the first one.
          </div>
        ) : visible.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            No teams match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {visible.map((t) => {
              const isSel = teamIds.includes(t.id);
              const clash = !isSel
                ? (t.playerIds || []).map((pid: string) => selectedPlayers.get(pid)).find(Boolean)
                : undefined;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!!clash}
                  onClick={() => toggle(t.id)}
                  aria-pressed={isSel}
                  className={`text-left p-3 rounded-xl border transition space-y-1.5 ${
                    isSel
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                      : clash
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs text-navy-950 truncate">
                      {t.name}{' '}
                      <span className="text-[10px] font-medium text-slate-400">
                        ({(t.players || []).length} player{(t.players || []).length !== 1 ? 's' : ''})
                      </span>
                    </span>
                    {isSel ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-bold text-slate-600">
                    {(t.clubs?.length ? t.clubs : t.club ? [t.club] : []).map((c: any) => (
                      <span key={c.id} className="inline-flex items-center gap-1">
                        <ClubBadge code={c.code} name={c.name} className="w-3 h-3" />
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(t.players || []).map((p: any) => (
                      <span key={p.id} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                        {p.name}
                      </span>
                    ))}
                  </div>
                  {clash && <p className="text-[10px] font-semibold text-amber-700">Shares a player with &quot;{clash}&quot;</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-navy-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-match-title"
        className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[95vh] sm:max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-navy-950 text-white flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 id="schedule-match-title" className="font-extrabold text-sm sm:text-base tracking-tight">
                Schedule Match
              </h3>
              <p className="text-xs text-blue-300 font-medium">
                Pick a sport, choose the clubs or players, then set when and where. Fields marked * are required.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* 1. Sport */}
            <section className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                1. Sport <span className="text-red-500">*</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {sports.map((s) => {
                  const active = s.id === sportId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => resetForSport(s.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-[11px] font-bold transition ${
                        active
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900'
                          : errors.sportId
                          ? 'border-red-300 text-slate-700 hover:bg-slate-50'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <SportIcon name={s.name} className="w-5 h-5 text-blue-600" />
                      <span className="truncate max-w-full">{s.name}</span>
                    </button>
                  );
                })}
              </div>
              {errors.sportId && <p className="text-[11px] font-semibold text-red-600">{errors.sportId}</p>}
            </section>

            {sportId && (
              <>
                {/* 2. Format & stage */}
                <section className="space-y-3">
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">2. Stage & Format</h4>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {STAGE_OPTIONS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStageType(st.id)}
                        className={`py-2 px-1.5 rounded-lg text-[10px] font-extrabold border transition truncate ${
                          stageType === st.id
                            ? 'bg-navy-950 text-white border-navy-950'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {hasFormats ? (
                    <div className="space-y-2.5">
                      <div>
                        <span className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Format</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {config.formats.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => pickFormat(f.id)}
                              className={`py-2 rounded-lg border text-[11px] font-extrabold transition ${
                                format === f.id
                                  ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {f.label}
                              <span className="block text-[9px] font-semibold text-slate-500">{f.size === 1 ? '1 v 1' : '2 v 2'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {formatOpt && formatOpt.options.length > 1 && (
                        <div>
                          <span className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Category</span>
                          <div className="flex flex-wrap gap-1.5">
                            {formatOpt.options.map((o) => (
                              <button
                                key={o.code}
                                type="button"
                                onClick={() => pickCategory(o.code)}
                                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                                  category === o.code
                                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {o.label}
                                {o.hint && <span className="ml-1 text-[9px] text-slate-500 font-semibold">{o.hint}</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {formatOpt && formatOpt.options.length === 1 && (
                        <p className="text-[11px] text-slate-500">
                          {formatOpt.options[0].label} <span className="font-semibold">{formatOpt.options[0].hint}</span> - one male and one female player per team.
                        </p>
                      )}
                    </div>
                  ) : (
                    config.categories.length > 1 && (
                      <div>
                        <span className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                          {config.categoryLabel}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {config.categories.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => pickCategory(c.code)}
                              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition ${
                                category === c.code
                                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {c.label}
                              {c.hint && <span className="ml-1 text-[9px] text-slate-500 font-semibold">{c.hint}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </section>

                {/* 3. Participants */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      3. {config.mode === 'CLUBS' ? 'Clubs' : config.mode === 'CRICKET_TEAMS' ? 'Teams' : config.mode === 'SQUADS' ? 'BGMI Teams' : 'Players'}{' '}
                      <span className="text-red-500">*</span>
                    </h4>
                  </div>

                  {config.mode === 'PLAYER_SIDES' && !effectiveDoubles && (
                    <p className="text-[11px] text-slate-500">Choose a club for each side, then pick from its players registered for this sport.</p>
                  )}

                  {config.mode === 'PLAYER_SIDES' && effectiveDoubles && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500">
                        Pick a registered {doublesCategory === 'MIXED_DOUBLES' ? 'mixed doubles' : 'doubles'} team for each side.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDoublesFormOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition shrink-0"
                      >
                        <Plus className="w-3 h-3" /> Create team
                      </button>
                    </div>
                  )}

                  {config.mode === 'PLAYER_SIDES' && effectiveDoubles && doublesTeamsLoaded && doublesTeams.filter((t) => t.status === 'ACTIVE' && (t.players || []).every((p: any) => genderOk(p.gender))).length === 0 && (
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                      No {doublesCategory === 'MIXED_DOUBLES' ? 'mixed doubles' : 'doubles'} teams for {sport?.name} yet. Use <strong>Create team</strong> to add one.
                    </div>
                  )}

                  {config.mode !== 'SQUADS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {effectiveDoubles ? doublesSideCard(0) : sideCard(0)}
                      {effectiveDoubles ? doublesSideCard(1) : sideCard(1)}
                    </div>
                  ) : (
                    teamPicker()
                  )}
                </section>

                {/* 4. Schedule */}
                <section className="space-y-3">
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">4. When & Where</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Date" required error={errors.matchDate}>
                      <input
                        type="date"
                        min={todayStr()}
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                        className={`${inputCls} ${borderFor(errors.matchDate)}`}
                      />
                    </Field>
                    <Field label="Start time" required error={errors.matchTime}>
                      <input
                        type="time"
                        value={matchTime}
                        onChange={(e) => setMatchTime(e.target.value)}
                        className={`${inputCls} ${borderFor(errors.matchTime)}`}
                      />
                    </Field>
                    <Field label="Venue" required error={errors.venueId}>
                      <select
                        value={venueId}
                        onChange={(e) => setVenueId(e.target.value)}
                        className={`${inputCls} ${borderFor(errors.venueId)}`}
                      >
                        <option value="">Select venue</option>
                        {venues.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Referee">
                      <select
                        value={refereeId}
                        onChange={(e) => setRefereeId(e.target.value)}
                        className={`${inputCls} border-slate-200`}
                      >
                        <option value="">Assign later</option>
                        {referees.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Match title" hint={`Defaults to “${autoRound}”`}>
                      <input
                        type="text"
                        value={round}
                        placeholder={autoRound}
                        onChange={(e) => setRound(e.target.value)}
                        className={`${inputCls} border-slate-200`}
                      />
                    </Field>
                    <Field label="Notes">
                      <input
                        type="text"
                        value={notes}
                        placeholder="Instructions for the referee"
                        onChange={(e) => setNotes(e.target.value)}
                        className={`${inputCls} border-slate-200`}
                      />
                    </Field>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !sportId}
              className="px-5 py-2 bg-navy-950 hover:bg-navy-900 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-sm transition text-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Scheduling…' : 'Schedule Match'}
            </button>
          </div>
        </form>
      </div>
      <DoublesTeamFormModal
        open={doublesFormOpen}
        onClose={() => setDoublesFormOpen(false)}
        clubs={clubs}
        sports={sport ? [sport] : []}
        fixedSportId={sportId}
        category={doublesCategory}
        fixedGender={categoryGender === 'MALE' || categoryGender === 'FEMALE' ? categoryGender : undefined}
        onSaved={(team) => {
          setDoublesTeams((prev) => [...prev.filter((x) => x.id !== team.id), team]);
          // put the new team on the first empty side
          setSides((prev) => {
            const next: [Side, Side] = [{ ...prev[0] }, { ...prev[1] }];
            if (!next[0].teamId) next[0].teamId = team.id;
            else if (!next[1].teamId) next[1].teamId = team.id;
            return next;
          });
        }}
      />
      <BgmiTeamFormModal
        open={teamFormOpen}
        onClose={() => setTeamFormOpen(false)}
        clubs={clubs}
        bgmiSportId={sportId}
        onSaved={(team) => {
          onTeamCreated?.(team);
          setTeamIds((prev) => (prev.includes(team.id) ? prev : [...prev, team.id]));
          setErrors((prev) => ({ ...prev, teams: '' }));
        }}
      />
    </div>,
    document.body
  );
}
