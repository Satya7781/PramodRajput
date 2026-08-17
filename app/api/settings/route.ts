import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const rows = await query(`SELECT key, value FROM site_settings`);
    const settings: Record<string, unknown> = {};
    for (const row of rows as { key: string; value: unknown }[]) {
      settings[row.key] = row.value;
    }
    return ok(settings);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      await queryOne(
        `INSERT INTO site_settings (key, value, updated_by) VALUES ($1,$2,$3)
         ON CONFLICT (key) DO UPDATE SET value=$2, updated_by=$3, updated_at=now()`,
        [key, JSON.stringify(value), user.id]
      );
    }

    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
