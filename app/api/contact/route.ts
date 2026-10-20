import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api-helpers';
import { query } from '@/lib/db';

// POST /api/contact — public: save a contact form submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body as {
      name: string;
      email: string;
      subject?: string;
      message: string;
    };

    if (!name?.trim())    return err('Name is required');
    if (!email?.trim())   return err('Email is required');
    if (!message?.trim()) return err('Message is required');

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return err('Please enter a valid email address');
    }

    // Minimum message length
    if (message.trim().length < 10) {
      return err('Message must be at least 10 characters');
    }

    // Persist to DB — create table if it doesn't exist (migration-safe)
    await query(
      `CREATE TABLE IF NOT EXISTS contact_submissions (
         id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         name       TEXT NOT NULL,
         email      TEXT NOT NULL,
         subject    TEXT,
         message    TEXT NOT NULL,
         created_at TIMESTAMPTZ DEFAULT now()
       )`,
      []
    );

    await query(
      `INSERT INTO contact_submissions (name, email, subject, message)
       VALUES ($1, $2, $3, $4)`,
      [name.trim(), email.trim(), subject?.trim() || null, message.trim()]
    );

    return ok({ success: true });
  } catch (e) {
    console.error('POST /api/contact error:', e);
    return err('Failed to send message. Please try again.', 500);
  }
}
