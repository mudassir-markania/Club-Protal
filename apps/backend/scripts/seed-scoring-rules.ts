/**
 * Seed the official scoring rules (sports_points_distribution.pdf) into MongoDB.
 *
 *   npx tsx scripts/seed-scoring-rules.ts           # add rules that are missing; keep rules you edited
 *   npx tsx scripts/seed-scoring-rules.ts --reset   # overwrite every official rule with the PDF values
 *
 * Also clears the "rules deliberately deleted" markers, so the points engine uses the rules again.
 * Custom rules you created (codes not in the PDF) are never touched.
 */
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { DEFAULT_OFFICIAL_RULES, OFFICIAL_CATEGORY_LABELS } from '@club-portal/shared';
import { inferRuleTrigger, inferRuleCategory } from '@club-portal/shared';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

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
const SPORTS = ['FOOTBALL', 'BGMI', 'CRICKET', 'BADMINTON', 'CARROM', 'CHESS'];

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db!;
  const rules = db.collection('sportscoringrules');
  const settings = db.collection('tournamentsettings');
  const now = new Date();

  let added = 0;
  let refreshed = 0;
  let kept = 0;

  for (const def of DEFAULT_OFFICIAL_RULES) {
    const doc = {
      sport: def.sport,
      ruleCode: def.ruleCode,
      ruleName: def.ruleName,
      category: inferRuleCategory(def.ruleCode, def.category || null),
      awardType: def.awardType,
      isTournamentLevel: Boolean(def.isTournamentLevel),
      points: def.points,
      description: def.description,
      conditions: def.conditions ? JSON.stringify(def.conditions) : null,
      trigger: inferRuleTrigger(def.ruleCode, def.awardType) || null,
      enabled: true,
      updatedAt: now,
    };

    const existing = await rules.findOne({ ruleCode: def.ruleCode });
    if (!existing) {
      await rules.insertOne({ _id: randomUUID() as any, ...doc, createdAt: now });
      added++;
    } else if (RESET) {
      await rules.updateOne({ _id: existing._id }, { $set: doc });
      refreshed++;
    } else {
      // keep admin edits, but make sure the rule can be used by the engine
      const patch: Record<string, unknown> = {};
      if (existing.trigger === undefined && doc.trigger) patch.trigger = doc.trigger;
      if (existing.enabled === undefined) patch.enabled = true;
      if (Object.keys(patch).length) await rules.updateOne({ _id: existing._id }, { $set: { ...patch, updatedAt: now } });
      kept++;
    }
  }

  // Category labels (MD, WD, Mixed, ...) - only created when missing
  for (const [key, label] of Object.entries(OFFICIAL_CATEGORY_LABELS)) {
    const settingKey = `CATEGORY_LABEL_${key.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    await settings.updateOne(
      { key: settingKey },
      { $setOnInsert: { _id: randomUUID() as any, key: settingKey, value: label, description: `Configurable label for official event category "${key}"`, createdAt: now }, $set: { updatedAt: now } },
      { upsert: true }
    );
  }

  // Rules are back: the engine must not treat them as deliberately deleted
  for (const sport of SPORTS) {
    await settings.updateOne(
      { key: `SCORING_RULES_PURGED_${sport}` },
      { $set: { value: 'false', updatedAt: now }, $setOnInsert: { _id: randomUUID() as any, key: `SCORING_RULES_PURGED_${sport}`, description: `Scoring rules for ${sport} were deliberately cleared`, createdAt: now } },
      { upsert: true }
    );
  }

  const total = await rules.countDocuments({});
  const perSport: Record<string, number> = {};
  for (const s of SPORTS) perSport[s] = await rules.countDocuments({ sport: s });

  console.log(`Official rules: ${DEFAULT_OFFICIAL_RULES.length}. Added ${added}, ${RESET ? `reset ${refreshed}` : `kept ${kept}`}.`);
  console.log(`Total rules in database: ${total}`, perSport);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
