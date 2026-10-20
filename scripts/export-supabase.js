#!/usr/bin/env node
'use strict';

const { init, load, isPostgres } = require('../src/db');
const { backupDatabase } = require('../src/jobs');

async function main() {
  if (!isPostgres()) {
    console.error('export:supabase membutuhkan SUPABASE_DB_URL atau DB_BACKEND=postgres.');
    process.exit(2);
  }
  await init();
  const target = backupDatabase(load());
  console.log(`Backup ditulis: ${target}`);
  console.log('Salin file ini keluar dari host sebelum redeploy.');
}

main().catch((error) => {
  console.error('Backup gagal:', error.message);
  process.exit(1);
});
