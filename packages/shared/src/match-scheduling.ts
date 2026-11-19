/**
 * Sport-specific scheduling configuration.
 * Adding a new sport = add one entry to SPORT_CONFIGS (or rely on the sportType fallback).
 * The Schedule Match modal renders entirely from this config.
 */

export type ParticipantMode =
  | 'CLUBS' // club vs club (team sports)
  | 'CRICKET_TEAMS' // two cricket teams
  | 'PLAYER_SIDES' // two sides of 1..N players, each side from one club
  | 'SQUADS'; // 2+ registered teams picked as a unit (BGMI)

export interface CategoryOption {
  code: string;
  label: string;
  hint?: string;
  forcesDoubles?: boolean;
}

export type PlayFormat = 'SINGLES' | 'DOUBLES' | 'MIXED_DOUBLES';
export type CategoryGender = 'MALE' | 'FEMALE' | 'MIXED';

export interface FormatOption {
  id: PlayFormat;
  label: string;
  size: 1 | 2; // players per side
  options: { code: string; label: string; hint?: string; gender: CategoryGender }[];
}

export interface SportScheduleConfig {
  mode: ParticipantMode;
  categoryLabel: string;
  categories: CategoryOption[];
  formats: FormatOption[]; // Singles / Doubles / Mixed Doubles (racket-style sports); empty for other sports
  allowDoubles: boolean;
  squadSize: number;
  minSquads: number;
  defaultRound: string;
  sideLabels: [string, string];
}

const BASE: SportScheduleConfig = {
  mode: 'CLUBS',
  categoryLabel: 'Format',
  categories: [],
  formats: [],
  allowDoubles: false,
  squadSize: 4,
  minSquads: 2,
  defaultRound: 'League Match',
  sideLabels: ['Side A', 'Side B'],
};

/**
 * Badminton / Carrom formats. The category code is what the scoring rules key on:
 *  Singles        -> "Men's singles / doubles" | "Women's singles / doubles"  (10 / 7 / 5 pts)
 *  Doubles        -> MD | WD                                                  (20 / 14 / 10 pts)
 *  Mixed Doubles  -> Mixed                                                    (20 / 14 / 10 pts)
 */
const RACKET_FORMATS: FormatOption[] = [
  {
    id: 'SINGLES',
    label: 'Singles',
    size: 1,
    options: [
      { code: "Men's singles / doubles", label: "Men's Singles", hint: '10/7/5 pts', gender: 'MALE' },
      { code: "Women's singles / doubles", label: "Women's Singles", hint: '10/7/5 pts', gender: 'FEMALE' },
    ],
  },
  {
    id: 'DOUBLES',
    label: 'Doubles',
    size: 2,
    options: [
      { code: 'MD', label: "Men's Doubles", hint: '20/14/10 pts', gender: 'MALE' },
      { code: 'WD', label: "Women's Doubles", hint: '20/14/10 pts', gender: 'FEMALE' },
    ],
  },
  {
    id: 'MIXED_DOUBLES',
    label: 'Mixed Doubles',
    size: 2,
    options: [{ code: 'Mixed', label: 'Mixed Doubles', hint: '20/14/10 pts', gender: 'MIXED' }],
  },
];

const RACKET_CONFIG: Partial<SportScheduleConfig> = {
  mode: 'PLAYER_SIDES',
  categoryLabel: 'Category',
  allowDoubles: true,
  formats: RACKET_FORMATS,
  categories: RACKET_FORMATS.flatMap((f) => f.options.map((o) => ({ code: o.code, label: o.label, hint: o.hint, forcesDoubles: f.size === 2 }))),
  defaultRound: "Men's Singles",
};

const SPORT_CONFIGS: Record<string, Partial<SportScheduleConfig>> = {
  FOOTBALL: {
    mode: 'CLUBS',
    categoryLabel: 'Format',
    categories: [{ code: '11v11', label: '11 v 11' }],
    defaultRound: 'Championship Match',
  },
  CRICKET: {
    mode: 'CRICKET_TEAMS',
    categoryLabel: 'Format',
    categories: [
      { code: 'T10', label: 'T10' },
      { code: 'T20', label: 'T20' },
      { code: 'House Derby', label: 'House Derby' },
    ],
    defaultRound: 'House Derby',
  },
  CHESS: {
    mode: 'PLAYER_SIDES',
    categoryLabel: 'Format',
    categories: [{ code: 'Classical', label: 'Classical' }],
    defaultRound: 'Classical 1v1',
    sideLabels: ['Player A (White)', 'Player B (Black)'],
  },
  BADMINTON: RACKET_CONFIG,
  CARROM: RACKET_CONFIG,
  BGMI: {
    mode: 'SQUADS',
    categoryLabel: 'Format',
    categories: [{ code: 'Squad', label: 'Squad Battle' }],
    squadSize: 4,
    minSquads: 2,
    defaultRound: 'Squad Battle',
  },
};

