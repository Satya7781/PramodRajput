/**
 * One-shot admin seed script — no interactive prompts.
 * Usage: node database/seed-admin.js
 * Delete this file after first run if you wish.
 */

// Load .env manually without dotenv dependency
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'pramod_rajput',
  user:     process.env.DB_USER     || 'pramod_user',
  password: process.env.DB_PASSWORD || '',
});

async function main() {
  const fullName = 'Pramod Rajput';
  const email    = 'admin@pramodrajput.com';
  const password = 'Admin@1234';

  const hash = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO profiles (full_name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, 'admin', true)
     ON CONFLICT (email) DO UPDATE
       SET password_hash=$3, role='admin', is_active=true, updated_at=now()
     RETURNING id, full_name, email, role`,
    [fullName, email, hash]
  );

  console.log('\n✓ Admin user ready:');
  console.table(rows);
  console.log('  Email   :', email);
  console.log('  Password: Admin@1234');
  console.log('\n  Log in at: http://localhost:3000/admin\n');

  await pool.end();
}

main().catch((e) => {
  console.error('\n✗ Error:', e.message);
  console.error('  DB config being used:');
  console.error('    host    :', process.env.DB_HOST);
  console.error('    port    :', process.env.DB_PORT);
  console.error('    database:', process.env.DB_NAME);
  console.error('    user    :', process.env.DB_USER);
  console.error('\n  Make sure PostgreSQL is running and .env values are correct.\n');
  process.exit(1);
});
