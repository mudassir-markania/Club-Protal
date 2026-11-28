/**
 * Seed only the roles and the admin login (nothing else).
 *
 *   node scripts/seed-admin.js
 *   ADMIN_PASSWORD="a-strong-password" node scripts/seed-admin.js     # choose the password
 *
 * Idempotent: re-running updates the same records (and resets the admin password to the one given).
 * Default login: admin@sportsportal.com / admin123  - change the password after the first sign-in.
 */
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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
const ADMIN_EMAIL = 'ubaid';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ubaid2303';

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const now = new Date();

  const roles = [
    { _id: 'role-super-admin', name: 'SUPER_ADMIN', description: 'Full control' },
    { _id: 'role-admin', name: 'ADMIN', description: 'Championship management' },
    { _id: 'role-referee', name: 'REFEREE', description: 'Match officiating' },
  ];
  for (const r of roles) {
    await db.collection('roles').updateOne(
      { name: r.name },
      { $set: { name: r.name, description: r.description, updatedAt: now }, $setOnInsert: { _id: r._id, createdAt: now } },
      { upsert: true }
    );
  }
  const superAdmin = await db.collection('roles').findOne({ name: 'SUPER_ADMIN' });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.collection('users').updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: { email: ADMIN_EMAIL, passwordHash, name: 'Championship Director', roleId: String(superAdmin._id), status: 'ACTIVE', updatedAt: now },
      $setOnInsert: { _id: 'user-admin', createdAt: now },
    },
    { upsert: true }
  );

  console.log(`Roles ready: ${roles.map((r) => r.name).join(', ')}`);
  console.log(`Admin ready: ${ADMIN_EMAIL} (SUPER_ADMIN)`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
