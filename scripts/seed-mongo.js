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
    await CricketTeam.findOneAndUpdate({ name: `${c.name} A` }, { _id: `crick-${c.code.toLowerCase()}-a`, name: `${c.name} A`, clubId: c._id, captainName: `${c.captainName} (A)`, status: 'ACTIVE' }, { upsert: true });
    await CricketTeam.findOneAndUpdate({ name: `${c.name} B` }, { _id: `crick-${c.code.toLowerCase()}-b`, name: `${c.name} B`, clubId: c._id, captainName: `${c.name} Vice Captain (B)`, status: 'ACTIVE' }, { upsert: true });
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

  console.log('Seeding Users & Referees...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const refereePassword = await bcrypt.hash('referee123', 10);

  await User.findOneAndUpdate({ email: 'admin@sportsportal.com' }, { _id: 'user-admin', email: 'admin@sportsportal.com', passwordHash: adminPassword, name: 'Championship Director', roleId: superAdminRole._id, status: 'ACTIVE' }, { upsert: true });

  const ref1 = await Referee.findOneAndUpdate({ refereeCode: 'REF-001' }, { _id: 'ref-001', refereeCode: 'REF-001', name: 'Marcus Sterling', email: 'ref.marcus@sportsportal.com', phone: '+1 555-0192', availability: 'AVAILABLE', status: 'ACTIVE' }, { upsert: true, new: true });
  const ref2 = await Referee.findOneAndUpdate({ refereeCode: 'REF-002' }, { _id: 'ref-002', refereeCode: 'REF-002', name: 'Sarah Jenkins', email: 'ref.sarah@sportsportal.com', phone: '+1 555-0193', availability: 'AVAILABLE', status: 'ACTIVE' }, { upsert: true, new: true });
  const ref3 = await Referee.findOneAndUpdate({ refereeCode: 'REF-003' }, { _id: 'ref-003', refereeCode: 'REF-003', name: 'David Okafor', email: 'ref.david@sportsportal.com', phone: '+1 555-0194', availability: 'AVAILABLE', status: 'ACTIVE' }, { upsert: true, new: true });

  await User.findOneAndUpdate({ email: 'ref.marcus@sportsportal.com' }, { _id: 'user-ref-marcus', email: 'ref.marcus@sportsportal.com', passwordHash: refereePassword, name: 'Marcus Sterling', roleId: refereeRole._id, refereeId: ref1._id, status: 'ACTIVE' }, { upsert: true });
  await User.findOneAndUpdate({ email: 'ref.sarah@sportsportal.com' }, { _id: 'user-ref-sarah', email: 'ref.sarah@sportsportal.com', passwordHash: refereePassword, name: 'Sarah Jenkins', roleId: refereeRole._id, refereeId: ref2._id, status: 'ACTIVE' }, { upsert: true });
  await User.findOneAndUpdate({ email: 'ref.david@sportsportal.com' }, { _id: 'user-ref-david', email: 'ref.david@sportsportal.com', passwordHash: refereePassword, name: 'David Okafor', roleId: refereeRole._id, refereeId: ref3._id, status: 'ACTIVE' }, { upsert: true });

  // Athletes
  const p1 = await Player.findOneAndUpdate({ registrationId: 'REG-MAV-101' }, { _id: 'ply-1', registrationId: 'REG-MAV-101', name: 'Alex Rivera', email: 'alex.rivera@housechampionship.com', clubId: 'club-mav', status: 'APPROVED' }, { upsert: true, new: true });
  const p2 = await Player.findOneAndUpdate({ registrationId: 'REG-MAV-102' }, { _id: 'ply-2', registrationId: 'REG-MAV-102', name: 'David Miller', email: 'david.miller@housechampionship.com', clubId: 'club-mav', status: 'APPROVED' }, { upsert: true, new: true });
  const p3 = await Player.findOneAndUpdate({ registrationId: 'REG-DOM-103' }, { _id: 'ply-3', registrationId: 'REG-DOM-103', name: 'Leo Vance', email: 'leo.vance@housechampionship.com', clubId: 'club-dom', status: 'APPROVED' }, { upsert: true, new: true });
  const p4 = await Player.findOneAndUpdate({ registrationId: 'REG-ALP-104' }, { _id: 'ply-4', registrationId: 'REG-ALP-104', name: 'Ethan Hunt', email: 'ethan.hunt@housechampionship.com', clubId: 'club-alp', status: 'APPROVED' }, { upsert: true, new: true });

  // Fixture: M-BGMI-01 with 3 unique clubs represented!
  const bgmi = sports.find((s) => s.name === 'BGMI');
  const match = await Match.findOneAndUpdate({ matchCode: 'M-BGMI-01' }, {
    _id: 'match-bgmi-01',
    matchCode: 'M-BGMI-01',
    sportId: bgmi._id,
    round: 'Grand Finals - Erangel',
    stageName: 'Championship Finals',
    matchDate: '2026-11-26',
    matchTime: '15:00',
    venueId: venues[1]._id,
    status: 'SCHEDULED',
    notes: 'Squad 1 features 4 players from 3 unique clubs: 2 Mavericks, 1 Dominator, 1 Alpha.',
  }, { upsert: true, new: true });

  await MatchReferee.findOneAndUpdate({ matchId: match._id, refereeId: ref1._id }, { _id: 'mr-1', matchId: match._id, refereeId: ref1._id }, { upsert: true });

  const part1 = await MatchParticipant.findOneAndUpdate({ _id: 'part-bgmi-sq1' }, {
    _id: 'part-bgmi-sq1',
    matchId: match._id,
    teamName: 'Squad Titans',
    score: 100,
    rank: 1,
    isWinner: true,
  }, { upsert: true, new: true });

  await MatchParticipantPlayer.findOneAndUpdate({ participantId: part1._id, playerId: p1._id }, { _id: 'mpp-1', participantId: part1._id, playerId: p1._id, clubId: 'club-mav' }, { upsert: true });
  await MatchParticipantPlayer.findOneAndUpdate({ participantId: part1._id, playerId: p2._id }, { _id: 'mpp-2', participantId: part1._id, playerId: p2._id, clubId: 'club-mav' }, { upsert: true });
  await MatchParticipantPlayer.findOneAndUpdate({ participantId: part1._id, playerId: p3._id }, { _id: 'mpp-3', participantId: part1._id, playerId: p3._id, clubId: 'club-dom' }, { upsert: true });
  await MatchParticipantPlayer.findOneAndUpdate({ participantId: part1._id, playerId: p4._id }, { _id: 'mpp-4', participantId: part1._id, playerId: p4._id, clubId: 'club-alp' }, { upsert: true });

  // Settings
  await TournamentSetting.findOneAndUpdate({ key: 'CHAMPIONSHIP_STATUS' }, { _id: 'set-1', key: 'CHAMPIONSHIP_STATUS', value: 'ACTIVE', description: 'Championship status' }, { upsert: true });
  await TournamentSetting.findOneAndUpdate({ key: 'CURRENT_ROTATION_INDEX' }, { _id: 'set-2', key: 'CURRENT_ROTATION_INDEX', value: '0', description: 'Rotation index' }, { upsert: true });

  console.log('✅ MongoDB Seeding finished successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

