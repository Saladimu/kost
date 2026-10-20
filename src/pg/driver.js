'use strict';

function sslOptions(connectionString) {
  if (process.env.PGSSLMODE === 'disable') return false;
  if (/localhost|127\.0\.0\.1|::1/.test(connectionString)) return false;
  if (/sslmode=disable/.test(connectionString)) return false;
  return { rejectUnauthorized: false };
}

function createDriver(connectionString) {
  if (!connectionString) throw new Error('SUPABASE_DB_URL belum diisi.');
  let Pool;
  try {
    ({ Pool } = require('pg'));
  } catch (error) {
    throw new Error('Driver pg belum terpasang. Jalankan npm install.');
  }
  const pool = new Pool({
    connectionString,
    ssl: sslOptions(connectionString),
    max: Number(process.env.PG_POOL_MAX || 5),
    application_name: 'sistem-operasional-kos',
  });
  pool.on('error', (error) => {
    console.error('Postgres pool error:', error.message);
  });
  return {
    query: (sql, params) => pool.query(sql, params),
    connect: () => pool.connect(),
    close: () => pool.end(),
  };
}

module.exports = { createDriver, sslOptions };
