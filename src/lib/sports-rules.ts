import { calculateClubPointsDistribution, PlayerContribution } from './points-distribution';

export interface SportScoringRuleDef {
  sport: 'FOOTBALL' | 'BGMI' | 'CRICKET' | 'BADMINTON' | 'CARROM' | 'CHESS';
  ruleCode: string;
  ruleName: string;
  category?: string;
  awardType: 'TEAM' | 'INDIVIDUAL';
  isTournamentLevel?: boolean;
  points: number;
  description: string;
  conditions?: Record<string, any>;
}

/**
 * Official PDF scoring constants - Source of Truth
 */
export const DEFAULT_OFFICIAL_RULES: SportScoringRuleDef[] = [
  // FOOTBALL
  {
    sport: 'FOOTBALL',
    ruleCode: 'FT_MATCH_WIN',
    ruleName: 'Per match win',
    awardType: 'TEAM',
    points: 10,
    description: 'Awarded to the winning team of a match',
  },
  {
    sport: 'FOOTBALL',
    ruleCode: 'FT_FINAL_WINNER',
    ruleName: 'Final winner',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 50,
    description: 'Awarded to the championship final winner',
  },
  {
    sport: 'FOOTBALL',
    ruleCode: 'FT_FINAL_LOSER',
    ruleName: 'Final loser',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 25,
    description: 'Awarded to the championship final runner-up',
  },
  {
    sport: 'FOOTBALL',
    ruleCode: 'FT_TOP_SCORER',
    ruleName: 'Top scorer',
    awardType: 'INDIVIDUAL',
    isTournamentLevel: true,
    points: 15,
    description: 'Individual award for highest goal scorer, credited to player’s club',
  },

  // BGMI
  {
    sport: 'BGMI',
    ruleCode: 'BGMI_MATCH_WIN',
    ruleName: 'Per match win',
    awardType: 'TEAM',
    points: 8,
    description: 'Awarded to the match-winning squad (WWCD)',
  },
  {
    sport: 'BGMI',
    ruleCode: 'BGMI_OVERALL_WINNER',
    ruleName: 'Overall winner',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 20,
    description: 'Awarded to overall esports tournament champion',
  },
  {
    sport: 'BGMI',
    ruleCode: 'BGMI_RUNNER_UP',
    ruleName: 'Runner-up',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 12,
    description: 'Awarded to 2nd place overall esports squad',
  },
  {
    sport: 'BGMI',
    ruleCode: 'BGMI_MVP',
    ruleName: 'MVP',
    awardType: 'INDIVIDUAL',
    isTournamentLevel: true,
    points: 5,
    description: 'Tournament Most Valuable Player, credited directly to player’s club',
  },
  {
    sport: 'BGMI',
    ruleCode: 'BGMI_THIRD_PLACE',
    ruleName: 'Third place (if 7 teams participate)',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 8,
    conditions: { minTeams: 7 },
    description: 'Awarded to 3rd place squad ONLY if 7 teams participated in the tournament',
  },

  // CRICKET
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_MATCH_WIN',
    ruleName: 'Per match win',
    awardType: 'TEAM',
    points: 10,
    description: 'Awarded to the winning team of a match',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_BEST_BATSMAN_MEN',
    ruleName: 'Best batsman — Men',
    awardType: 'INDIVIDUAL',
    points: 10,
    description: 'Individual award for top men batsman, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_BEST_BATSMAN_WOMEN',
    ruleName: 'Best batsman — Women',
    awardType: 'INDIVIDUAL',
    points: 5,
    description: 'Individual award for top women batsman, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_BEST_BOWLER_MEN',
    ruleName: 'Best bowler — Men',
    awardType: 'INDIVIDUAL',
    points: 10,
    description: 'Individual award for top men bowler, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_BEST_BOWLER_WOMEN',
    ruleName: 'Best bowler — Women',
    awardType: 'INDIVIDUAL',
    points: 5,
    description: 'Individual award for top women bowler, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_BEST_FIELDER_MEN',
    ruleName: 'Best fielder — Men',
    awardType: 'INDIVIDUAL',
    points: 10,
    description: 'Individual award for top men fielder, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_BEST_FIELDER_WOMEN',
    ruleName: 'Best fielder — Women',
    awardType: 'INDIVIDUAL',
    points: 5,
    description: 'Individual award for top women fielder, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_MOST_FOURS',
    ruleName: 'Most fours',
    awardType: 'INDIVIDUAL',
    points: 5,
    description: 'Awarded for hitting the most 4s, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_MOST_SIXES',
    ruleName: 'Most sixes',
    awardType: 'INDIVIDUAL',
    points: 5,
    description: 'Awarded for hitting the most 6s, credited to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_MOTM_MEN',
    ruleName: 'Man of the Tournament — Men',
    awardType: 'INDIVIDUAL',
    isTournamentLevel: true,
    points: 15,
    description: 'Tournament MVP for Men, credited directly to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_MOTM_WOMEN',
    ruleName: 'Man of the Tournament — Women',
    awardType: 'INDIVIDUAL',
    isTournamentLevel: true,
    points: 10,
    description: 'Tournament MVP for Women, credited directly to player’s club',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_FINAL_WINNER',
    ruleName: 'Final winner',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 50,
    description: 'Awarded to the championship final winner',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_FINAL_LOSER',
    ruleName: 'Final loser',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 25,
    description: 'Awarded to the championship final runner-up',
  },
  {
    sport: 'CRICKET',
    ruleCode: 'CRICK_THIRD_PLACE',
    ruleName: 'Third place',
    awardType: 'TEAM',
    isTournamentLevel: true,
    points: 20,
    description: 'Awarded to the 3rd place playoff winner',
  },

  // BADMINTON
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MS_MD_1ST',
    ruleName: '1st place',
    category: "Men's singles / doubles",
    awardType: 'TEAM',
    points: 10,
    description: 'Men’s singles / doubles 1st place champion',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MS_MD_2ND',
    ruleName: '2nd place',
    category: "Men's singles / doubles",
    awardType: 'TEAM',
    points: 7,
    description: 'Men’s singles / doubles 2nd place runner-up',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MS_MD_3RD',
    ruleName: '3rd place',
    category: "Men's singles / doubles",
    awardType: 'TEAM',
    points: 5,
    description: 'Men’s singles / doubles 3rd place bronze',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_WS_WD_1ST',
    ruleName: '1st place',
    category: "Women's singles / doubles",
    awardType: 'TEAM',
    points: 10,
    description: 'Women’s singles / doubles 1st place champion',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_WS_WD_2ND',
    ruleName: '2nd place',
    category: "Women's singles / doubles",
    awardType: 'TEAM',
    points: 7,
    description: 'Women’s singles / doubles 2nd place runner-up',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_WS_WD_3RD',
    ruleName: '3rd place',
    category: "Women's singles / doubles",
    awardType: 'TEAM',
    points: 5,
    description: 'Women’s singles / doubles 3rd place bronze',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MIXED_1ST',
    ruleName: '1st place',
    category: 'Mixed',
    awardType: 'TEAM',
    points: 20,
    description: 'Mixed doubles 1st place champion',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MIXED_2ND',
    ruleName: '2nd place',
    category: 'Mixed',
    awardType: 'TEAM',
    points: 14,
    description: 'Mixed doubles 2nd place runner-up',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MIXED_3RD',
    ruleName: '3rd place',
    category: 'Mixed',
    awardType: 'TEAM',
    points: 10,
    description: 'Mixed doubles 3rd place bronze',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MD_1ST',
    ruleName: '1st place',
    category: 'MD',
    awardType: 'TEAM',
    points: 20,
    description: 'MD 1st place (official PDF category)',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MD_2ND',
    ruleName: '2nd place',
    category: 'MD',
    awardType: 'TEAM',
    points: 14,
    description: 'MD 2nd place (official PDF category)',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_MD_3RD',
    ruleName: '3rd place',
    category: 'MD',
    awardType: 'TEAM',
    points: 10,
    description: 'MD 3rd place (official PDF category)',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_WD_1ST',
    ruleName: '1st place',
    category: 'WD',
    awardType: 'TEAM',
    points: 20,
    description: 'WD 1st place (official PDF category)',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_WD_2ND',
    ruleName: '2nd place',
    category: 'WD',
    awardType: 'TEAM',
    points: 14,
    description: 'WD 2nd place (official PDF category)',
  },
  {
    sport: 'BADMINTON',
    ruleCode: 'BADM_WD_3RD',
    ruleName: '3rd place',
    category: 'WD',
    awardType: 'TEAM',
    points: 10,
    description: 'WD 3rd place (official PDF category)',
  },

  // CARROM
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MS_MD_1ST',
    ruleName: '1st place',
    category: "Men's singles / doubles",
    awardType: 'TEAM',
    points: 10,
    description: 'Men’s singles / doubles 1st place champion',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MS_MD_2ND',
    ruleName: '2nd place',
    category: "Men's singles / doubles",
    awardType: 'TEAM',
    points: 7,
    description: 'Men’s singles / doubles 2nd place runner-up',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MS_MD_3RD',
    ruleName: '3rd place',
    category: "Men's singles / doubles",
    awardType: 'TEAM',
    points: 5,
    description: 'Men’s singles / doubles 3rd place bronze',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_WS_WD_1ST',
    ruleName: '1st place',
    category: "Women's singles / doubles",
    awardType: 'TEAM',
    points: 10,
    description: 'Women’s singles / doubles 1st place champion',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_WS_WD_2ND',
    ruleName: '2nd place',
    category: "Women's singles / doubles",
    awardType: 'TEAM',
    points: 7,
    description: 'Women’s singles / doubles 2nd place runner-up',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_WS_WD_3RD',
    ruleName: '3rd place',
    category: "Women's singles / doubles",
    awardType: 'TEAM',
    points: 5,
    description: 'Women’s singles / doubles 3rd place bronze',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MIXED_1ST',
    ruleName: '1st place',
    category: 'Mixed',
    awardType: 'TEAM',
    points: 20,
    description: 'Mixed doubles 1st place champion',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MIXED_2ND',
    ruleName: '2nd place',
    category: 'Mixed',
    awardType: 'TEAM',
    points: 14,
    description: 'Mixed doubles 2nd place runner-up',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MIXED_3RD',
    ruleName: '3rd place',
    category: 'Mixed',
    awardType: 'TEAM',
    points: 10,
    description: 'Mixed doubles 3rd place bronze',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MD_1ST',
    ruleName: '1st place',
    category: 'MD',
    awardType: 'TEAM',
    points: 20,
    description: 'MD 1st place (official PDF category)',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MD_2ND',
    ruleName: '2nd place',
    category: 'MD',
    awardType: 'TEAM',
    points: 14,
    description: 'MD 2nd place (official PDF category)',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_MD_3RD',
    ruleName: '3rd place',
    category: 'MD',
    awardType: 'TEAM',
    points: 10,
    description: 'MD 3rd place (official PDF category)',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_WD_1ST',
    ruleName: '1st place',
    category: 'WD',
    awardType: 'TEAM',
    points: 20,
    description: 'WD 1st place (official PDF category)',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_WD_2ND',
    ruleName: '2nd place',
    category: 'WD',
    awardType: 'TEAM',
    points: 14,
    description: 'WD 2nd place (official PDF category)',
  },
  {
    sport: 'CARROM',
    ruleCode: 'CARROM_WD_3RD',
    ruleName: '3rd place',
    category: 'WD',
    awardType: 'TEAM',
    points: 10,
    description: 'WD 3rd place (official PDF category)',
  },

  // CHESS
  {
    sport: 'CHESS',
    ruleCode: 'CHESS_1ST',
    ruleName: '1st place',
    awardType: 'TEAM',
    points: 10,
    description: 'Chess 1st place champion',
  },
  {
    sport: 'CHESS',
    ruleCode: 'CHESS_2ND',
    ruleName: '2nd place',
    awardType: 'TEAM',
    points: 5,
    description: 'Chess 2nd place runner-up',
  },
];

