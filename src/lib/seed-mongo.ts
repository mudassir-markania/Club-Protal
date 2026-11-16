import { db, connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function seedMongoDatabase() {
  console.log('Connecting to MongoDB for seeding...');
  await connectToDatabase();

  console.log('1. Seeding Roles...');
  const superAdminRole = await db.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Full system control' },
  });

  const adminRole = await db.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Championship management' },
  });

  const refereeRole = await db.role.upsert({
    where: { name: 'REFEREE' },
    update: {},
    create: { name: 'REFEREE', description: 'Match officiating & result submission' },
  });

  console.log('2. Seeding 5 Houses / Clubs...');
  const clubsData = [
    { name: 'Mavericks', code: 'MAV', logoUrl: '/clubs/mavericks.png', captainName: 'Alex Rivera' },
    { name: 'Dominator', code: 'DOM', logoUrl: '/clubs/dominator.png', captainName: 'Leo Vance' },
    { name: 'Alpha', code: 'ALP', logoUrl: '/clubs/alpha.png', captainName: 'Ethan Hunt' },
    { name: 'Royal Force', code: 'RYL', logoUrl: '/clubs/royal-force.png', captainName: 'Carlos Vega' },
    { name: 'Crown Crushers', code: 'CRW', logoUrl: '/clubs/crown-crushers.png', captainName: 'Zane Malik' },
  ];

  const clubs: any[] = [];
  for (const c of clubsData) {
    const club = await db.club.upsert({
      where: { code: c.code },
      update: { name: c.name, logoUrl: c.logoUrl, captainName: c.captainName },
      create: { ...c, totalPoints: 0.0, currentRank: 1 },
    });
    clubs.push(club);
  }

  console.log('3. Seeding 10 Cricket Teams (2 per House)...');
  const cricketTeams: any[] = [];
  for (const c of clubs) {
    const teamA = await db.cricketTeam.upsert({
      where: { name: `${c.name} A` },
      update: { clubId: c.id },
      create: { name: `${c.name} A`, clubId: c.id, captainName: `${c.captainName} (A)` },
    });
    const teamB = await db.cricketTeam.upsert({
      where: { name: `${c.name} B` },
      update: { clubId: c.id },
      create: { name: `${c.name} B`, clubId: c.id, captainName: `${c.name} Vice Captain (B)` },
    });
    cricketTeams.push(teamA, teamB);
  }

  console.log('4. Seeding 7 Championship Sports...');
  const sportsData = [
    {
      name: 'BGMI',
      category: 'Esports',
      icon: 'Gamepad2',
      sportType: 'SQUAD',
      maxParticipants: 4,
      allowsMixedClubs: true,
      pointsEntryMethod: 'BOTH',
      positionPoints: JSON.stringify({ '1': 100, '2': 70, '3': 50, '4': 30, '5': 20 }),
      scoringConfig: JSON.stringify({ type: 'squad_points', placementPoints: true, killPoints: true }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
    {
      name: 'Carrom',
      category: 'BoardGame',
      icon: 'Target',
      sportType: 'INDIVIDUAL',
      maxParticipants: 2,
      allowsMixedClubs: false,
      pointsEntryMethod: 'POSITION',
      positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }),
      scoringConfig: JSON.stringify({ type: 'board_points', boards: 3 }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
    {
      name: 'Badminton',
      category: 'Racquet',
      icon: 'Zap',
      sportType: 'INDIVIDUAL',
      maxParticipants: 2,
      allowsMixedClubs: false,
      pointsEntryMethod: 'BOTH',
      positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }),
      scoringConfig: JSON.stringify({ type: 'sets', setsToWin: 2, pointsPerSet: 21 }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
    {
      name: 'Chess',
      category: 'BoardGame',
      icon: 'Brain',
      sportType: 'INDIVIDUAL',
      maxParticipants: 2,
      allowsMixedClubs: false,
      pointsEntryMethod: 'POSITION',
      positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }),
      scoringConfig: JSON.stringify({ type: 'classical', timeControl: '15+10' }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
    {
      name: 'Table Tennis',
      category: 'Racquet',
      icon: 'Activity',
      sportType: 'INDIVIDUAL',
      maxParticipants: 2,
      allowsMixedClubs: false,
      pointsEntryMethod: 'BOTH',
      positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }),
      scoringConfig: JSON.stringify({ type: 'sets', setsToWin: 3, pointsPerSet: 11 }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
    {
      name: 'Cricket',
      category: 'Outdoor',
      icon: 'Flame',
      sportType: 'TEAM',
      maxParticipants: 11,
      allowsMixedClubs: false,
      pointsEntryMethod: 'MANUAL',
      positionPoints: JSON.stringify({ '1': 100, '2': 60, '3': 40 }),
      scoringConfig: JSON.stringify({ overs: 10, ballsPerOver: 6 }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true, creditParentClub: true }),
    },
    {
      name: 'Football',
      category: 'Team',
      icon: 'Trophy',
      sportType: 'TEAM',
      maxParticipants: 11,
      allowsMixedClubs: false,
      pointsEntryMethod: 'MANUAL',
      positionPoints: JSON.stringify({ '1': 100, '2': 60, '3': 40 }),
      scoringConfig: JSON.stringify({ halves: 2, minutesPerHalf: 20 }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
    {
      name: 'Treasure Hunt',
      category: 'Adventure Quest',
      icon: 'Compass',
      sportType: 'SQUAD',
      maxParticipants: 5,
      allowsMixedClubs: true,
      pointsEntryMethod: 'POSITION',
      positionPoints: JSON.stringify({ '1': 75, '2': 50, '3': 35, '4': 20, '5': 10 }),
      scoringConfig: JSON.stringify({ type: 'clues_found', timeBased: true }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
    },
  ];

  const sports: any[] = [];
  for (const s of sportsData) {
    const sp = await db.sport.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
    sports.push(sp);
  }

  console.log('5. Seeding Venues...');
  const venuesData = [
    { name: 'Olympic Grand Arena', location: 'Main Campus East Wing', capacity: 2500 },
    { name: 'Esports Center', location: 'Tech Building, 3rd Floor', capacity: 300 },
    { name: 'Cricket Grounds', location: 'South Complex', capacity: 1500 },
    { name: 'Indoor Sports Complex', location: 'North Wing', capacity: 800 },
  ];

  const venues: any[] = [];
  for (const v of venuesData) {
    const ven = await db.venue.upsert({
      where: { name: v.name },
      update: v,
      create: v,
    });
    venues.push(ven);
  }

  console.log('6. Seeding Users & Referees...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const refereePassword = await bcrypt.hash('referee123', 10);

  await db.user.upsert({
    where: { email: 'admin@sportsportal.com' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@sportsportal.com',
      passwordHash: adminPassword,
      name: 'Championship Director',
      roleId: superAdminRole.id,
      status: 'ACTIVE',
    },
  });

  const refereesData = [
    {
      refereeCode: 'REF-001',
      name: 'Marcus Sterling',
      email: 'ref.marcus@sportsportal.com',
      phone: '+1 555-0192',
      sportNames: ['BGMI', 'Cricket', 'Football'],
    },
    {
      refereeCode: 'REF-002',
      name: 'Sarah Jenkins',
      email: 'ref.sarah@sportsportal.com',
      phone: '+1 555-0193',
      sportNames: ['Badminton', 'Table Tennis', 'Carrom'],
    },
    {
      refereeCode: 'REF-003',
      name: 'David Okafor',
      email: 'ref.david@sportsportal.com',
      phone: '+1 555-0194',
      sportNames: ['Chess', 'BGMI', 'Football', 'Treasure Hunt'],
    },
  ];

  const referees: any[] = [];
  for (const r of refereesData) {
    const ref = await db.referee.upsert({
      where: { refereeCode: r.refereeCode },
      update: { name: r.name, email: r.email },
      create: {
        refereeCode: r.refereeCode,
        name: r.name,
        email: r.email,
        phone: r.phone,
        availability: 'AVAILABLE',
        status: 'ACTIVE',
      },
    });
    referees.push(ref);

    await db.user.upsert({
      where: { email: r.email },
      update: { refereeId: ref.id, passwordHash: refereePassword },
      create: {
        email: r.email,
        passwordHash: refereePassword,
        name: r.name,
        roleId: refereeRole.id,
        refereeId: ref.id,
        status: 'ACTIVE',
      },
    });

    for (const sName of r.sportNames) {
      const sp = sports.find((s) => s.name === sName);
      if (sp) {
        await db.refereeSport.upsert({
          where: { refereeId_sportId: { refereeId: ref.id, sportId: sp.id } },
          update: {},
          create: { refereeId: ref.id, sportId: sp.id },
        });
      }
    }
  }

  console.log('7. Seeding Athletes across 5 Clubs...');
  const sampleAthletes = [
    { name: 'Alex Rivera', clubCode: 'MAV' },
    { name: 'David Miller', clubCode: 'MAV' },
    { name: 'Kenji Sato', clubCode: 'MAV' },
    { name: 'Leo Vance', clubCode: 'DOM' },
    { name: 'Samira Khan', clubCode: 'DOM' },
    { name: 'Ethan Hunt', clubCode: 'ALP' },
    { name: 'Priya Sharma', clubCode: 'ALP' },
    { name: 'Carlos Vega', clubCode: 'RYL' },
    { name: 'Maya Patel', clubCode: 'RYL' },
    { name: 'Zane Malik', clubCode: 'CRW' },
  ];

  const players: any[] = [];
  let regNum = 101;
  for (const a of sampleAthletes) {
    const club = clubs.find((c) => c.code === a.clubCode);
    const regId = `REG-${a.clubCode}-${regNum++}`;
    const p = await db.player.upsert({
      where: { registrationId: regId },
      update: { name: a.name, clubId: club.id },
      create: {
        registrationId: regId,
        name: a.name,
        email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@housechampionship.com`,
        clubId: club.id,
        teamName: club.name,
        status: 'APPROVED',
      },
    });
    players.push({ ...p, clubCode: a.clubCode });
  }

  console.log('8. Seeding Initial Matches & Fixtures...');
  const bgmi = sports.find((s) => s.name === 'BGMI');
  const esportsVenue = venues.find((v) => v.name === 'Esports Center');

  // Match: M-BGMI-01 with multi-club squad
  const mBgmi = await db.match.upsert({
    where: { matchCode: 'M-BGMI-01' },
    update: {},
    create: {
      matchCode: 'M-BGMI-01',
      sportId: bgmi.id,
      round: 'Grand Finals - Erangel',
      stageName: 'Championship Finals',
      matchDate: '2026-11-26',
      matchTime: '15:00',
      venueId: esportsVenue?.id,
      status: 'SCHEDULED',
      notes: 'Squad 1 features mixed club athletes (2 Mavericks, 1 Dominator, 1 Alpha).',
    },
  });

  // Assign referee Marcus
  await db.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: mBgmi.id, refereeId: referees[0].id } },
    update: {},
    create: { matchId: mBgmi.id, refereeId: referees[0].id },
  });

  // Squad 1 participant
  const squad1 = await db.matchParticipant.upsert({
    where: { id: `part-bgmi-sq1-${mBgmi.id}` },
    update: {},
    create: {
      id: `part-bgmi-sq1-${mBgmi.id}`,
      matchId: mBgmi.id,
      teamName: 'Squad Titans',
      score: 100,
      rank: 1,
      isWinner: true,
    },
  });

  // Link 4 athletes: 2 Mavericks, 1 Dominator, 1 Alpha
  const mavPlayers = players.filter((p) => p.clubCode === 'MAV').slice(0, 2);
  const domPlayer = players.find((p) => p.clubCode === 'DOM');
  const alpPlayer = players.find((p) => p.clubCode === 'ALP');

  const squadPlayers = [
    ...mavPlayers.map((p) => ({ playerId: p.id, clubId: clubs.find((c) => c.code === 'MAV').id })),
    { playerId: domPlayer.id, clubId: clubs.find((c) => c.code === 'DOM').id },
    { playerId: alpPlayer.id, clubId: clubs.find((c) => c.code === 'ALP').id },
  ];

  for (const sp of squadPlayers) {
    await db.matchParticipantPlayer.upsert({
      where: { participantId_playerId: { participantId: squad1.id, playerId: sp.playerId } },
      update: { clubId: sp.clubId },
      create: {
        participantId: squad1.id,
        playerId: sp.playerId,
        clubId: sp.clubId,
      },
    });
  }

  // Match: M-TH-01 (Treasure Hunt Campus Clue Quest)
  const treasureHunt = sports.find((s) => s.name === 'Treasure Hunt');
  const mainVenue = venues.find((v) => v.name === 'Olympic Grand Arena');

  if (treasureHunt) {
    const mTH = await db.match.upsert({
      where: { matchCode: 'M-TH-01' },
      update: {},
      create: {
        matchCode: 'M-TH-01',
        sportId: treasureHunt.id,
        round: 'Campus Finals - Clue Quest',
        stageName: 'Championship Finals',
        matchDate: '2026-11-27',
        matchTime: '10:00',
        venueId: mainVenue?.id,
        status: 'SCHEDULED',
        notes: 'Campus-wide multi-clue adventure quest. House squads race across checkpoints to unlock the vault.',
      },
    });

    // Assign referee David Okafor
    await db.matchReferee.upsert({
      where: { matchId_refereeId: { matchId: mTH.id, refereeId: referees[2].id } },
      update: {},
      create: { matchId: mTH.id, refereeId: referees[2].id },
    });

    // Seed 5 participating house squads
    for (let i = 0; i < clubs.length; i++) {
      const c = clubs[i];
      await db.matchParticipant.upsert({
        where: { id: `part-th-sq${i + 1}-${mTH.id}` },
        update: {},
        create: {
          id: `part-th-sq${i + 1}-${mTH.id}`,
          matchId: mTH.id,
          clubId: c.id,
          teamName: `${c.name} Questers`,
          score: 0,
        },
      });
    }
  }

  // Tournament settings
  await db.tournamentSetting.upsert({
    where: { key: 'CHAMPIONSHIP_STATUS' },
    update: {},
    create: { key: 'CHAMPIONSHIP_STATUS', value: 'ACTIVE', description: 'Championship status' },
  });

  await db.tournamentSetting.upsert({
    where: { key: 'CURRENT_ROTATION_INDEX' },
    update: {},
    create: { key: 'CURRENT_ROTATION_INDEX', value: '0', description: 'Deterministic remainder rotation' },
  });

  console.log('MongoDB House Championship Seeding completed successfully!');
}

