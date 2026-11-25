'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kos-settings-'));
const dbPath = path.join(tmp, 'db.json');
fs.writeFileSync(dbPath, JSON.stringify({ rooms: [] }));

const { getBooleanSetting } = require('../src/services/common');

function backups() {
  const dir = path.join(tmp, 'backups');
  return fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
}

// autoRun() only fires once per calendar day, so each scenario needs its own process.
function runAutoRun(backupValue) {
  const script = `
    const { buildSeed } = require(${JSON.stringify(path.join(__dirname, '..', 'src', 'seed'))});
    const jobs = require(${JSON.stringify(path.join(__dirname, '..', 'src', 'jobs'))});
    const db = {
      meta: { schemaVersion: 1, counters: {}, demoPaymentsSeeded: false },
      settings: [], roomTypes: [], rooms: [], tenants: [], priceList: [], services: [],
      staff: [], users: [], reservations: [], occupancies: [], invoices: [], payments: [],
      allocations: [], credits: [], serviceOrders: [], expenses: [], activities: [],
      transactions: [], deposits: [], auditLog: [], systemLog: [],
    };
    buildSeed(db);
    db.settings.find((s) => s.SettingKey === 'BackupEnabled').SettingValue = ${JSON.stringify(backupValue)};
    jobs.autoRun(db, () => {});
  `;
  const result = spawnSync(process.execPath, ['-e', script], {
    env: { ...process.env, DB_PATH: dbPath },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
}

function testBooleanCoercion() {
  const cases = [
    [false, false], [true, true], ['false', false], ['FALSE', false],
    ['true', true], ['TRUE', true], ['1', true], ['yes', true],
  ];
  for (const [stored, expected] of cases) {
    const db = { settings: [{ SettingKey: 'BackupEnabled', SettingValue: stored }] };
    assert.equal(getBooleanSetting(db, 'BackupEnabled', !expected), expected, `nilai ${JSON.stringify(stored)}`);
  }
  assert.equal(getBooleanSetting({ settings: [] }, 'BackupEnabled', true), true, 'setting hilang memakai fallback');
  assert.equal(getBooleanSetting({ settings: [{ SettingKey: 'BackupEnabled', SettingValue: '' }] }, 'BackupEnabled', true), true, 'sel kosong memakai fallback');
}

function testSkipsBackupWhenDisabled() {
  const before = backups();
  runAutoRun(false);
  assert.equal(backups(), before, 'BackupEnabled=false harus mencegah backup otomatis');
}

function testCreatesBackupWhenEnabled() {
  const before = backups();
  runAutoRun(true);
  assert.equal(backups(), before + 1, 'BackupEnabled=true harus membuat backup otomatis');
}

testBooleanCoercion();
testSkipsBackupWhenDisabled();
testCreatesBackupWhenEnabled();

fs.rmSync(tmp, { recursive: true, force: true });
console.log('OK: BackupEnabled dibaca benar dari boolean Sheets maupun string, dan mengontrol backup otomatis.');
