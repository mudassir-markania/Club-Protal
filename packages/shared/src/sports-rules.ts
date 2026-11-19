import { calculateClubPointsDistribution, PlayerContribution } from './points-distribution';
export * from './sports-rules-definitions';
export * from './scoring-triggers';
import { toEffectiveRule, findRuleForTrigger, triggerLabel, RuleTrigger } from './scoring-triggers';
import {
  SportScoringRuleDef,
  DEFAULT_OFFICIAL_RULES,
  OFFICIAL_CATEGORY_LABELS,
  normalizeSportKey,
} from './sports-rules-definitions';

/**
 * Fetch all rules for a sport (from default official constants)
 */
export function getSportRules(sportName: string): SportScoringRuleDef[] {
  const norm = normalizeSportKey(sportName);
  if (!norm) return [];
  return DEFAULT_OFFICIAL_RULES.filter((r) => r.sport === norm);
}

export interface MatchCalculationInput {
  sportName: string;
  stageType?: 'NORMAL' | 'FINAL' | 'THIRD_PLACE' | 'SEMI_FINAL' | 'QUARTER_FINAL';
  eventCategory?: string; // For Badminton/Carrom

  // Common match results
  winnerParticipantId?: string;
  loserParticipantId?: string;
  isDraw?: boolean;
  scoresSummary: string;
  refereeNotes?: string;

  // Placements (Badminton, Carrom, Chess, BGMI)
  firstPlaceParticipantId?: string;
  secondPlaceParticipantId?: string;
  thirdPlaceParticipantId?: string;

  // BGMI specifics
  isTournamentPlacement?: boolean;
  totalTeamsParticipating?: number; // BGMI condition for 3rd place (needs exactly 7)
  bgmiMvpPlayerId?: string;

  // Football specifics
  topScorerPlayerId?: string;

  // Cricket specifics
  bestBatsmanMenPlayerId?: string;
  bestBatsmanWomenPlayerId?: string;
  bestBowlerMenPlayerId?: string;
  bestBowlerWomenPlayerId?: string;
  bestFielderMenPlayerId?: string;
  bestFielderWomenPlayerId?: string;
  mostFoursPlayerId?: string;
  mostSixesPlayerId?: string;
  manOfTheTournamentMenPlayerId?: string;
  manOfTheTournamentWomenPlayerId?: string;

  // Optional Star Player Highlight (Does not add extra points unless official rule)
  starPlayerId?: string;
}

export interface CalculatedMatchResult {
  sportKey: 'FOOTBALL' | 'BGMI' | 'CRICKET' | 'BADMINTON' | 'CARROM' | 'CHESS';
  teamPoints: Array<{
    participantId: string;
    teamName: string;
    points: number;
    reason: string;
    isWinner: boolean;
    rank?: number;
  }>;
  individualAwards: Array<{
    awardKey: string;
    awardTitle: string;
    playerId: string;
    playerName: string;
    clubId: string;
    clubName: string;
    points: number;
    reason: string;
  }>;
  calculatedDistributions: Array<{
    participantId: string;
    teamName: string;
    originalPoints: number;
    uniqueClubCount: number;
    explanation: string;
    allocations: Array<{
      clubId: string;
      clubName: string;
      clubCode?: string;
      playersContributed: number;
      points: number;
      pointsFormatted: string;
      isRemainderWinner: boolean;
    }>;
  }>;
  clubPointsBreakdown: Record<string, { clubName: string; teamPoints: number; awardPoints: number; totalPoints: number }>;
  summary: string;
}

/**
 * Authoritative Backend Calculation Engine
 * Implements the exact scoring logic from sports_points_distribution.pdf
 */
