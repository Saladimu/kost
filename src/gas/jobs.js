'use strict';

const { today } = require('./util');
const { generateMonthlyInvoices, updateOverdueInvoices } = require('./services/billing');
const { reconcile } = require('./services/reports');
const { audit } = require('./services/common');
const { withLock } = require('./db');

function runBillingJobs(db, { user = 'SYSTEM', asOf = today() } = {}) {
  const billing = generateMonthlyInvoices(db, { asOf, user });
  const overdue = updateOverdueInvoices(db, { asOf, user });
  const recon = reconcile(db);
  return { asOf, billing, overdue: overdue.length, reconciliation: recon };
}

function backupDatabase() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diatur.');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const copy = DriveApp.getFileById(id).makeCopy(`kos-backup-${stamp}`);
  return copy.getUrl();
}

function dailyJobs() {
  return withLock((db) => {
    const day = today();
    const result = runBillingJobs(db, { asOf: day, user: 'SYSTEM' });
    audit(db, {
      user: 'SYSTEM',
      action: 'AUTO_BILLING',
      module: 'Automation',
      recordId: 'DAILY_JOB',
      next: JSON.stringify({ created: result.billing.count, overdue: result.overdue }),
    });
    backupDatabase();
    return result;
  });
}

function installTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some((trigger) => trigger.getHandlerFunction() === 'dailyJobs');
  if (!exists) {
    ScriptApp.newTrigger('dailyJobs').timeBased().atHour(1).everyDays(1).create();
  }
  return !exists;
}

module.exports = { runBillingJobs, backupDatabase, dailyJobs, installTriggers };
