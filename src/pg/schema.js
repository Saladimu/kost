'use strict';

const TABLES = [
  { app: 'settings', table: 'settings', pk: 'SettingKey' },
  { app: 'staff', table: 'staff', pk: 'StaffID' },
  { app: 'users', table: 'users', pk: 'UserID' },
  { app: 'roomTypes', table: 'room_types', pk: 'RoomTypeID' },
  { app: 'rooms', table: 'rooms', pk: 'RoomID' },
  { app: 'tenants', table: 'tenants', pk: 'TenantID' },
  { app: 'priceList', table: 'price_list', pk: 'PriceID' },
  { app: 'services', table: 'services', pk: 'ServiceID' },
  { app: 'transactions', table: 'transactions', pk: 'TransactionID' },
  { app: 'reservations', table: 'reservations', pk: 'ReservationID' },
  { app: 'occupancies', table: 'occupancies', pk: 'OccupancyID' },
  { app: 'deposits', table: 'deposits', pk: 'DepositRecordID' },
  { app: 'invoices', table: 'invoices', pk: 'InvoiceID' },
  { app: 'payments', table: 'payments', pk: 'PaymentID' },
  { app: 'allocations', table: 'payment_allocations', pk: 'AllocationID' },
  { app: 'credits', table: 'credits', pk: 'CreditID' },
  { app: 'serviceOrders', table: 'service_orders', pk: 'ServiceOrderID' },
  { app: 'expenses', table: 'expenses', pk: 'ExpenseID' },
  { app: 'activities', table: 'activities', pk: 'ActivityID' },
  { app: 'auditLog', table: 'audit_log', pk: 'AuditID' },
  { app: 'systemLog', table: 'system_log', pk: 'LogID' },
];

const VERSION_KEY = '__data_version';
const LOCK_KEY = 727274001;

const ACRONYMS = { id: 'ID', url: 'URL' };

function appKey(column) {
  return column.split('_').map((word) => {
    if (ACRONYMS[word]) return ACRONYMS[word];
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');
}

function findTable(name) {
  return TABLES.find((item) => item.app === name || item.table === name);
}

module.exports = { TABLES, VERSION_KEY, LOCK_KEY, appKey, findTable };
