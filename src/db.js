'use strict';

const fs = require('fs');
const path = require('path');
const { nowISO } = require('./util');
const { buildSeed } = require('./seed');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'db.json');
let cache = null;
let writeQueue = Promise.resolve();

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
}

module.exports = { DB_PATH, load, save, withLock, resetCacheForTests };
