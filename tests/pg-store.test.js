'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function loadPglite() {
  try {
    return require('@electric-sql/pglite');
  } catch (_error) {
    return require('/usr/local/lib/node_modules/@electric-sql/pglite');
  }
}

function createPgliteDriver(pg) {
  let tail = Promise.resolve();
  return {
    query: async (sql, params) => {
      await tail;
      return pg.query(sql, params);
    },
    connect: async () => {
      let release;
      const gate = new Promise((resolve) => { release = resolve; });
      const previous = tail;
      tail = previous.then(() => gate);
      let released = false;
      return {
        query: async (sql, params) => {
          await previous;
          return pg.query(sql, params);
        },
        release: () => {
          if (!released) {
            released = true;
            release();
          }
        },
      };
    },
    close: () => pg.close(),
  };
}

async function main() {
  const { PGlite } = loadPglite();
  const { buildSeed } = require('../src/seed');
  const { bootstrap } = require('../src/bootstrap');
  const { login } = require('../src/auth');
  const { saveRoom } = require('../src/services/rooms');
  const { setSetting } = require('../src/services/common');
  const { recordPayment } = require('../src/services/payments');
  const { prepareImport, renderSql } = require('../scripts/import-supabase');
  const { createStore } = require('../src/pg/store');

  const snapshot = buildSeed({ meta: {} });
  const billing = bootstrap(snapshot);
  const prepared = prepareImport(snapshot);
  assert.equal(prepared.errors.length, 0, `Validasi impor gagal: ${prepared.errors.join('; ')}`);
  const importSql = renderSql(prepared);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kos-pg-store-'));
  const pg = new PGlite(dir);
  const schema = fs.readFileSync(path.join(__dirname, '..', 'docs', 'supabase', '0001_initial.sql'), 'utf8');
  await pg.exec(schema);
  await pg.exec(importSql);

  const driver = createPgliteDriver(pg);
  const store = createStore({ driver, advisoryLock: false });
  await store.init();
  const db = store.snapshot();

  assert.equal(db.rooms.length, 21);
  assert.equal(db.settings.length, 17);
  assert.equal(db.users.length, 5);
  assert.equal(db.invoices.length, billing.billingCount);
  assert.ok(db.meta.demoPaymentsSeeded, 'Data impor tidak boleh memicu seed demo.');

  const owner = login(db, 'owner@kos.id', 'owner123');
  assert.equal(owner.user.Role, 'Owner');

  const invoice = db.invoices[0];
  const balance = await pg.query('select * from v_invoice_balances where invoice_id = $1', [invoice.InvoiceID]);
  assert.equal(Number(balance.rows[0].total_amount), invoice.TotalAmount);
  assert.equal(Number(balance.rows[0].amount_paid), 0);
  assert.equal(Number(balance.rows[0].outstanding_balance), invoice.TotalAmount);
  assert.equal(invoice.AmountPaid, Number(balance.rows[0].amount_paid));
  assert.equal(invoice.OutstandingBalance, Number(balance.rows[0].outstanding_balance));

  const roomCounter = db.meta.counters.room;
  const auditCount = db.auditLog.length;
  const created = await store.withLock((tx) => saveRoom(tx, {
    RoomNumber: 'Z-999',
    RoomTypeID: 'RT-0001',
    StandardMonthlyPrice: 1000000,
  }, { StaffID: 'ST-0001' }));
  assert.equal(created.RoomNumber, 'Z-999');
  assert.equal(store.snapshot().meta.counters.room, roomCounter + 1);
  assert.equal(store.snapshot().auditLog.length, auditCount + 1);

  await store.withLock((tx) => setSetting(tx, 'PropertyName', 'Kos Uji', 'ST-0001'));

  const versionAfterWrite = store.version();
  await store.withLock(() => {});
  assert.equal(store.version(), versionAfterWrite, 'Transaksi tanpa perubahan tidak boleh menaikkan versi.');

  const verifier = createStore({ driver, advisoryLock: false });
  await verifier.init();
  const reloaded = verifier.snapshot();
  assert.equal(reloaded.rooms.length, 22);
  assert.ok(reloaded.rooms.some((room) => room.RoomNumber === 'Z-999'));
  assert.equal(reloaded.settings.find((row) => row.SettingKey === 'PropertyName').SettingValue, 'Kos Uji');
  assert.equal(reloaded.auditLog.length, auditCount + 1);
  assert.equal(reloaded.meta.counters.room, roomCounter + 1);
  assert.ok(reloaded.meta.demoPaymentsSeeded);

  const persisted = await pg.query('select count(*)::int as total from rooms');
  assert.equal(persisted.rows[0].total, 22);

  const target = db.invoices.find((row) => row.InvoiceStatus !== 'Cancelled' && Number(row.OutstandingBalance) > 0);
  const partial = 100000;
  await store.withLock((tx) => recordPayment(tx, {
    TenantID: target.TenantID,
    InvoiceID: target.InvoiceID,
    AmountReceived: partial,
    PaymentMethod: 'Cash',
    IdempotencyKey: 'PG-TEST-PAY-1',
  }, { StaffID: 'ST-0004' }));

  const paidVerifier = createStore({ driver, advisoryLock: false });
  await paidVerifier.init();
  const paidInvoice = paidVerifier.snapshot().invoices.find((row) => row.InvoiceID === target.InvoiceID);
  assert.equal(paidInvoice.AmountPaid, partial);
  assert.equal(paidInvoice.OutstandingBalance, Number(target.TotalAmount) - partial);

  await driver.close();
  console.log(`OK: ${db.rooms.length + 1} kamar, ${db.settings.length} setting, ${db.invoices.length} invoice, versi ${versionAfterWrite}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
