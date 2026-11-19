/**
 * Seed demo matches (all SCHEDULED) for every sport, plus the BGMI / doubles teams they need.
 *
 *   node scripts/seed-matches.js           # seed (aborts if seeded matches already exist)
 *   node scripts/seed-matches.js --reset   # remove previously seeded matches and teams first, then seed again
 *
 * Needs clubs, sports and players with sport registrations (run scripts/seed-players.js first).
 * Everything created is recorded in the TournamentSetting keys SEED_MATCH_IDS / SEED_TEAM_IDS,
 * so --reset only removes what this script made.
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
const RESET = process.argv.includes('--reset');

const MATCH_KEY = 'SEED_MATCH_IDS';
const TEAM_KEY = 'SEED_TEAM_IDS';

// deterministic pseudo random so re-runs look the same
let seed = 42;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const col = (n) => db.collection(n);
  const now = new Date();
  const stamp = { createdAt: now, updatedAt: now };

  const getSetting = async (key) => {
    const s = await col('tournamentsettings').findOne({ key });
    try {
      return s ? JSON.parse(s.value) : [];
    } catch {
      return [];
    }
  };
  const setSetting = (key, value) =>
    col('tournamentsettings').updateOne(
      { key },
      { $set: { value: JSON.stringify(value), updatedAt: now }, $setOnInsert: { _id: randomUUID(), key, description: 'Seed data tracking', createdAt: now } },
      { upsert: true }
    );

  // ---------- reset ----------
  const oldMatchIds = await getSetting(MATCH_KEY);
  const oldTeamIds = await getSetting(TEAM_KEY);
  if (oldMatchIds.length > 0 || oldTeamIds.length > 0) {
    if (!RESET) {
      console.log(`Seeded data already exists (${oldMatchIds.length} matches, ${oldTeamIds.length} teams). Run with --reset to replace it.`);
      await mongoose.disconnect();
      return;
    }
    const parts = await col('matchparticipants').find({ matchId: { $in: oldMatchIds } }).project({ _id: 1 }).toArray();
    const partIds = parts.map((p) => p._id);
    await col('matchparticipantplayers').deleteMany({ participantId: { $in: partIds } });
    await col('matchparticipants').deleteMany({ matchId: { $in: oldMatchIds } });
    await col('matchreferees').deleteMany({ matchId: { $in: oldMatchIds } });
    await col('matches').deleteMany({ _id: { $in: oldMatchIds } });
    await col('bgmiteams').deleteMany({ _id: { $in: oldTeamIds } });
    await col('doublesteams').deleteMany({ _id: { $in: oldTeamIds } });
    console.log(`Removed ${oldMatchIds.length} seeded matches and ${oldTeamIds.length} seeded teams.`);
  }

  // ---------- reference data ----------
  const clubs = (await col('clubs').find({}).sort({ name: 1 }).toArray()).filter((c) => c.status !== 'INACTIVE');
  const sports = await col('sports').find({}).toArray();
  const venues = (await col('venues').find({}).toArray()).filter((v) => v.status !== 'INACTIVE');
  const referees = (await col('referees').find({}).toArray()).filter((r) => r.status !== 'INACTIVE');
  const refereeSports = await col('refereesports').find({}).toArray();
  const cricketTeams = await col('cricketteams').find({}).toArray();
  const allPlayers = await col('players').find({}).toArray();
  const playerSports = await col('playersports').find({}).toArray();
  const existingBgmiNames = new Set((await col('bgmiteams').find({}).toArray()).map((t) => String(t.name).toLowerCase()));
  const existingDoublesNames = new Set((await col('doublesteams').find({}).toArray()).map((t) => String(t.name).toLowerCase()));

  if (clubs.length < 2) throw new Error('Need at least 2 clubs. Seed clubs first.');
  if (venues.length === 0) throw new Error('Need at least 1 venue.');

  const sportByName = (n) => sports.find((s) => String(s.name).trim().toLowerCase() === n.toLowerCase());
  const playersFor = (sport) => {
    const ids = new Set(playerSports.filter((ps) => ps.sportId === String(sport._id)).map((ps) => ps.playerId));
    return allPlayers.filter((p) => ids.has(String(p._id)) && p.status !== 'REJECTED');
  };
  const gender = (p) => String(p.gender || '').toUpperCase();
  const clubOf = (id) => clubs.find((c) => String(c._id) === String(id));

  // ---------- match code counter (same scheme as the app: M-<SP>-<nnn>) ----------
  const existingCodes = await col('matches').find({}).project({ matchCode: 1 }).toArray();
  let counter = existingCodes.reduce((max, m) => {
    const n = parseInt(String(m.matchCode).split('-').pop(), 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, existingCodes.length);

  const createdMatchIds = [];
  const createdTeamIds = [];
  const summary = {};
  const bump = (k) => (summary[k] = (summary[k] || 0) + 1);

  // schedule slots: next 14 days, 09:00 - 18:00
  let slot = 0;
  const nextSlot = () => {
    const day = new Date(now.getTime() + (1 + (slot % 14)) * 86400000);
    const date = day.toISOString().slice(0, 10);
    const hour = 9 + ((slot * 3) % 10);
    slot++;
    return { date, time: `${String(hour).padStart(2, '0')}:${slot % 2 ? '00' : '30'}` };
  };

  const refereeFor = (sport) => {
    const eligible = refereeSports.filter((rs) => rs.sportId === String(sport._id)).map((rs) => rs.refereeId);
    const list = referees.filter((r) => eligible.includes(String(r._id)));
    return list.length ? pick(list) : null;
  };

  /** participants: [{ clubId?, playerId?, cricketTeamId?, bgmiTeamId?, doublesTeamId?, teamName, playerIds? }] */
  const createMatch = async (sport, { category, round, stageType = 'NORMAL', participants }) => {
    counter++;
    const id = randomUUID();
    const { date, time } = nextSlot();
    const prefix = String(sport.name).slice(0, 2).toUpperCase();
    await col('matches').insertOne({
      _id: id,
      matchCode: `M-${prefix}-${String(counter).padStart(3, '0')}`,
      sportId: String(sport._id),
      round,
      stageName: 'Championship Stage',
      stageType,
      matchCategory: category,
      matchDate: date,
      matchTime: time,
      venueId: String(pick(venues)._id),
      status: 'SCHEDULED',
      starPlayerPoints: 0,
      ...stamp,
    });
    for (const p of participants) {
      const pid = randomUUID();
      const linked = Array.from(new Set([...(p.playerIds || []), ...(p.playerId ? [p.playerId] : [])]));
      await col('matchparticipants').insertOne({
        _id: pid,
        matchId: id,
        clubId: p.clubId || undefined,
        playerId: p.playerId || undefined,
        cricketTeamId: p.cricketTeamId || undefined,
        bgmiTeamId: p.bgmiTeamId || undefined,
        doublesTeamId: p.doublesTeamId || undefined,
        teamName: p.teamName,
        score: 0,
        isWinner: false,
        ...stamp,
      });
      for (const plId of linked) {
        const pl = allPlayers.find((x) => String(x._id) === String(plId));
        await col('matchparticipantplayers').insertOne({ _id: randomUUID(), participantId: pid, playerId: String(plId), clubId: pl.clubId, ...stamp });
      }
    }
    const ref = refereeFor(sport);
    if (ref) await col('matchreferees').insertOne({ _id: randomUUID(), matchId: id, refereeId: String(ref._id), ...stamp });
    createdMatchIds.push(id);
    bump(sport.name);
    return id;
  };

  const singlesSide = (p) => ({ playerId: String(p._id), clubId: p.clubId, teamName: p.name, playerIds: [String(p._id)] });
  const pairs = (list, n) => {
    const s = shuffle(list);
    const out = [];
    for (let i = 0; i + 1 < s.length && out.length < n; i += 2) out.push([s[i], s[i + 1]]);
    return out;
  };

  // ---------- Football: club vs club ----------
  const football = sportByName('Football');
  if (football && clubs.length >= 2) {
    for (let i = 0; i < 5; i++) {
      const a = clubs[i % clubs.length];
      const b = clubs[(i + 1 + Math.floor(i / clubs.length)) % clubs.length];
      if (String(a._id) === String(b._id)) continue;
      await createMatch(football, {
        category: '11v11',
        round: 'Championship Match',
        participants: [
          { clubId: String(a._id), teamName: a.name },
          { clubId: String(b._id), teamName: b.name },
        ],
      });
    }
  }

  // ---------- Cricket: house team vs house team ----------
  const cricket = sportByName('Cricket');
  if (cricket && cricketTeams.length >= 2) {
    const used = new Set();
    for (let i = 0; i < 4; i++) {
      const a = cricketTeams[(i * 2) % cricketTeams.length];
      const b = cricketTeams[(i * 2 + 3) % cricketTeams.length];
      if (String(a._id) === String(b._id) || used.has(`${a._id}|${b._id}`)) continue;
      used.add(`${a._id}|${b._id}`);
      await createMatch(cricket, {
        category: i % 2 ? 'T20' : 'T10',
        round: 'House Derby',
        participants: [
          { cricketTeamId: String(a._id), clubId: a.clubId, teamName: a.name },
          { cricketTeamId: String(b._id), clubId: b.clubId, teamName: b.name },
        ],
      });
    }
  }

  // ---------- Chess: player vs player ----------
  const chess = sportByName('Chess');
  if (chess) {
    for (const [a, b] of pairs(playersFor(chess), 4)) {
      await createMatch(chess, { category: 'Classical', round: 'Classical 1v1', participants: [singlesSide(a), singlesSide(b)] });
    }
  }

  // ---------- Badminton / Carrom singles (gender specific) ----------
  for (const [sportName, perGender] of [['Badminton', 3], ['Carrom', 2]]) {
    const sport = sportByName(sportName);
    if (!sport) continue;
    const pool = playersFor(sport);
    for (const [g, category, label] of [
      ['MALE', "Men's singles / doubles", "Men's Singles"],
      ['FEMALE', "Women's singles / doubles", "Women's Singles"],
    ]) {
      for (const [a, b] of pairs(pool.filter((p) => gender(p) === g), perGender)) {
        await createMatch(sport, { category, round: `${label} Match`, participants: [singlesSide(a), singlesSide(b)] });
      }
    }
  }

  // ---------- Badminton doubles / mixed doubles (registered doubles teams) ----------
  const badminton = sportByName('Badminton');
  if (badminton) {
    const pool = playersFor(badminton);
    const men = pool.filter((p) => gender(p) === 'MALE');
    const women = pool.filter((p) => gender(p) === 'FEMALE');
    const names = ['Smash Duo', 'Net Ninjas', 'Shuttle Kings', 'Drop Shot Pair', 'Rally Royals', 'Court Crushers', 'Feather Force', 'Volley Vibes', 'Ace Alliance', 'Power Pair', 'Lob Legends', 'Drive Duo'];
    let nameIdx = 0;
    const nextName = () => {
      let n;
      do {
        n = names[nameIdx % names.length] + (nameIdx >= names.length ? ` ${Math.floor(nameIdx / names.length) + 1}` : '');
        nameIdx++;
      } while (existingDoublesNames.has(n.toLowerCase()));
      existingDoublesNames.add(n.toLowerCase());
      return n;
    };

    const makeTeam = async (a, b, category) => {
      const id = randomUUID();
      const name = nextName();
      const clubIds = Array.from(new Set([a.clubId, b.clubId]));
      await col('doublesteams').insertOne({
        _id: id,
        name,
        clubId: a.clubId,
        clubIds,
        sportId: String(badminton._id),
        category,
        playerIds: [String(a._id), String(b._id)],
        status: 'ACTIVE',
        ...stamp,
      });
      createdTeamIds.push(id);
      return { id, name, playerIds: [String(a._id), String(b._id)] };
    };
    const side = (t) => ({ doublesTeamId: t.id, teamName: t.name, playerIds: t.playerIds });

    // Men's doubles (MD) and Women's doubles (WD): 4 teams each -> 2 matches each
    for (const [list, cat, label] of [[men, 'MD', "Men's Doubles"], [women, 'WD', "Women's Doubles"]]) {
      const teams = [];
      for (const [a, b] of pairs(list, 4)) teams.push(await makeTeam(a, b, 'DOUBLES'));
      for (let i = 0; i + 1 < teams.length; i += 2) {
        await createMatch(badminton, { category: cat, round: `${label} Match`, participants: [side(teams[i]), side(teams[i + 1])] });
      }
    }
    // Mixed doubles: one man + one woman per team
    const m = shuffle(men);
    const w = shuffle(women);
    const mixed = [];
    for (let i = 0; i < Math.min(4, m.length, w.length); i++) mixed.push(await makeTeam(m[i], w[i], 'MIXED_DOUBLES'));
    for (let i = 0; i + 1 < mixed.length; i += 2) {
      await createMatch(badminton, { category: 'Mixed', round: 'Mixed Doubles Match', participants: [side(mixed[i]), side(mixed[i + 1])] });
    }
  }

  // ---------- BGMI: registered teams (4 players each, may mix clubs), 3-team lobbies ----------
  const bgmi = sportByName('BGMI');
  if (bgmi) {
    const pool = shuffle(playersFor(bgmi));
    const teamNames = ['Seed Squad Alpha', 'Seed Squad Bravo', 'Seed Squad Charlie', 'Seed Squad Delta'];
    const teams = [];
    for (let t = 0; t < teamNames.length && (t + 1) * 4 <= pool.length; t++) {
      if (existingBgmiNames.has(teamNames[t].toLowerCase())) continue;
      const members = pool.slice(t * 4, t * 4 + 4);
      const id = randomUUID();
      const clubIds = Array.from(new Set(members.map((p) => p.clubId)));
      await col('bgmiteams').insertOne({
        _id: id,
        name: teamNames[t],
        clubId: members[0].clubId,
        clubIds,
        playerIds: members.map((p) => String(p._id)),
        status: 'ACTIVE',
        ...stamp,
      });
      createdTeamIds.push(id);
      teams.push({ id, name: teamNames[t], playerIds: members.map((p) => String(p._id)) });
    }
    const lobbies = teams.length >= 4 ? [teams.slice(0, 3), teams.slice(1, 4)] : teams.length >= 2 ? [teams] : [];
    for (const lobby of lobbies) {
      await createMatch(bgmi, {
        category: 'Squad',
        round: 'Squad Battle',
        participants: lobby.map((t) => ({ bgmiTeamId: t.id, teamName: t.name, playerIds: t.playerIds })),
      });
    }
  }

  await setSetting(MATCH_KEY, createdMatchIds);
  await setSetting(TEAM_KEY, createdTeamIds);

  console.log(`Seeded ${createdMatchIds.length} matches and ${createdTeamIds.length} teams.`);
  console.log('Matches per sport:', summary);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
