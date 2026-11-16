'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';
import { calculateClubPointsDistribution } from '@/lib/points-distribution';

export default function RefereeMatchSheetPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states per participant: { [participantId]: { pointsEarned: number, rank?: number, isWinner: boolean } }
  const [entryResults, setEntryResults] = useState<
    Record<string, { pointsEarned: number; rank?: number; isWinner: boolean }>
  >({});
  const [refereeNotes, setRefereeNotes] = useState('');

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('RULES_DISAGREEMENT');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      // Initialize results mapping from participants
      const initialMap: Record<string, { pointsEarned: number; rank?: number; isWinner: boolean }> = {};
      if (data.participants && Array.isArray(data.participants)) {
        data.participants.forEach((p: any) => {
          initialMap[p.id] = {
            pointsEarned: p.score || 0,
            rank: p.rank || undefined,
            isWinner: p.isWinner || false,
          };
        });
      }
      setEntryResults(initialMap);

      if (data.notes) setRefereeNotes(data.notes);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateParticipantPoints = (participantId: string, points: number) => {
    setEntryResults((prev) => ({
      ...prev,
      [participantId]: {
        ...(prev[participantId] || { isWinner: false }),
        pointsEarned: Math.max(0, points),
      },
    }));
  };

  const updateParticipantRank = (participantId: string, rankNum: number, positionPointsMap?: Record<string, number>) => {
    let autoPoints = entryResults[participantId]?.pointsEarned ?? 0;
    if (positionPointsMap && positionPointsMap[rankNum.toString()] !== undefined) {
      autoPoints = positionPointsMap[rankNum.toString()];
    }

    setEntryResults((prev) => ({
      ...prev,
      [participantId]: {
        ...(prev[participantId] || { isWinner: false }),
        rank: rankNum,
        pointsEarned: autoPoints,
        isWinner: rankNum === 1,
      },
    }));
  };

  const handleSubmitResult = async () => {
    setSubmitting(true);
    try {
      const formattedResults = Object.entries(entryResults).map(([pId, val]) => ({
        participantId: pId,
        pointsEarned: val.pointsEarned,
        rank: val.rank,
        isWinner: val.isWinner,
      }));

      const res = await fetch(`/api/matches/${match.id}/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryResults: formattedResults,
          refereeNotes,
        }),
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

  // Parse sport configuration
  let positionPointsMap: Record<string, number> | undefined;
  try {
    if (match.sport?.positionPoints) {
      positionPointsMap = JSON.parse(match.sport.positionPoints);
    }
  } catch (e) {}

  const isSubmitted = match.status === 'SUBMITTED';
  const isCompleted = match.status === 'COMPLETED';
  const isReadOnly = isSubmitted || isCompleted;

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
              <strong>Note:</strong> Live scoring is completed on the scoring platform. Record final points or positions earned below.
            </span>
            <span className="text-[11px] text-amber-400 font-medium">
              Points will be automatically distributed equally among unique participating clubs.
            </span>
          </div>
        </div>

        {/* Participating Entries & Unique-Club Points Distribution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Participating Squads & Final Points Earned</span>
            </h2>
            <span className="text-xs text-slate-500">
              {match.participants?.length || 0} Participating Entry/Entries
            </span>
          </div>

          {match.participants?.map((participant: any, index: number) => {
            const resultState = entryResults[participant.id] || { pointsEarned: 0, rank: undefined, isWinner: false };
            const pointsEarned = resultState.pointsEarned || 0;

            // Extract players and their club affiliations
            const players = (participant.players || []).map((mpp: any) => ({
              playerId: mpp.playerId,
              playerName: mpp.player?.name,
              clubId: mpp.clubId,
              clubName: mpp.club?.name || 'Club',
              clubCode: mpp.club?.code,
            }));

            // Fallback for single club team or cricket team
            if (players.length === 0 && participant.club) {
              players.push({
                playerId: participant.playerId || 'team',
                playerName: participant.teamName || participant.club.name,
                clubId: participant.clubId,
                clubName: participant.club.name,
                clubCode: participant.club.code,
              });
            }

            // Real-time calculation using the reusable distribution engine
            const dist = calculateClubPointsDistribution(pointsEarned, players, index);

            return (
              <div
                key={participant.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5"
              >
                {/* Entry Title & Roster Breakdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-700">
                      {participant.rank ? `#${participant.rank}` : `E${index + 1}`}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-navy-950 flex items-center gap-2">
                        <span>{participant.teamName || participant.club?.name || `Entry ${index + 1}`}</span>
                        {participant.cricketTeam && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            Parent Club: {participant.club?.name}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {players.length} participating athlete{players.length === 1 ? '' : 's'} •{' '}
                        <strong className="text-slate-700">{dist.uniqueClubCount} unique club{dist.uniqueClubCount === 1 ? '' : 's'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Points Input Control */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {positionPointsMap && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-bold text-slate-500">Position:</span>
                        <select
                          disabled={isReadOnly}
                          value={resultState.rank || ''}
                          onChange={(e) =>
                            updateParticipantRank(
                              participant.id,
                              parseInt(e.target.value, 10),
                              positionPointsMap
                            )
                          }
                          className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                        >
                          <option value="">Select Rank</option>
                          {Object.keys(positionPointsMap).map((pos) => (
                            <option key={pos} value={pos}>
                              #{pos} ({positionPointsMap[pos]} pts)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Points Earned:
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isReadOnly}
                        value={pointsEarned}
                        onChange={(e) =>
                          updateParticipantPoints(participant.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-navy-950 font-mono font-black text-right text-base outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Participating Players with Club Affiliations */}
                {participant.players && participant.players.length > 0 && (
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                      Participating Players & Respective Club Affiliations:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {participant.players.map((mpp: any) => (
                        <div
                          key={mpp.id}
                          className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-800 truncate mr-2">
                            {mpp.player?.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white border border-slate-200 text-slate-700 shrink-0">
                            {mpp.club?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AUTOMATIC CLUB-WISE POINTS DISTRIBUTION PREVIEW TABLE */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Automatic Unique-Club Points Distribution Calculation:</span>
                    </span>
                    <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Formula: {pointsEarned.toFixed(2)} pts ÷ {dist.uniqueClubCount} unique club{dist.uniqueClubCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-1.5 px-3">Unique Club</th>
                          <th className="py-1.5 px-3 text-center">Players Contributed</th>
                          <th className="py-1.5 px-3 text-right">Distributed Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dist.allocations.map((alloc) => (
                          <tr key={alloc.clubId} className="hover:bg-white/60">
                            <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              <span>{alloc.clubName}</span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-600">
                              {alloc.playersContributed} athlete{alloc.playersContributed === 1 ? '' : 's'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-black text-navy-950">
                              {alloc.pointsFormatted} pts
                              {alloc.isRemainderWinner && (
                                <span className="ml-1 text-[10px] text-amber-600 font-bold" title="Fair remainder cent (+0.01)">
                                  (+0.01 rot)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-200 font-extrabold text-navy-950">
                          <td className="py-2 px-3">Sum Total Distributed:</td>
                          <td className="py-2 px-3 text-center font-mono">{dist.totalPlayers} total</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-600">
                            {dist.totalDistributed.toFixed(2)} pts
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">{dist.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Referee Official Observations & Submit Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Referee Official Notes & Match Summary
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              value={refereeNotes}
              onChange={(e) => setRefereeNotes(e.target.value)}
              placeholder="e.g. Competition conducted under official house championship rules. No technical infractions."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50"
            />
          </div>

          {!isReadOnly && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500">
                Final points entered by the referee are automatically calculated and distributed to clubs immediately upon submission.
              </span>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Submit Final Result & Distribute Points</span>
              </button>
            </div>
          )}

          {isSubmitted && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Result submitted and recorded. Points distributed to clubs.</span>
            </div>
          )}

          {isCompleted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Match completed! Official points have been automatically calculated, distributed to participating clubs, and credited on the leaderboard.</span>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-navy-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">Confirm Result Submission</h3>
                </div>
                <button onClick={() => setIsConfirmModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Are you ready to submit the final points for <strong>{match.matchCode} ({match.sport?.name})</strong>?
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  {Object.entries(entryResults).map(([pId, val]) => {
                    const part = match.participants?.find((p: any) => p.id === pId);
                    return (
                      <div key={pId} className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">{part?.teamName || part?.club?.name}</span>
                        <span className="font-mono font-bold text-navy-950">{val.pointsEarned.toFixed(2)} pts</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Points will be automatically distributed across unique clubs and credited directly to the official leaderboard upon submission.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 text-xs"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitResult}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Reporting Modal */}
        {isDisputeModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-red-950 text-white flex items-center justify-between border-b border-red-900">
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-sm">Report Match Issue / Dispute</h3>
                </div>
                <button onClick={() => setIsDisputeModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Classification:</label>
                  <select
                    value={disputeCategory}
                    onChange={(e) => setDisputeCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="RULES_DISAGREEMENT">Rules Disagreement / Rule Challenge</option>
                    <option value="UNSPORTSMANLIKE_CONDUCT">Unsportsmanlike Conduct</option>
                    <option value="TECHNICAL_INCIDENT">Technical / Network Glitch (Esports)</option>
                    <option value="EQUIPMENT_FAILURE">Equipment or Venue Issue</option>
                    <option value="ELIGIBILITY_PROTEST">Player Eligibility Protest</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Incident Details:</label>
                  <textarea
                    rows={4}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Provide details about the incident, teams involved, and actions taken..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportDispute}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Flag className="w-4 h-4" />
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RefereeLayout>
  );
}
