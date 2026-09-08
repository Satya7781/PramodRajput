/**
 * Back-fills name_en and description_en for gallery_events
 * that were created before translation columns existed.
 * Run once: node database/backfill-translations.js
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_eF7CHLRUq4XM@ep-calm-pond-ax0p1bu0-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

const MYMEMORY = 'https://api.mymemory.translated.net/get';

async function translate(text) {
  if (!text) return null;
  try {
    const res = await fetch(`${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=hi|en`);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch { /* ignore */ }
  return null;
}

async function run() {
  const rows = await pool.query(
    `SELECT id, name, description FROM gallery_events WHERE name_en IS NULL OR name_en = ''`
  );
  console.log(`Found ${rows.rows.length} events to translate`);

  for (const row of rows.rows) {
    console.log(`Translating: "${row.name}"…`);
    const name_en = await translate(row.name);
    await new Promise(r => setTimeout(r, 300));
    const description_en = row.description ? await translate(row.description) : null;
    if (description_en) await new Promise(r => setTimeout(r, 300));

    await pool.query(
      `UPDATE gallery_events SET name_en = $1, description_en = $2 WHERE id = $3`,
      [name_en, description_en, row.id]
    );
    console.log(`  → "${name_en}"`);
  }

  console.log('Done!');
  pool.end();
}

run().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
