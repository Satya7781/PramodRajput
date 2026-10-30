import { NextRequest } from 'next/server';
import { ok, err, requireAuth, isResponse, writeAuditLog } from '@/lib/api-helpers';
import { query, queryOne } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('event_id');
    const search = searchParams.get('search');

    let sql = `
      SELECT c.*, e.title as event_title, r.registration_number
      FROM certificates c
      LEFT JOIN events e ON e.id = c.event_id
      LEFT JOIN registrations r ON r.id = c.registration_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let idx = 1;

    if (eventId) { sql += ` AND c.event_id=$${idx++}`; params.push(eventId); }
    if (search) {
      sql += ` AND (c.certificate_number ILIKE $${idx} OR c.participant_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` ORDER BY c.issued_at DESC`;

    const certs = await query(sql, params);
    return ok(certs);
  } catch (e) {
    return err('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if (isResponse(authResult)) return authResult;
  const { user } = authResult;
  if (user.role !== 'admin') return err('Forbidden', 403);

  try {
    const body = await req.json();
    const { registration_id, event_id, template_id, participant_name } = body;

    if (!registration_id || !event_id || !template_id || !participant_name) {
      return err('registration_id, event_id, template_id, and participant_name are required');
    }

    // Generate certificate number atomically using a DB sequence to avoid race conditions
    const year = new Date().getFullYear().toString();
    const seqRow = await queryOne<{ nextval: string }>(
      `SELECT nextval('certificate_number_seq') AS nextval`
    );
    const nextNum = parseInt(seqRow?.nextval ?? '1', 10).toString().padStart(6, '0');
    const certificateNumber = `PR-CERT-${year}-${nextNum}`;
    const verificationToken = randomBytes(32).toString('hex');

    // Insert the certificate record first
    const cert = await queryOne<{
      id: string;
      certificate_number: string;
      verification_token: string;
      participant_name: string;
      [key: string]: unknown;
    }>(
      `INSERT INTO certificates
         (certificate_number, registration_id, event_id, template_id, participant_name, verification_token, status)
       VALUES ($1,$2,$3,$4,$5,$6,'valid') RETURNING *`,
      [certificateNumber, registration_id, event_id, template_id, participant_name, verificationToken]
    );

    if (!cert) return err('Failed to create certificate record', 500);

    // Generate the PDF using the template background and field positions
    let pdfUrl: string | null = null;
    try {
      const participantImage = await queryOne<{ participant_image_url: string | null }>(
        `SELECT rv.file_url AS participant_image_url
         FROM registration_values rv
         JOIN form_fields ff ON ff.id = rv.field_id
         WHERE rv.registration_id = $1
           AND ff.field_type = 'image'
           AND rv.file_url IS NOT NULL
         ORDER BY ff.sort_order
         LIMIT 1`,
        [registration_id]
      );
      const template = await queryOne<{
        background_url: string | null;
        width: number;
        height: number;
        orientation: string;
      }>(
        `SELECT background_url, width, height, orientation FROM certificate_templates WHERE id=$1`,
        [template_id]
      );

      const templateFields = await query<{
        field_key: string;
        label: string;
        x_position: number;
        y_position: number;
        width: number;
        height: number;
        font_family: string;
        font_size: number;
        font_weight: string;
        text_align: string;
        color: string;
      }>(
        `SELECT field_key, label, x_position, y_position, width, height,
                font_family, font_size, font_weight, text_align, color
         FROM certificate_template_fields WHERE template_id=$1`,
        [template_id]
      );

      if (template?.background_url && templateFields.length > 0) {
        const { generateCertificatePdf } = await import('@/lib/generate-certificate-pdf');
        pdfUrl = await generateCertificatePdf({
          backgroundUrl: template.background_url,
          participantImageUrl: participantImage?.participant_image_url,
          templateWidth: template.width,
          templateHeight: template.height,
          orientation: template.orientation,
          fields: templateFields,
          fieldValues: { participant_name, certificate_number: certificateNumber },
        });

        // Update the certificate row with the generated PDF URL
        await queryOne(
          `UPDATE certificates SET pdf_url=$1, updated_at=now() WHERE id=$2`,
          [pdfUrl, cert.id]
        );
      }
    } catch (pdfErr) {
      // PDF generation failure is non-fatal — certificate record is already created
      console.error('PDF generation error (non-fatal):', pdfErr);
    }

    await writeAuditLog(user.id, 'ISSUE_CERTIFICATE', 'certificates', cert.id, { participant_name, pdf_generated: !!pdfUrl });
    return ok({ ...cert, pdf_url: pdfUrl }, 201);
  } catch (e) {
    console.error('POST /api/certificates error:', e);
    return err('Internal server error', 500);
  }
}
