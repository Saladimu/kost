'use strict';

const fs = require('fs');
const path = require('path');
const { today, nowISO, addDays } = require('./util');
const { generateMonthlyInvoices, updateOverdueInvoices } = require('./services/billing');
const { reconcile } = require('./services/reports');
const { getNumberSetting, audit } = require('./services/common');
const { DB_PATH } = require('./db');

let lastAutoRun = '';

function runBillingJobs(db, { user = 'SYSTEM', asOf = today() } = {}) {
  const billing = generateMonthlyInvoices(db, { asOf, user });
  const overdue = updateOverdueInvoices(db, { asOf, user });
  const recon = reconcile(db);
  return { asOf, billing, overdue: overdue.length, reconciliation: recon };
}

function backupDatabase() {
  const dir = path.join(path.dirname(DB_PATH), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(dir, `db-${stamp}.json`);
  fs.copyFileSync(DB_PATH, target);
  return target;
}

function autoRun(db, save) {
  const day = today();
  if (lastAutoRun === day) return;
  lastAutoRun = day;
  const result = runBillingJobs(db, { asOf: day, user: 'SYSTEM' });
  audit(db, { user: 'SYSTEM', action: 'AUTO_BILLING', module: 'Automation', recordId: 'DAILY_JOB', next: JSON.stringify({ created: result.billing.count, overdue: result.overdue }) });
  save(db);
}

function startScheduler(getDb, save, intervalMs = 6 * 60 * 60 * 1000) {
  const timer = setInterval(() => {
    try {
      autoRun(getDb(), save);
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  }, intervalMs);
  if (timer.unref) timer.unref();
  return timer;
}

module.exports = { runBillingJobs, backupDatabase, autoRun, startScheduler };
