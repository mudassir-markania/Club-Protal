/**
 * Seed the real participant roster: 5 houses, the 10 house teams, the sports and every player with the sports
 * they registered for.
 *
 *   node scripts/seed-roster.js
 *
 * Safe to re-run: houses, sports and teams are matched by name/code and players by (name + house). Players that already
 * exist are updated (gender, team, and their sport registrations are synced to this roster), so nothing is duplicated.
 *
 * Gender comes from the roster ("Not specified" stays empty). Every player is registered for Cricket as well.
 */
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!m) return;
      let v = m[2] || '';
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    });
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/apexarena';

const HOUSES = [
  { id: 'club-red', name: 'Red Club', code: 'RED', logoUrl: '/clubs/red.png' },
  { id: 'club-blue', name: 'Blue Club', code: 'BLU', logoUrl: '/clubs/blue.png' },
  { id: 'club-green', name: 'Green Club', code: 'GRN', logoUrl: '/clubs/green.png' },
  { id: 'club-purple', name: 'Purple Club', code: 'PUR', logoUrl: '/clubs/purple.png' },
  { id: 'club-yellow', name: 'Yellow Club', code: 'YEL', logoUrl: '/clubs/yellow.png' },
];

const SPORTS = [
  { id: 'sport-bgmi', name: 'BGMI', category: 'Esports', icon: 'Gamepad2', sportType: 'SQUAD', maxParticipants: 4, allowsMixedClubs: true, pointsEntryMethod: 'BOTH' },
  { id: 'sport-carrom', name: 'Carrom', category: 'BoardGame', icon: 'Target', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'POSITION' },
  { id: 'sport-badminton', name: 'Badminton', category: 'Racquet', icon: 'Zap', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'BOTH' },
  { id: 'sport-chess', name: 'Chess', category: 'BoardGame', icon: 'Brain', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'POSITION' },
  { id: 'sport-tt', name: 'Table Tennis', category: 'Racquet', icon: 'Activity', sportType: 'INDIVIDUAL', maxParticipants: 2, allowsMixedClubs: false, pointsEntryMethod: 'BOTH' },
  { id: 'sport-cricket', name: 'Cricket', category: 'Outdoor', icon: 'Flame', sportType: 'TEAM', maxParticipants: 11, allowsMixedClubs: false, pointsEntryMethod: 'MANUAL' },
  { id: 'sport-football', name: 'Football', category: 'Team', icon: 'Trophy', sportType: 'TEAM', maxParticipants: 11, allowsMixedClubs: false, pointsEntryMethod: 'MANUAL' },
];

// Gender as given in the roster. Everyone not listed here is Male.
const FEMALE = new Set([
  'Anjali', 'Alisha', 'Kainat', 'Sanika', 'Roheen', 'Iqfat Shaikh', 'Farhat', 'Sajiya', 'Siddhi', 'Shaikh Mariya', 'Alijah',
  'Nafisa', 'Anam', 'Tamanna Ansari', 'Devinshree Marathe', 'Tasmiya', 'Kasturi', 'Ifra', 'Atifa Ansari', 'Mansi', 'Sanchita Dalvi',
]);
const NOT_SPECIFIED = new Set(['Kaivalya Gavaskar', 'Noor Khan', 'Amanat Rasool', 'Ibadat Khan']);

