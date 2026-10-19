'use strict';

const { nowISO, today } = require('./util');
const { buildSeed } = require('./seed');

const TABS = {
  settings: 'Settings',
  roomTypes: 'RoomTypes',
  rooms: 'Rooms',
  tenants: 'Tenants',
  priceList: 'PriceList',
  services: 'Services',
  staff: 'Staff',
  users: 'Users',
  reservations: 'Reservations',
  occupancies: 'Occupancies',
  invoices: 'Invoices',
  payments: 'Payments',
  allocations: 'Allocations',
  credits: 'Credits',
  serviceOrders: 'ServiceOrders',
  expenses: 'Expenses',
  activities: 'Activities',
  transactions: 'Transactions',
  deposits: 'Deposits',
  auditLog: 'AuditLog',
  systemLog: 'SystemLog',
};

const HEADERS = {
  settings: ['SettingKey', 'SettingValue', 'Description', 'UpdatedAt', 'UpdatedBy'],
  roomTypes: ['RoomTypeID', 'TypeName', 'Description', 'DefaultCapacity', 'DefaultMonthlyPrice', 'Facilities', 'IsActive', 'CreatedAt', 'UpdatedAt'],
  rooms: ['RoomID', 'RoomNumber', 'Building', 'Floor', 'RoomTypeID', 'Capacity', 'Facilities', 'StandardMonthlyPrice', 'OperationalStatus', 'Notes', 'CreatedAt', 'UpdatedAt'],
  tenants: ['TenantID', 'FullName', 'IdentityType', 'IdentityNumber', 'Phone', 'Email', 'Address', 'EmergencyContact', 'EmergencyPhone', 'Occupation', 'RegistrationDate', 'TenantStatus', 'Notes', 'CreatedAt', 'UpdatedAt'],
  priceList: ['PriceID', 'ItemCode', 'ItemName', 'ItemCategory', 'RoomTypeID', 'BillingUnit', 'StandardPrice', 'EffectiveFrom', 'EffectiveTo', 'IsActive', 'Notes'],
  services: ['ServiceID', 'ServiceCode', 'ServiceName', 'Category', 'Unit', 'StandardPrice', 'CostPrice', 'IsAvailable', 'Description', 'CreatedAt', 'UpdatedAt'],
  staff: ['StaffID', 'FullName', 'Position', 'Phone', 'Email', 'StartDate', 'EndDate', 'EmploymentStatus', 'AppRole', 'Notes'],
  users: ['UserID', 'StaffID', 'Email', 'PasswordHash', 'Role', 'IsActive', 'CreatedAt', 'UpdatedAt'],
  reservations: ['ReservationID', 'TenantID', 'RoomID', 'ReservationDate', 'PlannedCheckIn', 'PlannedCheckOut', 'AgreedMonthlyPrice', 'DepositAmount', 'ReservationStatus', 'CreatedBy', 'CreatedAt', 'Notes'],
  occupancies: ['OccupancyID', 'TenantID', 'RoomID', 'CheckInDate', 'PlannedCheckOut', 'ActualCheckOut', 'RentalPlan', 'AgreedMonthlyPrice', 'BillingDay', 'DueDay', 'DepositAmount', 'AgreementStatus', 'PreviousOccupancyID', 'CreatedBy', 'CreatedAt', 'Notes'],
  invoices: ['InvoiceID', 'InvoiceNumber', 'TenantID', 'OccupancyID', 'RoomID', 'PeriodStart', 'PeriodEnd', 'InvoiceDate', 'DueDate', 'RentalAmount', 'ServiceCharges', 'OtherCharges', 'DiscountAmount', 'TotalAmount', 'AmountPaid', 'OutstandingBalance', 'InvoiceStatus', 'LateFeeApplied', 'CreatedAt', 'CreatedBy', 'Notes'],
  payments: ['PaymentID', 'ReceiptNumber', 'PaymentDate', 'TenantID', 'PaymentMethod', 'AmountReceived', 'ReferenceNumber', 'PaymentStatus', 'ReceivedBy', 'IdempotencyKey', 'CreatedAt', 'Notes'],
  allocations: ['AllocationID', 'PaymentID', 'InvoiceID', 'AllocatedAmount', 'AllocationStatus', 'CreatedAt', 'CreatedBy', 'Notes'],
  credits: ['CreditID', 'TenantID', 'PaymentID', 'Amount', 'RemainingAmount', 'Status', 'CreatedAt', 'Notes'],
  serviceOrders: ['ServiceOrderID', 'OrderDate', 'TenantID', 'RoomID', 'ServiceID', 'Quantity', 'UnitPrice', 'TotalAmount', 'OrderStatus', 'BillingMethod', 'InvoiceID', 'PaymentID', 'RequestedBy', 'ProcessedBy', 'CreatedAt', 'Notes'],
  expenses: ['ExpenseID', 'ExpenseDate', 'Category', 'Description', 'Vendor', 'Quantity', 'UnitCost', 'TotalAmount', 'PaymentMethod', 'PaymentStatus', 'ReceiptURL', 'RequestedBy', 'ApprovedBy', 'TransactionID', 'CreatedAt', 'Notes'],
  activities: ['ActivityID', 'ActivityDate', 'StaffID', 'Category', 'RoomID', 'TenantID', 'Description', 'Priority', 'DueDate', 'Status', 'StartedAt', 'CompletedAt', 'VerifiedBy', 'Notes'],
  transactions: ['TransactionID', 'TransactionDate', 'TransactionType', 'Direction', 'Category', 'ReferenceType', 'ReferenceID', 'TenantID', 'RoomID', 'Description', 'Amount', 'PaymentMethod', 'PaymentStatus', 'StaffID', 'RelatedTransactionID', 'IdempotencyKey', 'CreatedAt', 'Notes'],
  deposits: ['DepositRecordID', 'TenantID', 'OccupancyID', 'DepositType', 'DepositAmount', 'AmountReturned', 'AmountDeducted', 'OutstandingDepositLiability', 'ReceiptTransactionID', 'ReturnTransactionID', 'DepositStatus', 'CreatedAt', 'Notes'],
  auditLog: ['AuditID', 'Timestamp', 'UserID', 'Action', 'Module', 'RecordID', 'PreviousValue', 'NewValue', 'Reason', 'RequestID'],
  systemLog: ['LogID', 'Timestamp', 'FunctionName', 'Severity', 'RequestID', 'RecordID', 'ErrorMessage', 'Status'],
};

