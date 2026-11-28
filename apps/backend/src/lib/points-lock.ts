import { db } from './db';
import { getSessionUser } from './auth';

export async function getPointsLockState(): Promise<{
  pointsLocked: boolean;
  isAdmin: boolean;
  hidePoints: boolean;
}> {
  try {
    const lockSetting = await db.tournamentSetting.findUnique({
      where: { key: 'POINTS_LOCKED' },
    });
    // Default to true (locked for Final Day as requested) unless explicitly set to 'false'
    const pointsLocked = lockSetting ? lockSetting.value === 'true' : true;
    const authUser = await getSessionUser();
    const isAdmin = authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'ADMIN';
    const hidePoints = pointsLocked && !isAdmin;
    return { pointsLocked, isAdmin, hidePoints };
  } catch {
    return { pointsLocked: false, isAdmin: false, hidePoints: false };
  }
}
