'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RefereeLayout from '@/components/layout/RefereeLayout';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  Send,
  Flag,
  X,
  Users,
  Shield,
  Sparkles,
  Check,
  Calendar,
  MapPin,
  HelpCircle,
  FileText,
  Medal,
  Award,
  Flame,
  ChevronDown,
  Info,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import {
  normalizeSportKey,
  calculateMatchPoints,
  MatchCalculationInput,
  OFFICIAL_CATEGORY_LABELS,
} from '@/lib/sports-rules';

export default function RefereeMatchSheetPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [stageType, setStageType] = useState<'NORMAL' | 'FINAL' | 'THIRD_PLACE'>('NORMAL');
  const [eventCategory, setEventCategory] = useState<string>("Men's singles / doubles");
  const [scoresSummary, setScoresSummary] = useState('');
  const [refereeNotes, setRefereeNotes] = useState('');

  // Football
  const [winnerParticipantId, setWinnerParticipantId] = useState('');
  const [loserParticipantId, setLoserParticipantId] = useState('');
  const [topScorerPlayerId, setTopScorerPlayerId] = useState('');

  // BGMI
  const [isBgmiTournamentPlacement, setIsBgmiTournamentPlacement] = useState(false);
  const [totalTeamsParticipating, setTotalTeamsParticipating] = useState<number>(7);
  const [bgmiFirstPlaceId, setBgmiFirstPlaceId] = useState('');
  const [bgmiSecondPlaceId, setBgmiSecondPlaceId] = useState('');
  const [bgmiThirdPlaceId, setBgmiThirdPlaceId] = useState('');
  const [bgmiMvpPlayerId, setBgmiMvpPlayerId] = useState('');

  // Cricket
  const [bestBatsmanMenPlayerId, setBestBatsmanMenPlayerId] = useState('');
  const [bestBatsmanWomenPlayerId, setBestBatsmanWomenPlayerId] = useState('');
  const [bestBowlerMenPlayerId, setBestBowlerMenPlayerId] = useState('');
  const [bestBowlerWomenPlayerId, setBestBowlerWomenPlayerId] = useState('');
  const [bestFielderMenPlayerId, setBestFielderMenPlayerId] = useState('');
  const [bestFielderWomenPlayerId, setBestFielderWomenPlayerId] = useState('');
  const [mostFoursPlayerId, setMostFoursPlayerId] = useState('');
  const [mostSixesPlayerId, setMostSixesPlayerId] = useState('');
  const [motmMenPlayerId, setMotmMenPlayerId] = useState('');
  const [motmWomenPlayerId, setMotmWomenPlayerId] = useState('');

  // Badminton / Carrom / Chess Placements
  const [firstPlaceParticipantId, setFirstPlaceParticipantId] = useState('');
  const [secondPlaceParticipantId, setSecondPlaceParticipantId] = useState('');
  const [thirdPlaceParticipantId, setThirdPlaceParticipantId] = useState('');

  // Modals & Messages
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('RULES_DISAGREEMENT');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live calculation preview state
  const [previewCalculation, setPreviewCalculation] = useState<any | null>(null);

  useEffect(() => {
    if (matchId) fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMatch(data);

      if (data.stageType) setStageType(data.stageType);
      if (data.matchCategory) setEventCategory(data.matchCategory);
      if (data.notes) setRefereeNotes(data.notes);

      // Check if previous submitted result exists
      const latestResult = data.results?.[0];
      if (latestResult) {
        if (latestResult.scoresSummary) setScoresSummary(latestResult.scoresSummary);
        if (latestResult.refereeNotes) setRefereeNotes(latestResult.refereeNotes);
        if (latestResult.stageType) setStageType(latestResult.stageType);
        if (latestResult.eventCategory) setEventCategory(latestResult.eventCategory);

        if (latestResult.resultPayload) {
          try {
            const p = JSON.parse(latestResult.resultPayload);
            if (p.winnerParticipantId) setWinnerParticipantId(p.winnerParticipantId);
            if (p.loserParticipantId) setLoserParticipantId(p.loserParticipantId);
            if (p.topScorerPlayerId) setTopScorerPlayerId(p.topScorerPlayerId);
            if (p.isTournamentPlacement) setIsBgmiTournamentPlacement(p.isTournamentPlacement);
            if (p.totalTeamsParticipating) setTotalTeamsParticipating(p.totalTeamsParticipating);
            if (p.firstPlaceParticipantId) {
              setFirstPlaceParticipantId(p.firstPlaceParticipantId);
              setBgmiFirstPlaceId(p.firstPlaceParticipantId);
            }
            if (p.secondPlaceParticipantId) {
              setSecondPlaceParticipantId(p.secondPlaceParticipantId);
              setBgmiSecondPlaceId(p.secondPlaceParticipantId);
            }
            if (p.thirdPlaceParticipantId) {
              setThirdPlaceParticipantId(p.thirdPlaceParticipantId);
              setBgmiThirdPlaceId(p.thirdPlaceParticipantId);
            }
            if (p.bgmiMvpPlayerId) setBgmiMvpPlayerId(p.bgmiMvpPlayerId);
            if (p.bestBatsmanMenPlayerId) setBestBatsmanMenPlayerId(p.bestBatsmanMenPlayerId);
            if (p.bestBatsmanWomenPlayerId) setBestBatsmanWomenPlayerId(p.bestBatsmanWomenPlayerId);
            if (p.bestBowlerMenPlayerId) setBestBowlerMenPlayerId(p.bestBowlerMenPlayerId);
            if (p.bestBowlerWomenPlayerId) setBestBowlerWomenPlayerId(p.bestBowlerWomenPlayerId);
            if (p.bestFielderMenPlayerId) setBestFielderMenPlayerId(p.bestFielderMenPlayerId);
            if (p.bestFielderWomenPlayerId) setBestFielderWomenPlayerId(p.bestFielderWomenPlayerId);
            if (p.mostFoursPlayerId) setMostFoursPlayerId(p.mostFoursPlayerId);
            if (p.mostSixesPlayerId) setMostSixesPlayerId(p.mostSixesPlayerId);
            if (p.manOfTheTournamentMenPlayerId) setMotmMenPlayerId(p.manOfTheTournamentMenPlayerId);
            if (p.manOfTheTournamentWomenPlayerId) setMotmWomenPlayerId(p.manOfTheTournamentWomenPlayerId);
          } catch (e) {}
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const sportKey = useMemo(() => {
    return normalizeSportKey(match?.sport?.name);
  }, [match?.sport?.name]);

  // All eligible players from participating rosters/houses
  const eligiblePlayers = useMemo(() => {
    return match?.eligibleStarPlayers || [];
  }, [match?.eligibleStarPlayers]);

  const participants = useMemo(() => {
    return match?.participants || [];
  }, [match?.participants]);

  // Recalculate automatic preview whenever inputs change
  useEffect(() => {
    if (!match || !sportKey) return;

    let isMounted = true;
    const calcInput: MatchCalculationInput = {
      sportName: match.sport?.name || sportKey,
      stageType,
      eventCategory,
      winnerParticipantId: winnerParticipantId || undefined,
      loserParticipantId: loserParticipantId || undefined,
      firstPlaceParticipantId: (sportKey === 'BGMI' ? bgmiFirstPlaceId : firstPlaceParticipantId) || undefined,
      secondPlaceParticipantId: (sportKey === 'BGMI' ? bgmiSecondPlaceId : secondPlaceParticipantId) || undefined,
      thirdPlaceParticipantId: (sportKey === 'BGMI' ? bgmiThirdPlaceId : thirdPlaceParticipantId) || undefined,
      isTournamentPlacement: isBgmiTournamentPlacement,
      totalTeamsParticipating: Number(totalTeamsParticipating) || participants.length,
      bgmiMvpPlayerId: bgmiMvpPlayerId || undefined,
      topScorerPlayerId: topScorerPlayerId || undefined,
      bestBatsmanMenPlayerId: bestBatsmanMenPlayerId || undefined,
      bestBatsmanWomenPlayerId: bestBatsmanWomenPlayerId || undefined,
      bestBowlerMenPlayerId: bestBowlerMenPlayerId || undefined,
      bestBowlerWomenPlayerId: bestBowlerWomenPlayerId || undefined,
      bestFielderMenPlayerId: bestFielderMenPlayerId || undefined,
      bestFielderWomenPlayerId: bestFielderWomenPlayerId || undefined,
      mostFoursPlayerId: mostFoursPlayerId || undefined,
      mostSixesPlayerId: mostSixesPlayerId || undefined,
      manOfTheTournamentMenPlayerId: motmMenPlayerId || undefined,
      manOfTheTournamentWomenPlayerId: motmWomenPlayerId || undefined,
      scoresSummary,
      refereeNotes,
    };

    calculateMatchPoints(calcInput, participants, eligiblePlayers, 0)
      .then((res) => {
        if (isMounted) setPreviewCalculation(res);
      })
      .catch((e) => console.error('Preview error:', e));

    return () => {
      isMounted = false;
    };
  }, [
    match,
    sportKey,
    stageType,
    eventCategory,
    winnerParticipantId,
    loserParticipantId,
    topScorerPlayerId,
    isBgmiTournamentPlacement,
    totalTeamsParticipating,
    bgmiFirstPlaceId,
    bgmiSecondPlaceId,
    bgmiThirdPlaceId,
    bgmiMvpPlayerId,
    bestBatsmanMenPlayerId,
    bestBatsmanWomenPlayerId,
    bestBowlerMenPlayerId,
    bestBowlerWomenPlayerId,
    bestFielderMenPlayerId,
    bestFielderWomenPlayerId,
    mostFoursPlayerId,
    mostSixesPlayerId,
    motmMenPlayerId,
    motmWomenPlayerId,
    firstPlaceParticipantId,
    secondPlaceParticipantId,
    thirdPlaceParticipantId,
    scoresSummary,
    refereeNotes,
    participants,
    eligiblePlayers,
  ]);

  const handleSubmitResult = async () => {
    if (!scoresSummary.trim()) {
      alert('Please enter a brief final match result summary (e.g. 2 - 1, or 21-18, 21-16).');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        sportName: match.sport?.name,
        stageType,
        eventCategory,
        scoresSummary: scoresSummary.trim(),
        refereeNotes: refereeNotes.trim(),
      };

      if (sportKey === 'FOOTBALL') {
        payload.winnerParticipantId = winnerParticipantId || null;
        payload.loserParticipantId = loserParticipantId || null;
        payload.topScorerPlayerId = topScorerPlayerId || null;
      } else if (sportKey === 'BGMI') {
        payload.winnerParticipantId = winnerParticipantId || null;
        payload.isTournamentPlacement = isBgmiTournamentPlacement;
        payload.totalTeamsParticipating = Number(totalTeamsParticipating) || participants.length;
        payload.firstPlaceParticipantId = bgmiFirstPlaceId || null;
        payload.secondPlaceParticipantId = bgmiSecondPlaceId || null;
        payload.thirdPlaceParticipantId = bgmiThirdPlaceId || null;
        payload.bgmiMvpPlayerId = bgmiMvpPlayerId || null;
      } else if (sportKey === 'CRICKET') {
        payload.winnerParticipantId = winnerParticipantId || null;
        payload.loserParticipantId = loserParticipantId || null;
        payload.bestBatsmanMenPlayerId = bestBatsmanMenPlayerId || null;
        payload.bestBatsmanWomenPlayerId = bestBatsmanWomenPlayerId || null;
        payload.bestBowlerMenPlayerId = bestBowlerMenPlayerId || null;
        payload.bestBowlerWomenPlayerId = bestBowlerWomenPlayerId || null;
        payload.bestFielderMenPlayerId = bestFielderMenPlayerId || null;
        payload.bestFielderWomenPlayerId = bestFielderWomenPlayerId || null;
        payload.mostFoursPlayerId = mostFoursPlayerId || null;
        payload.mostSixesPlayerId = mostSixesPlayerId || null;
        payload.manOfTheTournamentMenPlayerId = motmMenPlayerId || null;
        payload.manOfTheTournamentWomenPlayerId = motmWomenPlayerId || null;
      } else if (sportKey === 'BADMINTON' || sportKey === 'CARROM') {
        payload.eventCategory = eventCategory;
        payload.firstPlaceParticipantId = firstPlaceParticipantId || null;
        payload.secondPlaceParticipantId = secondPlaceParticipantId || null;
        payload.thirdPlaceParticipantId = thirdPlaceParticipantId || null;
      } else if (sportKey === 'CHESS') {
        payload.firstPlaceParticipantId = firstPlaceParticipantId || null;
        payload.secondPlaceParticipantId = secondPlaceParticipantId || null;
      }

      const res = await fetch(`/api/matches/${match.id}/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsConfirmModalOpen(false);
      setMessage({ type: 'success', text: data.message });
      fetchMatchDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportDispute = async () => {
    if (!disputeReason) {
      alert('Please state the nature of dispute or issue');
      return;
    }

    try {
      const res = await fetch(`/api/matches/${match.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeReason: `[${disputeCategory}] ${disputeReason}`,
        }),
      });

      if (res.ok) {
        setIsDisputeModalOpen(false);
        setDisputeReason('');
        setMessage({ type: 'success', text: 'Dispute recorded. Tournament committee alerted.' });
        fetchMatchDetails();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !match) {
    return (
      <RefereeLayout>
        <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
          <Clock className="w-8 h-8 animate-spin text-slate-300" />
          <span>Loading official match details...</span>
        </div>
      </RefereeLayout>
    );
  }

  const isSubmitted = match.status === 'SUBMITTED';
  const isCompleted = match.status === 'COMPLETED';
  const isReadOnly = isSubmitted || isCompleted;
  const latestResult = match.results?.[0];
  const isRejected = latestResult?.status === 'REJECTED' || match.notes?.includes('[Rejected by Admin]');

  return (
    <RefereeLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/referee/matches"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assigned Matches
          </Link>

          {!isCompleted && (
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100 text-xs font-bold rounded-lg transition"
            >
              <Flag className="w-3.5 h-3.5 text-red-600" />
              Report Issue / Dispute
            </button>
          )}
        </div>

        {/* Status Alerts */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 rounded text-slate-500 hover:text-slate-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* If Rejected Alert */}
        {isRejected && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-extrabold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Submission Returned / Rejected by Admin</span>
            </div>
            <p className="text-amber-800/90 font-medium">
              {latestResult?.rejectionReason || 'Please review the result entry, verify award recipients, and resubmit.'}
            </p>
          </div>
        )}

        {/* Match Header Overview */}
        <div className="bg-navy-950 text-white rounded-2xl p-6 border border-navy-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-blue-600 text-white">
                  {match.matchCode}
                </span>
                <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <SportIcon name={match.sport?.name} className="w-4 h-4 text-amber-400" />
                  <span>{match.sport?.name}</span>
                </span>
                <span className="text-xs text-navy-400">• {match.round}</span>
                {stageType === 'FINAL' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-navy-950">
                    Championship Final
                  </span>
                )}
                {stageType === 'THIRD_PLACE' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-amber-300">
                    3rd Place Playoff
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-navy-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-navy-400" />
                  {match.matchDate} at {match.matchTime}
                </span>
                <span className="text-navy-600">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-navy-400" />
                  {match.venue?.name || 'Olympic Arena'}
                </span>
              </div>
            </div>

            <div>
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border ${
                  match.status === 'SUBMITTED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : match.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}
              >
                {match.status}
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs text-navy-300 flex items-center justify-between flex-wrap gap-2">
            <span>
              <strong>Official Scoring:</strong> Matches are officiated on ground. Select the final match result below — points are calculated and distributed across unique clubs automatically.
            </span>
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Source of Truth: sports_points_distribution.pdf
            </span>
          </div>
        </div>

        {/* SPORT-SPECIFIC RESULT ENTRY FORM */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{match.sport?.name} Official Result Entry</span>
              </h2>
              <p className="text-xs text-slate-500">
                Enter match outcome and award winners. Points will be automatically allocated by the backend.
              </p>
            </div>

            {/* Stage Selector (League / Final / 3rd Place) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Stage:</span>
              <select
                disabled={isReadOnly}
                value={stageType}
                onChange={(e) => setStageType(e.target.value as any)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-navy-950 focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
              >
                <option value="NORMAL">Normal Match / League</option>
                <option value="FINAL">Championship Final (Placement Pts)</option>
                <option value="THIRD_PLACE">3rd Place Playoff</option>
              </select>
            </div>
          </div>

          {/* 1. FOOTBALL FORM */}
          {sportKey === 'FOOTBALL' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Winning Team *
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={winnerParticipantId}
                    onChange={(e) => {
                      const wId = e.target.value;
                      setWinnerParticipantId(wId);
                      // Auto-select other as loser if 2 teams
                      if (participants.length === 2) {
                        const other = participants.find((p: any) => p.id !== wId);
                        if (other) setLoserParticipantId(other.id);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
                  >
                    <option value="">-- Select Winner --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.club?.name} ({p.club?.code || 'Club'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Losing Team
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={loserParticipantId}
                    onChange={(e) => setLoserParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
                  >
                    <option value="">-- Select Loser (if decisive) --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.club?.name} ({p.club?.code || 'Club'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Top Scorer Award */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-extrabold text-amber-950 uppercase">
                      Top Scorer Award (15 Points)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Official PDF Award
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80">
                  Select the participating athlete who earned the tournament Top Scorer award. Points credit directly to their club.
                </p>
                <select
                  disabled={isReadOnly}
                  value={topScorerPlayerId}
                  onChange={(e) => setTopScorerPlayerId(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-xs font-bold text-navy-950 focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-60"
                >
                  <option value="">-- Optional: No Top Scorer Award for this Match --</option>
                  {eligiblePlayers.map((pl: any) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} — House {pl.clubName} ({pl.teamName || pl.clubCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 2. BGMI FORM */}
          {sportKey === 'BGMI' && (
            <div className="space-y-5">
              {/* Placement Toggle */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs font-extrabold text-blue-950 uppercase block">
                    Tournament Placement Mode
                  </span>
                  <span className="text-[11px] text-blue-800/80">
                    Toggle ON if this match decides the overall championship podium (1st 20 pts, 2nd 12 pts, 3rd 8 pts if 7 teams).
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={isBgmiTournamentPlacement}
                    onChange={(e) => setIsBgmiTournamentPlacement(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-900">Award Overall Placements</span>
                </label>
              </div>

              {/* Normal match winner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Match Winner (WWCD — 8 Points) *
                </label>
                <select
                  disabled={isReadOnly}
                  value={winnerParticipantId}
                  onChange={(e) => setWinnerParticipantId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
                >
                  <option value="">-- Select Match Winner (WWCD) --</option>
                  {participants.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.teamName || p.club?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Tournament Placements */}
              {isBgmiTournamentPlacement && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-navy-950 uppercase">
                      Overall Tournament Placements (Podium)
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">Total Teams:</span>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={totalTeamsParticipating}
                        onChange={(e) => setTotalTeamsParticipating(parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded bg-white"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">
                        Overall Winner (20 pts)
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={bgmiFirstPlaceId}
                        onChange={(e) => setBgmiFirstPlaceId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-navy-950"
                      >
                        <option value="">-- 1st Place --</option>
                        {participants.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.teamName || p.club?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Runner-Up (12 pts)
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={bgmiSecondPlaceId}
                        onChange={(e) => setBgmiSecondPlaceId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-navy-950"
                      >
                        <option value="">-- 2nd Place --</option>
                        {participants.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.teamName || p.club?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                        3rd Place (8 pts if 7 teams)
                      </label>
                      <select
                        disabled={isReadOnly || totalTeamsParticipating !== 7}
                        value={bgmiThirdPlaceId}
                        onChange={(e) => setBgmiThirdPlaceId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-navy-950 disabled:opacity-40"
                      >
                        <option value="">-- 3rd Place --</option>
                        {participants.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.teamName || p.club?.name}
                          </option>
                        ))}
                      </select>
                      {totalTeamsParticipating !== 7 && (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Only awarded if exactly 7 teams participate (current: {totalTeamsParticipating}).
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BGMI MVP */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-extrabold text-amber-950 uppercase">
                      Tournament MVP Award (5 Points)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Official PDF Award
                  </span>
                </div>
                <select
                  disabled={isReadOnly}
                  value={bgmiMvpPlayerId}
                  onChange={(e) => setBgmiMvpPlayerId(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-xs font-bold text-navy-950 focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-60"
                >
                  <option value="">-- Optional: No MVP Award for this Match --</option>
                  {eligiblePlayers.map((pl: any) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} — House {pl.clubName} ({pl.teamName || pl.clubCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 3. CRICKET FORM */}
          {sportKey === 'CRICKET' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Winning Team *
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={winnerParticipantId}
                    onChange={(e) => {
                      const wId = e.target.value;
                      setWinnerParticipantId(wId);
                      if (participants.length === 2) {
                        const other = participants.find((p: any) => p.id !== wId);
                        if (other) setLoserParticipantId(other.id);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
                  >
                    <option value="">-- Select Winner --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.cricketTeam?.name || p.club?.name} ({p.club?.name || 'House'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Losing Team
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={loserParticipantId}
                    onChange={(e) => setLoserParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
                  >
                    <option value="">-- Select Loser --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.cricketTeam?.name || p.club?.name} ({p.club?.name || 'House'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cricket Individual Awards */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-extrabold text-navy-950 uppercase flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Cricket Individual Awards (PDF Rules)</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Points credit directly to recipient&apos;s house
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Best Batsman — Men (10 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={bestBatsmanMenPlayerId}
                      onChange={(e) => setBestBatsmanMenPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Best Batsman — Women (5 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={bestBatsmanWomenPlayerId}
                      onChange={(e) => setBestBatsmanWomenPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Best Bowler — Men (10 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={bestBowlerMenPlayerId}
                      onChange={(e) => setBestBowlerMenPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Best Bowler — Women (5 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={bestBowlerWomenPlayerId}
                      onChange={(e) => setBestBowlerWomenPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Best Fielder — Men (10 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={bestFielderMenPlayerId}
                      onChange={(e) => setBestFielderMenPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Best Fielder — Women (5 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={bestFielderWomenPlayerId}
                      onChange={(e) => setBestFielderWomenPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Most Fours (5 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={mostFoursPlayerId}
                      onChange={(e) => setMostFoursPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Most Sixes (5 pts)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={mostSixesPlayerId}
                      onChange={(e) => setMostSixesPlayerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- None / Not Applicable --</option>
                      {eligiblePlayers.map((pl: any) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} ({pl.clubName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tournament Level Man of Tournament (Finals) */}
                {stageType === 'FINAL' && (
                  <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-amber-700 mb-1">
                        Man of the Tournament — Men (15 pts)
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={motmMenPlayerId}
                        onChange={(e) => setMotmMenPlayerId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg bg-white text-xs font-bold"
                      >
                        <option value="">-- Select Player --</option>
                        {eligiblePlayers.map((pl: any) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name} ({pl.clubName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-amber-700 mb-1">
                        Man of the Tournament — Women (10 pts)
                      </label>
                      <select
                        disabled={isReadOnly}
                        value={motmWomenPlayerId}
                        onChange={(e) => setMotmWomenPlayerId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg bg-white text-xs font-bold"
                      >
                        <option value="">-- Select Player --</option>
                        {eligiblePlayers.map((pl: any) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name} ({pl.clubName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. BADMINTON & CARROM FORM */}
          {(sportKey === 'BADMINTON' || sportKey === 'CARROM') && (
            <div className="space-y-5">
              {/* Event Category Selector */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-extrabold text-navy-950 uppercase">
                  Event Category (Official PDF Matrix) *
                </label>
                <select
                  disabled={isReadOnly}
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-navy-950 outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                >
                  <option value="Men's singles / doubles">Men&apos;s singles / doubles (1st: 10, 2nd: 7, 3rd: 5)</option>
                  <option value="Women's singles / doubles">Women&apos;s singles / doubles (1st: 10, 2nd: 7, 3rd: 5)</option>
                  <option value="Mixed">Mixed (1st: 20, 2nd: 14, 3rd: 10)</option>
                  <option value="MD">MD — Official Category Label (1st: 20, 2nd: 14, 3rd: 10)</option>
                  <option value="WD">WD — Official Category Label (1st: 20, 2nd: 14, 3rd: 10)</option>
                </select>
                <span className="text-[11px] text-slate-500 block">
                  {OFFICIAL_CATEGORY_LABELS[eventCategory] || 'Official championship category from sports_points_distribution.pdf'}
                </span>
              </div>

              {/* Placement selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">
                    1st Place (Champion) *
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={firstPlaceParticipantId}
                    onChange={(e) => setFirstPlaceParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950"
                  >
                    <option value="">-- Select 1st Place --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.club?.name || `Entry ${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    2nd Place (Runner-up) *
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={secondPlaceParticipantId}
                    onChange={(e) => setSecondPlaceParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950"
                  >
                    <option value="">-- Select 2nd Place --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.club?.name || `Entry ${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                    3rd Place (Bronze / Playoff)
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={thirdPlaceParticipantId}
                    onChange={(e) => setThirdPlaceParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950"
                  >
                    <option value="">-- Optional: 3rd Place --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.club?.name || `Entry ${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. CHESS FORM */}
          {sportKey === 'CHESS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">
                    1st Place Winner (10 Points) *
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={firstPlaceParticipantId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setFirstPlaceParticipantId(id);
                      if (participants.length === 2) {
                        const other = participants.find((p: any) => p.id !== id);
                        if (other) setSecondPlaceParticipantId(other.id);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950"
                  >
                    <option value="">-- Select 1st Place (10 pts) --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.player?.name || p.club?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    2nd Place Winner (5 Points) *
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={secondPlaceParticipantId}
                    onChange={(e) => setSecondPlaceParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950"
                  >
                    <option value="">-- Select 2nd Place (5 pts) --</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.teamName || p.player?.name || p.club?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Common Result Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Match Result / Score Summary *
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={scoresSummary}
                onChange={(e) => setScoresSummary(e.target.value)}
                placeholder="e.g. 2 - 1 (FT), or 21-18, 21-16, or Nex Blitz won by 14 runs"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Referee Officiating Notes (Optional)
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={refereeNotes}
                onChange={(e) => setRefereeNotes(e.target.value)}
                placeholder="Official notes, incident logs, or ground conditions"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* AUTOMATIC POINT CALCULATION PREVIEW */}
        {previewCalculation && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wider">
                  Automatic Point Calculation & Club Distribution Preview
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Official PDF Logic Applied
              </span>
            </div>

            {/* Team/Squad Distributions */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                1. Team Points & Unique-Club Distribution:
              </span>
              {previewCalculation.calculatedDistributions.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center font-medium">
                  Select a winning participant or placement above to preview automatic point calculation.
                </div>
              ) : (
                <div className="space-y-2">
                  {previewCalculation.calculatedDistributions.map((dist: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-navy-950 flex items-center gap-2">
                          <span>{dist.teamName}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[11px]">
                            {dist.originalPoints} pts earned
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{dist.explanation}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {dist.allocations.map((alloc: any, aIdx: number) => (
                          <div
                            key={aIdx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-[11px] font-bold flex items-center gap-1.5"
                          >
                            <span className="text-slate-700">{alloc.clubName}:</span>
                            <span className="font-mono text-navy-950 font-black">{alloc.pointsFormatted} pts</span>
                            {alloc.isRemainderWinner && (
                              <span className="text-[9px] text-amber-600 font-extrabold" title="Fair Remainder Cent">
                                (+0.01¢)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Individual Awards Allocation */}
            {previewCalculation.individualAwards.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  2. Individual Award Allocations:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {previewCalculation.individualAwards.map((aw: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/40 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-amber-950 block">{aw.awardTitle}</span>
                        <span className="text-[11px] text-slate-600">
                          {aw.playerName} (House {aw.clubName})
                        </span>
                      </div>
                      <span className="font-mono text-sm font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                        +{aw.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Club Points Breakdown */}
            {Object.keys(previewCalculation.clubPointsBreakdown).length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  3. Total Points Credited to Houses:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {Object.entries(previewCalculation.clubPointsBreakdown).map(([cId, cInfo]: [string, any]) => (
                    <div key={cId} className="p-3 rounded-xl bg-navy-950 text-white flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-300 truncate">{cInfo.clubName}</span>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-mono text-base font-black text-amber-400">
                          {cInfo.totalPoints.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="text-xs font-bold text-navy-950">
              {isSubmitted ? 'Result Submitted for Verification' : isCompleted ? 'Result Approved & Finalized' : 'Ready to Submit Match Result?'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {isSubmitted
                ? 'This match result is currently awaiting Admin approval.'
                : isCompleted
                ? 'Points have been approved and posted to the official club leaderboard.'
                : 'Backend will verify points against official rules and notify tournament admins for verification.'}
            </p>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Result...' : 'Submit Result for Admin Approval'}</span>
            </button>
          )}
        </div>

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-navy-950 font-extrabold text-sm border-b border-slate-100 pb-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Confirm Official Match Result Submission</span>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  You are submitting the official match result for <strong>{match.matchCode}</strong> ({match.sport?.name}).
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div>
                    <strong>Summary:</strong> {scoresSummary || 'N/A'}
                  </div>
                  <div>
                    <strong>Stage:</strong> {stageType}
                  </div>
                  {eventCategory && (
                    <div>
                      <strong>Category:</strong> {eventCategory}
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-[11px]">
                  Points will be calculated automatically according to official PDF rules and submitted to Administrators for approval.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResult}
                  disabled={submitting}
                  className="px-5 py-2 bg-navy-950 hover:bg-navy-900 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Submit to Admin'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {isDisputeModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm border-b border-slate-100 pb-3">
                <Flag className="w-4 h-4 text-red-600" />
                <span>Report Match Issue or Technical Dispute</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Dispute Category
                  </label>
                  <select
                    value={disputeCategory}
                    onChange={(e) => setDisputeCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold"
                  >
                    <option value="RULES_DISAGREEMENT">Rules Disagreement / Interpretation</option>
                    <option value="PLAYER_INELIGIBILITY">Player Ineligibility / Roster Issue</option>
                    <option value="EQUIPMENT_GROUND_FAILURE">Weather / Equipment / Ground Failure</option>
                    <option value="MISCONDUCT">Unsportsmanlike Conduct / Foul Play</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Detailed Notes *
                  </label>
                  <textarea
                    rows={3}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Provide detailed incident summary for tournament director..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportDispute}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RefereeLayout>
  );
}
