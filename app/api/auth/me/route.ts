import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const profile = await queryOne(
      `SELECT id, full_name, email, phone, avatar_url, role, is_active, created_at, updated_at
       FROM profiles WHERE id = $1`,
      [user.id]
    );

    if (!profile) return err('User not found', 404);
    return ok(profile);
  } catch (e) {
    console.error('Get me error:', e);
    return err('Internal server error', 500);
  }
}
