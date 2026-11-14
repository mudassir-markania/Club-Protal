import { prisma } from './prisma';

interface FixtureOptions {
  sportId: string;
  format: 'LEAGUE' | 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_STAGE';
  participatingClubIds: string[];
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  venueIds?: string[];
  refereeIds?: string[];
  matchDurationMinutes?: number;
}

export async function generateTournamentFixtures(options: FixtureOptions) {
  const {
    sportId,
    format,
    participatingClubIds,
    startDate = '2026-11-25',
    endDate = '2026-11-28',
    venueIds = [],
    refereeIds = [],
  } = options;

  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
  });

  if (!sport) throw new Error('Sport not found');

  if (participatingClubIds.length < 2) {
    throw new Error('At least 2 participating clubs are required to generate fixtures');
  }

  // Fetch venues and referees if not provided
  let allVenues = venueIds;
  if (allVenues.length === 0) {
    const venues = await prisma.venue.findMany({ select: { id: true } });
    allVenues = venues.map((v) => v.id);
  }

  let allReferees = refereeIds;
  if (allReferees.length === 0) {
    const refSports = await prisma.refereeSport.findMany({
      where: { sportId },
      select: { refereeId: true },
    });
    allReferees = refSports.map((r) => r.refereeId);
    if (allReferees.length === 0) {
      const allRefs = await prisma.referee.findMany({ select: { id: true } });
      allReferees = allRefs.map((r) => r.id);
    }
  }

  const tournamentDays = ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28'];
  const timeslots = ['09:30', '11:30', '14:00', '16:00', '18:00'];

  const generatedMatches: any[] = [];
  const clubs = [...participatingClubIds];

  // Helper to pick rotating venue & referee
  let venueIndex = 0;
  let refIndex = 0;
  let slotIndex = 0;
  let dayIndex = 0;

  function getNextSlot() {
    const date = tournamentDays[dayIndex % tournamentDays.length];
    const time = timeslots[slotIndex % timeslots.length];
    slotIndex++;
    if (slotIndex >= timeslots.length) {
      slotIndex = 0;
      dayIndex++;
    }
    const venueId = allVenues.length > 0 ? allVenues[venueIndex % allVenues.length] : null;
    const refereeId = allReferees.length > 0 ? allReferees[refIndex % allReferees.length] : null;
    venueIndex++;
    refIndex++;

    return { date, time, venueId, refereeId };
  }

  const existingCount = await prisma.match.count();
  let matchSeq = existingCount + 1;

  if (format === 'ROUND_ROBIN' || format === 'LEAGUE') {
    // Generate Round Robin pairings
    const n = clubs.length;
    const isOdd = n % 2 !== 0;
    const list = isOdd ? [...clubs, 'BYE'] : [...clubs];
    const totalRounds = list.length - 1;
    const half = list.length / 2;

    for (let r = 0; r < totalRounds; r++) {
      const roundName = `League Match Round ${r + 1}`;

      for (let i = 0; i < half; i++) {
        const team1 = list[i];
        const team2 = list[list.length - 1 - i];

        if (team1 !== 'BYE' && team2 !== 'BYE') {
          const slot = getNextSlot();
          const matchCode = `M-${sport.name.slice(0, 2).toUpperCase()}-${matchSeq.toString().padStart(3, '0')}`;
          matchSeq++;

          const match = await prisma.match.create({
            data: {
              matchCode,
              sportId,
              round: roundName,
              stageName: 'League Stage',
              matchDate: slot.date,
              matchTime: slot.time,
              venueId: slot.venueId,
              status: 'SCHEDULED',
              participants: {
                create: [
                  { clubId: team1, score: 0 },
                  { clubId: team2, score: 0 },
                ],
              },
            },
          });

          if (slot.refereeId) {
            await prisma.matchReferee.create({
              data: { matchId: match.id, refereeId: slot.refereeId },
            });
          }

          generatedMatches.push(match);
        }
      }

      // Rotate list (keep first element fixed)
      list.splice(1, 0, list.pop()!);
    }
  } else if (format === 'KNOCKOUT') {
    // Generate Single Elimination Bracket
    // If 4 teams: 2 Semifinals + 1 Final
    // If 8 teams: 4 Quarterfinals + 2 Semifinals + 1 Final
    if (clubs.length >= 4) {
      // Quarterfinals or Semifinals depending on count
      const numQF = clubs.length >= 8 ? 4 : (clubs.length >= 4 ? 2 : 1);
      const isQuarter = clubs.length >= 8;

      for (let i = 0; i < numQF; i++) {
        const team1 = clubs[i * 2];
        const team2 = clubs[i * 2 + 1] || clubs[0];
        const slot = getNextSlot();
        const roundName = isQuarter ? `Quarterfinal ${i + 1}` : `Semifinal ${i + 1}`;
        const matchCode = `M-${sport.name.slice(0, 2).toUpperCase()}-${matchSeq.toString().padStart(3, '0')}`;
        matchSeq++;

        const match = await prisma.match.create({
          data: {
            matchCode,
            sportId,
            round: roundName,
            stageName: isQuarter ? 'Quarterfinals' : 'Semifinals',
            matchDate: tournamentDays[0], // Day 1 or 2
            matchTime: slot.time,
            venueId: slot.venueId,
            status: 'SCHEDULED',
            participants: {
              create: [
                { clubId: team1, score: 0 },
                { clubId: team2, score: 0 },
              ],
            },
          },
        });

        if (slot.refereeId) {
          await prisma.matchReferee.create({
            data: { matchId: match.id, refereeId: slot.refereeId },
          });
        }
        generatedMatches.push(match);
      }

      // Grand Final scheduled for Day 4 (Nov 28)
      const finalCode = `M-${sport.name.slice(0, 2).toUpperCase()}-${matchSeq.toString().padStart(3, '0')}`;
      matchSeq++;

      const finalMatch = await prisma.match.create({
        data: {
          matchCode: finalCode,
          sportId,
          round: 'Grand Championship Final',
          stageName: 'Finals',
          matchDate: '2026-11-28',
          matchTime: '17:00',
          venueId: allVenues[0] || null,
          status: 'SCHEDULED',
          notes: 'Winner of SF 1 vs Winner of SF 2',
          participants: {
            create: [
              { clubId: clubs[0], score: 0, teamName: 'Finalist 1' },
              { clubId: clubs[1], score: 0, teamName: 'Finalist 2' },
            ],
          },
        },
      });

      if (allReferees[0]) {
        await prisma.matchReferee.create({
          data: { matchId: finalMatch.id, refereeId: allReferees[0] },
        });
      }
      generatedMatches.push(finalMatch);
    }
  }

  return {
    success: true,
    totalGenerated: generatedMatches.length,
    matches: generatedMatches,
  };
}
