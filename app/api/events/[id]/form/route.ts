import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';

// GET /api/events/[id]/form — public (for registration page)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const form = await queryOne(
      `SELECT * FROM event_forms WHERE event_id=$1 AND is_active=true`,
      [params.id]
    );
    if (!form) return ok(null);

    const fields = await query(
      `SELECT f.*, json_agg(
         json_build_object('id',o.id,'label',o.label,'value',o.value,'sort_order',o.sort_order)
         ORDER BY o.sort_order
       ) FILTER (WHERE o.id IS NOT NULL) AS form_field_options
       FROM form_fields f
       LEFT JOIN form_field_options o ON o.field_id = f.id
       WHERE f.form_id=$1 AND f.is_active=true
       GROUP BY f.id
       ORDER BY f.sort_order`,
      [(form as { id: string }).id]
    );

    return ok({ form, fields });
  } catch (e) {
    console.error('GET /api/events/[id]/form error:', e);
    return err('Internal server error', 500);
  }
}

// PUT /api/events/[id]/form — admin: upsert form + replace fields
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const body = await req.json();
    const { title, description, fields } = body as {
      title: string;
      description: string;
      fields: Array<{
        id?: string;
        field_type: string;
        field_key: string;
        label: string;
        description?: string;
        placeholder?: string;
        is_required: boolean;
        sort_order: number;
        options: Array<{ id?: string; label: string; value: string }>;
      }>;
    };

    // Upsert the event form
    let form = await queryOne<{ id: string }>(
      `SELECT id FROM event_forms WHERE event_id=$1`,
      [params.id]
    );

    if (form) {
      await queryOne(
        `UPDATE event_forms SET title=$1, description=$2, updated_at=now() WHERE id=$3`,
        [title, description || null, form.id]
      );
    } else {
      form = await queryOne<{ id: string }>(
        `INSERT INTO event_forms (event_id, title, description, is_active)
         VALUES ($1,$2,$3,true) RETURNING id`,
        [params.id, title, description || null]
      );
    }

    if (!form) return err('Failed to upsert form', 500);

    // Delete all existing fields (cascade deletes options)
    await query(`DELETE FROM form_fields WHERE form_id=$1`, [form.id]);

    // Re-insert fields and options
    for (const field of fields ?? []) {
      const inserted = await queryOne<{ id: string }>(
        `INSERT INTO form_fields
           (form_id, field_type, field_key, label, description, placeholder, is_required, sort_order, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING id`,
        [
          form.id, field.field_type, field.field_key, field.label,
          field.description || null, field.placeholder || null,
          field.is_required, field.sort_order,
        ]
      );
      if (inserted && field.options?.length) {
        for (let i = 0; i < field.options.length; i++) {
          const opt = field.options[i];
          await query(
            `INSERT INTO form_field_options (field_id, label, value, sort_order) VALUES ($1,$2,$3,$4)`,
            [inserted.id, opt.label, opt.value, i]
          );
        }
      }
    }

    // Return the updated form with fields
    const updatedFields = await query(
      `SELECT f.*, json_agg(
         json_build_object('id',o.id,'label',o.label,'value',o.value,'sort_order',o.sort_order)
         ORDER BY o.sort_order
       ) FILTER (WHERE o.id IS NOT NULL) AS form_field_options
       FROM form_fields f
       LEFT JOIN form_field_options o ON o.field_id = f.id
       WHERE f.form_id=$1
       GROUP BY f.id
       ORDER BY f.sort_order`,
      [form.id]
    );

    return ok({ form: { id: form.id, title, description }, fields: updatedFields });
  } catch (e) {
    console.error('PUT /api/events/[id]/form error:', e);
    return err('Internal server error', 500);
  }
}
