import { NextRequest } from 'next/server';
import { ok, err, requireAdmin, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/certificate-templates/[id] — admin: get full template with fields
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;

  try {
    const template = await queryOne(
      `SELECT * FROM certificate_templates WHERE id = $1`,
      [params.id]
    );
    if (!template) return err('Template not found', 404);

    const fields = await query(
      `SELECT * FROM certificate_template_fields WHERE template_id = $1 ORDER BY field_key`,
      [params.id]
    );

    return ok({ template, fields });
  } catch (e) {
    console.error('GET /api/certificate-templates/[id] error:', e);
    return err('Internal server error', 500);
  }
}

// PUT /api/certificate-templates/[id] — admin: update template + upsert fields
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    const body = await req.json();
    const {
      name, description, background_url,
      width, height, orientation, is_active,
      fields,
    } = body as {
      name: string;
      description?: string;
      background_url?: string;
      width?: number;
      height?: number;
      orientation?: string;
      is_active?: boolean;
      fields?: Array<{
        field_key: string;
        label: string;
        x_position: number;
        y_position: number;
        width?: number;
        height?: number;
        font_family?: string;
        font_size?: number;
        font_weight?: string;
        text_align?: string;
        color?: string;
      }>;
    };

    if (!name?.trim()) return err('Template name is required');

    const template = await queryOne(
      `UPDATE certificate_templates SET
         name = $1, description = $2, background_url = $3,
         width = $4, height = $5, orientation = $6, is_active = $7,
         updated_at = now()
       WHERE id = $8 RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        background_url || null,
        width ?? 1200,
        height ?? 850,
        orientation ?? 'landscape',
        is_active ?? true,
        params.id,
      ]
    );

    if (!template) return err('Template not found', 404);

    // Replace template fields if provided
    if (fields !== undefined) {
      await query(`DELETE FROM certificate_template_fields WHERE template_id = $1`, [params.id]);
      for (const f of fields) {
        await query(
          `INSERT INTO certificate_template_fields
             (template_id, field_key, label, x_position, y_position, width, height,
              font_family, font_size, font_weight, text_align, color)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            params.id,
            f.field_key,
            f.label,
            f.x_position,
            f.y_position,
            f.width ?? 300,
            f.height ?? 50,
            f.font_family ?? 'Helvetica',
            f.font_size ?? 24,
            f.font_weight ?? 'normal',
            f.text_align ?? 'center',
            f.color ?? '#000000',
          ]
        );
      }
    }

    await writeAuditLog(user.id, 'UPDATE_CERTIFICATE_TEMPLATE', 'certificate_templates', params.id, { name });
    return ok(template);
  } catch (e) {
    console.error('PUT /api/certificate-templates/[id] error:', e);
    return err('Internal server error', 500);
  }
}

// DELETE /api/certificate-templates/[id] — admin: soft-delete (deactivate)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAdmin(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;

  try {
    // Check if template is in use
    const inUse = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM certificates WHERE template_id = $1`,
      [params.id]
    );
    if (parseInt(inUse?.count ?? '0', 10) > 0) {
      // Soft delete — deactivate instead of hard delete
      await queryOne(
        `UPDATE certificate_templates SET is_active = false, updated_at = now() WHERE id = $1`,
        [params.id]
      );
      await writeAuditLog(user.id, 'DEACTIVATE_CERTIFICATE_TEMPLATE', 'certificate_templates', params.id, {});
      return ok({ message: 'Template deactivated (in use by certificates)' });
    }

    await queryOne(`DELETE FROM certificate_templates WHERE id = $1 RETURNING id`, [params.id]);
    await writeAuditLog(user.id, 'DELETE_CERTIFICATE_TEMPLATE', 'certificate_templates', params.id, {});
    return ok({ success: true });
  } catch (e) {
    console.error('DELETE /api/certificate-templates/[id] error:', e);
    return err('Internal server error', 500);
  }
}