const TIMEZONE = 'Asia/Jakarta';
const COLLECTIONS = Object.keys(TABS);
const DB_PATH = '';

function emptyDb_() {
  const db = {
    meta: { schemaVersion: 1, createdAt: nowISO(), updatedAt: nowISO(), counters: {}, demoPaymentsSeeded: false },
    settings: [], roomTypes: [], rooms: [], tenants: [], priceList: [], services: [],
    staff: [], users: [], reservations: [], occupancies: [], invoices: [], payments: [],
    allocations: [], credits: [], serviceOrders: [], expenses: [], activities: [],
    transactions: [], deposits: [], auditLog: [], systemLog: [],
  };
  for (const key of COLLECTIONS) db[key] = [];
  return db;
}

function spreadsheetId_() {
  const stored = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (stored) return stored;
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active.getId();
  } catch (error) {
    // Container-bound scripts can resolve the active spreadsheet; standalone scripts cannot.
  }
  throw new Error('SPREADSHEET_ID belum diatur. Jalankan fungsi setup() terlebih dahulu.');
}

function openSpreadsheet_() {
  return SpreadsheetApp.openById(spreadsheetId_());
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function valueForSheet_(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return Utilities.formatDate(value, TIMEZONE, 'yyyy-MM-dd');
  if (typeof value === 'object') {
    const text = JSON.stringify(value);
    return text.length > 49000 ? text.slice(0, 49000) : text;
  }
  if (typeof value === 'string' && value.length > 49000) return value.slice(0, 49000);
  return value;
}

function readRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) return [];
  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values[0].map((header) => String(header || '').trim());
  const rows = [];
  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    const row = {};
    let hasValue = false;
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      const header = headers[columnIndex];
      if (!header) continue;
      const value = valueForSheet_(values[rowIndex][columnIndex]);
      row[header] = value;
      if (value !== '' && value !== null) hasValue = true;
    }
    if (hasValue) rows.push(row);
  }
  return rows;
}

