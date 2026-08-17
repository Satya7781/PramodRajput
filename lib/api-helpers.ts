import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, JwtPayload } from './jwt';

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getAuthUser(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get('authorization') ?? undefined;
  const cookieHeader = req.headers.get('cookie') ?? undefined;
  const token = extractToken(authHeader, cookieHeader);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest): { user: JwtPayload } | NextResponse {
  const user = getAuthUser(req);
  if (!user) return err('Unauthorized', 401);
  return { user };
}

export function requireAdmin(req: NextRequest): { user: JwtPayload } | NextResponse {
  const user = getAuthUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'admin') return err('Forbidden: admin access required', 403);
  return { user };
}

export function requireEditor(req: NextRequest): { user: JwtPayload } | NextResponse {
  const user = getAuthUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'admin' && user.role !== 'editor') return err('Forbidden', 403);
  return { user };
}

export function isResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse;
}

// Helper to write an audit log entry (non-blocking, best-effort)
export async function writeAuditLog(
  userId: string | null,
  action: string,
  entityType: string | null,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
) {
  try {
    const { query } = await import('./db');
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entityType, entityId, JSON.stringify(metadata)]
    );
  } catch {
    // Don't fail the request if audit logging fails
  }
}
