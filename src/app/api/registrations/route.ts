import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { submissionId: { contains: search } },
        { clubPreference: { contains: search } },
      ];
    }

    const registrations = await db.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Compute stats
    const totalCount = await db.registration.count();
    const approvedCount = await db.registration.count({ where: { status: 'APPROVED' } });
    const pendingCount = await db.registration.count({ where: { status: 'PENDING' } });
    const rejectedCount = await db.registration.count({ where: { status: 'REJECTED' } });
    const duplicateCount = await db.registration.count({ where: { status: 'DUPLICATE' } });

    const integration = await db.googleIntegration.findFirst({
      include: {
        syncLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      registrations,
      stats: {
        total: totalCount,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        duplicate: duplicateCount,
      },
      integration,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Manual registration or Google Forms Webhook receiver
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      phone,
      gender,
      age,
      clubPreference,
      sportsSelected,
      teamName,
      source,
      rawData,
    } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full Name and Email are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Duplicate detection strategy
    const existingRegistration = await db.registration.findFirst({
      where: { email: cleanEmail },
    });

    const existingPlayer = await db.player.findFirst({
      where: { email: cleanEmail },
    });

    const isDuplicate = Boolean(existingRegistration || existingPlayer);
    const submissionId = `GF-SUB-${Date.now().toString().slice(-6)}`;

    const registration = await db.registration.create({
      data: {
        submissionId,
        fullName,
        email: cleanEmail,
        phone: phone || null,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        clubPreference: clubPreference || 'Unassigned',
        sportsSelected: typeof sportsSelected === 'string' ? sportsSelected : (Array.isArray(sportsSelected) ? sportsSelected.join(', ') : ''),
        teamName: teamName || null,
        source: source || 'GOOGLE_SHEETS',
        status: isDuplicate ? 'DUPLICATE' : 'PENDING',
        duplicateOfId: existingRegistration ? existingRegistration.submissionId : (existingPlayer ? existingPlayer.registrationId : null),
        rawData: rawData ? (typeof rawData === 'string' ? rawData : JSON.stringify(rawData)) : null,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        recipientRole: 'ADMIN',
        title: isDuplicate ? 'Duplicate Registration Detected' : 'New Form Registration Received',
        message: `${fullName} (${cleanEmail}) submitted registration for ${clubPreference}. ${isDuplicate ? '[Flagged as DUPLICATE]' : '[Pending Review]'}`,
        type: 'REGISTRATION',
        link: '/admin/registrations',
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