function writeRows_(sheet, baseHeaders, rows) {
  const headers = [];
  const seen = {};
  const add = (header) => {
    const key = String(header || '').trim();
    if (!key || seen[key]) return;
    seen[key] = true;
    headers.push(key);
  };
  baseHeaders.forEach(add);
  if (sheet.getLastColumn() > 0) {
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].forEach(add);
  }
  rows.forEach((row) => Object.keys(row).forEach(add));

  const values = [headers].concat(rows.map((row) => headers.map((header) => valueForSheet_(row[header]))));
  const target = sheet.getRange(1, 1, values.length, headers.length);
  target.setNumberFormat('@');
  sheet.clearContents();
  target.setValues(values);
  sheet.setFrozenRows(1);
}

function readMeta_(sheet) {
  const lastRow = sheet.getLastRow();
  const meta = { schemaVersion: 1, createdAt: nowISO(), updatedAt: nowISO(), counters: {}, demoPaymentsSeeded: false };
  if (lastRow < 2) return meta;
  const values = sheet.getRange(1, 1, lastRow, 2).getValues();
  for (let index = 1; index < values.length; index += 1) {
    if (String(values[index][0]) === 'meta' && values[index][1]) {
      try {
        const parsed = JSON.parse(values[index][1]);
        Object.keys(parsed).forEach((key) => { meta[key] = parsed[key]; });
      } catch (error) {
        // Fall back to defaults when the meta payload is unreadable.
      }
    }
  }
  if (!meta.counters) meta.counters = {};
  return meta;
}

function snapshot_(db) {
  const state = {};
  COLLECTIONS.forEach((key) => { state[key] = JSON.stringify(db[key] || []); });
  return state;
}

function remember_(db, state) {
  Object.defineProperty(db, '__original', {
    value: state,
    enumerable: false,
    configurable: true,
    writable: true,
  });
}

function load(options) {
  const allowSeed = !options || options.seed !== false;
  const spreadsheet = openSpreadsheet_();
  const metaSheet = ensureSheet_(spreadsheet, 'Meta', ['Key', 'Value']);
  const db = emptyDb_();
  db.meta = readMeta_(metaSheet);
  COLLECTIONS.forEach((key) => {
    const sheet = ensureSheet_(spreadsheet, TABS[key], HEADERS[key]);
    db[key] = readRows_(sheet);
  });

  const empty = !db.rooms.length && !db.users.length && !db.settings.length;
  if (empty && allowSeed) {
    buildSeed(db);
    save(db);
  }
  remember_(db, snapshot_(db));
  return db;
}

function save(db) {
  if (!db) throw new Error('Database belum dimuat.');
  const spreadsheet = openSpreadsheet_();
  db.meta.updatedAt = nowISO();
  const metaSheet = ensureSheet_(spreadsheet, 'Meta', ['Key', 'Value']);
  const previous = db.__original || {};
  COLLECTIONS.forEach((key) => {
    const serialized = JSON.stringify(db[key] || []);
    if (previous[key] === serialized) return;
    const sheet = ensureSheet_(spreadsheet, TABS[key], HEADERS[key]);
    writeRows_(sheet, HEADERS[key], db[key] || []);
  });
  metaSheet.clearContents();
  metaSheet.getRange(1, 1, 2, 2).setValues([['Key', 'Value'], ['meta', JSON.stringify(db.meta)]]);
  SpreadsheetApp.flush();
  remember_(db, snapshot_(db));
  return db;
}

function withLock(work) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const db = load();
    const result = work(db);
    save(db);
    return result;
  } finally {
    lock.releaseLock();
  }
}

function resetCacheForTests() {}

function isConfigured() {
  try {
    spreadsheetId_();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { DB_PATH, TABS, HEADERS, load, save, withLock, isConfigured, resetCacheForTests };
