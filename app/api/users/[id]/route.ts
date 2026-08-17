import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;

  try {
    const body = await req.json();
    const { role, is_active } = body as { role?: 'admin' | 'editor'; is_active?: boolean };

    const setClauses: string[] = ['updated_at=now()'];
    const values: unknown[] = [];
    let idx = 1;

    if (role !== undefined) { setClauses.push(`role=$${idx++}`); values.push(role); }
    if (is_active !== undefined) { setClauses.push(`is_active=$${idx++}`); values.push(is_active); }

    values.push(params.id);
    const user = await queryOne(
      `UPDATE profiles SET ${setClauses.join(',')} WHERE id=$${idx} RETURNING id, full_name, email, role, is_active`,
      values
    );

    if (!user) return err('User not found', 404);
    return ok(user);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
