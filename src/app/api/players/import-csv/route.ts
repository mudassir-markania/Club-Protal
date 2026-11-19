import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

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
      if (!raw) return null;
      const s = raw.toLowerCase().trim();
      return (
        clubs.find((c: any) => c.id.toLowerCase() === s) ||
        clubs.find((c: any) => c.name.toLowerCase() === s) ||
        clubs.find((c: any) => c.code.toLowerCase() === s) ||
        (s.includes('mav') ? clubs.find((c: any) => c.code === 'MAV' || c.name === 'Blue') : null) ||
        (s.includes('dom') ? clubs.find((c: any) => c.code === 'DOM' || c.name === 'Red') : null) ||
        (s.includes('crw') || s.includes('crew') || s.includes('crown')
          ? clubs.find((c: any) => c.code === 'CRW' || c.name === 'Yellow')
          : null) ||
        (s.includes('alp') || s.includes('alpha')
          ? clubs.find((c: any) => c.code === 'ALP' || c.name === 'Green')
          : null) ||
        (s.includes('ryl') || s.includes('royal')
          ? clubs.find((c: any) => c.code === 'RYL' || c.name === 'Purple')
          : null) ||
        clubs[0]
      );
    };

    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;

    for (const row of records) {
      try {
        // Extract Name from common header variations
        const name =
          row['Participant Name'] ||
          row['Player Name'] ||
          row['Full Name'] ||
          row['Name'] ||
          row['name'] ||
          '';

        const cleanName = typeof name === 'string' ? name.trim() : '';
        if (!cleanName) {
          failedCount++;
          continue;
        }

        // Extract House/Club
        const houseInput =
          row['Assigned Club'] ||
          row['Club'] ||
          row['House'] ||
          row['House Name'] ||
          row['Club Preference'] ||
          row['house'] ||
          row['club'] ||
          '';

        const club = normalizeClub(houseInput) || clubs[0];
        if (!club) {
          failedCount++;
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

        // Extract Gender
        const rawGender = (row['Gender'] || row['gender'] || 'MALE').toUpperCase().trim();
        const gender = rawGender.startsWith('F') ? 'FEMALE' : rawGender.startsWith('O') ? 'OTHER' : 'MALE';

        // Extract Age
        const rawAge = row['Age'] || row['age'] || null;
        const age = rawAge ? parseInt(rawAge) : 22;

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
            age: isNaN(age) ? 22 : age,
            clubId: club.id,
            status: 'APPROVED',
            paymentStatus: 'PAID',
          },
        });

        // Extract and assign participating sports if provided
        const rawSports =
          row['Participating Sports'] ||
          row['Sports'] ||
          row['Sport'] ||
          row['Sport(s) Selected'] ||
          '';

        if (rawSports && typeof rawSports === 'string') {
          const sportTokens = rawSports.split(/[,;/]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
          for (const token of sportTokens) {
            const matchedSport = sports.find(
              (s: any) =>
                s.name.toLowerCase() === token ||
                s.name.toLowerCase().includes(token) ||
                token.includes(s.name.toLowerCase())
            );
            if (matchedSport) {
              await db.playerSport.create({
                data: {
                  playerId: player.id,
                  sportId: matchedSport.id,
                },
              }).catch(() => {}); // ignore duplicates
            }
          }
        }

        importedCount++;
      } catch (err) {
        console.error('Error importing row:', err);
        failedCount++;
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
      message: `Import complete: ${importedCount} athletes added successfully, ${duplicateCount} duplicates skipped, ${failedCount} errors.`,
      summary: {
        totalFound: records.length,
        importedCount,
        duplicateCount,
        failedCount,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
