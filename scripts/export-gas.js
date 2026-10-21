#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { TABLES } = require('../src/pg/schema');
const { verifyPassword } = require('../src/password');

const ROOT = path.join(__dirname, '..');
const DEFAULTS = {
  db: process.env.DB_PATH || path.join(ROOT, 'data', 'db.json'),
  output: path.join(ROOT, 'data', 'gas-import.json'),
  report: path.join(ROOT, 'data', 'gas-import-report.json'),
  credentials: path.join(ROOT, 'data', 'gas-import-credentials.json'),
};

const COLLECTIONS = TABLES.map((item) => item.app);
const PRIMARY_KEYS = Object.fromEntries(TABLES.map((item) => [item.app, item.pk]));
const ROUNDS = 800;
const DEMO_PASSWORDS = {
  'owner@kos.id': 'owner123',
  'manager@kos.id': 'manager123',
  'resepsionis@kos.id': 'reception123',
  'kasir@kos.id': 'cashier123',
  'staf@kos.id': 'staff123',
};

const REFERENCES = [
  ['users', 'StaffID', 'staff'],
  ['occupancies', 'TenantID', 'tenants'],
  ['occupancies', 'RoomID', 'rooms'],
  ['reservations', 'TenantID', 'tenants'],
  ['reservations', 'RoomID', 'rooms'],
  ['invoices', 'TenantID', 'tenants'],
  ['invoices', 'OccupancyID', 'occupancies'],
  ['invoices', 'RoomID', 'rooms'],
  ['payments', 'TenantID', 'tenants'],
  ['allocations', 'PaymentID', 'payments'],
  ['allocations', 'InvoiceID', 'invoices'],
  ['credits', 'TenantID', 'tenants'],
  ['credits', 'PaymentID', 'payments'],
  ['serviceOrders', 'TenantID', 'tenants'],
  ['serviceOrders', 'RoomID', 'rooms'],
  ['serviceOrders', 'ServiceID', 'services'],
  ['serviceOrders', 'InvoiceID', 'invoices'],
  ['deposits', 'TenantID', 'tenants'],
  ['deposits', 'OccupancyID', 'occupancies'],
  ['activities', 'StaffID', 'staff'],
  ['activities', 'RoomID', 'rooms'],
  ['activities', 'TenantID', 'tenants'],
  ['transactions', 'TenantID', 'tenants'],
  ['transactions', 'RoomID', 'rooms'],
  ['transactions', 'StaffID', 'staff'],
];

function nowISO() {
  return new Date().toISOString();
}

function gasHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  let value = `${salt}:${password}`;
  for (let index = 0; index < ROUNDS; index += 1) {
    value = crypto.createHash('sha256').update(value, 'utf8').digest('hex');
  }
  return `sha256$${ROUNDS}$${salt}$${value}`;
}

function randomPassword() {
  return crypto.randomBytes(12).toString('base64url');
}

function validateMeta(db, errors) {
  if (!db.meta || typeof db.meta !== 'object' || Array.isArray(db.meta)) {
    errors.push('meta hilang atau bukan objek.');
    return;
  }
  if (!db.meta.counters || typeof db.meta.counters !== 'object' || Array.isArray(db.meta.counters)) {
    errors.push('meta.counters hilang atau bukan objek.');
    return;
  }
  Object.keys(db.meta.counters).forEach((key) => {
    const value = Number(db.meta.counters[key]);
    if (!Number.isFinite(value) || value < 0) errors.push(`meta.counters.${key} bukan angka yang valid.`);
  });
}

