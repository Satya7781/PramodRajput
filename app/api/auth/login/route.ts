import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { ok, err } from '@/lib/api-helpers';
import { queryOne } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return err('Email and password are required');
    }

    const user = await queryOne<{
      id: string;
      email: string;
      full_name: string;
      password_hash: string;
      role: 'admin' | 'editor';
      is_active: boolean;
    }>(
      `SELECT id, email, full_name, password_hash, role, is_active
       FROM profiles WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (!user || !user.password_hash) {
      return err('Invalid email or password', 401);
    }

    if (!user.is_active) {
      return err('Your account has been deactivated', 403);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return err('Invalid email or password', 401);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    const response = ok({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });

    // Set HttpOnly cookie (7 days)
    response.headers.set(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return response;
  } catch (e) {
    console.error('Login error:', e);
    return err('Internal server error', 500);
  }
}
