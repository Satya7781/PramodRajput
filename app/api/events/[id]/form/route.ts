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

// PUT /api/events/[id]/form — admin: upsert form + update fields without destroying existing registration data
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const body = await req.json();
    const { title, description, fields, name_field_key } = body as {
      title: string;
      description: string;
      name_field_key?: string;
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
      // Try updating with name_field_key (requires migration_v4/v5 to have run)
      try {
        await queryOne(
          `UPDATE event_forms SET title=$1, description=$2, name_field_key=$3, updated_at=now() WHERE id=$4`,
          [title, description || null, name_field_key || null, form.id]
        );
      } catch {
        // Fallback: column may not exist yet — update without it
        await queryOne(
          `UPDATE event_forms SET title=$1, description=$2, updated_at=now() WHERE id=$3`,
          [title, description || null, form.id]
        );
      }
    } else {
      try {
        form = await queryOne<{ id: string }>(
          `INSERT INTO event_forms (event_id, title, description, name_field_key, is_active)
           VALUES ($1,$2,$3,$4,true) RETURNING id`,
          [params.id, title, description || null, name_field_key || null]
        );
      } catch {
        // Fallback without name_field_key column
        form = await queryOne<{ id: string }>(
          `INSERT INTO event_forms (event_id, title, description, is_active)
           VALUES ($1,$2,$3,true) RETURNING id`,
          [params.id, title, description || null]
        );
      }
    }

    if (!form) return err('Failed to upsert form', 500);

    // SAFE upsert: get existing field IDs to detect removals
    const existingFields = await query<{ id: string; field_key: string }>(
      `SELECT id, field_key FROM form_fields WHERE form_id=$1`,
      [form.id]
    );
    const existingMap = new Map(existingFields.map((f) => [f.field_key, f.id]));

    // Track which field_keys we processed this save
    const processedKeys = new Set<string>();

    for (const field of fields ?? []) {
      processedKeys.add(field.field_key);
      const existingId = existingMap.get(field.field_key);

      if (existingId) {
        // UPDATE existing field — preserves registration_values FK references
        await query(
          `UPDATE form_fields SET
             field_type=$1, label=$2, description=$3, placeholder=$4,
             is_required=$5, sort_order=$6, is_active=true, updated_at=now()
           WHERE id=$7`,
          [
            field.field_type, field.label,
            field.description || null, field.placeholder || null,
            field.is_required, field.sort_order,
            existingId,
          ]
        );

        // Replace options for this field
        if (field.options !== undefined) {
          await query(`DELETE FROM form_field_options WHERE field_id=$1`, [existingId]);
          for (let i = 0; i < field.options.length; i++) {
            const opt = field.options[i];
            await query(
              `INSERT INTO form_field_options (field_id, label, value, sort_order) VALUES ($1,$2,$3,$4)`,
              [existingId, opt.label, opt.value, i]
            );
          }
        }
      } else {
        // INSERT new field
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
    }

    // SOFT-delete fields that were removed (set is_active=false) — preserves registration_values
    for (const [fieldKey, fieldId] of existingMap.entries()) {
      if (!processedKeys.has(fieldKey)) {
        await query(
          `UPDATE form_fields SET is_active=false, updated_at=now() WHERE id=$1`,
          [fieldId]
        );
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
       WHERE f.form_id=$1 AND f.is_active=true
       GROUP BY f.id
       ORDER BY f.sort_order`,
      [form.id]
    );

    return ok({ form: { id: form.id, title, description, name_field_key }, fields: updatedFields });
  } catch (e) {
    console.error('PUT /api/events/[id]/form error:', e);
    return err('Internal server error', 500);
  }
}
