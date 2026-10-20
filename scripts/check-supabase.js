#!/usr/bin/env node
'use strict';

const { createDriver } = require('../src/pg/driver');
const { TABLES, VERSION_KEY } = require('../src/pg/schema');

async function main() {
  const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error('SUPABASE_DB_URL belum diisi. Contoh:');
    console.error('  SUPABASE_DB_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres" npm run check:supabase');
    process.exit(2);
  }

  const driver = createDriver(url);
  try {
    const counts = await driver.query(
      TABLES.map((info) => `select '${info.table}' as tabel, count(*)::int as jumlah from ${info.table}`).join(' union all '),
    );
    counts.rows.sort((a, b) => a.tabel.localeCompare(b.tabel));
    console.table(counts.rows);

    const version = await driver.query('select last_value from id_counters where counter_key = $1', [VERSION_KEY]);
    const counters = await driver.query('select count(*)::int as jumlah from id_counters');
    console.log(`Versi cache: ${version.rows[0] ? version.rows[0].last_value : '(belum ada)'}`);
    console.log(`Counter: ${counters.rows[0].jumlah} baris`);

    const balance = await driver.query('select invoice_id, total_amount, amount_paid, outstanding_balance from v_invoice_balances where invoice_id = $1', ['INV-0001']);
    if (balance.rows.length) {
      console.table(balance.rows);
    } else {
      console.log('INV-0001 tidak ada pada database ini.');
    }

    const duplicates = await driver.query(
      "select room_id, count(*)::int as jumlah from occupancies where agreement_status = 'Active' group by room_id having count(*) > 1",
    );
    if (duplicates.rows.length) {
      console.error('Ada kamar dengan lebih dari satu hunian aktif:');
      console.table(duplicates.rows);
      process.exitCode = 1;
    } else {
      console.log('Tidak ada hunian aktif ganda.');
    }
  } finally {
    await driver.close();
  }
}

main().catch((error) => {
  console.error('Pemeriksaan Supabase gagal:', error.message);
  process.exit(1);
});