export async function calculateMatchPoints(
  input: MatchCalculationInput,
  participants: any[], // Array of MatchParticipant with club, cricketTeam, and players
  allPlayers: any[] = [], // Optional lookup array of players
  rotationOffset: number = 0,
  customRuleMap?: Map<string, number>,
  rulesOverride?: SportScoringRuleDef[] // rules loaded from the database; when given they replace the PDF defaults
): Promise<CalculatedMatchResult> {
  const sportKey = normalizeSportKey(input.sportName);
  if (!sportKey) {
    throw new Error(`Unsupported sport: "${input.sportName}"`);
  }

  const rules = rulesOverride !== undefined ? rulesOverride : await getSportRules(sportKey);
  const ruleMap = new Map<string, number>();
  rules.forEach((r) => ruleMap.set(r.ruleCode, r.points));

  if (customRuleMap) {
    customRuleMap.forEach((pts, code) => {
      ruleMap.set(code, pts);
    });
  }

  const teamPoints: CalculatedMatchResult['teamPoints'] = [];
  const individualAwards: CalculatedMatchResult['individualAwards'] = [];

  const getParticipantName = (pId?: string) => {
    if (!pId) return 'Unknown Participant';
    const found = participants.find((p) => p.id === pId);
    return found?.teamName || found?.cricketTeam?.name || found?.club?.name || `Participant ${pId}`;
  };

  const findPlayerDetails = (playerId?: string) => {
    if (!playerId) return null;
    // Check in allPlayers lookup
    let player = allPlayers.find((p) => p.id === playerId);
    if (!player) {
      // Check in participants' rosters
      for (const p of participants) {
        if (p.players) {
          const mpp = p.players.find((item: any) => item.playerId === playerId || item.player?.id === playerId);
          if (mpp) {
            player = mpp.player || { id: mpp.playerId, clubId: mpp.clubId, club: mpp.club };
            break;
          }
        }
        if (p.playerId === playerId && p.player) {
          player = p.player;
          break;
        }
      }
    }
    return player || null;
  };

  // Helper to add an individual award
  const addIndividualAward = (
    awardKey: string,
    awardTitle: string,
    ruleCode: string,
    playerId?: string,
    defaultPoints: number = 0
  ) => {
    if (!playerId) return;
    const player = findPlayerDetails(playerId);
    if (!player) return;

    const configured = ruleMap.get(ruleCode);
    if (configured === undefined) return; // rule deleted or disabled: nothing to award
    const points = configured;
    const clubId = player.clubId || player.club?.id;
    const clubName = player.club?.name || 'Club';

    individualAwards.push({
      awardKey,
      awardTitle,
      playerId: player.id,
      playerName: player.name || 'Athlete',
      clubId,
      clubName,
      points,
      reason: `${input.sportName} - ${awardTitle}: ${points} pts to ${clubName}`,
    });
  };

  // ---- TEAM / INDIVIDUAL-ENTRY POINTS: driven by the scoring rules ----
  // A participant is one player or one team. Its points come from the rule whose trigger matches what it achieved
  // in this match (win, final winner, 1st place, ...). They are then split equally across the unique clubs of its players.
  const effectiveRules = rules
    .map((r) => {
      const e = toEffectiveRule(r);
      const override = customRuleMap?.get(e.ruleCode);
      return override !== undefined ? { ...e, points: Number(override) || 0 } : e;
    })
    .filter((r) => r.trigger && (!r.sport || r.sport === sportKey));
  const teamCount = Number(input.totalTeamsParticipating) || participants.length;

  const awardTeam = (
    participantId: string | undefined,
    trigger: RuleTrigger,
    isWinner: boolean,
    rank: number,
    opts: { fallback?: RuleTrigger; skipIfNoRule?: boolean } = {}
  ) => {
    if (!participantId) return;
    let rule = findRuleForTrigger(effectiveRules, trigger, input.eventCategory, teamCount);
    if (!rule && opts.fallback) rule = findRuleForTrigger(effectiveRules, opts.fallback, input.eventCategory, teamCount);
    if (!rule && opts.skipIfNoRule) return;

    const label = triggerLabel(trigger);
    const points = rule?.points ?? 0;
    const catSuffix = rule?.category ? ` (${rule.category})` : '';
    const zeroByDesign =
      trigger === 'MATCH_LOSS' || trigger === 'THIRD_PLACE_LOSER' || trigger === 'QUARTER_FINAL_LOSS' || trigger === 'SEMI_FINAL_LOSS';
    teamPoints.push({
      participantId,
      teamName: getParticipantName(participantId),
      points,
      reason: rule
        ? `${input.sportName} ${label}${catSuffix}: ${points} pts`
        : zeroByDesign
        ? `${input.sportName} ${label}: 0 pts`
        : `${input.sportName} ${label}: no scoring rule configured (0 pts)`,
      isWinner,
      rank,
    });
  };

  const stage = input.stageType || 'NORMAL';
  const winnerId = input.winnerParticipantId;
  const loserId = input.loserParticipantId;

  if (sportKey === 'BADMINTON' || sportKey === 'CARROM' || sportKey === 'CHESS') {
    // Badminton / Carrom / Chess: NO points per match. Points come from the event standings: when an admin finalizes an
    // event, the 1st / 2nd / 3rd place rules are paid to the top three (see event-standings.ts).
    const note = 'no points per match - awarded when the event is finalized from the standings';
    if (winnerId) {
      teamPoints.push({ participantId: winnerId, teamName: getParticipantName(winnerId), points: 0, reason: `${input.sportName} match win: ${note}`, isWinner: true, rank: 1 });
    }
    if (loserId) {
      teamPoints.push({ participantId: loserId, teamName: getParticipantName(loserId), points: 0, reason: `${input.sportName} match loss: 0 pts`, isWinner: false, rank: 2 });
    }
  } else if (sportKey === 'BGMI') {
    // BGMI: every match pays the winning team the match-win rule. Overall winner / runner-up / third place are paid
    // when the overall team ranking is finalized (see event-standings.ts), not by a single match.
    awardTeam(winnerId, 'MATCH_WIN', true, 1);
  } else {
    // Football and Cricket: each match pays its winner the match-win rule. Final winner / loser and cricket third place
    // are paid by the overall team ranking when it is finalized, so a final or 3rd-place match is paid like any other.
    if (stage === 'QUARTER_FINAL' || stage === 'SEMI_FINAL') {
      const q = stage === 'QUARTER_FINAL';
      awardTeam(winnerId, q ? 'QUARTER_FINAL_WIN' : 'SEMI_FINAL_WIN', true, 1, { fallback: 'MATCH_WIN' });
      awardTeam(loserId, q ? 'QUARTER_FINAL_LOSS' : 'SEMI_FINAL_LOSS', false, 2, { fallback: 'MATCH_LOSS' });
    } else {
      awardTeam(winnerId, 'MATCH_WIN', true, 1);
      awardTeam(loserId, 'MATCH_LOSS', false, 2);
    }
  }

  // ---- INDIVIDUAL AWARDS (points come from the INDIVIDUAL rules; the player's own club is credited) ----
  if (sportKey === 'FOOTBALL') {
    addIndividualAward('TOP_SCORER', 'Top Scorer', 'FT_TOP_SCORER', input.topScorerPlayerId);
  } else if (sportKey === 'BGMI') {
    addIndividualAward('BGMI_MVP', 'MVP', 'BGMI_MVP', input.bgmiMvpPlayerId);
  } else if (sportKey === 'CRICKET') {
    addIndividualAward('BEST_BATSMAN_MEN', 'Best batsman — Men', 'CRICK_BEST_BATSMAN_MEN', input.bestBatsmanMenPlayerId);
    addIndividualAward('BEST_BATSMAN_WOMEN', 'Best batsman — Women', 'CRICK_BEST_BATSMAN_WOMEN', input.bestBatsmanWomenPlayerId);
    addIndividualAward('BEST_BOWLER_MEN', 'Best bowler — Men', 'CRICK_BEST_BOWLER_MEN', input.bestBowlerMenPlayerId);
    addIndividualAward('BEST_BOWLER_WOMEN', 'Best bowler — Women', 'CRICK_BEST_BOWLER_WOMEN', input.bestBowlerWomenPlayerId);
    addIndividualAward('BEST_FIELDER_MEN', 'Best fielder — Men', 'CRICK_BEST_FIELDER_MEN', input.bestFielderMenPlayerId);
    addIndividualAward('BEST_FIELDER_WOMEN', 'Best fielder — Women', 'CRICK_BEST_FIELDER_WOMEN', input.bestFielderWomenPlayerId);
    addIndividualAward('MOST_FOURS', 'Most fours', 'CRICK_MOST_FOURS', input.mostFoursPlayerId);
    addIndividualAward('MOST_SIXES', 'Most sixes', 'CRICK_MOST_SIXES', input.mostSixesPlayerId);
    addIndividualAward('MOTM_MEN', 'Man of the Tournament — Men', 'CRICK_MOTM_MEN', input.manOfTheTournamentMenPlayerId);
    addIndividualAward('MOTM_WOMEN', 'Man of the Tournament — Women', 'CRICK_MOTM_WOMEN', input.manOfTheTournamentWomenPlayerId);
  }

  // Now, calculate the automatic unique-club points distribution for each team/participant
  const calculatedDistributions: CalculatedMatchResult['calculatedDistributions'] = [];
  const clubPointsBreakdown: CalculatedMatchResult['clubPointsBreakdown'] = {};

  let currentRotation = rotationOffset;

  for (const tp of teamPoints) {
    const participant = participants.find((p) => p.id === tp.participantId);
    if (!participant) continue;

    // Build player contributions
    const playerContributions: PlayerContribution[] = [];

    if (participant.players && participant.players.length > 0) {
      for (const mpp of participant.players) {
        playerContributions.push({
          playerId: mpp.playerId,
          playerName: mpp.player?.name,
          clubId: mpp.clubId,
          clubName: mpp.club?.name || 'House',
          clubCode: mpp.club?.code,
        });
      }
    } else if (participant.clubId && participant.club) {
      playerContributions.push({
        playerId: participant.playerId || 'team',
        playerName: participant.teamName || participant.club.name,
        clubId: participant.clubId,
        clubName: participant.club.name,
        clubCode: participant.club.code,
      });
    }

    const distCalc = calculateClubPointsDistribution(tp.points, playerContributions, currentRotation);
    currentRotation += 1;

    calculatedDistributions.push({
      participantId: participant.id,
      teamName: tp.teamName,
      originalPoints: distCalc.originalPoints,
      uniqueClubCount: distCalc.uniqueClubCount,
      explanation: distCalc.explanation,
      allocations: distCalc.allocations.map((a) => ({
        clubId: a.clubId,
        clubName: a.clubName,
        clubCode: a.clubCode,
        playersContributed: a.playersContributed,
        points: a.points,
        pointsFormatted: a.pointsFormatted,
        isRemainderWinner: a.isRemainderWinner,
      })),
    });

    // Accumulate into club breakdown
    for (const alloc of distCalc.allocations) {
      if (!clubPointsBreakdown[alloc.clubId]) {
        clubPointsBreakdown[alloc.clubId] = {
          clubName: alloc.clubName,
          teamPoints: 0,
          awardPoints: 0,
          totalPoints: 0,
        };
      }
      clubPointsBreakdown[alloc.clubId].teamPoints = Number(
        (clubPointsBreakdown[alloc.clubId].teamPoints + alloc.points).toFixed(2)
      );
    }
  }

  // Accumulate individual awards into club breakdown
  for (const award of individualAwards) {
    if (!clubPointsBreakdown[award.clubId]) {
      clubPointsBreakdown[award.clubId] = {
        clubName: award.clubName,
        teamPoints: 0,
        awardPoints: 0,
        totalPoints: 0,
      };
    }
    clubPointsBreakdown[award.clubId].awardPoints = Number(
      (clubPointsBreakdown[award.clubId].awardPoints + award.points).toFixed(2)
    );
  }

  // Calculate totals
  for (const cId in clubPointsBreakdown) {
    const item = clubPointsBreakdown[cId];
    item.totalPoints = Number((item.teamPoints + item.awardPoints).toFixed(2));
  }

  const summary = input.scoresSummary || `${input.sportName} Result`;

  return {
    sportKey,
    teamPoints,
    individualAwards,
    calculatedDistributions,
    clubPointsBreakdown,
    summary,
  };
}

