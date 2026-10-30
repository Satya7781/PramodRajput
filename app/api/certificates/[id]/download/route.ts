import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { generateCertificatePdfBytes } from '@/lib/generate-certificate-pdf';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificate = await queryOne<{
      certificate_number: string;
      registration_id: string;
      participant_name: string;
      participant_image_url: string | null;
      status: 'valid' | 'revoked';
      background_url: string | null;
      width: number;
      height: number;
      orientation: string;
    }>(
      `SELECT c.certificate_number, c.registration_id, c.participant_name, c.status,
              (
                SELECT rv.file_url
                FROM registration_values rv
                JOIN form_fields ff ON ff.id = rv.field_id
                WHERE rv.registration_id = c.registration_id
                  AND ff.field_type = 'image'
                  AND rv.file_url IS NOT NULL
                ORDER BY ff.sort_order
                LIMIT 1
              ) AS participant_image_url,
              t.background_url, t.width, t.height, t.orientation
       FROM certificates c
       JOIN certificate_templates t ON t.id = c.template_id
       WHERE c.id = $1`,
      [params.id]
    );

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }
    if (certificate.status === 'revoked') {
      return NextResponse.json({ error: 'Certificate has been revoked' }, { status: 410 });
    }
    if (!certificate.background_url) {
      return NextResponse.json({ error: 'Certificate template background is not configured' }, { status: 409 });
    }

    const fields = await query<{
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
       FROM certificate_template_fields
       WHERE template_id = (
         SELECT template_id FROM certificates WHERE id = $1
       )`,
      [params.id]
    );

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Certificate template fields are not configured' }, { status: 409 });
    }

    const pdfBytes = await generateCertificatePdfBytes({
      backgroundUrl: certificate.background_url,
      participantImageUrl: certificate.participant_image_url,
      templateWidth: certificate.width,
      templateHeight: certificate.height,
      orientation: certificate.orientation,
      fields,
      fieldValues: {
        participant_name: certificate.participant_name,
        certificate_number: certificate.certificate_number,
      },
    });

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${certificate.certificate_number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('GET /api/certificates/[id]/download error:', error);
    return NextResponse.json({ error: 'Unable to generate certificate PDF' }, { status: 500 });
  }
}
