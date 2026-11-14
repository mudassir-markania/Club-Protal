import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json();

    const { records, fieldMapping } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No records provided for import' }, { status: 400 });
    }

    const mapping = fieldMapping || {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      age: 'Age',
      clubPreference: 'Club Preference',
      sportsSelected: 'Sport(s) Selected',
    };

    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const importedIds: string[] = [];

    for (const row of records) {
      try {
        const fullName =
          row[mapping.fullName] ||
          row['Full Name'] ||
          row['Name'] ||
          row['Player Name'] ||
          '';

        const email = (
          row[mapping.email] ||
          row['Email'] ||
          row['Email Address'] ||
          ''
        )
          .toLowerCase()
          .trim();

        const phone = row[mapping.phone] || row['Phone'] || row['Contact Number'] || null;
        const gender = row[mapping.gender] || row['Gender'] || null;
        const age = parseInt(row[mapping.age] || row['Age'] || '0') || null;
        const clubPreference =
          row[mapping.clubPreference] ||
          row['Club Preference'] ||
          row['Club'] ||
          'Unassigned';

        const sportsSelected =
          row[mapping.sportsSelected] ||
          row['Sport(s) Selected'] ||
          row['Sports'] ||
          '';

        if (!fullName || !email) {
          failedCount++;
          continue;
        }

        // Duplicate Check
        const existingReg = await db.registration.findFirst({
          where: { email },
        });

        const existingPlayer = await db.player.findFirst({
          where: { email },
        });

        const isDuplicate = Boolean(existingReg || existingPlayer);
        const subId = `CSV-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

        const reg = await db.registration.create({
          data: {
            submissionId: subId,
            fullName,
            email,
            phone,
            gender,
            age,
            clubPreference,
            sportsSelected,
            source: 'CSV_IMPORT',
            status: isDuplicate ? 'DUPLICATE' : 'PENDING',
            duplicateOfId: existingReg ? existingReg.submissionId : (existingPlayer ? existingPlayer.registrationId : null),
            rawData: JSON.stringify(row),
          },
        });

        importedIds.push(reg.id);

        if (isDuplicate) {
          duplicateCount++;
        } else {
          importedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    // Record Sync Log
    const syncLog = await db.synchronizationLog.create({
      data: {
        syncType: 'CSV_IMPORT',
        totalFound: records.length,
        importedCount,
        duplicateCount,
        failedCount,
        status: failedCount > 0 && importedCount === 0 ? 'FAILED' : (duplicateCount > 0 ? 'WARNING' : 'SUCCESS'),
        logDetails: JSON.stringify({
          source: 'CSV/Excel File Upload',
          totalRows: records.length,
          importedCount,
          duplicateCount,
          failedCount,
        }),
      },
    });

    await createAuditLog({
      user,
      action: 'CSV_REGISTRATION_IMPORT',
      entity: 'Registration',
      recordId: syncLog.id,
      updatedValue: { total: records.length, importedCount, duplicateCount, failedCount },
    });

    return NextResponse.json({
      success: true,
      message: `Import completed: ${importedCount} records added, ${duplicateCount} duplicates identified, ${failedCount} errors.`,
      summary: {
        totalFound: records.length,
        importedCount,
        duplicateCount,
        failedCount,
      },
      syncLog,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

