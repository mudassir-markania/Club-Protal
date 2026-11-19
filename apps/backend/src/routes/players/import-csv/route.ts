import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// Helper to look up a field from a CSV row case-insensitively and ignoring non-alphanumeric chars
function getField(row: any, aliases: string[]): string {
  if (!row || typeof row !== 'object') return '';
  const entries = Object.entries(row);
  for (const [key, val] of entries) {
    if (val === undefined || val === null) continue;
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const alias of aliases) {
      const cleanAlias = alias.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanKey === cleanAlias || cleanKey.includes(cleanAlias)) {
        const strVal = String(val).trim();
        if (strVal.length > 0) return strVal;
      }
    }
  }
  return '';
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No records provided for CSV import' }, { status: 400 });
    }

    // Fetch available clubs and sports to resolve references
    const [clubs, sports] = await Promise.all([
      db.club.findMany({}),
      db.sport.findMany({}),
    ]);

    const normalizeClub = (raw: string): any => {
      if (!raw || typeof raw !== 'string') return null;
      const s = raw.toLowerCase().trim();

      // 1. Direct ID, code, or exact name match
      const direct = clubs.find(
        (c: any) =>
          (c.id && c.id.toLowerCase() === s) ||
          (c.code && c.code.toLowerCase() === s) ||
          (c.name && c.name.toLowerCase() === s)
      );
      if (direct) return direct;

      // 2. House Names / Codes / Color Aliases
      // Blue -> Mavericks (MAV)
      if (s.includes('blue') || s.includes('mav') || s === 'mav') {
        return clubs.find((c: any) => c.code?.toUpperCase() === 'MAV' || c.name?.toLowerCase().includes('mav')) || clubs[0];
      }
      // Red -> Dominator (DOM)
      if (s.includes('red') || s.includes('dom') || s === 'dom') {
        return clubs.find((c: any) => c.code?.toUpperCase() === 'DOM' || c.name?.toLowerCase().includes('dom')) || clubs[1];
      }
      // Yellow -> Crown Crushers (CRW)
      if (s.includes('yellow') || s.includes('crw') || s.includes('crown') || s.includes('crush') || s === 'crw') {
        return clubs.find((c: any) => c.code?.toUpperCase() === 'CRW' || c.name?.toLowerCase().includes('crown')) || clubs[4];
      }
      // Green -> Alpha (ALP)
      if (s.includes('green') || s.includes('alp') || s.includes('alpha') || s === 'alp') {
        return clubs.find((c: any) => c.code?.toUpperCase() === 'ALP' || c.name?.toLowerCase().includes('alpha')) || clubs[2];
      }
      // Purple -> Royal Force (RYL)
      if (s.includes('purple') || s.includes('ryl') || s.includes('royal') || s === 'ryl') {
        return clubs.find((c: any) => c.code?.toUpperCase() === 'RYL' || c.name?.toLowerCase().includes('royal')) || clubs[3];
      }

      return null;
    };

    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const failures: { row: number; name: string; reason: string }[] = [];
    const fail = (idx: number, name: string, reason: string) => {
      failedCount++;
      failures.push({ row: idx + 2, name, reason }); // +2 = header line + 1-based
    };

    for (let rowIdx = 0; rowIdx < records.length; rowIdx++) {
      const row = records[rowIdx];
      try {
        // Extract Name from common header variations
        const cleanName = getField(row, [
          'participantname',
          'playername',
          'fullname',
          'athlete',
          'name',
        ]);

        if (!cleanName) {
          fail(rowIdx, '', 'Missing participant name (expected a "Participant Name" column)');
          continue;
        }

        // Extract House/Club
        const houseInput = getField(row, [
          'assignedhouse',
          'assignedclub',
          'house',
          'club',
          'housename',
          'clubpreference',
          'team',
          'color',
          'housecolor',
        ]);

        const club = normalizeClub(houseInput) || clubs[0];
        if (!club) {
          fail(rowIdx, cleanName, 'No matching house/club found');
          continue;
        }

        // Check if player with same name in same club already exists
        const existing = await db.player.findFirst({
          where: {
            name: { equals: cleanName, mode: 'insensitive' },
            clubId: club.id,
          },
        });

        if (existing) {
          duplicateCount++;
          continue;
        }

        // Resolve participating sports first: every athlete needs at least one valid sport
        const rawSportsCell = getField(row, ['participatingsports', 'participatingsport', 'sportsselected', 'sports', 'sport']);
        const resolvedSportIds = new Set<string>();
        if (rawSportsCell && typeof rawSportsCell === 'string') {
          for (const token of rawSportsCell.split(/[,;/]+/).map((x) => x.trim().toLowerCase()).filter(Boolean)) {
            const m = sports.find((s: any) => {
              const sName = (s.name || '').toLowerCase();
              if (sName === token) return true;
              if (token === 'tt' && sName.includes('table tennis')) return true;
              return sName.includes(token) || token.includes(sName);
            });
            if (m) resolvedSportIds.add(m.id);
          }
        }
        if (resolvedSportIds.size === 0) {
          fail(
            rowIdx,
            cleanName,
            rawSportsCell
              ? `Unrecognised sport "${rawSportsCell}"`
              : 'No sport given (add a "Participating Sports" column, e.g. "Badminton, Cricket")'
          );
          continue;
        }

        // Extract Gender
        const rawGender = getField(row, ['gender', 'sex']).toUpperCase();
        const gender = rawGender.startsWith('F') ? 'FEMALE' : rawGender.startsWith('O') ? 'OTHER' : 'MALE';

        // Extract Age
        const rawAge = getField(row, ['age', 'years']);
        const parsedAge = rawAge ? parseInt(rawAge) : 22;
        const age = isNaN(parsedAge) ? 22 : parsedAge;

        // Auto-generate unique registration ID and internal identifier email
        const nameSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'athlete';
        const uniqueSuffix = `${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
        const regId = `REG-${club.code || 'ATH'}-${uniqueSuffix}`;
        const email = `${nameSlug}.${uniqueSuffix}@apl.internal`;

        const player = await db.player.create({
          data: {
            name: cleanName,
            registrationId: regId,
            email,
            gender,
            age,
            clubId: club.id,
            status: 'APPROVED',
            paymentStatus: 'PAID',
          },
        });

        for (const sportId of Array.from(resolvedSportIds)) {
          await db.playerSport.create({ data: { playerId: player.id, sportId } }).catch(() => {}); // ignore duplicates
        }

        importedCount++;
      } catch (err) {
        console.error('Error importing row:', err);
        fail(rowIdx, '', err instanceof Error ? err.message : 'Unexpected error');
      }
    }

    await createAuditLog({
      user,
      action: 'CSV_PLAYER_ROSTER_IMPORT',
      entity: 'Player',
      recordId: `BATCH-${Date.now()}`,
      updatedValue: { total: records.length, importedCount, duplicateCount, failedCount },
    });

    return NextResponse.json({
      success: true,
      message:
        `Import complete: ${importedCount} athletes added successfully, ${duplicateCount} duplicates skipped, ${failedCount} errors.` +
        (failures.length
          ? ` Examples: ${failures.slice(0, 3).map((f) => `row ${f.row}${f.name ? ` (${f.name})` : ''}: ${f.reason}`).join(' | ')}`
          : ''),
      summary: {
        totalFound: records.length,
        importedCount,
        duplicateCount,
        failedCount,
        failures: failures.slice(0, 50),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

