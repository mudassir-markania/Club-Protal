import { db } from './db';
import { AuthUser } from './auth';

export async function createAuditLog({
  user,
  action,
  entity,
  recordId,
  previousValue,
  updatedValue,
  ipAddress,
}: {
  user?: AuthUser | null;
  action: string;
  entity: string;
  recordId?: string | null;
  previousValue?: any;
  updatedValue?: any;
  ipAddress?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || 'System / Anonymous',
        role: user?.role || 'SYSTEM',
        action,
        entity,
        recordId: recordId || null,
        previousValue: previousValue ? JSON.stringify(previousValue) : null,
        updatedValue: updatedValue ? JSON.stringify(updatedValue) : null,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

