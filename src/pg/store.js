'use strict';

const { nowISO } = require('../util');
const { buildSeed } = require('../seed');
const { TABLES, VERSION_KEY, LOCK_KEY, appKey } = require('./schema');

const NUMERIC_TYPES = new Set(['smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision']);
const TIMESTAMP_TYPES = new Set(['timestamp with time zone', 'timestamp without time zone']);
const JSON_TYPES = new Set(['json', 'jsonb']);

function isTruthy(value) {
  if (value === true) return true;
  if (value === false || value === null || value === undefined) return false;
  return ['true', '1', 'yes', 'ya', 'TRUE'].includes(String(value));
}

function decodeValue(value, column) {
  if (value === null || value === undefined) {
    if (column.dataType === 'boolean') return 'FALSE';
    if (NUMERIC_TYPES.has(column.dataType)) return null;
    return '';
  }
  if (column.dataType === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (NUMERIC_TYPES.has(column.dataType)) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }
  if (column.dataType === 'date') {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
  }
  if (TIMESTAMP_TYPES.has(column.dataType)) {
    const parsed = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
  }
  if (JSON_TYPES.has(column.dataType)) {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  return String(value);
}

function encodeValue(value, column) {
  if (column.dataType === 'boolean') return isTruthy(value);
  if (value === undefined || value === null || value === '') {
    if (column.isNullable) return null;
    if (NUMERIC_TYPES.has(column.dataType)) return 0;
    return '';
  }
  if (NUMERIC_TYPES.has(column.dataType)) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }
  if (JSON_TYPES.has(column.dataType)) {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  return value;
}

function buildSnapshotSql(tables) {
  const parts = [];
  for (const info of tables) {
    parts.push(`'${info.app}', (select coalesce(jsonb_agg(to_jsonb(x) order by x.${info.pkColumn}), '[]'::jsonb) from ${info.table} x)`);
  }
  parts.push(`'__counters', (select coalesce(jsonb_object_agg(counter_key, last_value), '{}'::jsonb) from id_counters where counter_key <> '${VERSION_KEY}')`);
  parts.push(`'${VERSION_KEY}', coalesce((select last_value from id_counters where counter_key = '${VERSION_KEY}'), 0)`);
  return `select jsonb_build_object(${parts.join(', ')}) as data`;
}

const VERSION_SQL = `select coalesce((select last_value from id_counters where counter_key = '${VERSION_KEY}'), 0) as version`;

function createStore({ driver, advisoryLock = true, seedDemo = false }) {
  let columns = null;
  let tableInfo = [];
  let snapshot = null;
  let version = 0;
  let snapshotSql = null;

  async function loadColumns() {
    let result;
    try {
      result = await driver.query(
        "select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position",
      );
    } catch (error) {
      throw new Error(`Skema Supabase tidak dapat dibaca: ${error.message}`);
    }
    const byTable = new Map();
    for (const row of result.rows) {
      if (!byTable.has(row.table_name)) byTable.set(row.table_name, []);
      byTable.get(row.table_name).push({
        name: row.column_name,
        dataType: row.data_type,
        isNullable: row.is_nullable === 'YES',
      });
    }
    const missing = TABLES.filter((info) => !byTable.has(info.table) || byTable.get(info.table).length === 0);
    if (missing.length) {
      throw new Error(`Tabel Supabase belum lengkap: ${missing.map((item) => item.table).join(', ')}. Jalankan docs/supabase/0001_initial.sql terlebih dahulu.`);
    }
    return {
      byTable,
      tables: TABLES.map((info) => {
        const list = byTable.get(info.table);
        const pkColumn = list.find((column) => appKey(column.name) === info.pk);
        if (!pkColumn) throw new Error(`Primary key ${info.pk} tidak ditemukan pada tabel ${info.table}.`);
        return { ...info, columns: list, pkColumn: pkColumn.name };
      }),
    };
  }

  function decodeRow(row, info) {
    const result = {};
    for (const column of info.columns) {
      result[appKey(column.name)] = decodeValue(row[column.name], column);
    }
    return result;
  }

  function applyInvoiceBalances(db) {
    const paidByInvoice = new Map();
    for (const allocation of db.allocations || []) {
      if (allocation.AllocationStatus !== 'Valid') continue;
      const current = paidByInvoice.get(allocation.InvoiceID) || 0;
      paidByInvoice.set(allocation.InvoiceID, current + Number(allocation.AllocatedAmount || 0));
    }
    for (const invoice of db.invoices || []) {
      if (invoice.InvoiceStatus === 'Cancelled') {
        invoice.AmountPaid = 0;
        invoice.OutstandingBalance = 0;
        continue;
      }
      const total = Number(invoice.RentalAmount || 0)
        + Number(invoice.ServiceCharges || 0)
        + Number(invoice.OtherCharges || 0)
        - Number(invoice.DiscountAmount || 0);
      const amountPaid = paidByInvoice.get(invoice.InvoiceID) || 0;
      invoice.AmountPaid = amountPaid;
      invoice.OutstandingBalance = Math.max(0, total - amountPaid);
    }
  }

  function parseSnapshot(data) {
    const payload = typeof data === 'string' ? JSON.parse(data) : data;
    const db = {
      meta: {
        schemaVersion: 1,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        counters: {},
        demoPaymentsSeeded: true,
      },
    };
    for (const info of tableInfo) {
      const rows = payload[info.app] || [];
      db[info.app] = rows.map((row) => decodeRow(row, info));
    }
    const counters = payload.__counters || {};
    for (const [key, value] of Object.entries(counters)) {
      const number = Number(value);
      if (Number.isFinite(number)) db.meta.counters[key] = number;
    }
    applyInvoiceBalances(db);
    return db;
  }

  async function loadSnapshot(client) {
    const result = await client.query(snapshotSql);
    const data = result.rows[0] ? result.rows[0].data : null;
    if (!data) throw new Error('Snapshot Supabase kosong.');
    return {
      snapshot: parseSnapshot(data),
      version: Number((typeof data === 'string' ? JSON.parse(data) : data)[VERSION_KEY] || 0),
    };
  }

  function project(row, info) {
    const values = {};
    for (const column of info.columns) {
      const key = appKey(column.name);
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        values[column.name] = encodeValue(row[key], column);
      }
    }
    return values;
  }

  function capture(db) {
    const result = new Map();
    for (const info of tableInfo) {
      const rows = new Map();
      for (const row of db[info.app] || []) {
        const key = row[info.pk];
        if (key === undefined || key === null || key === '') continue;
        rows.set(String(key), JSON.stringify(project(row, info)));
      }
      result.set(info.app, rows);
    }
    return result;
  }

  function diff(db, before, after) {
    const upserts = [];
    const deletes = [];
    for (const info of tableInfo) {
      const previous = before.get(info.app);
      const next = after.get(info.app);
      for (const row of db[info.app] || []) {
        const key = String(row[info.pk]);
        const values = project(row, info);
        if (previous.get(key) !== JSON.stringify(values)) upserts.push({ info, values });
      }
      for (const key of previous.keys()) {
        if (!next.has(key)) deletes.push({ info, key });
      }
    }
    return { upserts, deletes };
  }

  async function upsertRow(client, info, values) {
    const names = Object.keys(values);
    if (!names.includes(info.pkColumn)) return;
    const placeholders = names.map((_, index) => `$${index + 1}`);
    const updates = names.filter((name) => name !== info.pkColumn).map((name) => `${name} = excluded.${name}`);
    const conflict = updates.length ? updates.join(', ') : `${info.pkColumn} = excluded.${info.pkColumn}`;
    const sql = `insert into ${info.table} (${names.join(', ')}) values (${placeholders.join(', ')}) on conflict (${info.pkColumn}) do update set ${conflict}`;
    await client.query(sql, names.map((name) => values[name]));
  }

  async function deleteRow(client, info, key) {
    await client.query(`delete from ${info.table} where ${info.pkColumn} = $1`, [key]);
  }

  async function upsertCounter(client, key, value) {
    await client.query(
      'insert into id_counters (counter_key, last_value) values ($1, $2) on conflict (counter_key) do update set last_value = excluded.last_value',
      [key, Number(value)],
    );
  }

  async function bumpVersion(client) {
    const result = await client.query(
      'insert into id_counters (counter_key, last_value) values ($1, 1) on conflict (counter_key) do update set last_value = id_counters.last_value + 1 returning last_value',
      [VERSION_KEY],
    );
    return Number(result.rows[0].last_value);
  }

  async function write(work) {
    const client = await driver.connect();
    let committed = false;
    try {
      await client.query('begin');
      if (advisoryLock) await client.query('select pg_advisory_xact_lock($1)', [LOCK_KEY]);
      await client.query('set constraints all deferred');
      const loaded = await loadSnapshot(client);
      const db = loaded.snapshot;
      if (snapshot) db.meta.demoPaymentsSeeded = snapshot.meta.demoPaymentsSeeded;
      const before = capture(db);
      const countersBefore = { ...db.meta.counters };
      const result = await work(db);
      const after = capture(db);
      const changes = diff(db, before, after);
      const counterChanges = Object.keys(db.meta.counters).filter(
        (key) => Number(db.meta.counters[key]) !== Number(countersBefore[key] ?? NaN),
      );
      let nextVersion = loaded.version;
      if (changes.upserts.length || changes.deletes.length || counterChanges.length) {
        for (const change of changes.upserts) await upsertRow(client, change.info, change.values);
        for (const change of [...changes.deletes].reverse()) await deleteRow(client, change.info, change.key);
        for (const key of counterChanges) await upsertCounter(client, key, db.meta.counters[key]);
        nextVersion = await bumpVersion(client);
      }
      await client.query('commit');
      committed = true;
      snapshot = db;
      version = nextVersion;
      return result;
    } catch (error) {
      if (!committed) {
        try { await client.query('rollback'); } catch (_rollbackError) { /* ignore */ }
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async function init() {
    const loadedColumns = await loadColumns();
    columns = loadedColumns.byTable;
    tableInfo = loadedColumns.tables;
    snapshotSql = buildSnapshotSql(tableInfo);
    const loaded = await loadSnapshot(driver);
    snapshot = loaded.snapshot;
    version = loaded.version;
    const empty = (snapshot.settings || []).length === 0;
    if (empty) {
      if (!seedDemo) {
        throw new Error('Database Supabase kosong. Jalankan impor data atau set PG_SEED_DEMO=true untuk data demo.');
      }
      await write((db) => { buildSeed(db); });
      snapshot.meta.demoPaymentsSeeded = false;
    } else {
      snapshot.meta.demoPaymentsSeeded = true;
    }
    await driver.query(
      `insert into id_counters (counter_key, last_value) values ('${VERSION_KEY}', 0) on conflict (counter_key) do nothing`,
    );
    return snapshot;
  }

  async function sync() {
    if (!snapshot) return null;
    const result = await driver.query(VERSION_SQL);
    const current = Number(result.rows[0] ? result.rows[0].version : 0);
    if (current !== version) {
      const loaded = await loadSnapshot(driver);
      loaded.snapshot.meta.demoPaymentsSeeded = snapshot.meta.demoPaymentsSeeded;
      snapshot = loaded.snapshot;
      version = loaded.version;
    }
    return snapshot;
  }

  async function ping() {
    await driver.query('select 1');
  }

  return {
    init,
    sync,
    ping,
    withLock: write,
    snapshot: () => snapshot,
    version: () => version,
    columns: () => columns,
    close: () => (driver.close ? driver.close() : null),
  };
}

module.exports = { createStore, decodeValue, encodeValue, buildSnapshotSql };
