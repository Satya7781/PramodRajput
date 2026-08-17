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

    // Generate certificate number: PR-CERT-YYYY-NNNNNN
    const year = new Date().getFullYear().toString();
    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM certificates WHERE certificate_number LIKE $1`,
      [`PR-CERT-${year}-%`]
    );
    const nextNum = (parseInt(countRow?.count ?? '0', 10) + 1).toString().padStart(6, '0');
    const certificateNumber = `PR-CERT-${year}-${nextNum}`;
    const verificationToken = randomBytes(32).toString('hex');

    const cert = await queryOne(
      `INSERT INTO certificates
         (certificate_number, registration_id, event_id, template_id, participant_name, verification_token, status)
       VALUES ($1,$2,$3,$4,$5,$6,'valid') RETURNING *`,
      [certificateNumber, registration_id, event_id, template_id, participant_name, verificationToken]
    );

    await writeAuditLog(user.id, 'ISSUE_CERTIFICATE', 'certificates', (cert as { id: string }).id, { participant_name });
    return ok(cert, 201);
  } catch (e) {
    console.error('POST /api/certificates error:', e);
    return err('Internal server error', 500);
  }
}
