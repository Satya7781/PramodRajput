import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse } from '@/lib/api-helpers';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '200', 10);
    const search = searchParams.get('search');

    let sql = `
      SELECT al.*, p.full_name as user_name
      FROM audit_logs al
      LEFT JOIN profiles p ON p.id = al.user_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      sql += ` AND (al.action ILIKE $${idx} OR al.entity_type ILIKE $${idx} OR p.full_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${idx}`;
    params.push(limit);

    const logs = await query(sql, params);
    return ok(logs);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
