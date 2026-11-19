import { NextResponse } from '@/http/next-server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();

    let where: any = {};
    if (user) {
      if (user.role === 'REFEREE') {
        where = {
          OR: [
            { recipientRole: 'REFEREE' },
            { recipientUserId: user.id },
          ],
        };
      } else {
        where = {
          OR: [
            { recipientRole: 'ADMIN' },
            { recipientRole: null },
            { recipientUserId: user.id },
          ],
        };
      }
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { ...where, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    if (body.notificationId) {
      await db.notification.update({
        where: { id: body.notificationId },
        data: { isRead: true },
      });
    } else {
      await db.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

