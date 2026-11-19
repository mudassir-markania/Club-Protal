const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore fallback
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/apexarena';

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB successfully.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Make sure MONGODB_URI in .env contains a valid MongoDB Atlas connection string or local MongoDB instance.');
    process.exit(1);
  }

  const { Schema } = mongoose;
  const opt = { timestamps: true };

  // Simple models for seeding
  const Role = mongoose.models.Role || mongoose.model('Role', new Schema({ _id: String, name: String, description: String }, opt));
  const User = mongoose.models.User || mongoose.model('User', new Schema({ _id: String, email: String, passwordHash: String, name: String, roleId: String, refereeId: String, status: String }, opt));
  const Club = mongoose.models.Club || mongoose.model('Club', new Schema({ _id: String, name: String, code: String, logoUrl: String, captainName: String, status: String, totalPoints: Number, currentRank: Number }, opt));
  const CricketTeam = mongoose.models.CricketTeam || mongoose.model('CricketTeam', new Schema({ _id: String, name: String, clubId: String, captainName: String, status: String }, opt));
  const Sport = mongoose.models.Sport || mongoose.model('Sport', new Schema({ _id: String, name: String, category: String, icon: String, sportType: String, maxParticipants: Number, allowsMixedClubs: Boolean, pointsEntryMethod: String, positionPoints: String, scoringConfig: String, pointsDistribution: String, status: String }, opt));
  const Referee = mongoose.models.Referee || mongoose.model('Referee', new Schema({ _id: String, refereeCode: String, name: String, email: String, phone: String, availability: String, status: String }, opt));
  const RefereeSport = mongoose.models.RefereeSport || mongoose.model('RefereeSport', new Schema({ _id: String, refereeId: String, sportId: String }, opt));
  const Venue = mongoose.models.Venue || mongoose.model('Venue', new Schema({ _id: String, name: String, location: String, capacity: Number, status: String }, opt));
  const Player = mongoose.models.Player || mongoose.model('Player', new Schema({ _id: String, registrationId: String, name: String, email: String, clubId: String, teamName: String, status: String }, opt));
  const Match = mongoose.models.Match || mongoose.model('Match', new Schema({ _id: String, matchCode: String, sportId: String, round: String, stageName: String, matchDate: String, matchTime: String, venueId: String, status: String, notes: String }, opt));
  const MatchParticipant = mongoose.models.MatchParticipant || mongoose.model('MatchParticipant', new Schema({ _id: String, matchId: String, clubId: String, cricketTeamId: String, teamName: String, score: Number, rank: Number, isWinner: Boolean }, opt));
  const MatchParticipantPlayer = mongoose.models.MatchParticipantPlayer || mongoose.model('MatchParticipantPlayer', new Schema({ _id: String, participantId: String, playerId: String, clubId: String }, opt));
  const MatchReferee = mongoose.models.MatchReferee || mongoose.model('MatchReferee', new Schema({ _id: String, matchId: String, refereeId: String }, opt));
  const TournamentSetting = mongoose.models.TournamentSetting || mongoose.model('TournamentSetting', new Schema({ _id: String, key: String, value: String, description: String }, opt));

  console.log('Seeding Roles...');
  const superAdminRole = await Role.findOneAndUpdate({ name: 'SUPER_ADMIN' }, { _id: 'role-super-admin', name: 'SUPER_ADMIN', description: 'Full control' }, { upsert: true, new: true });
  const adminRole = await Role.findOneAndUpdate({ name: 'ADMIN' }, { _id: 'role-admin', name: 'ADMIN', description: 'Championship management' }, { upsert: true, new: true });
  const refereeRole = await Role.findOneAndUpdate({ name: 'REFEREE' }, { _id: 'role-referee', name: 'REFEREE', description: 'Match officiating' }, { upsert: true, new: true });

  console.log('Seeding 5 Houses...');
  const clubsData = [
    { id: 'club-mav', name: 'Mavericks', code: 'MAV', logoUrl: '/clubs/mavericks.png', captainName: 'Alex Rivera' },
    { id: 'club-dom', name: 'Dominator', code: 'DOM', logoUrl: '/clubs/dominator.png', captainName: 'Leo Vance' },
    { id: 'club-alp', name: 'Alpha', code: 'ALP', logoUrl: '/clubs/alpha.png', captainName: 'Ethan Hunt' },
    { id: 'club-ryl', name: 'Royal Force', code: 'RYL', logoUrl: '/clubs/royal-force.png', captainName: 'Carlos Vega' },
    { id: 'club-crw', name: 'Crown Crushers', code: 'CRW', logoUrl: '/clubs/crown-crushers.png', captainName: 'Zane Malik' },
  ];

  const clubs = [];
  for (const c of clubsData) {
    const cl = await Club.findOneAndUpdate({ code: c.code }, { _id: c.id, ...c, totalPoints: 0.0, currentRank: 1, status: 'ACTIVE' }, { upsert: true, new: true });
    clubs.push(cl);
  }

  console.log('Seeding 10 Cricket Teams (2 per House)...');
  for (const c of clubs) {
    await CricketTeam.findOneAndUpdate(
      { _id: `crick-${c.code.toLowerCase()}-a` },
      { $set: { name: `${c.name} A`, clubId: c._id, captainName: `${c.captainName} (A)`, status: 'ACTIVE' } },
      { upsert: true }
    );
    await CricketTeam.findOneAndUpdate(
      { _id: `crick-${c.code.toLowerCase()}-b` },
      { $set: { name: `${c.name} B`, clubId: c._id, captainName: `${c.name} Vice Captain (B)`, status: 'ACTIVE' } },
      { upsert: true }
    );
  }

  console.log('Seeding 7 Sports...');
  const sportsData = [
    { id: 'sport-bgmi', name: 'BGMI', category: 'Esports', icon: 'Gamepad2', sportType: 'SQUAD', maxParticipants: 4, allowsMixedClubs: true, pointsEntryMethod: 'BOTH', positionPoints: JSON.stringify({ '1': 100, '2': 70, '3': 50, '4': 30, '5': 20 }) },
    { id: 'sport-carrom', name: 'Carrom', category: 'BoardGame', icon: 'Target', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'POSITION', positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }) },
    { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', icon: 'Zap', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'BOTH', positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }) },
    { id: 'sport-chess', name: 'Chess', category: 'BoardGame', icon: 'Brain', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'POSITION', positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }) },
    { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', icon: 'Activity', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'BOTH', positionPoints: JSON.stringify({ '1': 50, '2': 30, '3': 20 }) },
    { id: 'sport-cricket', name: 'Cricket', category: 'Outdoor', icon: 'Flame', sportType: 'TEAM', maxParticipants: 11, allowsMixedClubs: false, pointsEntryMethod: 'MANUAL', positionPoints: JSON.stringify({ '1': 100, '2': 60, '3': 40 }) },
    { id: 'sport-football', name: 'Football', category: 'Team', icon: 'Trophy', sportType: 'TEAM', maxParticipants: 11, allowsMixedClubs: false, pointsEntryMethod: 'MANUAL', positionPoints: JSON.stringify({ '1': 100, '2': 60, '3': 40 }) },
  ];

  const sports = [];
  for (const s of sportsData) {
    const sp = await Sport.findOneAndUpdate({ name: s.name }, { _id: s.id, ...s, status: 'ACTIVE', scoringConfig: '{}', pointsDistribution: '{}' }, { upsert: true, new: true });
    sports.push(sp);
  }

  console.log('Seeding Venues...');
  const venues = [
    await Venue.findOneAndUpdate({ name: 'Olympic Grand Arena' }, { _id: 'ven-1', name: 'Olympic Grand Arena', location: 'Main Campus East Wing', capacity: 2500, status: 'ACTIVE' }, { upsert: true, new: true }),
    await Venue.findOneAndUpdate({ name: 'Esports Center' }, { _id: 'ven-2', name: 'Esports Center', location: 'Tech Building, 3rd Floor', capacity: 300, status: 'ACTIVE' }, { upsert: true, new: true }),
  ];

  console.log('Seeding Users & Single Official Referee (Marcus)...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const marcusPassword = await bcrypt.hash('marcus123', 10);

  // Clean out legacy referees
  await Referee.deleteMany({});
  await RefereeSport.deleteMany({});
  await User.deleteMany({ roleId: refereeRole._id });

  await User.findOneAndUpdate(
    { email: 'admin@sportsportal.com' },
    { _id: 'user-admin', email: 'admin@sportsportal.com', passwordHash: adminPassword, name: 'Championship Director', roleId: superAdminRole._id, status: 'ACTIVE' },
    { upsert: true }
  );

  const ref1 = await Referee.findOneAndUpdate(
    { email: 'marcus@gmail.com' },
    { _id: 'ref-001', refereeCode: 'REF-001', name: 'Marcus Sterling', email: 'marcus@gmail.com', phone: '+1 555-0192', availability: 'AVAILABLE', status: 'ACTIVE' },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'marcus@gmail.com' },
    { _id: 'user-ref-marcus', email: 'marcus@gmail.com', passwordHash: marcusPassword, name: 'Marcus Sterling', roleId: refereeRole._id, refereeId: ref1._id, status: 'ACTIVE' },
    { upsert: true }
  );

  for (const s of sports) {
    await RefereeSport.findOneAndUpdate(
      { refereeId: ref1._id, sportId: s._id },
      { _id: `rs-${ref1._id}-${s._id}`, refereeId: ref1._id, sportId: s._id },
      { upsert: true }
    );
  }

  // Athletes
  const p1 = await Player.findOneAndUpdate(
    { registrationId: 'REG-MAV-101' },
    {
      $setOnInsert: { _id: 'ply-1' },
      $set: { name: 'Alex Rivera', email: 'alex.rivera@housechampionship.com', clubId: 'club-mav', status: 'APPROVED' },
    },
    { upsert: true, returnDocument: 'after' }
  );
  const p2 = await Player.findOneAndUpdate(
    { registrationId: 'REG-MAV-102' },
    {
      $setOnInsert: { _id: 'ply-2' },
      $set: { name: 'David Miller', email: 'david.miller@housechampionship.com', clubId: 'club-mav', status: 'APPROVED' },
    },
    { upsert: true, returnDocument: 'after' }
  );
  const p3 = await Player.findOneAndUpdate(
    { registrationId: 'REG-DOM-103' },
    {
      $setOnInsert: { _id: 'ply-3' },
      $set: { name: 'Leo Vance', email: 'leo.vance@housechampionship.com', clubId: 'club-dom', status: 'APPROVED' },
    },
    { upsert: true, returnDocument: 'after' }
  );
  const p4 = await Player.findOneAndUpdate(
    { registrationId: 'REG-ALP-104' },
    {
      $setOnInsert: { _id: 'ply-4' },
      $set: { name: 'Ethan Hunt', email: 'ethan.hunt@housechampionship.com', clubId: 'club-alp', status: 'APPROVED' },
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Fixture: M-BGMI-01 with 3 unique clubs represented!
  const bgmi = sports.find((s) => s.name === 'BGMI');
  const match = await Match.findOneAndUpdate(
    { matchCode: 'M-BGMI-01' },
    {
      $setOnInsert: { _id: 'match-bgmi-01' },
      $set: {
        matchCode: 'M-BGMI-01',
        sportId: bgmi._id,
        round: 'Grand Finals - Erangel',
        stageName: 'Championship Finals',
        matchDate: '2026-11-26',
        matchTime: '15:00',
        venueId: venues[1]._id,
        status: 'SCHEDULED',
        notes: 'Squad 1 features 4 players from 3 unique clubs: 2 Mavericks, 1 Dominator, 1 Alpha.',
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  await MatchReferee.findOneAndUpdate(
    { matchId: match._id, refereeId: ref1._id },
    { $setOnInsert: { _id: 'mr-1' }, $set: { matchId: match._id, refereeId: ref1._id } },
    { upsert: true }
  );

  const part1 = await MatchParticipant.findOneAndUpdate(
    { _id: 'part-bgmi-sq1' },
    {
      $setOnInsert: { _id: 'part-bgmi-sq1' },
      $set: {
        matchId: match._id,
        teamName: 'Squad Titans',
        score: 100,
        rank: 1,
        isWinner: true,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  await MatchParticipantPlayer.findOneAndUpdate(
    { participantId: part1._id, playerId: p1._id },
    { $setOnInsert: { _id: 'mpp-1' }, $set: { participantId: part1._id, playerId: p1._id, clubId: 'club-mav' } },
    { upsert: true }
  );
  await MatchParticipantPlayer.findOneAndUpdate(
    { participantId: part1._id, playerId: p2._id },
    { $setOnInsert: { _id: 'mpp-2' }, $set: { participantId: part1._id, playerId: p2._id, clubId: 'club-mav' } },
    { upsert: true }
  );
  await MatchParticipantPlayer.findOneAndUpdate(
    { participantId: part1._id, playerId: p3._id },
    { $setOnInsert: { _id: 'mpp-3' }, $set: { participantId: part1._id, playerId: p3._id, clubId: 'club-dom' } },
    { upsert: true }
  );
  await MatchParticipantPlayer.findOneAndUpdate(
    { participantId: part1._id, playerId: p4._id },
    { $setOnInsert: { _id: 'mpp-4' }, $set: { participantId: part1._id, playerId: p4._id, clubId: 'club-alp' } },
    { upsert: true }
  );

  // Settings
  await TournamentSetting.findOneAndUpdate(
    { key: 'CHAMPIONSHIP_STATUS' },
    { $setOnInsert: { _id: 'set-1' }, $set: { key: 'CHAMPIONSHIP_STATUS', value: 'ACTIVE', description: 'Championship status' } },
    { upsert: true }
  );
  await TournamentSetting.findOneAndUpdate(
    { key: 'CURRENT_ROTATION_INDEX' },
    { $setOnInsert: { _id: 'set-2' }, $set: { key: 'CURRENT_ROTATION_INDEX', value: '0', description: 'Rotation index' } },
    { upsert: true }
  );

  console.log('✅ MongoDB Seeding finished successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

