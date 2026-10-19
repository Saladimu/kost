'use strict';

const { nowISO, makeId, today, AppError } = require('../util');

function getSetting(db, key, fallback = '') {
  const row = db.settings.find((s) => s.SettingKey === key);
  return row ? row.SettingValue : fallback;
}

function getNumberSetting(db, key, fallback = 0) {
  const value = Number(getSetting(db, key, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function getBooleanSetting(db, key, fallback = false) {
  const value = String(getSetting(db, key, fallback)).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

function setSetting(db, key, value, user, description = '') {
  const existing = db.settings.find((s) => s.SettingKey === key);
  if (existing) {
    existing.SettingValue = String(value);
    existing.UpdatedAt = nowISO();
    existing.UpdatedBy = user;
    if (description) existing.Description = description;
  } else {
    db.settings.push({
      SettingKey: key,
      SettingValue: String(value),
      Description: description,
      UpdatedAt: nowISO(),
      UpdatedBy: user,
    });
  }
}

function audit(db, { user, action, module, recordId = '', previous = '', next = '', reason = '', requestId = '' }) {
  db.auditLog.push({
    AuditID: makeId(db, 'audit', 'AUD'),
    Timestamp: nowISO(),
    UserID: user || 'SYSTEM',
    Action: action,
    Module: module,
    RecordID: recordId,
    PreviousValue: typeof previous === 'string' ? previous : JSON.stringify(previous),
    NewValue: typeof next === 'string' ? next : JSON.stringify(next),
    Reason: reason,
    RequestID: requestId,
  });
}

function logError(db, { functionName, severity = 'ERROR', requestId = '', recordId = '', errorMessage = '', status = 'Failed' }) {
  db.systemLog.push({
    LogID: makeId(db, 'systemLog', 'LOG'),
    Timestamp: nowISO(),
    FunctionName: functionName,
    Severity: severity,
    RequestID: requestId,
    RecordID: recordId,
    ErrorMessage: String(errorMessage).slice(0, 1000),
    Status: status,
  });
}

function findById(rows, key, id) {
  const row = rows.find((item) => item[key] === id);
  if (!row) throw new AppError(`Data dengan ID ${id} tidak ditemukan.`, 404, 'NOT_FOUND');
  return row;
}

function staffIdForUser(db, user) {
  if (!user) return '';
  return user.StaffID || '';
}

function actorName(db, user) {
  if (!user) return 'SYSTEM';
  const staff = db.staff.find((s) => s.StaffID === user.StaffID);
  return staff ? staff.FullName : user.Email;
}

function todayClampedStart(value) {
  return value || today();
}

module.exports = {
  getSetting,
  getNumberSetting,
  getBooleanSetting,
  setSetting,
  audit,
  logError,
  findById,
  staffIdForUser,
  actorName,
  todayClampedStart,
};
