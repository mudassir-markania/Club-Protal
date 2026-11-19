/**
 * Seed 100 demo players (20 per club) with sport registrations.
 *
 *   node scripts/seed-players.js           # add players (aborts if seeded players already exist)
 *   node scripts/seed-players.js --reset   # delete previously seeded players first, then re-seed
 *
 * Seeded players are tagged with registrationId "SEED-<CLUB>-<nnn>" so they can be removed safely
 * without touching real records.
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
const PER_CLUB = 20;
const RESET = process.argv.includes('--reset');

const MALE = ['Aarav', 'Vihaan', 'Arjun', 'Rohan', 'Kabir', 'Ishaan', 'Aditya', 'Rahul', 'Karan', 'Dev', 'Yash', 'Nikhil', 'Sahil', 'Imran', 'Faisal', 'Zaid', 'Tanmay', 'Harsh', 'Omkar', 'Varun', 'Ayaan', 'Mihir', 'Pranav', 'Siddharth'];
const FEMALE = ['Ananya', 'Diya', 'Isha', 'Kavya', 'Meera', 'Naina', 'Priya', 'Riya', 'Sara', 'Tara', 'Zoya', 'Aisha', 'Pooja', 'Sneha', 'Neha', 'Anjali', 'Fatima', 'Simran', 'Tanya', 'Vaani', 'Ira', 'Myra', 'Kiara', 'Sana'];
const LAST = ['Sharma', 'Verma', 'Patel', 'Khan', 'Mehta', 'Iyer', 'Nair', 'Reddy', 'Singh', 'Gupta', 'Joshi', 'Kulkarni', 'Shaikh', 'Pandey', 'Choudhary', 'Hingwala', 'Desai', 'Bose', 'Malik', 'Ansari', 'Kapoor', 'Rao', 'Chopra', 'Bhatt'];

const SPORT_ORDER = ['BGMI', 'Badminton', 'Carrom', 'Chess', 'Cricket', 'Football', 'Table Tennis'];

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const clubsCol = db.collection('clubs');
  const sportsCol = db.collection('sports');
  const playersCol = db.collection('players');
  const playerSportsCol = db.collection('playersports');

  const clubs = (await clubsCol.find({}).sort({ name: 1 }).toArray()).filter((c) => c.status !== 'INACTIVE');
  const sports = await sportsCol.find({}).toArray();
  if (clubs.length === 0) throw new Error('No clubs found. Seed clubs first.');

  const sportByName = new Map(sports.map((s) => [String(s.name).trim().toLowerCase(), s]));
  const orderedSports = SPORT_ORDER.map((n) => sportByName.get(n.toLowerCase())).filter(Boolean);
  if (orderedSports.length < 2) throw new Error('Not enough sports found in the database.');
  const sportIdx = (n) => orderedSports.findIndex((s) => s.name.toLowerCase() === n.toLowerCase());
  const bgmi = sportIdx('BGMI');

  const existing = await playersCol.find({ registrationId: /^SEED-/ }).project({ _id: 1 }).toArray();
  if (existing.length > 0) {
    if (!RESET) {
      console.log(`Found ${existing.length} previously seeded players. Run with --reset to replace them.`);
      await mongoose.disconnect();
      return;
    }
    const ids = existing.map((p) => p._id);
    await playerSportsCol.deleteMany({ playerId: { $in: ids } });
    await playersCol.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${existing.length} previously seeded players.`);
  }

  const usedNames = new Set((await playersCol.find({}).project({ name: 1 }).toArray()).map((p) => String(p.name).toLowerCase()));
  const now = new Date();
  const players = [];
  const regs = [];
  let seq = 0;

  clubs.forEach((club, ci) => {
    for (let i = 0; i < PER_CLUB; i++) {
      // 12 male / 8 female per club so mixed doubles is always possible
      const gender = i % 5 < 3 ? 'MALE' : 'FEMALE';
      const pool = gender === 'MALE' ? MALE : FEMALE;

      let name;
      for (let tries = 0; ; tries++) {
        name = `${pool[(seq + tries * 5) % pool.length]} ${LAST[(seq * 7 + tries * 3 + ci) % LAST.length]}`;
        if (!usedNames.has(name.toLowerCase())) break;
        if (tries > 200) throw new Error('Could not generate a unique name');
      }
      usedNames.add(name.toLowerCase());
      seq++;

      // Sports: one base sport, optional extras. Every club gets >= 10 BGMI players (2+ BGMI teams).
      const chosen = new Set();
      chosen.add((i + ci) % orderedSports.length);
      if (i % 2 === 0) chosen.add((i + 3) % orderedSports.length);
      if (i % 5 === 0) chosen.add((i + 5) % orderedSports.length);
      if (bgmi >= 0 && i % 2 === 0) chosen.add(bgmi);

      const id = randomUUID();
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const code = String(club.code || 'CLB').toUpperCase();
      players.push({
        _id: id,
        registrationId: `SEED-${code}-${String(i + 1).padStart(3, '0')}`,
        name,
        email: `${slug}.${seq}@apl.internal`,
        gender,
        age: 18 + ((i * 7 + ci * 3) % 17),
        clubId: String(club._id),
        status: 'APPROVED',
        paymentStatus: 'PAID',
        totalPerformancePoints: 0,
        starPlayerCount: 0,
        registrationDate: now,
        createdAt: now,
        updatedAt: now,
      });
      chosen.forEach((si) => {
        regs.push({ _id: randomUUID(), playerId: id, sportId: String(orderedSports[si]._id), createdAt: now, updatedAt: now });
      });
    }
  });

  await playersCol.insertMany(players);
  await playerSportsCol.insertMany(regs);

  console.log(`Seeded ${players.length} players across ${clubs.length} clubs with ${regs.length} sport registrations.`);
  const perSport = {};
  regs.forEach((r) => {
    const n = orderedSports.find((s) => String(s._id) === r.sportId).name;
    perSport[n] = (perSport[n] || 0) + 1;
  });
  console.log('Registrations per sport:', perSport);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
