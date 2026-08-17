import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse } from '@/lib/api-helpers';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;

  try {
    const users = await query(
      `SELECT id, full_name, email, phone, avatar_url, role, is_active, created_at, updated_at
       FROM profiles ORDER BY created_at DESC`
    );
    return ok(users);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