function validateCollections(db, errors, warnings) {
  COLLECTIONS.forEach((key) => {
    const rows = db[key];
    if (!Array.isArray(rows)) {
      errors.push(`Koleksi ${key} bukan array.`);
      return;
    }
    const pk = PRIMARY_KEYS[key];
    const seen = new Set();
    rows.forEach((row, index) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        errors.push(`${key}[${index}] bukan objek.`);
        return;
      }
      const id = row[pk];
      if (id === undefined || id === null || String(id) === '') {
        errors.push(`${key}[${index}] tidak memiliki ${pk}.`);
        return;
      }
      const text = String(id);
      if (seen.has(text)) errors.push(`${key}: ${pk} ganda ${text}.`);
      seen.add(text);
      Object.keys(row).forEach((field) => {
        const value = row[field];
        if (typeof value === 'boolean') {
          warnings.push(`${key}.${pk} ${text}: ${field} bertipe boolean; gunakan 'TRUE'/'FALSE'.`);
        } else if (typeof value === 'object' && value !== null) {
          if (JSON.stringify(value).length > 49000) errors.push(`${key}.${pk} ${text}: ${field} melebihi 49.000 karakter.`);
          else warnings.push(`${key}.${pk} ${text}: ${field} berupa objek dan akan disimpan sebagai JSON.`);
        } else if (typeof value === 'string' && value.length > 49000) {
          errors.push(`${key}.${pk} ${text}: ${field} melebihi 49.000 karakter.`);
        }
      });
    });
  });
}

function validateReferences(db, errors) {
  REFERENCES.forEach(([source, field, target]) => {
    const ids = new Set((db[target] || []).map((row) => String(row[PRIMARY_KEYS[target]])));
    (db[source] || []).forEach((row) => {
      const value = row[field];
      if (value === undefined || value === null || String(value) === '') return;
      if (!ids.has(String(value))) {
        errors.push(`${source}.${field} ${value} tidak ditemukan di ${target}.`);
      }
    });
  });
}

function validateFinancials(db, errors) {
  (db.invoices || []).forEach((invoice) => {
    const expected = Number(invoice.TotalAmount || 0) - Number(invoice.AmountPaid || 0);
    const actual = Number(invoice.OutstandingBalance || 0);
    if (!Number.isFinite(expected) || !Number.isFinite(actual) || Math.abs(expected - actual) > 0.01) {
      errors.push(`Invoice ${invoice.InvoiceID} memiliki saldo yang tidak konsisten.`);
    }
  });

  const rooms = new Map();
  const tenants = new Map();
  (db.occupancies || []).filter((row) => row.AgreementStatus === 'Active').forEach((row) => {
    if (rooms.has(row.RoomID)) errors.push(`Kamar ${row.RoomID} memiliki lebih dari satu hunian aktif.`);
    else rooms.set(row.RoomID, row.OccupancyID);
    if (tenants.has(row.TenantID)) errors.push(`Penghuni ${row.TenantID} memiliki lebih dari satu hunian aktif.`);
    else tenants.set(row.TenantID, row.OccupancyID);
  });

  const keys = new Set();
  [['payments', 'PaymentID'], ['transactions', 'TransactionID']].forEach(([key, pk]) => {
    (db[key] || []).forEach((row) => {
      const value = String(row.IdempotencyKey || '').trim();
      if (!value) return;
      const composite = `${key}:${value}`;
      if (keys.has(composite)) errors.push(`${key} ${row[pk]}: IdempotencyKey ganda.`);
      keys.add(composite);
    });
  });
}

function prepareUsers(users, errors) {
  const credentials = [];
  const rows = (users || []).map((user) => {
    const email = String(user.Email || '').trim().toLowerCase();
    const known = DEMO_PASSWORDS[email];
    let kept = false;
    if (known) {
      try {
        kept = verifyPassword(known, user.PasswordHash);
      } catch (error) {
        kept = false;
      }
    }
    if (!email) errors.push(`Pengguna ${user.UserID || '(tanpa ID)'} tidak memiliki email.`);
    const password = kept ? known : randomPassword();
    credentials.push({
      email,
      password,
      action: kept ? 'kept-demo-password' : 'generated',
    });
    return Object.assign({}, user, { PasswordHash: gasHash(password) });
  });
  return { rows, credentials };
}

