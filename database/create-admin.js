/**
 * Create the first admin user in the database.
 * Usage: node database/create-admin.js
 *
 * Set environment variables first (or edit the values below):
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
 */

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pramod_rajput',
  user: process.env.DB_USER || 'pramod_user',
  password: process.env.DB_PASSWORD || '',
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log('\n=== Create Admin User ===\n');
  const fullName = await ask('Full name: ');
  const email    = await ask('Email: ');
  const password = await ask('Password (min 8 chars): ');

  if (password.length < 8) { console.error('Password too short.'); process.exit(1); }

  const hash = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO profiles (full_name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, 'admin', true)
     ON CONFLICT (email) DO UPDATE SET password_hash=$3, role='admin', is_active=true, updated_at=now()
     RETURNING id, email, role`,
    [fullName.trim(), email.trim().toLowerCase(), hash]
  );

  console.log('\n✓ Admin user created/updated:');
  console.table(rows);
  rl.close();
  await pool.end();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
