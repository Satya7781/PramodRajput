import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';
import { translateBatch, isHindi } from '@/lib/translate';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await queryOne(`SELECT * FROM events WHERE id = $1`, [params.id]);
    if (!event) return err('Event not found', 404);
    return ok(event);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const body = await req.json();
    const {
      title, slug, short_description, description, banner_url,
      start_date, end_date, start_time, end_time, venue, address,
      registration_start, registration_end, max_participants,
      registration_enabled, certificate_enabled, status,
    } = body;

    let { title_en, short_description_en, description_en } = body as {
      title_en?: string; short_description_en?: string; description_en?: string;
    };

    // Auto-translate missing English fields
    if (isHindi(title)) {
      const textsToTranslate = [
        !title_en?.trim()             ? title             : null,
        !short_description_en?.trim() ? short_description : null,
        !description_en?.trim()       ? description       : null,
      ];
      if (textsToTranslate.some(t => t && t.trim())) {
        const [tTitle, tShort, tDesc] = await translateBatch(textsToTranslate);
        if (!title_en?.trim()             && tTitle) title_en = tTitle;
        if (!short_description_en?.trim() && tShort) short_description_en = tShort;
        if (!description_en?.trim()       && tDesc)  description_en = tDesc;
      }
    }

    const event = await queryOne(
      `UPDATE events SET
         title=$1, slug=$2, short_description=$3, description=$4, banner_url=$5,
         start_date=$6, end_date=$7, start_time=$8, end_time=$9,
         venue=$10, address=$11, registration_start=$12, registration_end=$13,
         max_participants=$14, registration_enabled=$15, certificate_enabled=$16,
         status=$17, title_en=$18, short_description_en=$19, description_en=$20,
         updated_at=now()
       WHERE id=$21 RETURNING *`,
      [
        title, slug, short_description || null, description || null, banner_url || null,
        start_date || null, end_date || null, start_time || null, end_time || null,
        venue || null, address || null, registration_start || null, registration_end || null,
        max_participants || null, registration_enabled ?? false, certificate_enabled ?? false,
        status || 'draft',
        title_en || null, short_description_en || null, description_en || null,
        params.id,
      ]
    );

    if (!event) return err('Event not found', 404);
    await writeAuditLog(user.id, 'UPDATE_EVENT', 'events', params.id, { title });
    return ok(event);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    if (msg.includes('unique') || msg.includes('duplicate')) return err('Slug already exists', 409);
    console.error('PUT /api/events/[id] error:', e);
    return err(msg, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const event = await queryOne(`DELETE FROM events WHERE id=$1 RETURNING id, title`, [params.id]);
    if (!event) return err('Event not found', 404);
    await writeAuditLog(user.id, 'DELETE_EVENT', 'events', params.id, {});
    return ok({ success: true });
  } catch (e) {
    return err('Internal server error', 500);
  }
}
