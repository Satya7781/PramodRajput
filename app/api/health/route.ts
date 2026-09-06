import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars are present
  checks.DATABASE_URL     = process.env.DATABASE_URL     ? 'set' : 'MISSING';
  checks.JWT_SECRET       = process.env.JWT_SECRET       ? 'set' : 'MISSING';
  checks.CLOUDINARY_NAME  = process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'MISSING';

  // Try DB connection
  try {
    const { query } = await import('@/lib/db');
    await query('SELECT 1');
    checks.db = 'connected';
  } catch (e: unknown) {
    checks.db = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  const allOk = Object.values(checks).every(v => v === 'set' || v === 'connected');
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 });
}
