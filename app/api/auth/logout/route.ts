import { NextRequest } from 'next/server';
import { ok } from '@/lib/api-helpers';

export async function POST(_req: NextRequest) {
  const response = ok({ success: true });
  response.headers.set(
    'Set-Cookie',
    'auth_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'
  );
  return response;
}
