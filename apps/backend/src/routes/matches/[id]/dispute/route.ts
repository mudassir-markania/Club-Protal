import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { disputeReason } = body;

    const match = await db.match.findFirst({
      where: {
        OR: [{ id: params.id }, { matchCode: params.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const updated = await db.match.update({
      where: { id: match.id },
      data: {
        status: 'DISPUTED',
        notes: disputeReason ? `${match.notes || ''}\n[DISPUTE REPORTED by ${user.name}]: ${disputeReason}` : match.notes,
      },
    });

    // Notify admins
    await db.notification.create({
      data: {
        recipientRole: 'ADMIN',
        title: `Match Dispute Reported: ${match.matchCode}`,
        message: `${user.name} reported a dispute for match ${match.matchCode}: "${disputeReason || 'No details provided'}"`,
        type: 'DISPUTE',
        link: `/admin/matches/${match.matchCode}`,
      },
    });

    await createAuditLog({
      user,
      action: 'REPORT_DISPUTE',
      entity: 'Match',
      recordId: match.id,
      updatedValue: { status: 'DISPUTED', disputeReason },
    });

    return NextResponse.json({ success: true, match: updated });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