function buildExport(db, exportedAt = nowISO()) {
  const errors = [];
  const warnings = [];
  validateMeta(db, errors);
  validateCollections(db, errors, warnings);
  validateReferences(db, errors);
  validateFinancials(db, errors);

  const prepared = prepareUsers(db.users, errors);
  const payloadDb = { meta: db.meta };
  COLLECTIONS.forEach((key) => {
    payloadDb[key] = key === 'users' ? prepared.rows : db[key];
  });

  const counts = Object.fromEntries(COLLECTIONS.map((key) => [key, (payloadDb[key] || []).length]));
  const payload = {
    format: 'kos-json-export',
    version: 1,
    exportedAt,
    counts,
    db: payloadDb,
  };
  const report = {
    ok: errors.length === 0,
    generatedAt: exportedAt,
    counts,
    users: prepared.credentials.map(({ email, action }) => ({ email, action })),
    warnings,
    errors,
  };
  return { payload, report, credentials: prepared.credentials };
}

function usage() {
  return [
    'Pemakaian: node scripts/export-gas.js [opsi]',
    '',
    'Opsi:',
    '  --db <file>           Database JSON sumber. Default: data/db.json',
    '  --output <file>       Berkas impor. Default: data/gas-import.json',
    '  --report <file>       Laporan validasi. Default: data/gas-import-report.json',
    '  --credentials <file>  Kredensial sementara. Default: data/gas-import-credentials.json',
    '  --help                Tampilkan bantuan ini.',
  ].join('\n');
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--db' || arg === '--output' || arg === '--report' || arg === '--credentials') {
      const value = argv[index + 1];
      if (!value) throw new Error(`Nilai untuk ${arg} belum diisi.`);
      args[arg.slice(2)] = value;
      index += 1;
    } else {
      throw new Error(`Opsi tidak dikenal: ${arg}`);
    }
  }
  return args;
}

function writeJson(file, value, mode) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, mode ? { mode } : undefined);
  if (mode) fs.chmodSync(file, mode);
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error(usage());
    process.exit(2);
  }
  if (args.help) {
    console.log(usage());
    return;
  }

  const dbPath = args.db || DEFAULTS.db;
  const output = args.output || DEFAULTS.output;
  const reportPath = args.report || DEFAULTS.report;
  const credentialsPath = args.credentials || DEFAULTS.credentials;

  if (!fs.existsSync(dbPath)) {
    console.error(`Database JSON tidak ditemukan: ${dbPath}`);
    process.exit(2);
  }

  let db;
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    console.error(`Database JSON tidak dapat dibaca: ${error.message}`);
    process.exit(2);
  }

  const result = buildExport(db);
  result.report.source = path.relative(ROOT, dbPath) || dbPath;
  result.report.output = path.relative(ROOT, output) || output;
  result.report.credentials = path.relative(ROOT, credentialsPath) || credentialsPath;

  if (!result.report.ok) {
    writeJson(reportPath, result.report);
    console.error(`Validasi gagal: ${result.report.errors.length} masalah. Lihat ${path.relative(ROOT, reportPath) || reportPath}.`);
    console.error('Berkas impor dan kredensial lama tidak diubah; jangan dipakai sebelum laporan ok.');
    result.report.errors.slice(0, 20).forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  writeJson(output, result.payload);
  writeJson(reportPath, result.report);
  writeJson(credentialsPath, {
    generatedAt: result.report.generatedAt,
    note: 'Password sementara untuk login setelah impor. Hapus berkas ini setelah semua akun direset.',
    accounts: result.credentials,
  }, 0o600);

  const summary = COLLECTIONS.map((key) => `${key}=${result.report.counts[key]}`).join(', ');
  console.log(`Berkas impor: ${path.relative(ROOT, output) || output}`);
  console.log(`Jumlah baris: ${summary}`);
  console.log(`Akun: ${result.credentials.length} (kredensial di ${path.relative(ROOT, credentialsPath) || credentialsPath})`);
  if (result.report.warnings.length) {
    console.log(`Peringatan: ${result.report.warnings.length} (lihat ${path.relative(ROOT, reportPath) || reportPath})`);
  }
}

if (require.main === module) main();

module.exports = {
  COLLECTIONS,
  DEMO_PASSWORDS,
  buildExport,
  gasHash,
  randomPassword,
};
