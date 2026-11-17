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
    { name: 'Blue', code: 'MAV', logoUrl: '/clubs/mavericks.png', captainName: 'Affan', viceCaptainName: 'Irfan' },
    { name: 'Red', code: 'DOM', logoUrl: '/clubs/dominator.png', captainName: 'Aquib Hingwala', viceCaptainName: 'Ubaid' },
    { name: 'Green', code: 'ALP', logoUrl: '/clubs/alpha.png', captainName: 'Piyush Pandey', viceCaptainName: 'Shams ali Shaikh' },
    { name: 'Purple', code: 'RYL', logoUrl: '/clubs/royal-force.png', captainName: 'Pravin', viceCaptainName: 'Zaid Acchwa' },
    { name: 'Yellow', code: 'CRW', logoUrl: '/clubs/crown-crushers.png', captainName: 'Taha Choudhary', viceCaptainName: 'Ali Mapri' },
  ];

  const clubs: any[] = [];
  for (const c of clubsData) {
    const club = await db.club.upsert({
      where: { code: c.code },
      update: { name: c.name, logoUrl: c.logoUrl, captainName: c.captainName, viceCaptainName: c.viceCaptainName },
      create: { ...c, totalPoints: 0.0, currentRank: 1 },
    });
    clubs.push(club);
  }

  console.log('3. Seeding 10 House Teams (2 per House)...');
  const houseTeamsMap: Record<string, { team1: string; team2: string }> = {
    Blue: { team1: 'Nex Blitz', team2: 'Royal Force' },
    Red: { team1: 'GenZ Warrior', team2: 'Crown Crusher' },
    Green: { team1: 'Dominators', team2: 'Rebel Royals' },
    Purple: { team1: 'Alpha Warriors', team2: 'Mavericks' },
    Yellow: { team1: 'Savage Strikers', team2: 'Storm Breakers' },
  };

  const cricketTeams: any[] = [];
  for (const c of clubs) {
    const mapping = houseTeamsMap[c.name] || { team1: `${c.name} A`, team2: `${c.name} B` };
    const teamA = await db.cricketTeam.upsert({
      where: { id: `crick-${c.code.toLowerCase()}-a` },
      update: { name: mapping.team1, clubId: c.id, captainName: c.captainName },
      create: { id: `crick-${c.code.toLowerCase()}-a`, name: mapping.team1, clubId: c.id, captainName: c.captainName },
    });
    const teamB = await db.cricketTeam.upsert({
      where: { id: `crick-${c.code.toLowerCase()}-b` },
      update: { name: mapping.team2, clubId: c.id, captainName: c.viceCaptainName },
      create: { id: `crick-${c.code.toLowerCase()}-b`, name: mapping.team2, clubId: c.id, captainName: c.viceCaptainName },
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
      maxParticipants: 4,
      allowsMixedClubs: false,
      pointsEntryMethod: 'POSITION',
      positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }),
      scoringConfig: JSON.stringify({ type: 'board_points', boards: 3, categories: ['Singles', 'Doubles', 'Mixed Doubles'] }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
      subCategories: ['Singles', 'Doubles', 'Mixed Doubles'],
    },
    {
      name: 'Badminton',
      category: 'Racquet',
      icon: 'Zap',
      sportType: 'INDIVIDUAL',
      maxParticipants: 4,
      allowsMixedClubs: false,
      pointsEntryMethod: 'BOTH',
      positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }),
      scoringConfig: JSON.stringify({ type: 'sets', setsToWin: 2, pointsPerSet: 21, categories: ['Singles', 'Doubles', 'Mixed Doubles'] }),
      pointsDistribution: JSON.stringify({ uniqueClubSplit: true }),
      subCategories: ['Singles', 'Doubles', 'Mixed Doubles'],
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

  console.log('7. Seeding 10 Official House Athletes (Captains & Vice Captains)...');
  const sampleAthletes = [
    { name: 'Affan', clubCode: 'MAV' },
    { name: 'Irfan', clubCode: 'MAV' },
    { name: 'Aquib Hingwala', clubCode: 'DOM' },
    { name: 'Ubaid', clubCode: 'DOM' },
    { name: 'Piyush Pandey', clubCode: 'ALP' },
    { name: 'Shams ali Shaikh', clubCode: 'ALP' },
    { name: 'Pravin', clubCode: 'RYL' },
    { name: 'Zaid Acchwa', clubCode: 'RYL' },
    { name: 'Taha Choudhary', clubCode: 'CRW' },
    { name: 'Ali Mapri', clubCode: 'CRW' },
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

  console.log('MongoDB House Championship Baseline Seeding completed successfully!');
}

