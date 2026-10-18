import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/certificate-templates — public list of active templates (for dropdowns)
// Pass ?all=1 (admin auth required) to get all templates including inactive
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const allMode = searchParams.get('all') === '1';

    if (allMode) {
      // Requires auth for full admin listing
      const authHeader = req.headers.get('authorization') ?? undefined;
      const cookieHeader = req.headers.get('cookie') ?? undefined;
      const { extractToken, verifyToken } = await import('@/lib/jwt');
      const token = extractToken(authHeader, cookieHeader);
      if (!token || !verifyToken(token)) {
        return err('Unauthorized', 401);
      }
      const templates = await query(
        `SELECT id, name, description, background_url, width, height, orientation, is_active, created_at, updated_at
         FROM certificate_templates
         ORDER BY name`
      );
      return ok(templates);
    }

    const templates = await query(
      `SELECT id, name, description, background_url, width, height, orientation, is_active, created_at, updated_at
       FROM certificate_templates
       WHERE is_active = true
       ORDER BY name`
    );
    return ok(templates);
  } catch (e) {
    console.error('GET /api/certificate-templates error:', e);
    return err('Internal server error', 500);
  }
}

// POST /api/certificate-templates — admin: create a new template
export async function POST(req: NextRequest) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const {
      name, description, background_url,
      width = 1200, height = 850, orientation = 'landscape',
    } = body as {
      name: string;
      description?: string;
      background_url?: string;
      width?: number;
      height?: number;
      orientation?: string;
    };

    if (!name?.trim()) return err('Template name is required');

    const template = await queryOne(
      `INSERT INTO certificate_templates
         (name, description, background_url, width, height, orientation, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        background_url || null,
        width,
        height,
        orientation,
        user.id,
      ]
    );

    await writeAuditLog(user.id, 'CREATE_CERTIFICATE_TEMPLATE', 'certificate_templates', (template as { id: string }).id, { name });
    return ok(template, 201);
  } catch (e) {
    console.error('POST /api/certificate-templates error:', e);
    return err('Internal server error', 500);
  }
}