// Participant | House | Team | Sports   ("—" = no other sport; everyone is also registered for Cricket)
const ROSTER = `
Anjali (Captain) | Red Club | Genz Warrior | Carrom, Badminton
Sharique | Red Club | Genz Warrior | BGMI
Kaivalya Gavaskar | Red Club | Genz Warrior | —
Shadab | Red Club | Genz Warrior | BGMI
Aquib Hingwala | Red Club | Genz Warrior | Carrom, Badminton, Table Tennis
Alisha | Red Club | Genz Warrior | Badminton
Kazim | Red Club | Genz Warrior | —
Awesh | Red Club | Genz Warrior | —
Shaikh Abdullah | Red Club | Genz Warrior | Carrom, Chess, Badminton
Kainat (Captain) | Red Club | Crown Crushers | Carrom, Badminton, Table Tennis
Piyush Patwa | Red Club | Crown Crushers | Carrom, Chess, Badminton
Sayyed Asif | Red Club | Crown Crushers | BGMI
Karan | Red Club | Crown Crushers | Chess, Badminton
Vinayak Gupta | Red Club | Crown Crushers | Carrom, Badminton, Table Tennis
Miraza Ubaid | Red Club | Crown Crushers | Carrom, Chess, Badminton, Table Tennis
Ammar Juwle | Red Club | Crown Crushers | Carrom, Badminton
Mohd Ahmed Patel | Red Club | Crown Crushers | —
Ubaid Shaikh | Red Club | Crown Crushers | —
Sanika | Red Club | Crown Crushers | Badminton
Roheen (Captain) | Blue Club | Nex Blitz | Carrom, Badminton, Table Tennis
Saad Ranasaria | Blue Club | Nex Blitz | Carrom, Chess, Badminton, Table Tennis
Tushar Sutar | Blue Club | Nex Blitz | Carrom, BGMI
Noor Khan | Blue Club | Nex Blitz | —
Iqfat Shaikh | Blue Club | Nex Blitz | Badminton
Affan Khan | Blue Club | Nex Blitz | Carrom, Chess, Badminton
Awaab Sonde | Blue Club | Nex Blitz | Carrom, Chess, Badminton, BGMI
Abhijeet Sawant | Blue Club | Nex Blitz | Carrom, Badminton, Table Tennis
Maaz Quraishi | Blue Club | Nex Blitz | —
Farhat (Captain) | Blue Club | Royal Force | Badminton
Aamir Sable | Blue Club | Royal Force | Badminton
Shahnawaz | Blue Club | Royal Force | —
Najeeb Sayeed | Blue Club | Royal Force | —
Faraz Khan | Blue Club | Royal Force | Carrom, Badminton
Sabir Shaikh | Blue Club | Royal Force | BGMI
Irfan | Blue Club | Royal Force | Carrom, Chess, Badminton, Table Tennis
Sajiya | Blue Club | Royal Force | —
Quitbuddin | Blue Club | Royal Force | Carrom, Chess, Badminton, Table Tennis
Faheem Daruvala | Blue Club | Royal Force | —
Siddhi (Captain) | Green Club | Dominators | Carrom, Badminton
Piyush Pandey | Green Club | Dominators | Carrom, Badminton, Table Tennis
Chinmay Gawade | Green Club | Dominators | —
Saeed Siddique | Green Club | Dominators | Carrom, Badminton, Table Tennis
Prashant Patil | Green Club | Dominators | Carrom, Chess, Badminton
Shaikh Mariya | Green Club | Dominators | Carrom, Badminton
Sanad Naqvi | Green Club | Dominators | —
Nouman Khan | Green Club | Dominators | Carrom, Badminton, Table Tennis
Amit | Green Club | Dominators | Carrom, Badminton
Alijah (Captain) | Green Club | Rebel Royals | Carrom, Badminton, Table Tennis
Mohd Aquib | Green Club | Rebel Royals | —
Sahil Ansari | Green Club | Rebel Royals | BGMI
Shams Ali Shaikh | Green Club | Rebel Royals | BGMI
Vishesh Jaiswar | Green Club | Rebel Royals | —
Mohd Ayan Imtiyaz Sayed | Green Club | Rebel Royals | Carrom, Badminton, Table Tennis
Atif | Green Club | Rebel Royals | —
Abdul Rehman | Green Club | Rebel Royals | —
Nafisa | Green Club | Rebel Royals | —
Vishwajeet | Green Club | Rebel Royals | Badminton
Anam (Captain) | Purple Club | Alpha Warriors | Carrom, Badminton, Table Tennis
Fahad Shaikh | Purple Club | Alpha Warriors | BGMI
Tamanna Ansari | Purple Club | Alpha Warriors | Badminton
Zaid Achwa | Purple Club | Alpha Warriors | Badminton, BGMI
Rehan Ansari | Purple Club | Alpha Warriors | BGMI
Shamshad | Purple Club | Alpha Warriors | Carrom
Uzer Sayyed | Purple Club | Alpha Warriors | Badminton
Mudassair | Purple Club | Alpha Warriors | BGMI
Azeem | Purple Club | Alpha Warriors | BGMI
Devinshree Marathe | Purple Club | Alpha Warriors | Carrom, Badminton
Tasmiya (Captain) | Purple Club | Mavericks | —
Ayaan Raje | Purple Club | Mavericks | —
Shah Sohel | Purple Club | Mavericks | —
Ghavte Ikrama | Purple Club | Mavericks | Carrom, Badminton
Sanskar Ashan | Purple Club | Mavericks | Carrom, Badminton
Pravin Chettiar | Purple Club | Mavericks | Carrom, Chess, Badminton, Table Tennis
Awab Fakih | Purple Club | Mavericks | —
Amanat Rasool | Purple Club | Mavericks | —
Kasturi | Purple Club | Mavericks | —
Ifra (Captain) | Yellow Club | Savage | —
Junaid Khan | Yellow Club | Savage | Carrom, Badminton, BGMI
Ali Mapari | Yellow Club | Savage | Carrom, Chess, Badminton, Table Tennis, BGMI
Atifa Ansari | Yellow Club | Savage | —
Ahmed Khan | Yellow Club | Savage | BGMI
Shaiyaan | Yellow Club | Savage | —
Mohd Ali | Yellow Club | Savage | —
Zaid Khan | Yellow Club | Savage | BGMI
Ibadat Khan | Yellow Club | Savage | —
Mansi (Captain) | Yellow Club | Storm Breakers | Badminton
Sufiyan Khan | Yellow Club | Storm Breakers | Carrom, Badminton, Table Tennis
Sami Shaikh | Yellow Club | Storm Breakers | Carrom, Chess, Badminton
Farhan Tolkar | Yellow Club | Storm Breakers | Carrom, Badminton
Mohd Jagda | Yellow Club | Storm Breakers | Carrom, Badminton
Raj Sharma | Yellow Club | Storm Breakers | Badminton
Viraj Adsul | Yellow Club | Storm Breakers | Carrom, Badminton, BGMI
Taha Choudhary | Yellow Club | Storm Breakers | Badminton, Table Tennis, BGMI
Sanchita Dalvi | Yellow Club | Storm Breakers | Carrom, Badminton
`;

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const now = new Date();
  const stamp = { createdAt: now, updatedAt: now };

  // ---- parse the roster ----
  const rows = ROSTER.trim()
    .split('\n')
    .map((line) => line.split('|').map((c) => c.trim()))
    .map(([rawName, house, team, sports]) => ({
      name: rawName.replace(/\s*\(Captain\)\s*$/i, '').trim(),
      captain: /\(Captain\)/i.test(rawName),
      house,
      team,
      sports: ['Cricket', ...(sports === '—' || !sports ? [] : sports.split(',').map((s) => s.trim()).filter(Boolean))],
    }))
    .map((r) => ({ ...r, gender: NOT_SPECIFIED.has(r.name) ? undefined : FEMALE.has(r.name) ? 'FEMALE' : 'MALE' }));

  // ---- houses ----
  const clubIds = {};
  for (const h of HOUSES) {
    const found = await db.collection('clubs').findOne({ code: h.code });
    if (found) {
      clubIds[h.name] = String(found._id);
    } else {
      await db.collection('clubs').insertOne({ _id: h.id, name: h.name, code: h.code, logoUrl: h.logoUrl, totalPoints: 0, currentRank: 1, status: 'ACTIVE', ...stamp });
      clubIds[h.name] = h.id;
    }
  }

  // ---- sports ----
  const sportIds = {};
  for (const s of SPORTS) {
    const found = await db.collection('sports').findOne({ name: s.name });
    if (found) {
      sportIds[s.name] = String(found._id);
    } else {
      await db.collection('sports').insertOne({ ...s, _id: s.id, status: 'ACTIVE', scoringConfig: '{}', pointsDistribution: '{}', genderCategory: 'OPEN', tournamentFormat: 'TOURNAMENT', numRounds: 3, subCategories: [], ...stamp });
      sportIds[s.name] = s.id;
    }
  }

  // ---- house teams (2 per house) and captains ----
  const teams = new Map(); // team name -> { house, captain }
  rows.forEach((r) => {
    if (!teams.has(r.team)) teams.set(r.team, { house: r.house, captain: null });
    if (r.captain) teams.get(r.team).captain = r.name;
  });
  let teamsAdded = 0;
  const houseTeams = {};
  for (const [teamName, t] of teams) {
    (houseTeams[t.house] = houseTeams[t.house] || []).push({ teamName, captain: t.captain });
    if (!(await db.collection('cricketteams').findOne({ name: teamName }))) {
      await db.collection('cricketteams').insertOne({ _id: `team-${slug(teamName)}`, name: teamName, clubId: clubIds[t.house], captainName: t.captain || undefined, status: 'ACTIVE', ...stamp });
      teamsAdded++;
    }
  }
  // house captain = first team's captain, vice captain = second team's captain
  for (const [house, list] of Object.entries(houseTeams)) {
    await db.collection('clubs').updateOne(
      { _id: clubIds[house], captainName: { $in: [null, undefined] } },
      { $set: { captainName: list[0]?.captain || undefined, viceCaptainName: list[1]?.captain || undefined, updatedAt: now } }
    );
  }

  // ---- players + sport registrations ----
  const counters = {};
  let added = 0;
  let updated = 0;
  let registrations = 0;
  const unknownSports = new Set();
  const perSport = {};

  for (const r of rows) {
    const clubId = clubIds[r.house];
    if (!clubId) throw new Error(`Unknown house "${r.house}"`);
    const exists = await db.collection('players').findOne({ clubId, name: r.name });
    if (exists) {
      // keep the player, bring gender / team / sports in line with the roster
      await db.collection('players').updateOne(
        { _id: exists._id },
        { $set: { teamName: r.team, updatedAt: now, ...(r.gender ? { gender: r.gender } : {}) }, ...(r.gender ? {} : { $unset: { gender: '' } }) }
      );
      const wanted = Array.from(new Set(r.sports)).map((n) => sportIds[n]).filter(Boolean);
      await db.collection('playersports').deleteMany({ playerId: String(exists._id), sportId: { $nin: wanted } });
      for (const sid of wanted) {
        const has = await db.collection('playersports').findOne({ playerId: String(exists._id), sportId: sid });
        if (!has) {
          await db.collection('playersports').insertOne({ _id: randomUUID(), playerId: String(exists._id), sportId: sid, ...stamp });
          registrations++;
        }
      }
      for (const n of new Set(r.sports)) perSport[n] = (perSport[n] || 0) + 1;
      updated++;
      continue;
    }
    const code = HOUSES.find((h) => h.name === r.house).code;
    counters[code] = (counters[code] || 0) + 1;
    const id = randomUUID();
    await db.collection('players').insertOne({
      _id: id,
      registrationId: `REG-${code}-${String(counters[code]).padStart(3, '0')}`,
      name: r.name,
      email: `${slug(r.name)}.${code.toLowerCase()}${counters[code]}@apl.internal`,
      ...(r.gender ? { gender: r.gender } : {}),
      clubId,
      teamName: r.team,
      status: 'APPROVED',
      paymentStatus: 'PAID',
      totalPerformancePoints: 0,
      starPlayerCount: 0,
      registrationDate: now,
      ...stamp,
    });
    added++;
    for (const sName of Array.from(new Set(r.sports))) {
      const sid = sportIds[sName];
      if (!sid) {
        unknownSports.add(sName);
        continue;
      }
      await db.collection('playersports').insertOne({ _id: randomUUID(), playerId: id, sportId: sid, ...stamp });
      registrations++;
      perSport[sName] = (perSport[sName] || 0) + 1;
    }
  }

  const g = { MALE: 0, FEMALE: 0, 'not specified': 0 };
  rows.forEach((r) => (g[r.gender === 'MALE' ? 'MALE' : r.gender === 'FEMALE' ? 'FEMALE' : 'not specified'] += 1));
  console.log(`Houses: ${HOUSES.length}  |  sports: ${SPORTS.length}  |  house teams added: ${teamsAdded}`);
  console.log(`Players added: ${added}, updated: ${updated}, new sport registrations: ${registrations}`);
  console.log('Players per sport:', perSport);
  console.log('Gender:', g);
  if (unknownSports.size) console.log('Unknown sports skipped:', Array.from(unknownSports));
  const perHouse = {};
  rows.forEach((r) => (perHouse[r.house] = (perHouse[r.house] || 0) + 1));
  console.log('Players per house:', perHouse);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
