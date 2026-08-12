import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, fullName?: string, requestedRole?: string, chiefdom?: string) {
  try {
    // Default admin role for initial council officer emails if specified, or default citizen
    const role = requestedRole || (email.includes('admin') || email.includes('council') ? 'admin' : 'citizen');
    const name = fullName || email.split('@')[0] || 'District Citizen';

    const result = await db.insert(users)
      .values({
        uid,
        email,
        fullName: name,
        role,
        chiefdom: chiefdom || 'Kakua'
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(fullName ? { fullName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Failed to register or sync user profile', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.error('Database getUserByUid failed:', error);
    throw new Error('Failed to retrieve user by UID', { cause: error });
  }
}

export async function updateUserRole(uid: string, role: 'citizen' | 'officer' | 'admin', chiefdom?: string) {
  try {
    const result = await db.update(users)
      .set({
        role,
        ...(chiefdom ? { chiefdom } : {})
      })
      .where(eq(users.uid, uid))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database updateUserRole failed:', error);
    throw new Error('Failed to update user role/privileges', { cause: error });
  }
}
