const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_eF7CHLRUq4XM@ep-calm-pond-ax0p1bu0-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function createAdmin() {
  const hash = await bcrypt.hash('Admin@2024!', 12);
  const res = await pool.query(
    `INSERT INTO profiles (full_name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role          = EXCLUDED.role,
           is_active     = TRUE,
           updated_at    = now()
     RETURNING id, email, full_name, role`,
    ['Pramod Rajput', 'admin@pramodrajput.in', hash, 'admin', true]
  );
  console.log('Admin user ready:');
  console.log('  Email   :', res.rows[0].email);
  console.log('  Name    :', res.rows[0].full_name);
  console.log('  Role    :', res.rows[0].role);
  console.log('  Password: Admin@2024!');
  console.log('');
  console.log('Login at: http://localhost:3000/admin');
  pool.end();
}

createAdmin().catch(e => {
  console.error('Error:', e.message);
  pool.end();
  process.exit(1);
});
