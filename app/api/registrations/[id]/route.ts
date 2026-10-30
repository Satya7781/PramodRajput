import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/registrations/[id]/values — admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;

  try {
    const values = await query(
      `SELECT rv.field_id, rv.value_text, rv.value_json, rv.file_url, ff.label, ff.field_type
       FROM registration_values rv
       LEFT JOIN form_fields ff ON ff.id = rv.field_id
       WHERE rv.registration_id = $1
       ORDER BY ff.sort_order`,
      [params.id]
    );
    // Normalise output: prefer value_text, fall back to file_url for file/image fields
    const normalised = (values as Array<{ field_id: string; value_text: string | null; value_json: unknown; file_url: string | null; label: string | null; field_type: string | null }>).map((v) => ({
      field_id: v.field_id,
      label: v.label ?? 'Unknown',
      value: v.file_url ?? v.value_text ?? '',
      field_type: v.field_type,
    }));
    return ok(normalised);
  } catch (e) {
    console.error('GET /api/registrations/[id] error:', e);
    return err('Internal server error', 500);
  }
}

// PUT /api/registrations/[id] — admin only: update status or participant values
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  // ISSUE-14 fix: only admins can approve/reject registrations
  if (user.role !== 'admin') return err('Forbidden: admin access required', 403);

  try {
    const body = await req.json();
    const { status, values } = body as {
      status?: string;
      values?: Array<{ field_id: string; value: string }>;
    };

    if (values !== undefined) {
      if (!Array.isArray(values)) return err('Invalid participant values');
      const registration = await queryOne<{ id: string; form_id: string }>(
        `SELECT id, form_id FROM registrations WHERE id = $1`,
        [params.id]
      );
      if (!registration) return err('Registration not found', 404);

      for (const value of values) {
        if (!value.field_id || typeof value.value !== 'string') {
          return err('Invalid participant value');
        }

        const field = await queryOne<{ id: string; field_type: string }>(
          `SELECT id, field_type FROM form_fields WHERE id = $1 AND form_id = $2`,
          [value.field_id, registration.form_id]
        );
        if (!field) return err('Invalid form field');

        const isFileField = field.field_type === 'file' || field.field_type === 'image';
        const valueText = isFileField ? null : value.value;
        const fileUrl = isFileField ? value.value || null : null;
        const updated = await queryOne(
          `UPDATE registration_values
           SET value_text = $1, file_url = $2, updated_at = now()
           WHERE registration_id = $3 AND field_id = $4
           RETURNING id`,
          [valueText, fileUrl, params.id, value.field_id]
        );
        if (!updated) {
          await queryOne(
            `INSERT INTO registration_values
               (registration_id, field_id, value_text, file_url, updated_at)
             VALUES ($1, $2, $3, $4, now())`,
            [params.id, value.field_id, valueText, fileUrl]
          );
        }
      }

      await writeAuditLog(user.id, 'UPDATE_REGISTRATION_DETAILS', 'registrations', params.id, {
        fields_updated: values.length,
      });
      return ok({ success: true });
    }

    if (!status || !['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return err('Invalid status');
    }

    const registration = await queryOne(
      `UPDATE registrations SET status=$1, reviewed_at=now(), reviewed_by=$2, updated_at=now()
       WHERE id=$3 RETURNING *`,
      [status, user.id, params.id]
    );

    if (!registration) return err('Registration not found', 404);
    await writeAuditLog(user.id, `REGISTRATION_${status.toUpperCase()}`, 'registrations', params.id, { status });
    return ok(registration);
  } catch (e) {
    console.error('PUT /api/registrations/[id] error:', e);
    return err('Internal server error', 500);
  }
}
