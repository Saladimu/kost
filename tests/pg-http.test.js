'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

function loadPglite() {
  try {
    return require('@electric-sql/pglite');
  } catch (_error) {
    return require('/usr/local/lib/node_modules/@electric-sql/pglite');
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitFor(url, attempts = 100) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (_error) { /* not ready */ }
    await sleep(100);
  }
  throw new Error(`Server tidak siap: ${url}`);
}

async function startApp(port, dbUrl) {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      SUPABASE_DB_URL: dbUrl,
      PGSSLMODE: 'disable',
      DB_BACKEND: 'postgres',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  await waitFor(`http://127.0.0.1:${port}/api/health`);
  return { child, output: () => output };
}

async function stop(child) {
  if (child.exitCode !== null) return;
  await new Promise((resolve) => {
    child.once('exit', resolve);
    child.kill('SIGTERM');
  });
}

async function call(base, method, endpoint, body) {
  const response = await fetch(`${base}/api${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.status, 200, `${method} ${endpoint}: ${response.status} ${text.slice(0, 300)}`);
  return { payload: JSON.parse(text), cookie: response.headers.get('set-cookie') };
}

async function main() {
  const { PGlite } = loadPglite();
  const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
  const { buildSeed } = require('../src/seed');
  const { bootstrap } = require('../src/bootstrap');
  const { prepareImport, renderSql } = require('../scripts/import-supabase');

  const snapshot = buildSeed({ meta: {} });
  bootstrap(snapshot);
  const prepared = prepareImport(snapshot);
  assert.equal(prepared.errors.length, 0, prepared.errors.join('; '));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kos-pg-http-'));
  const pg = new PGlite(dir);
  await pg.exec(fs.readFileSync(path.join(__dirname, '..', 'docs', 'supabase', '0001_initial.sql'), 'utf8'));
  await pg.exec(renderSql(prepared));

  const pgPort = await freePort();
  const socketServer = new PGLiteSocketServer({ db: pg, port: pgPort, host: '127.0.0.1', maxConnections: 5 });
  await socketServer.start();
  const dbUrl = `postgres://postgres@127.0.0.1:${pgPort}/postgres`;

  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  let app = null;
  try {
    app = await startApp(port, dbUrl);
    const health = await call(base, 'GET', '/health');
    assert.equal(health.payload.data.database, 'postgres');
    assert.equal(health.payload.data.storage, 'Postgres-db');

    const login = await call(base, 'POST', '/auth/login', { email: 'owner@kos.id', password: 'owner123' });
    const cookie = login.cookie.split(';')[0];
    assert.equal(login.payload.data.user.Role, 'Owner');
    assert.equal(login.payload.data.bootstrap.storage, 'Postgres-db');

    const rooms = await fetch(`${base}/api/rooms`, { headers: { Cookie: cookie } }).then((res) => res.json());
    assert.equal(rooms.data.length, 21);

    const created = await fetch(`${base}/api/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ FullName: 'Uji Persistensi', Phone: '081200000001', TenantStatus: 'Prospective' }),
    }).then((res) => res.json());
    assert.equal(created.ok, true, created.error);
    const tenantId = created.data.TenantID;
    assert.ok(tenantId);

    await stop(app.child);
    app = await startApp(port, dbUrl);

    const login2 = await call(base, 'POST', '/auth/login', { email: 'owner@kos.id', password: 'owner123' });
    const cookie2 = login2.cookie.split(';')[0];
    assert.equal(login2.payload.data.user.Role, 'Owner');

    const tenants = await fetch(`${base}/api/tenants?q=Uji%20Persistensi`, { headers: { Cookie: cookie2 } }).then((res) => res.json());
    assert.equal(tenants.ok, true, tenants.error);
    assert.ok(tenants.data.some((tenant) => tenant.TenantID === tenantId), 'Tenant harus bertahan setelah restart.');

    const persisted = await pg.query('select count(*)::int as total from tenants');
    assert.equal(persisted.rows[0].total, snapshot.tenants.length + 1);

    console.log(`OK: HTTP Postgres, login, ${rooms.data.length} kamar, tenant ${tenantId} bertahan setelah restart.`);
  } finally {
    if (app) await stop(app.child);
    await socketServer.stop();
    await pg.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
