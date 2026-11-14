const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tournament database...');

  // 1. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Complete system and user administration' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Tournament operator and manager' },
  });

  const refereeRole = await prisma.role.upsert({
    where: { name: 'REFEREE' },
    update: {},
    create: { name: 'REFEREE', description: 'Field official for assigned sports and matches' },
  });

  // Common password hash for test accounts
  const adminPassword = await bcrypt.hash('admin123', 10);
  const refereePassword = await bcrypt.hash('referee123', 10);

  // 2. Tournament Settings
  const settings = [
    { key: 'TOURNAMENT_NAME', value: 'Inter-Club Championship 2026', description: 'Official tournament name' },
    { key: 'TOURNAMENT_DATES', value: '25th - 28th November 2026', description: 'Tournament operational dates' },
    { key: 'POINTS_TIE_BREAKER', value: 'HEAD_TO_HEAD_THEN_SCORE_DIFF', description: 'Tie breaker policy' },
    { key: 'AUTO_APPROVE_RESULTS', value: 'FALSE', description: 'Whether referee submissions need admin approval' },
    { key: 'REGISTRATION_DEADLINE', value: '2026-11-24T23:59:59', description: 'Registration cutoff' },
  ];

  for (const s of settings) {
    await prisma.tournamentSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 3. Venues
  const venuesData = [
    { name: 'Grand Stadium Pitch A', location: 'North Wing Complex', capacity: 2500 },
    { name: 'Olympic Indoor Arena Court 1', location: 'Indoor Complex B', capacity: 800 },
    { name: 'Olympic Indoor Arena Court 2', location: 'Indoor Complex B', capacity: 600 },
    { name: 'South Sportsplex Basketball Dome', location: 'South Wing Complex', capacity: 1200 },
    { name: 'Turf Ground 2', location: 'Recreation Ground', capacity: 500 },
  ];

  const venues = [];
  for (const v of venuesData) {
    const venue = await prisma.venue.upsert({
      where: { name: v.name },
      update: {},
      create: v,
    });
    venues.push(venue);
  }

  // 4. Clubs
  const clubsData = [
    {
      name: 'Apex Predators',
      code: 'APX',
      logoUrl: 'APX',
      captainName: 'Alex Rivera',
      viceCaptainName: 'David Miller',
      totalPoints: 48,
      currentRank: 1,
    },
    {
      name: 'Titan Warriors',
      code: 'TTN',
      logoUrl: 'TTN',
      captainName: 'Leo Vance',
      viceCaptainName: 'Samira Khan',
      totalPoints: 37,
      currentRank: 2,
    },
    {
      name: 'Velocity Strikers',
      code: 'VLS',
      logoUrl: 'VLS',
      captainName: 'Ethan Hunt',
      viceCaptainName: 'Priya Sharma',
      totalPoints: 26,
      currentRank: 3,
    },
    {
      name: 'Phoenix Hawks',
      code: 'PHX',
      logoUrl: 'PHX',
      captainName: 'Carlos Vega',
      viceCaptainName: 'Maya Patel',
      totalPoints: 18,
      currentRank: 4,
    },
  ];

  const clubs = [];
  for (const c of clubsData) {
    const club = await prisma.club.upsert({
      where: { code: c.code },
      update: { logoUrl: c.logoUrl, totalPoints: c.totalPoints, currentRank: c.currentRank },
      create: c,
    });
    clubs.push(club);
  }

  // 5. Sports
  const sportsData = [
    {
      name: 'Football',
      category: 'OutDoor',
      icon: 'football',
      sportType: 'TEAM',
      genderCategory: 'OPEN',
      maxParticipants: 11,
      tournamentFormat: 'LEAGUE',
      numRounds: 3,
      scoringConfig: JSON.stringify({ win: 3, draw: 1, loss: 0, bonus: 0 }),
      pointsDistribution: JSON.stringify({ first: 30, second: 20, third: 10, fourth: 5 }),
    },
    {
      name: 'Cricket (T10)',
      category: 'OutDoor',
      icon: 'cricket',
      sportType: 'TEAM',
      genderCategory: 'OPEN',
      maxParticipants: 11,
      tournamentFormat: 'LEAGUE',
      numRounds: 3,
      scoringConfig: JSON.stringify({ win: 4, draw: 2, loss: 0, bonus: 1 }),
      pointsDistribution: JSON.stringify({ first: 30, second: 20, third: 10, fourth: 5 }),
    },
    {
      name: 'Badminton Doubles',
      category: 'Racquet',
      icon: 'badminton',
      sportType: 'DOUBLES',
      genderCategory: 'MIXED',
      maxParticipants: 2,
      tournamentFormat: 'KNOCKOUT',
      numRounds: 3,
      scoringConfig: JSON.stringify({ win: 2, draw: 0, loss: 0, bonus: 0 }),
      pointsDistribution: JSON.stringify({ first: 20, second: 12, third: 6, fourth: 2 }),
    },
    {
      name: 'Table Tennis Singles',
      category: 'Indoor',
      icon: 'table-tennis',
      sportType: 'INDIVIDUAL',
      genderCategory: 'OPEN',
      maxParticipants: 1,
      tournamentFormat: 'KNOCKOUT',
      numRounds: 4,
      scoringConfig: JSON.stringify({ win: 2, draw: 0, loss: 0, bonus: 0 }),
      pointsDistribution: JSON.stringify({ first: 15, second: 10, third: 5, fourth: 2 }),
    },
    {
      name: 'Basketball',
      category: 'Indoor',
      icon: 'basketball',
      sportType: 'TEAM',
      genderCategory: 'OPEN',
      maxParticipants: 5,
      tournamentFormat: 'GROUP_STAGE',
      numRounds: 3,
      scoringConfig: JSON.stringify({ win: 3, draw: 0, loss: 0, bonus: 0 }),
      pointsDistribution: JSON.stringify({ first: 25, second: 15, third: 8, fourth: 4 }),
    },
  ];

  const sports = [];
  for (const s of sportsData) {
    const sport = await prisma.sport.upsert({
      where: { name: s.name },
      update: { icon: s.icon },
      create: s,
    });
    sports.push(sport);
  }

  // 6. Admin Users
  await prisma.user.upsert({
    where: { email: 'admin@sportsportal.com' },
    update: {},
    create: {
      email: 'admin@sportsportal.com',
      passwordHash: adminPassword,
      name: 'Tournament Director',
      roleId: superAdminRole.id,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@sportsportal.com' },
    update: {},
    create: {
      email: 'manager@sportsportal.com',
      passwordHash: adminPassword,
      name: 'Tournament Operations Admin',
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  // 7. Referees & Referee Users
  const refereesData = [
    {
      refereeCode: 'REF-001',
      name: 'Marcus Sterling',
      email: 'ref.marcus@sportsportal.com',
      phone: '+1 555-0192',
      sportIndexes: [0, 1], // Football & Cricket
    },
    {
      refereeCode: 'REF-002',
      name: 'Sarah Jenkins',
      email: 'ref.sarah@sportsportal.com',
      phone: '+1 555-0193',
      sportIndexes: [2, 3], // Badminton & Table Tennis
    },
    {
      refereeCode: 'REF-003',
      name: 'David Okafor',
      email: 'ref.david@sportsportal.com',
      phone: '+1 555-0194',
      sportIndexes: [4, 0], // Basketball & Football
    },
  ];

  const referees = [];
  for (const r of refereesData) {
    const ref = await prisma.referee.upsert({
      where: { email: r.email },
      update: {},
      create: {
        refereeCode: r.refereeCode,
        name: r.name,
        email: r.email,
        phone: r.phone,
        availability: 'AVAILABLE',
        status: 'ACTIVE',
      },
    });

    // Create user account for referee
    await prisma.user.upsert({
      where: { email: r.email },
      update: { refereeId: ref.id },
      create: {
        email: r.email,
        passwordHash: refereePassword,
        name: r.name,
        roleId: refereeRole.id,
        refereeId: ref.id,
        status: 'ACTIVE',
      },
    });

    // Assign sports
    for (const sIdx of r.sportIndexes) {
      await prisma.refereeSport.upsert({
        where: { refereeId_sportId: { refereeId: ref.id, sportId: sports[sIdx].id } },
        update: {},
        create: { refereeId: ref.id, sportId: sports[sIdx].id },
      });
    }

    referees.push(ref);
  }

  // 8. Players
  const playersData = [
    // Apex Predators (Club 0)
    { regId: 'REG-APX-01', name: 'Alex Rivera', email: 'alex.rivera@example.com', clubIdx: 0, sports: [0, 4] },
    { regId: 'REG-APX-02', name: 'David Miller', email: 'david.miller@example.com', clubIdx: 0, sports: [0, 1] },
    { regId: 'REG-APX-03', name: 'Jordan Hayes', email: 'jordan.hayes@example.com', clubIdx: 0, sports: [2, 3] },
    { regId: 'REG-APX-04', name: 'Elena Rostova', email: 'elena.r@example.com', clubIdx: 0, sports: [2, 3] },
    { regId: 'REG-APX-05', name: 'Liam Murphy', email: 'liam.m@example.com', clubIdx: 0, sports: [1, 4] },
    { regId: 'REG-APX-06', name: 'Kenji Sato', email: 'kenji.sato@example.com', clubIdx: 0, sports: [0] },
    // Titan Warriors (Club 1)
    { regId: 'REG-TTN-01', name: 'Leo Vance', email: 'leo.vance@example.com', clubIdx: 1, sports: [0, 4] },
    { regId: 'REG-TTN-02', name: 'Samira Khan', email: 'samira.khan@example.com', clubIdx: 1, sports: [2, 3] },
    { regId: 'REG-TTN-03', name: 'Tariq Al-Mansoor', email: 'tariq.m@example.com', clubIdx: 1, sports: [0, 1] },
    { regId: 'REG-TTN-04', name: 'Chloe Dubois', email: 'chloe.d@example.com', clubIdx: 1, sports: [2] },
    { regId: 'REG-TTN-05', name: 'Lucas Rossi', email: 'lucas.rossi@example.com', clubIdx: 1, sports: [1, 4] },
    { regId: 'REG-TTN-06', name: 'Dev Patel', email: 'dev.patel@example.com', clubIdx: 1, sports: [3] },
    // Velocity Strikers (Club 2)
    { regId: 'REG-VLS-01', name: 'Ethan Hunt', email: 'ethan.hunt@example.com', clubIdx: 2, sports: [0, 1] },
    { regId: 'REG-VLS-02', name: 'Priya Sharma', email: 'priya.sharma@example.com', clubIdx: 2, sports: [2, 3] },
    { regId: 'REG-VLS-03', name: 'Mason Clark', email: 'mason.clark@example.com', clubIdx: 2, sports: [0, 4] },
    { regId: 'REG-VLS-04', name: 'Zoe Schmidt', email: 'zoe.schmidt@example.com', clubIdx: 2, sports: [2, 3] },
    { regId: 'REG-VLS-05', name: 'Aaron Brooks', email: 'aaron.b@example.com', clubIdx: 2, sports: [4] },
    // Phoenix Hawks (Club 3)
    { regId: 'REG-PHX-01', name: 'Carlos Vega', email: 'carlos.vega@example.com', clubIdx: 3, sports: [0, 4] },
    { regId: 'REG-PHX-02', name: 'Maya Patel', email: 'maya.patel@example.com', clubIdx: 3, sports: [2, 3] },
    { regId: 'REG-PHX-03', name: 'Victor Gomez', email: 'victor.g@example.com', clubIdx: 3, sports: [1, 0] },
    { regId: 'REG-PHX-04', name: 'Aisha Bello', email: 'aisha.b@example.com', clubIdx: 3, sports: [3] },
    { regId: 'REG-PHX-05', name: 'Felix Nguyen', email: 'felix.n@example.com', clubIdx: 3, sports: [4, 1] },
  ];

  const createdPlayers = [];
  for (const p of playersData) {
    const player = await prisma.player.upsert({
      where: { registrationId: p.regId },
      update: {},
      create: {
        registrationId: p.regId,
        name: p.name,
        email: p.email,
        phone: '+1 555-' + Math.floor(1000 + Math.random() * 9000),
        gender: p.sports.includes(2) ? 'FEMALE' : 'MALE',
        age: 20 + Math.floor(Math.random() * 8),
        clubId: clubs[p.clubIdx].id,
        teamName: clubs[p.clubIdx].name + ' Squad',
        status: 'APPROVED',
        paymentStatus: 'PAID',
      },
    });

    for (const sIdx of p.sports) {
      await prisma.playerSport.upsert({
        where: { playerId_sportId: { playerId: player.id, sportId: sports[sIdx].id } },
        update: {},
        create: { playerId: player.id, sportId: sports[sIdx].id },
      });
    }

    createdPlayers.push(player);
  }

  // 9. Matches (Tournament: 25th - 28th Nov 2026)
  // Match 1: Completed Football Match (Apex vs Titan)
  const match1 = await prisma.match.upsert({
    where: { matchCode: 'M-FB-01' },
    update: {},
    create: {
      matchCode: 'M-FB-01',
      sportId: sports[0].id, // Football
      round: 'League Match 1',
      stageName: 'Group Stage',
      matchDate: '2026-11-25',
      matchTime: '09:30',
      venueId: venues[0].id,
      status: 'COMPLETED',
      notes: 'High intensity match, no cards issued.',
    },
  });

  const m1_p1 = await prisma.matchParticipant.create({
    data: {
      matchId: match1.id,
      clubId: clubs[0].id, // Apex
      score: 3,
      scoreDetail: JSON.stringify({ goals: ['12 Alex Rivera', '44 David Miller', '78 Kenji Sato'] }),
      isWinner: true,
      rank: 1,
    },
  });

  const m1_p2 = await prisma.matchParticipant.create({
    data: {
      matchId: match1.id,
      clubId: clubs[1].id, // Titan
      score: 1,
      scoreDetail: JSON.stringify({ goals: ['55 Leo Vance'] }),
      isWinner: false,
      rank: 2,
    },
  });

  await prisma.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: match1.id, refereeId: referees[0].id } },
    update: {},
    create: { matchId: match1.id, refereeId: referees[0].id },
  });

  await prisma.matchResult.create({
    data: {
      matchId: match1.id,
      submittedByRefereeId: referees[0].id,
      winnerClubId: clubs[0].id,
      winnerParticipantId: m1_p1.id,
      scoresSummary: 'Apex Predators 3 - 1 Titan Warriors',
      refereeNotes: 'Fair match, verified by both team captains.',
      status: 'APPROVED',
      approvedAt: new Date('2026-11-25T11:45:00Z'),
    },
  });

  // Points history for match 1
  await prisma.pointsHistory.create({
    data: {
      clubId: clubs[0].id,
      sportId: sports[0].id,
      matchId: match1.id,
      points: 3,
      reason: 'Football League Win vs Titan Warriors',
      recordedAt: new Date('2026-11-25T11:45:00Z'),
    },
  });

  // Match 2: Badminton Doubles Completed (Velocity vs Phoenix)
  const match2 = await prisma.match.upsert({
    where: { matchCode: 'M-BD-01' },
    update: {},
    create: {
      matchCode: 'M-BD-01',
      sportId: sports[2].id, // Badminton
      round: 'Quarterfinal 1',
      stageName: 'Knockout',
      matchDate: '2026-11-25',
      matchTime: '11:00',
      venueId: venues[1].id,
      status: 'COMPLETED',
      notes: '3 set thriller',
    },
  });

  const m2_p1 = await prisma.matchParticipant.create({
    data: {
      matchId: match2.id,
      clubId: clubs[2].id, // Velocity
      teamName: 'Priya Sharma & Zoe Schmidt',
      score: 2,
      scoreDetail: JSON.stringify({ sets: ['21-18', '19-21', '21-15'] }),
      isWinner: true,
      rank: 1,
    },
  });

  const m2_p2 = await prisma.matchParticipant.create({
    data: {
      matchId: match2.id,
      clubId: clubs[3].id, // Phoenix
      teamName: 'Maya Patel & Aisha Bello',
      score: 1,
      scoreDetail: JSON.stringify({ sets: ['18-21', '21-19', '15-21'] }),
      isWinner: false,
      rank: 2,
    },
  });

  await prisma.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: match2.id, refereeId: referees[1].id } },
    update: {},
    create: { matchId: match2.id, refereeId: referees[1].id },
  });

  await prisma.matchResult.create({
    data: {
      matchId: match2.id,
      submittedByRefereeId: referees[1].id,
      winnerClubId: clubs[2].id,
      winnerParticipantId: m2_p1.id,
      scoresSummary: 'Velocity Strikers (2) - Phoenix Hawks (1) [21-18, 19-21, 21-15]',
      refereeNotes: 'Clean sets, no line call issues.',
      status: 'APPROVED',
      approvedAt: new Date('2026-11-25T12:30:00Z'),
    },
  });

  // Points history for match 2
  await prisma.pointsHistory.create({
    data: {
      clubId: clubs[2].id,
      sportId: sports[2].id,
      matchId: match2.id,
      points: 2,
      reason: 'Badminton Doubles QF Win vs Phoenix Hawks',
      recordedAt: new Date('2026-11-25T12:30:00Z'),
    },
  });

  // Match 3: Basketball (Awaiting Result / In Progress)
  const match3 = await prisma.match.upsert({
    where: { matchCode: 'M-BB-01' },
    update: {},
    create: {
      matchCode: 'M-BB-01',
      sportId: sports[4].id, // Basketball
      round: 'Group Stage Round 1',
      stageName: 'Court Alpha',
      matchDate: '2026-11-26',
      matchTime: '14:00',
      venueId: venues[3].id,
      status: 'IN_PROGRESS',
      notes: 'Currently in 3rd Quarter',
    },
  });

  await prisma.matchParticipant.create({
    data: {
      matchId: match3.id,
      clubId: clubs[0].id, // Apex
      score: 54,
      scoreDetail: JSON.stringify({ q1: 18, q2: 20, q3: 16 }),
      isWinner: false,
    },
  });

  await prisma.matchParticipant.create({
    data: {
      matchId: match3.id,
      clubId: clubs[3].id, // Phoenix
      score: 49,
      scoreDetail: JSON.stringify({ q1: 15, q2: 17, q3: 17 }),
      isWinner: false,
    },
  });

  await prisma.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: match3.id, refereeId: referees[2].id } },
    update: {},
    create: { matchId: match3.id, refereeId: referees[2].id },
  });

  // Match 4: Table Tennis Singles (Pending Result Approval - Referee submitted)
  const match4 = await prisma.match.upsert({
    where: { matchCode: 'M-TT-01' },
    update: {},
    create: {
      matchCode: 'M-TT-01',
      sportId: sports[3].id, // Table Tennis
      round: 'Quarterfinal 2',
      stageName: 'Singles Knockout',
      matchDate: '2026-11-26',
      matchTime: '15:30',
      venueId: venues[2].id,
      status: 'SUBMITTED',
      notes: 'Result submitted by referee Sarah Jenkins, awaiting admin approval',
    },
  });

  const m4_p1 = await prisma.matchParticipant.create({
    data: {
      matchId: match4.id,
      clubId: clubs[1].id, // Titan
      playerId: createdPlayers.find(p => p.name === 'Dev Patel')?.id,
      score: 3,
      scoreDetail: JSON.stringify({ games: ['11-9', '8-11', '11-7', '11-6'] }),
      isWinner: true,
      rank: 1,
    },
  });

  const m4_p2 = await prisma.matchParticipant.create({
    data: {
      matchId: match4.id,
      clubId: clubs[0].id, // Apex
      playerId: createdPlayers.find(p => p.name === 'Elena Rostova')?.id,
      score: 1,
      scoreDetail: JSON.stringify({ games: ['9-11', '11-8', '7-11', '6-11'] }),
      isWinner: false,
      rank: 2,
    },
  });

  await prisma.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: match4.id, refereeId: referees[1].id } },
    update: {},
    create: { matchId: match4.id, refereeId: referees[1].id },
  });

  await prisma.matchResult.create({
    data: {
      matchId: match4.id,
      submittedByRefereeId: referees[1].id,
      winnerClubId: clubs[1].id,
      winnerParticipantId: m4_p1.id,
      scoresSummary: 'Dev Patel (Titan Warriors) 3 - 1 Elena Rostova (Apex Predators)',
      refereeNotes: 'Fast paced rallies. Match completed in 32 minutes.',
      status: 'PENDING_APPROVAL',
    },
  });

  // Match 5 & 6: Upcoming Matches
  const match5 = await prisma.match.upsert({
    where: { matchCode: 'M-CR-01' },
    update: {},
    create: {
      matchCode: 'M-CR-01',
      sportId: sports[1].id, // Cricket
      round: 'League Match 1',
      stageName: 'Group Stage',
      matchDate: '2026-11-27',
      matchTime: '10:00',
      venueId: venues[0].id,
      status: 'UPCOMING',
      notes: '10 overs per side',
    },
  });

  await prisma.matchParticipant.create({
    data: {
      matchId: match5.id,
      clubId: clubs[0].id, // Apex
      score: 0,
      isWinner: false,
    },
  });

  await prisma.matchParticipant.create({
    data: {
      matchId: match5.id,
      clubId: clubs[2].id, // Velocity
      score: 0,
      isWinner: false,
    },
  });

  await prisma.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: match5.id, refereeId: referees[0].id } },
    update: {},
    create: { matchId: match5.id, refereeId: referees[0].id },
  });

  const match6 = await prisma.match.upsert({
    where: { matchCode: 'M-FB-02' },
    update: {},
    create: {
      matchCode: 'M-FB-02',
      sportId: sports[0].id, // Football
      round: 'League Match 2',
      stageName: 'Group Stage',
      matchDate: '2026-11-28',
      matchTime: '16:00',
      venueId: venues[0].id,
      status: 'SCHEDULED',
      notes: 'Championship Decider',
    },
  });

  await prisma.matchParticipant.create({
    data: { matchId: match6.id, clubId: clubs[1].id, score: 0 },
  });
  await prisma.matchParticipant.create({
    data: { matchId: match6.id, clubId: clubs[3].id, score: 0 },
  });
  await prisma.matchReferee.upsert({
    where: { matchId_refereeId: { matchId: match6.id, refereeId: referees[0].id } },
    update: {},
    create: { matchId: match6.id, refereeId: referees[0].id },
  });

  // 10. Overall Leaderboard Entries
  const overallStandings = [
    { clubId: clubs[0].id, rank: 1, played: 3, won: 2, drawn: 1, lost: 0, points: 48, scoreDiff: 8, gold: 2, silver: 1, bronze: 0 },
    { clubId: clubs[1].id, rank: 2, played: 3, won: 2, drawn: 0, lost: 1, points: 37, scoreDiff: 4, gold: 1, silver: 2, bronze: 1 },
    { clubId: clubs[2].id, rank: 3, played: 2, won: 1, drawn: 0, lost: 1, points: 26, scoreDiff: 1, gold: 1, silver: 0, bronze: 1 },
    { clubId: clubs[3].id, rank: 4, played: 2, won: 0, drawn: 1, lost: 1, points: 18, scoreDiff: -3, gold: 0, silver: 1, bronze: 2 },
  ];

  for (const os of overallStandings) {
    await prisma.leaderboardEntry.upsert({
      where: { clubId_sportId: { clubId: os.clubId, sportId: 'OVERALL' } },
      update: {
        rank: os.rank,
        played: os.played,
        won: os.won,
        drawn: os.drawn,
        lost: os.lost,
        points: os.points,
        scoreDifference: os.scoreDiff,
        gold: os.gold,
        silver: os.silver,
        bronze: os.bronze,
      },
      create: {
        clubId: os.clubId,
        sportId: 'OVERALL',
        rank: os.rank,
        played: os.played,
        won: os.won,
        drawn: os.drawn,
        lost: os.lost,
        points: os.points,
        scoreDifference: os.scoreDiff,
        gold: os.gold,
        silver: os.silver,
        bronze: os.bronze,
      },
    });
  }

  // Sport-specific leaderboard entries for Football
  const fbStandings = [
    { clubId: clubs[0].id, rank: 1, played: 1, won: 1, drawn: 0, lost: 0, points: 3, scoreDiff: 2 },
    { clubId: clubs[1].id, rank: 2, played: 1, won: 0, drawn: 0, lost: 1, points: 0, scoreDiff: -2 },
    { clubId: clubs[2].id, rank: 3, played: 0, won: 0, drawn: 0, lost: 0, points: 0, scoreDiff: 0 },
    { clubId: clubs[3].id, rank: 4, played: 0, won: 0, drawn: 0, lost: 0, points: 0, scoreDiff: 0 },
  ];

  for (const fbs of fbStandings) {
    await prisma.leaderboardEntry.upsert({
      where: { clubId_sportId: { clubId: fbs.clubId, sportId: sports[0].id } },
      update: {
        rank: fbs.rank,
        played: fbs.played,
        won: fbs.won,
        drawn: fbs.drawn,
        lost: fbs.lost,
        points: fbs.points,
        scoreDifference: fbs.scoreDiff,
      },
      create: {
        clubId: fbs.clubId,
        sportId: sports[0].id,
        rank: fbs.rank,
        played: fbs.played,
        won: fbs.won,
        drawn: fbs.drawn,
        lost: fbs.lost,
        points: fbs.points,
        scoreDifference: fbs.scoreDiff,
      },
    });
  }

  // 11. Google Integration & Registrations
  const googleIntegration = await prisma.googleIntegration.upsert({
    where: { sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
    update: {},
    create: {
      sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      sheetName: 'Form Responses 1',
      range: 'A2:H100',
      fieldMapping: JSON.stringify({
        fullName: 'Full Name',
        email: 'Email Address',
        phone: 'Contact Number',
        gender: 'Gender',
        age: 'Age',
        clubPreference: 'Club Preference',
        sportsSelected: 'Sport(s) Selected',
        teamName: 'Team or Partner Name',
      }),
      autoSyncEnabled: true,
      syncIntervalMinutes: 15,
      lastSyncAt: new Date(),
      status: 'CONFIGURED',
    },
  });

  // Sample Registrations
  const sampleRegistrations = [
    {
      submissionId: 'GF-SUB-1001',
      fullName: 'Marcus Vance Jr.',
      email: 'm.vance@example.org',
      phone: '+1 555-8812',
      gender: 'MALE',
      age: 22,
      clubPreference: 'Titan Warriors',
      sportsSelected: 'Football, Basketball',
      teamName: 'Titan Strikers',
      source: 'GOOGLE_SHEETS',
      status: 'APPROVED',
      rawData: JSON.stringify({
        Timestamp: '2026-11-12 14:22:01',
        'Full Name': 'Marcus Vance Jr.',
        'Email Address': 'm.vance@example.org',
        'Contact Number': '+1 555-8812',
        Gender: 'MALE',
        Age: '22',
        'Club Preference': 'Titan Warriors',
        'Sport(s) Selected': 'Football, Basketball',
      }),
    },
    {
      submissionId: 'GF-SUB-1002',
      fullName: 'Alicia Keys-Stone',
      email: 'alicia.stone@example.org',
      phone: '+1 555-8819',
      gender: 'FEMALE',
      age: 21,
      clubPreference: 'Apex Predators',
      sportsSelected: 'Badminton Doubles, Table Tennis Singles',
      teamName: 'Apex Duo',
      source: 'GOOGLE_SHEETS',
      status: 'PENDING',
      rawData: JSON.stringify({
        Timestamp: '2026-11-13 09:15:30',
        'Full Name': 'Alicia Keys-Stone',
        'Email Address': 'alicia.stone@example.org',
        'Contact Number': '+1 555-8819',
        Gender: 'FEMALE',
        Age: '21',
        'Club Preference': 'Apex Predators',
        'Sport(s) Selected': 'Badminton Doubles, Table Tennis Singles',
      }),
    },
    {
      submissionId: 'GF-SUB-1003',
      fullName: 'Devin Cole',
      email: 'devin.cole@example.org',
      phone: '+1 555-3341',
      gender: 'MALE',
      age: 24,
      clubPreference: 'Phoenix Hawks',
      sportsSelected: 'Cricket (T10)',
      source: 'GOOGLE_SHEETS',
      status: 'PENDING',
      rawData: JSON.stringify({
        Timestamp: '2026-11-13 10:45:12',
        'Full Name': 'Devin Cole',
        'Email Address': 'devin.cole@example.org',
        'Contact Number': '+1 555-3341',
        Gender: 'MALE',
        Age: '24',
        'Club Preference': 'Phoenix Hawks',
        'Sport(s) Selected': 'Cricket (T10)',
      }),
    },
    {
      submissionId: 'GF-SUB-1004',
      fullName: 'Alicia Keys-Stone',
      email: 'alicia.stone@example.org',
      phone: '+1 555-8819',
      gender: 'FEMALE',
      age: 21,
      clubPreference: 'Apex Predators',
      sportsSelected: 'Badminton Doubles',
      source: 'GOOGLE_SHEETS',
      status: 'DUPLICATE',
      duplicateOfId: 'GF-SUB-1002',
      rawData: JSON.stringify({
        Timestamp: '2026-11-13 11:02:14',
        'Full Name': 'Alicia Keys-Stone',
        'Email Address': 'alicia.stone@example.org',
      }),
    },
  ];

  for (const reg of sampleRegistrations) {
    await prisma.registration.upsert({
      where: { submissionId: reg.submissionId },
      update: {},
      create: reg,
    });
  }

  // Sync log
  await prisma.synchronizationLog.create({
    data: {
      integrationId: googleIntegration.id,
      syncType: 'GOOGLE_SHEETS',
      totalFound: 4,
      importedCount: 3,
      duplicateCount: 1,
      failedCount: 0,
      status: 'SUCCESS',
      logDetails: JSON.stringify({
        message: 'Synchronized with Google Forms Responses sheet successfully',
        timestamp: new Date().toISOString(),
      }),
    },
  });

  // 12. Notifications
  const notificationsData = [
    {
      recipientRole: 'ADMIN',
      title: 'Match Result Awaiting Approval',
      message: 'Referee Sarah Jenkins submitted scores for M-TT-01 (Table Tennis QF). Please review.',
      type: 'RESULT_SUBMITTED',
      link: '/admin/matches/M-TT-01',
    },
    {
      recipientRole: 'ADMIN',
      title: 'New Google Forms Registrations',
      message: '3 new registrations synchronized from linked Google Spreadsheet.',
      type: 'REGISTRATION',
      link: '/admin/registrations',
    },
    {
      recipientRole: 'REFEREE',
      title: 'Match Assignment',
      message: 'You have been assigned to referee match M-CR-01 (Cricket T10) on 27th Nov at 10:00.',
      type: 'ASSIGNMENT',
      link: '/referee/matches',
    },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // 13. Audit Logs
  const auditLogsData = [
    {
      userName: 'Tournament Director',
      role: 'SUPER_ADMIN',
      action: 'APPROVE_RESULT',
      entity: 'Match',
      recordId: match1.id,
      previousValue: JSON.stringify({ status: 'SUBMITTED' }),
      updatedValue: JSON.stringify({ status: 'COMPLETED', winner: 'Apex Predators' }),
    },
    {
      userName: 'Sarah Jenkins',
      role: 'REFEREE',
      action: 'SUBMIT_RESULT',
      entity: 'Match',
      recordId: match4.id,
      previousValue: JSON.stringify({ status: 'IN_PROGRESS' }),
      updatedValue: JSON.stringify({ status: 'SUBMITTED', winner: 'Titan Warriors' }),
    },
  ];

  for (const a of auditLogsData) {
    await prisma.auditLog.create({ data: a });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
