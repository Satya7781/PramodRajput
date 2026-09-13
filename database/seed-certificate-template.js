const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_eF7CHLRUq4XM@ep-calm-pond-ax0p1bu0-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  // Check if template already exists
  const existing = await pool.query(`SELECT id FROM certificate_templates LIMIT 1`);
  if (existing.rows.length > 0) {
    console.log('Certificate template already exists:', existing.rows[0].id);
    pool.end(); return;
  }

  const res = await pool.query(`
    INSERT INTO certificate_templates (name, description, is_active)
    VALUES ($1, $2, true) RETURNING id, name
  `, [
    'Standard Participation Certificate',
    'Default certificate template for event participants'
  ]);
  console.log('Created certificate template:', res.rows[0]);
  pool.end();
}

run().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
