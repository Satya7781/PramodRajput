import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';

// GET /api/certificates/verify/[number] — public
export async function GET(_req: NextRequest, { params }: { params: { number: string } }) {
  try {
    const cert = await queryOne(
      `SELECT c.*, e.title as event_title, e.start_date, e.end_date, e.venue
       FROM certificates c
       LEFT JOIN events e ON e.id = c.event_id
       WHERE c.certificate_number=$1`,
      [params.number]
    );

    if (!cert) return err('Certificate not found', 404);
    return ok(cert);
  } catch (e) {
    return err('Internal server error', 500);
  }
}