export const OFFICIAL_CATEGORY_LABELS: Record<string, string> = {
  "Men's singles / doubles": "Men's Singles & Doubles bracket events",
  "Women's singles / doubles": "Women's Singles & Doubles bracket events",
  "Mixed": "Mixed Doubles (cross-gender pairing)",
  "MD": "MD — Retained verbatim from official PDF source",
  "WD": "WD — Retained verbatim from official PDF source",
};

/**
 * Normalizes sport name to rule enum key
 */
export function normalizeSportKey(sportName?: string): 'FOOTBALL' | 'BGMI' | 'CRICKET' | 'BADMINTON' | 'CARROM' | 'CHESS' | null {
  if (!sportName) return null;
  const s = sportName.trim().toUpperCase();
  if (s.includes('FOOTBALL') || s.includes('SOCCER')) return 'FOOTBALL';
  if (s.includes('BGMI') || s.includes('ESPORT') || s.includes('BATTLEGROUND')) return 'BGMI';
  if (s.includes('CRICKET')) return 'CRICKET';
  if (s.includes('BADMINTON')) return 'BADMINTON';
  if (s.includes('CARROM')) return 'CARROM';
  if (s.includes('CHESS')) return 'CHESS';
  return null;
}

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
  stageType?: 'NORMAL' | 'FINAL' | 'THIRD_PLACE' | 'SEMI_FINAL';
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
  rotationOffset: number = 0
): Promise<CalculatedMatchResult> {
  const sportKey = normalizeSportKey(input.sportName);
  if (!sportKey) {
    throw new Error(`Unsupported sport: "${input.sportName}"`);
  }

  const rules = await getSportRules(sportKey);
  const ruleMap = new Map<string, number>();
  rules.forEach((r) => ruleMap.set(r.ruleCode, r.points));

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

    const points = ruleMap.get(ruleCode) ?? defaultPoints;
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

  // 1. FOOTBALL
  if (sportKey === 'FOOTBALL') {
    const isFinal = input.stageType === 'FINAL';

    if (isFinal) {
      // In the final: 50 pts to winner, 25 pts to loser
      if (input.winnerParticipantId) {
        const winnerPts = ruleMap.get('FT_FINAL_WINNER') ?? 50;
        teamPoints.push({
          participantId: input.winnerParticipantId,
          teamName: getParticipantName(input.winnerParticipantId),
          points: winnerPts,
          reason: `Football Final Winner (${winnerPts} pts)`,
          isWinner: true,
          rank: 1,
        });
      }

      if (input.loserParticipantId) {
        const loserPts = ruleMap.get('FT_FINAL_LOSER') ?? 25;
        teamPoints.push({
          participantId: input.loserParticipantId,
          teamName: getParticipantName(input.loserParticipantId),
          points: loserPts,
          reason: `Football Final Loser (${loserPts} pts)`,
          isWinner: false,
          rank: 2,
        });
      }
    } else {
      // Normal match: 10 pts per match win
      if (input.winnerParticipantId) {
        const winPts = ruleMap.get('FT_MATCH_WIN') ?? 10;
        teamPoints.push({
          participantId: input.winnerParticipantId,
          teamName: getParticipantName(input.winnerParticipantId),
          points: winPts,
          reason: `Football Match Win (${winPts} pts)`,
          isWinner: true,
          rank: 1,
        });
      }
      if (input.loserParticipantId) {
        teamPoints.push({
          participantId: input.loserParticipantId,
          teamName: getParticipantName(input.loserParticipantId),
          points: 0,
          reason: `Football Match Loss (0 pts)`,
          isWinner: false,
          rank: 2,
        });
      }
    }

    // Individual award: Top Scorer (15 pts)
    addIndividualAward('TOP_SCORER', 'Top Scorer', 'FT_TOP_SCORER', input.topScorerPlayerId, 15);
  }

  // 2. BGMI
  else if (sportKey === 'BGMI') {
    // Per match win: 8 points
    if (input.winnerParticipantId) {
      const matchWinPts = ruleMap.get('BGMI_MATCH_WIN') ?? 8;
      teamPoints.push({
        participantId: input.winnerParticipantId,
        teamName: getParticipantName(input.winnerParticipantId),
        points: matchWinPts,
        reason: `BGMI Match Win (WWCD) (${matchWinPts} pts)`,
        isWinner: true,
        rank: 1,
      });
    }

    // Tournament Placements (if final/tournament level)
    if (input.isTournamentPlacement) {
      if (input.firstPlaceParticipantId) {
        const overallWinPts = ruleMap.get('BGMI_OVERALL_WINNER') ?? 20;
        teamPoints.push({
          participantId: input.firstPlaceParticipantId,
          teamName: getParticipantName(input.firstPlaceParticipantId),
          points: overallWinPts,
          reason: `BGMI Overall Winner (${overallWinPts} pts)`,
          isWinner: true,
          rank: 1,
        });
      }

      if (input.secondPlaceParticipantId) {
        const runnerUpPts = ruleMap.get('BGMI_RUNNER_UP') ?? 12;
        teamPoints.push({
          participantId: input.secondPlaceParticipantId,
          teamName: getParticipantName(input.secondPlaceParticipantId),
          points: runnerUpPts,
          reason: `BGMI Runner-Up (${runnerUpPts} pts)`,
          isWinner: false,
          rank: 2,
        });
      }

      // Third place: 8 points, ONLY if 7 teams participate
      const totalTeams = Number(input.totalTeamsParticipating) || participants.length;
      if (input.thirdPlaceParticipantId && totalTeams === 7) {
        const thirdPlacePts = ruleMap.get('BGMI_THIRD_PLACE') ?? 8;
        teamPoints.push({
          participantId: input.thirdPlaceParticipantId,
          teamName: getParticipantName(input.thirdPlaceParticipantId),
          points: thirdPlacePts,
          reason: `BGMI Third Place (7 teams participated) (${thirdPlacePts} pts)`,
          isWinner: false,
          rank: 3,
        });
      }
    }

    // MVP: 5 points
    addIndividualAward('BGMI_MVP', 'MVP', 'BGMI_MVP', input.bgmiMvpPlayerId, 5);
  }

  // 3. CRICKET
  else if (sportKey === 'CRICKET') {
    if (input.stageType === 'FINAL') {
      if (input.winnerParticipantId) {
        const winPts = ruleMap.get('CRICK_FINAL_WINNER') ?? 50;
        teamPoints.push({
          participantId: input.winnerParticipantId,
          teamName: getParticipantName(input.winnerParticipantId),
          points: winPts,
          reason: `Cricket Final Winner (${winPts} pts)`,
          isWinner: true,
          rank: 1,
        });
      }
      if (input.loserParticipantId) {
        const losePts = ruleMap.get('CRICK_FINAL_LOSER') ?? 25;
        teamPoints.push({
          participantId: input.loserParticipantId,
          teamName: getParticipantName(input.loserParticipantId),
          points: losePts,
          reason: `Cricket Final Loser (${losePts} pts)`,
          isWinner: false,
          rank: 2,
        });
      }
    } else if (input.stageType === 'THIRD_PLACE') {
      if (input.winnerParticipantId) {
        const thirdPts = ruleMap.get('CRICK_THIRD_PLACE') ?? 20;
        teamPoints.push({
          participantId: input.winnerParticipantId,
          teamName: getParticipantName(input.winnerParticipantId),
          points: thirdPts,
          reason: `Cricket Third Place (${thirdPts} pts)`,
          isWinner: true,
          rank: 3,
        });
      }
      if (input.loserParticipantId) {
        teamPoints.push({
          participantId: input.loserParticipantId,
          teamName: getParticipantName(input.loserParticipantId),
          points: 0,
          reason: `Cricket Fourth Place (0 pts)`,
          isWinner: false,
          rank: 4,
        });
      }
    } else {
      // Normal Match win: 10 pts
      if (input.winnerParticipantId) {
        const winPts = ruleMap.get('CRICK_MATCH_WIN') ?? 10;
        teamPoints.push({
          participantId: input.winnerParticipantId,
          teamName: getParticipantName(input.winnerParticipantId),
          points: winPts,
          reason: `Cricket Match Win (${winPts} pts)`,
          isWinner: true,
          rank: 1,
        });
      }
      if (input.loserParticipantId) {
        teamPoints.push({
          participantId: input.loserParticipantId,
          teamName: getParticipantName(input.loserParticipantId),
          points: 0,
          reason: `Cricket Match Loss (0 pts)`,
          isWinner: false,
          rank: 2,
        });
      }
    }

    // Individual Awards
    addIndividualAward('BEST_BATSMAN_MEN', 'Best batsman — Men', 'CRICK_BEST_BATSMAN_MEN', input.bestBatsmanMenPlayerId, 10);
    addIndividualAward('BEST_BATSMAN_WOMEN', 'Best batsman — Women', 'CRICK_BEST_BATSMAN_WOMEN', input.bestBatsmanWomenPlayerId, 5);
    addIndividualAward('BEST_BOWLER_MEN', 'Best bowler — Men', 'CRICK_BEST_BOWLER_MEN', input.bestBowlerMenPlayerId, 10);
    addIndividualAward('BEST_BOWLER_WOMEN', 'Best bowler — Women', 'CRICK_BEST_BOWLER_WOMEN', input.bestBowlerWomenPlayerId, 5);
    addIndividualAward('BEST_FIELDER_MEN', 'Best fielder — Men', 'CRICK_BEST_FIELDER_MEN', input.bestFielderMenPlayerId, 10);
    addIndividualAward('BEST_FIELDER_WOMEN', 'Best fielder — Women', 'CRICK_BEST_FIELDER_WOMEN', input.bestFielderWomenPlayerId, 5);
    addIndividualAward('MOST_FOURS', 'Most fours', 'CRICK_MOST_FOURS', input.mostFoursPlayerId, 5);
    addIndividualAward('MOST_SIXES', 'Most sixes', 'CRICK_MOST_SIXES', input.mostSixesPlayerId, 5);

    // Tournament-level awards
    addIndividualAward('MOTM_MEN', 'Man of the Tournament — Men', 'CRICK_MOTM_MEN', input.manOfTheTournamentMenPlayerId, 15);
    addIndividualAward('MOTM_WOMEN', 'Man of the Tournament — Women', 'CRICK_MOTM_WOMEN', input.manOfTheTournamentWomenPlayerId, 10);
  }

  // 4. BADMINTON & CARROM
  else if (sportKey === 'BADMINTON' || sportKey === 'CARROM') {
    const cat = input.eventCategory || "Men's singles / doubles";
    const prefix = sportKey === 'BADMINTON' ? 'BADM' : 'CARROM';

    // Determine point values for 1st, 2nd, 3rd from category rules
    let pts1st = 10;
    let pts2nd = 7;
    let pts3rd = 5;

    if (cat === 'Mixed' || cat === 'MD' || cat === 'WD') {
      pts1st = 20;
      pts2nd = 14;
      pts3rd = 10;
    }

    const firstPlaceId = input.firstPlaceParticipantId || input.winnerParticipantId;
    const secondPlaceId = input.secondPlaceParticipantId || input.loserParticipantId;
    const thirdPlaceId = input.thirdPlaceParticipantId;

    if (firstPlaceId) {
      teamPoints.push({
        participantId: firstPlaceId,
        teamName: getParticipantName(firstPlaceId),
        points: pts1st,
        reason: `${input.sportName} 1st Place (${cat}): ${pts1st} pts`,
        isWinner: true,
        rank: 1,
      });
    }

    if (secondPlaceId) {
      teamPoints.push({
        participantId: secondPlaceId,
        teamName: getParticipantName(secondPlaceId),
        points: pts2nd,
        reason: `${input.sportName} 2nd Place (${cat}): ${pts2nd} pts`,
        isWinner: false,
        rank: 2,
      });
    }

    if (thirdPlaceId) {
      teamPoints.push({
        participantId: thirdPlaceId,
        teamName: getParticipantName(thirdPlaceId),
        points: pts3rd,
        reason: `${input.sportName} 3rd Place (${cat}): ${pts3rd} pts`,
        isWinner: false,
        rank: 3,
      });
    }
  }

  // 5. CHESS
  else if (sportKey === 'CHESS') {
    const pts1st = ruleMap.get('CHESS_1ST') ?? 10;
    const pts2nd = ruleMap.get('CHESS_2ND') ?? 5;

    const firstPlaceId = input.firstPlaceParticipantId || input.winnerParticipantId;
    const secondPlaceId = input.secondPlaceParticipantId || input.loserParticipantId;

    if (firstPlaceId) {
      teamPoints.push({
        participantId: firstPlaceId,
        teamName: getParticipantName(firstPlaceId),
        points: pts1st,
        reason: `Chess 1st Place (${pts1st} pts)`,
        isWinner: true,
        rank: 1,
      });
    }

    if (secondPlaceId) {
      teamPoints.push({
        participantId: secondPlaceId,
        teamName: getParticipantName(secondPlaceId),
        points: pts2nd,
        reason: `Chess 2nd Place (${pts2nd} pts)`,
        isWinner: false,
        rank: 2,
      });
    }
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