export function getScheduleConfig(sportName?: string, sportType?: string): SportScheduleConfig {
  const key = (sportName || '').trim().toUpperCase();
  const specific = SPORT_CONFIGS[key];
  if (specific) return { ...BASE, ...specific };

  // Fallback for sports added later: individual sports -> player sides, otherwise club vs club.
  if ((sportType || '').toUpperCase() === 'INDIVIDUAL') {
    return {
      ...BASE,
      mode: 'PLAYER_SIDES',
      allowDoubles: true,
      categories: [{ code: 'Singles', label: 'Singles' }],
    };
  }
  return { ...BASE, categories: [{ code: 'Team', label: 'Team' }] };
}

export const STAGE_OPTIONS = [
  { id: 'NORMAL', label: 'League / Regular' },
  { id: 'QUARTER_FINAL', label: 'Quarter Final' },
  { id: 'SEMI_FINAL', label: 'Semi Final' },
  { id: 'FINAL', label: 'Championship Final' },
  { id: 'THIRD_PLACE', label: '3rd Place Playoff' },
] as const;

export function defaultRoundFor(stageType: string, config: SportScheduleConfig, categoryLabel?: string): string {
  if (stageType === 'FINAL') return 'Championship Final';
  if (stageType === 'QUARTER_FINAL') return 'Quarter Final';
  if (stageType === 'SEMI_FINAL') return 'Semi Final';
  if (stageType === 'THIRD_PLACE') return '3rd Place Playoff';
  if (config.mode === 'PLAYER_SIDES' && config.allowDoubles && categoryLabel) return `${categoryLabel} Match`;
  return config.defaultRound;
}

const CATEGORY_NAMES: Record<string, string> = {
  "men's singles / doubles": "Men's Singles",
  "women's singles / doubles": "Women's Singles",
  md: "Men's Doubles",
  wd: "Women's Doubles",
  mixed: 'Mixed Doubles',
};

/** Human friendly name for a stored match category (falls back to the stored text). */
export const categoryDisplayName = (code?: string | null) => (code ? CATEGORY_NAMES[code.trim().toLowerCase()] || code : '');

/** Which format and gender a stored category code means. */
export function categoryRules(code?: string | null): { format: PlayFormat; gender: CategoryGender } | null {
  switch ((code || '').trim().toLowerCase()) {
    case "men's singles / doubles":
      return { format: 'SINGLES', gender: 'MALE' };
    case "women's singles / doubles":
      return { format: 'SINGLES', gender: 'FEMALE' };
    case 'md':
      return { format: 'DOUBLES', gender: 'MALE' };
    case 'wd':
      return { format: 'DOUBLES', gender: 'FEMALE' };
    case 'mixed':
      return { format: 'MIXED_DOUBLES', gender: 'MIXED' };
    default:
      return null;
  }
}

export type MatchFormatKey = 'SINGLES' | 'MENS_DOUBLES' | 'WOMENS_DOUBLES' | 'MIXED_DOUBLES';

export const MATCH_FORMAT_FILTERS: { key: MatchFormatKey; label: string }[] = [
  { key: 'SINGLES', label: 'Singles' },
  { key: 'MENS_DOUBLES', label: "Men's Doubles" },
  { key: 'WOMENS_DOUBLES', label: "Women's Doubles" },
  { key: 'MIXED_DOUBLES', label: 'Mixed Doubles' },
];

/** Which format tab a stored match category belongs to (null for sports without these formats). */
export function matchFormatKey(code?: string | null): MatchFormatKey | null {
  const r = categoryRules(code);
  if (!r) return null;
  if (r.format === 'SINGLES') return 'SINGLES';
  if (r.format === 'MIXED_DOUBLES') return 'MIXED_DOUBLES';
  return r.gender === 'FEMALE' ? 'WOMENS_DOUBLES' : 'MENS_DOUBLES';
}
