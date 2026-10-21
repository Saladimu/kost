'use strict';

const assert = require('assert');
const { TABLES } = require('../src/pg/schema');
const { hashPassword } = require('../src/password');
const { buildExport } = require('../scripts/export-gas');

const ROUNDS = 800;

function verifyGas(password, stored) {
  if (!stored || stored.indexOf('sha256$') !== 0) return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || Number(parts[1]) !== ROUNDS) return false;
  let value = `${parts[2]}:${password}`;
  for (let index = 0; index < ROUNDS; index += 1) {
    value = require('crypto').createHash('sha256').update(value, 'utf8').digest('hex');
  }
  return value === parts[3];
}

function emptyDb() {
  const db = { meta: { schemaVersion: 1, counters: {} } };
  TABLES.forEach(({ app }) => { db[app] = []; });
  return db;
}

function baseDb() {
  const db = emptyDb();
  db.meta.counters = { user: 1, room: 1, tenant: 1, invoice: 1 };
  db.settings.push({ SettingKey: 'PropertyName', SettingValue: 'Kos', Description: '', UpdatedAt: '', UpdatedBy: 'SYSTEM' });
  db.staff.push({ StaffID: 'ST-0001', FullName: 'Owner' });
  db.users.push({
    UserID: 'USR-0001', StaffID: 'ST-0001', Email: 'owner@kos.id',
    PasswordHash: hashPassword('owner123'), Role: 'Owner', IsActive: 'TRUE',
  });
  db.rooms.push({ RoomID: 'RM-0001', RoomNumber: 'A1' });
  db.tenants.push({ TenantID: 'T-0001', FullName: 'Demo' });
  db.invoices.push({
    InvoiceID: 'INV-0001', TenantID: 'T-0001', RoomID: 'RM-0001',
    TotalAmount: 1000, AmountPaid: 400, OutstandingBalance: 600,
  });
  return db;
}

function testDemoPasswordIsPreserved() {
  const result = buildExport(baseDb(), '2026-01-01T00:00:00.000Z');
  assert.deepStrictEqual(result.report.errors, []);
  assert.equal(result.payload.format, 'kos-json-export');
  assert.equal(result.payload.version, 1);
  assert.equal(result.payload.counts.rooms, 1);
  assert.equal(result.credentials[0].email, 'owner@kos.id');
  assert.equal(result.credentials[0].action, 'kept-demo-password');
  assert.ok(result.payload.db.users[0].PasswordHash.startsWith('sha256$800$'));
  assert.ok(verifyGas('owner123', result.payload.db.users[0].PasswordHash));
}

function testUnknownPasswordIsRotated() {
  const db = baseDb();
  db.users[0].Email = 'admin@example.com';
  db.users[0].PasswordHash = hashPassword('secret123');
  const result = buildExport(db);
  assert.deepStrictEqual(result.report.errors, []);
  assert.equal(result.credentials[0].action, 'generated');
  assert.notEqual(result.credentials[0].password, 'secret123');
  assert.ok(verifyGas(result.credentials[0].password, result.payload.db.users[0].PasswordHash));
}

function testDuplicatePrimaryKeyFails() {
  const db = baseDb();
  db.rooms.push({ RoomID: 'RM-0001', RoomNumber: 'B1' });
  const result = buildExport(db);
  assert.ok(result.report.errors.some((error) => error.includes('RM-0001')));
}

function testBrokenBalanceFails() {
  const db = baseDb();
  db.invoices[0].OutstandingBalance = 1;
  const result = buildExport(db);
  assert.ok(result.report.errors.some((error) => error.includes('INV-0001')));
}

function testMissingReferenceFails() {
  const db = baseDb();
  db.invoices[0].TenantID = 'T-9999';
  const result = buildExport(db);
  assert.ok(result.report.errors.some((error) => error.includes('T-9999')));
}

function testDuplicateActiveOccupancyFails() {
  const db = baseDb();
  db.occupancies.push(
    { OccupancyID: 'OCC-0001', TenantID: 'T-0001', RoomID: 'RM-0001', AgreementStatus: 'Active' },
    { OccupancyID: 'OCC-0002', TenantID: 'T-0001', RoomID: 'RM-0001', AgreementStatus: 'Active' }
  );
  const result = buildExport(db);
  assert.ok(result.report.errors.some((error) => error.includes('RM-0001')));
  assert.ok(result.report.errors.some((error) => error.includes('T-0001')));
}

function testMissingCountersFails() {
  const db = baseDb();
  delete db.meta.counters;
  const result = buildExport(db);
  assert.ok(result.report.errors.some((error) => error.includes('meta.counters')));
}

testDemoPasswordIsPreserved();
testUnknownPasswordIsRotated();
testDuplicatePrimaryKeyFails();
testBrokenBalanceFails();
testMissingReferenceFails();
testDuplicateActiveOccupancyFails();
testMissingCountersFails();

console.log('OK: ekspor JSON ke Google Sheets, validasi, dan konversi password.');
