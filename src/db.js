'use strict';

const fs = require('fs');
const path = require('path');
const { nowISO } = require('./util');
const { buildSeed } = require('./seed');
const { createDriver } = require('./pg/driver');
const { createStore } = require('./pg/store');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'db.json');
let cache = null;
let writeQueue = Promise.resolve();
let store = null;
let initPromise = null;

function postgresUrl() {
  return process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
}

function isPostgres() {
  return String(process.env.DB_BACKEND || '').toLowerCase() === 'postgres' || postgresUrl() !== '';
}

async function init() {
  if (!isPostgres()) return null;
  if (store) return cache;
  if (!initPromise) {
    initPromise = (async () => {
      const driver = createDriver(postgresUrl());
      store = createStore({
        driver,
        advisoryLock: String(process.env.PG_ADVISORY_LOCK || 'true').toLowerCase() !== 'false',
        seedDemo: String(process.env.PG_SEED_DEMO || '').toLowerCase() === 'true',
      });
      await store.init();
      cache = store.snapshot();
      return cache;
    })();
  }
  return initPromise;
}

async function sync() {
  if (!store) return cache;
  cache = await store.sync();
  return cache;
}

function emptyDb() {
  return {
    meta: { schemaVersion: 1, createdAt: nowISO(), updatedAt: nowISO(), counters: {}, demoPaymentsSeeded: false },
    settings: [],
    roomTypes: [],
    rooms: [],
    tenants: [],
    priceList: [],
    services: [],
    staff: [],
    users: [],
    reservations: [],
    occupancies: [],
    invoices: [],
    payments: [],
    allocations: [],
    credits: [],
    serviceOrders: [],
    expenses: [],
    activities: [],
    transactions: [],
    deposits: [],
    auditLog: [],
    systemLog: [],
  };
}

function ensureCollections(db) {
  const base = emptyDb();
  for (const key of Object.keys(base)) {
    if (db[key] === undefined) db[key] = base[key];
  }
  if (!db.meta) db.meta = base.meta;
  if (!db.meta.counters) db.meta.counters = {};
  return db;
}

function load() {
  if (isPostgres()) {
    if (!cache) throw new Error('Database Postgres belum diinisialisasi.');
    return cache;
  }
  if (cache) return cache;
  if (fs.existsSync(DB_PATH)) {
    try {
      cache = ensureCollections(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
      return cache;
    } catch (error) {
      throw new Error(`Database tidak dapat dibaca: ${error.message}`);
    }
  }
  const db = ensureCollections(emptyDb());
  buildSeed(db);
  persist(db);
  cache = db;
  return cache;
}

function persist(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const temp = `${DB_PATH}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, DB_PATH);
}

function save(db = cache) {
  if (isPostgres()) throw new Error('save() tidak tersedia pada mode Postgres; gunakan withLock().');
  if (!db) throw new Error('Database belum dimuat.');
  db.meta.updatedAt = nowISO();
  persist(db);
  cache = db;
}

/**
 * Serializes mutations so concurrent HTTP requests cannot interleave between
 * validation and persistence. Services mutate synchronously inside this lock.
 */
async function withLock(work) {
  if (isPostgres()) {
    if (!store) await init();
    const run = writeQueue.then(async () => {
      const result = await store.withLock(work);
      cache = store.snapshot();
      return result;
    });
    writeQueue = run.catch(() => {});
    return run;
  }
  const run = writeQueue.then(async () => {
    const db = load();
    const result = await work(db);
    save(db);
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

function resetCacheForTests() {
  cache = null;
  store = null;
  initPromise = null;
}

module.exports = { DB_PATH, load, save, withLock, init, sync, isPostgres, resetCacheForTests };
