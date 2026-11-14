import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const settings = await prisma.tournamentSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings, settingsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'ADMIN']);
    const body = await req.json(); // Array of { key, value, description? } or object { key: value }

    const updatedSettings: any[] = [];

    if (Array.isArray(body)) {
      for (const item of body) {
        const s = await prisma.tournamentSetting.upsert({
          where: { key: item.key },
          update: { value: item.value, description: item.description },
          create: { key: item.key, value: item.value, description: item.description },
        });
        updatedSettings.push(s);
      }
    } else {
      for (const [key, value] of Object.entries(body)) {
        const s = await prisma.tournamentSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
        updatedSettings.push(s);
      }
    }

    await createAuditLog({
      user,
      action: 'UPDATE_TOURNAMENT_SETTINGS',
      entity: 'TournamentSetting',
      updatedValue: body,
    });

    return NextResponse.json({ success: true, updatedSettings });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

