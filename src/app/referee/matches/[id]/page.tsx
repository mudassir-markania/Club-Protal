'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Trophy,
  Save,
  Send,
  Flag,
  X,
  Plus,
  Minus,
  Sparkles,
  Check,
  Calendar,
  MapPin,
} from 'lucide-react';
import { ClubBadge, SportIcon } from '@/components/ui/icons';

export default function RefereeMatchSheetPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingScore, setSavingScore] = useState(false);

  // Live Score Sheet State
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winnerParticipantId, setWinnerParticipantId] = useState<string>('');
  const [refereeNotes, setRefereeNotes] = useState('');

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
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

      const p1 = data.participants?.[0];
      const p2 = data.participants?.[1];

      setScore1(p1?.score ?? 0);
      setScore2(p2?.score ?? 0);

      const winningP = data.participants?.find((p: any) => p.isWinner);
      if (winningP) {
        setWinnerParticipantId(winningP.id);
      } else if (p1 && p2) {
        if (p1.score > p2.score) setWinnerParticipantId(p1.id);
        else if (p2.score > p1.score) setWinnerParticipantId(p2.id);
      }

      if (data.notes) setRefereeNotes(data.notes);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${match.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Match marked as IN PROGRESS. Live score tracking active.' });
        fetchMatchDetails();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveLiveScore = async () => {
    setSavingScore(true);
    try {
      const p1 = match.participants?.[0];
      const p2 = match.participants?.[1];

      const res = await fetch(`/api/matches/${match.id}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: [
            { participantId: p1.id, score: score1 },
            { participantId: p2.id, score: score2 },
          ],
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Live scores saved!' });
        fetchMatchDetails();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingScore(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!winnerParticipantId && score1 !== score2) {
      alert('Please select the winning participant / club');
      return;
    }

    const p1 = match.participants?.[0];
    const p2 = match.participants?.[1];

    const winnerP = match.participants?.find((p: any) => p.id === winnerParticipantId);
    const summary = `${p1?.club?.name || 'T1'} (${score1}) - (${score2}) ${p2?.club?.name || 'T2'}`;

    try {
      const res = await fetch(`/api/matches/${match.id}/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: [
            { participantId: p1.id, score: score1, isWinner: p1.id === winnerParticipantId },
            { participantId: p2.id, score: score2, isWinner: p2.id === winnerParticipantId },
          ],
          winnerParticipantId: winnerParticipantId || null,
          winnerClubId: winnerP?.clubId || null,
          scoresSummary: summary,
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
    }
  };

  const handleReportDispute = async () => {
    if (!disputeReason) {
      alert('Please state the nature of dispute or technical issue');
      return;
    }

    try {
      const res = await fetch(`/api/matches/${match.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeReason }),
      });

      if (res.ok) {
        setIsDisputeModalOpen(false);
        setMessage({ type: 'success', text: 'Dispute report logged. Tournament director notified.' });
        fetchMatchDetails();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !match) {
    return (
      <AppLayout>
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading match control sheet...
        </div>
      </AppLayout>
    );
  }

  const p1 = match.participants?.[0];
  const p2 = match.participants?.[1];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/referee/matches"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assigned Matches
          </Link>

          <button
            onClick={() => setIsDisputeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg transition"
          >
            <Flag className="w-3.5 h-3.5" />
            Report Issue / Dispute
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/50">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Match Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-white">
                  {match.matchCode}
                </span>
                <span className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                  <SportIcon name={match.sport?.name} className="w-4 h-4 text-navy-800" />
                  <span>{match.sport?.name}</span>
                </span>
                <span className="text-xs text-slate-400">• {match.round}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {match.matchDate} at {match.matchTime}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {match.venue?.name || 'Grand Arena'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  match.status === 'IN_PROGRESS'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : match.status === 'SUBMITTED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : match.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {match.status}
              </span>

              {match.status === 'SCHEDULED' && (
                <button
                  onClick={handleStartMatch}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Match
                </button>
              )}
            </div>
          </div>

          {/* Big Interactive Live Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
            {/* Competitor 1 */}
            <div
              className={`p-6 rounded-2xl border transition text-center ${
                winnerParticipantId === p1?.id
                  ? 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <ClubBadge code={p1?.club?.code} name={p1?.club?.name} className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-navy-950 truncate">
                {p1?.club?.name || p1?.player?.name || 'Competitor 1'}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400 block mb-4">
                {p1?.club?.code || 'P1'}
              </span>

              {/* Big Score Counter */}
              <div className="flex items-center justify-center gap-4 my-4">
                <button
                  type="button"
                  disabled={match.status === 'COMPLETED'}
                  onClick={() => setScore1(Math.max(0, score1 - 1))}
                  className="w-10 h-10 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-lg flex items-center justify-center shadow-2xs hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-mono text-5xl font-black text-navy-950 w-24 text-center">
                  {score1}
                </span>

                <button
                  type="button"
                  disabled={match.status === 'COMPLETED'}
                  onClick={() => setScore1(score1 + 1)}
                  className="w-10 h-10 rounded-full bg-navy-900 text-white font-bold text-lg flex items-center justify-center shadow-sm hover:bg-navy-800 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Winner Selector */}
              {match.status !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => setWinnerParticipantId(p1?.id)}
                  className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    winnerParticipantId === p1?.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {winnerParticipantId === p1?.id ? 'Designated Winner' : 'Mark as Winner'}
                </button>
              )}
            </div>

            {/* Competitor 2 */}
            <div
              className={`p-6 rounded-2xl border transition text-center ${
                winnerParticipantId === p2?.id
                  ? 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/90 border border-slate-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <ClubBadge code={p2?.club?.code} name={p2?.club?.name} className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-navy-950 truncate">
                {p2?.club?.name || p2?.player?.name || 'Competitor 2'}
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400 block mb-4">
                {p2?.club?.code || 'P2'}
              </span>

              {/* Big Score Counter */}
              <div className="flex items-center justify-center gap-4 my-4">
                <button
                  type="button"
                  disabled={match.status === 'COMPLETED'}
                  onClick={() => setScore2(Math.max(0, score2 - 1))}
                  className="w-10 h-10 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-lg flex items-center justify-center shadow-2xs hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="font-mono text-5xl font-black text-navy-950 w-24 text-center">
                  {score2}
                </span>

                <button
                  type="button"
                  disabled={match.status === 'COMPLETED'}
                  onClick={() => setScore2(score2 + 1)}
                  className="w-10 h-10 rounded-full bg-navy-900 text-white font-bold text-lg flex items-center justify-center shadow-sm hover:bg-navy-800 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Winner Selector */}
              {match.status !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => setWinnerParticipantId(p2?.id)}
                  className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    winnerParticipantId === p2?.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {winnerParticipantId === p2?.id ? 'Designated Winner' : 'Mark as Winner'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Score Save / Live updates */}
          {match.status !== 'COMPLETED' && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">
                Live match scoring: Sync current interim goals/points to database spectators
              </span>
              <button
                type="button"
                disabled={savingScore}
                onClick={handleSaveLiveScore}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                {savingScore ? 'Saving...' : 'Save Live Scores'}
              </button>
            </div>
          )}

          {/* Referee Match Observations */}
          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Referee Match Observations & Disciplinary Notes
            </label>
            <textarea
              rows={3}
              disabled={match.status === 'COMPLETED'}
              value={refereeNotes}
              onChange={(e) => setRefereeNotes(e.target.value)}
              placeholder="e.g. Fair play maintained. High tempo match. 1 yellow card issued in 65th minute."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          {/* Submit Action Bar */}
          {match.status !== 'COMPLETED' && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Official Result Submission requires confirmation before locking.
              </span>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-xs rounded-xl shadow-md shadow-navy-900/20 flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                Submit Final Certified Result
              </button>
            </div>
          )}
        </div>

        {/* Modal: Confirmation Screen Before Final Submission (Requirement 5.C) */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-navy-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">Confirm Official Result Submission</h3>
                </div>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Certified Scoreline
                  </span>
                  <div className="text-xl font-extrabold text-navy-950 my-1">
                    {p1?.club?.name} ({score1}) - ({score2}) {p2?.club?.name}
                  </div>
                  <div className="text-xs font-bold text-blue-600 mt-2">
                    Winner: {match.participants?.find((p: any) => p.id === winnerParticipantId)?.club?.name || 'Draw / Tie'}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Submission Policy Warning:</span>
                  </p>
                  <p>
                    Once submitted, this result is officially filed to the tournament committee.
                    Standings will be updated upon tournament director approval.
                  </p>
                </div>

                {refereeNotes && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                      Attached Notes:
                    </span>
                    <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100">
                      "{refereeNotes}"
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 text-xs"
                >
                  Back to Review
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResult}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Report Match Dispute */}
        {isDisputeModalOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
              <div className="p-5 bg-red-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-sm">Report Match Incident / Dispute</h3>
                </div>
                <button
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="p-1 text-slate-300 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <p className="text-slate-600">
                  Report any refereeing conflict, player misconduct, weather stoppage, or score protest.
                  This flags the match as <strong>DISPUTED</strong> for tournament committee review.
                </p>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Incident Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe incident, timing, involved players/clubs, and referee decision..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-600 text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportDispute}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  File Official Dispute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

