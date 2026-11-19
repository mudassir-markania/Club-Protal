import { normalizeSportKey } from './sports-rules-definitions';

export interface AwardField {
  key: string; // request field, e.g. topScorerPlayerId
  label: string;
  gender?: 'MALE' | 'FEMALE'; // limits the player choices (Men / Women awards)
}

/** Individual awards a match can give, per sport. Their points come from the scoring rules. */
export function awardFieldsFor(sportName?: string): AwardField[] {
  switch (normalizeSportKey(sportName)) {
    case 'FOOTBALL':
      return [{ key: 'topScorerPlayerId', label: 'Top scorer' }];
    case 'BGMI':
      return [{ key: 'bgmiMvpPlayerId', label: 'MVP' }];
    case 'CRICKET':
      return [
        { key: 'bestBatsmanMenPlayerId', label: 'Best batsman — Men', gender: 'MALE' },
        { key: 'bestBatsmanWomenPlayerId', label: 'Best batsman — Women', gender: 'FEMALE' },
        { key: 'bestBowlerMenPlayerId', label: 'Best bowler — Men', gender: 'MALE' },
        { key: 'bestBowlerWomenPlayerId', label: 'Best bowler — Women', gender: 'FEMALE' },
        { key: 'bestFielderMenPlayerId', label: 'Best fielder — Men', gender: 'MALE' },
        { key: 'bestFielderWomenPlayerId', label: 'Best fielder — Women', gender: 'FEMALE' },
        { key: 'mostFoursPlayerId', label: 'Most fours' },
        { key: 'mostSixesPlayerId', label: 'Most sixes' },
        { key: 'manOfTheTournamentMenPlayerId', label: 'Man of the Tournament — Men', gender: 'MALE' },
        { key: 'manOfTheTournamentWomenPlayerId', label: 'Man of the Tournament — Women', gender: 'FEMALE' },
      ];
    default:
      return [];
  }
}

/** BGMI can also record the overall tournament placements (1st / 2nd / 3rd team). */
export const hasTournamentPlacements = (sportName?: string) => normalizeSportKey(sportName) === 'BGMI';
