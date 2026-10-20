#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DEFAULT_INPUT = process.env.DB_PATH || path.join(ROOT, 'data', 'db.json');
const DEFAULT_OUTPUT = path.join(ROOT, 'data', 'supabase-import.sql');
const DEFAULT_REPORT = path.join(ROOT, 'data', 'supabase-import-report.json');

const ROLE_VALUES = ['Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff'];
const EMPLOYMENT_VALUES = ['Active', 'Inactive', 'Resigned'];
const TENANT_VALUES = ['Prospective', 'Active', 'Checked Out', 'Inactive'];
const ROOM_VALUES = ['Available', 'Maintenance', 'Inactive'];
const RESERVATION_VALUES = ['Pending', 'Confirmed', 'Cancelled', 'Converted', 'Expired'];
const OCCUPANCY_VALUES = ['Active', 'Ended', 'Transferred', 'Renewed'];
const DEPOSIT_VALUES = ['Held', 'Partially Returned', 'Returned', 'Voided'];
const INVOICE_VALUES = ['Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];
const PAYMENT_VALUES = ['Pending', 'Confirmed', 'Voided', 'Refunded'];
const PAYMENT_METHOD_VALUES = ['Cash', 'Bank Transfer', 'QRIS', 'Other'];
const ALLOCATION_VALUES = ['Valid', 'Voided'];
const CREDIT_VALUES = ['Available', 'Used', 'Voided'];
const SERVICE_ORDER_VALUES = ['Billed', 'Paid', 'Cancelled'];
const BILLING_METHOD_VALUES = ['Immediate Payment', 'Add to Invoice'];
const EXPENSE_VALUES = ['Pending', 'Approved', 'Paid', 'Cancelled'];
const ACTIVITY_VALUES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const ACTIVITY_CATEGORIES = ['Cleaning', 'Maintenance', 'Inspection', 'Security', 'Administration', 'Other'];
const PRIORITY_VALUES = ['Low', 'Normal', 'High', 'Urgent'];
const DIRECTION_VALUES = ['IN', 'OUT'];

class ImportError extends Error {}

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    report: DEFAULT_REPORT,
    execute: false,
    repairTotals: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') options.input = path.resolve(argv[++i]);
    else if (arg === '--output') options.output = path.resolve(argv[++i]);
    else if (arg === '--report') options.report = path.resolve(argv[++i]);
    else if (arg === '--execute') options.execute = true;
    else if (arg === '--repair-totals') options.repairTotals = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Argumen tidak dikenal: ${arg}`);
  }
  return options;
}

function text(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function optionalText(value) {
  const result = text(value);
  return result === '' ? null : result;
}

function requiredText(value, label) {
  const result = text(value);
  if (!result) throw new ImportError(`${label} wajib diisi.`);
  return result;
}

function toDate(value, label, { required = false } = {}) {
  const raw = text(value);
  if (!raw) {
    if (required) throw new ImportError(`${label} wajib diisi.`);
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new ImportError(`${label} harus berformat YYYY-MM-DD: ${raw}`);
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw) {
    throw new ImportError(`${label} bukan tanggal yang valid: ${raw}`);
  }
  return raw;
}

function toTimestamp(value, label, { required = false } = {}) {
  const raw = text(value);
  if (!raw) {
    if (required) throw new ImportError(`${label} wajib diisi.`);
    return null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw new ImportError(`${label} bukan waktu yang valid: ${raw}`);
  return parsed.toISOString();
}

function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'ya'].includes(normalized)) return true;
  if (['false', '0', 'no', 'tidak'].includes(normalized)) return false;
  throw new ImportError(`Nilai boolean tidak valid: ${value}`);
}

function toAmount(value, label, { allowZero = true } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new ImportError(`${label} harus berupa angka.`);
  if (number < 0 || (!allowZero && number === 0)) {
    throw new ImportError(`${label} harus ${allowZero ? 'nol atau lebih' : 'lebih besar dari nol'}.`);
  }
  return number;
}

function toInteger(value, label, { required = false } = {}) {
  const raw = text(value);
  if (!raw) {
    if (required) throw new ImportError(`${label} wajib diisi.`);
    return null;
  }
  const number = Number(raw);
  if (!Number.isInteger(number)) throw new ImportError(`${label} harus berupa bilangan bulat.`);
  return number;
}

function toEnum(value, allowed, label, fallback) {
  const raw = text(value) || fallback;
  if (!allowed.includes(raw)) {
    throw new ImportError(`${label} tidak valid: ${raw}. Pilihan: ${allowed.join(', ')}`);
  }
  return raw;
}

function actor(value) {
  return optionalText(value) || 'SYSTEM';
}

function jsonb(value) {
  if (value && typeof value === 'object') return JSON.stringify(value);
  const raw = text(value);
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw));
  } catch (_error) {
    return JSON.stringify(raw);
  }
}

function mapRows(rows, label, mapper, errors) {
  const result = [];
  rows.forEach((row, index) => {
    try {
      result.push(mapper(row, index));
    } catch (error) {
      errors.push(`${label}[${index}]: ${error.message}`);
    }
  });
  return result;
}

function makeRow(values) {
  return values;
}

function snapshotRows(snapshot, key) {
  const value = snapshot[key];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ImportError(`${key} harus berupa array.`);
  return value;
}

function buildSettings(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'settings'), 'settings', (row, index) => {
    const item = Array.isArray(row)
      ? { SettingKey: row[0], SettingValue: row[1], Description: row[2] }
      : row;
    return makeRow({
      setting_key: requiredText(item.SettingKey, 'SettingKey'),
      setting_value: text(item.SettingValue),
      description: text(item.Description),
      updated_at: toTimestamp(item.UpdatedAt, 'UpdatedAt') || new Date().toISOString(),
      updated_by: actor(item.UpdatedBy),
    });
  }, errors);
}

function buildStaff(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'staff'), 'staff', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      staff_id: requiredText(row.StaffID, 'StaffID'),
      full_name: requiredText(row.FullName, 'FullName'),
      position: text(row.Position),
      phone: text(row.Phone),
      email: text(row.Email),
      start_date: toDate(row.StartDate, 'StartDate'),
      end_date: toDate(row.EndDate, 'EndDate'),
      employment_status: toEnum(row.EmploymentStatus, EMPLOYMENT_VALUES, 'EmploymentStatus', 'Active'),
      app_role: toEnum(row.AppRole, ROLE_VALUES, 'AppRole'),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildUsers(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'users'), 'users', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      user_id: requiredText(row.UserID, 'UserID'),
      staff_id: requiredText(row.StaffID, 'StaffID'),
      email: requiredText(row.Email, 'Email'),
      password_hash: requiredText(row.PasswordHash, 'PasswordHash'),
      role: toEnum(row.Role, ROLE_VALUES, 'Role'),
      is_active: toBool(row.IsActive, true),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildRoomTypes(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'roomTypes'), 'roomTypes', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      room_type_id: requiredText(row.RoomTypeID, 'RoomTypeID'),
      type_name: requiredText(row.TypeName, 'TypeName'),
      description: text(row.Description),
      default_capacity: toInteger(row.DefaultCapacity, 'DefaultCapacity', { required: true }),
      default_monthly_price: toAmount(row.DefaultMonthlyPrice, 'DefaultMonthlyPrice'),
      facilities: text(row.Facilities),
      is_active: toBool(row.IsActive, true),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildRooms(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'rooms'), 'rooms', (row, index) => {
    const now = new Date().toISOString();
    let status = text(row.OperationalStatus, 'Available');
    if (status === 'Occupied' || status === 'Reserved') status = 'Available';
    return makeRow({
      room_id: requiredText(row.RoomID, 'RoomID'),
      room_number: requiredText(row.RoomNumber, 'RoomNumber'),
      building: text(row.Building),
      floor: text(row.Floor),
      room_type_id: requiredText(row.RoomTypeID, 'RoomTypeID'),
      capacity: toInteger(row.Capacity, 'Capacity', { required: true }),
      facilities: text(row.Facilities),
      standard_monthly_price: toAmount(row.StandardMonthlyPrice, 'StandardMonthlyPrice'),
      operational_status: toEnum(status, ROOM_VALUES, 'OperationalStatus'),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildTenants(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'tenants'), 'tenants', (row, index) => {
    const now = new Date().toISOString();
    const registrationDate = toDate(row.RegistrationDate, 'RegistrationDate') || new Date().toISOString().slice(0, 10);
    return makeRow({
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      full_name: requiredText(row.FullName, 'FullName'),
      identity_type: text(row.IdentityType, 'KTP'),
      identity_number: text(row.IdentityNumber),
      phone: text(row.Phone),
      email: text(row.Email),
      address: text(row.Address),
      emergency_contact: text(row.EmergencyContact),
      emergency_phone: text(row.EmergencyPhone),
      occupation: text(row.Occupation),
      registration_date: registrationDate,
      tenant_status: toEnum(row.TenantStatus, TENANT_VALUES, 'TenantStatus', 'Prospective'),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildPriceList(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'priceList'), 'priceList', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      price_id: requiredText(row.PriceID, 'PriceID'),
      item_code: requiredText(row.ItemCode, 'ItemCode'),
      item_name: requiredText(row.ItemName, 'ItemName'),
      item_category: requiredText(row.ItemCategory, 'ItemCategory'),
      room_type_id: optionalText(row.RoomTypeID),
      billing_unit: text(row.BillingUnit, 'bulan'),
      standard_price: toAmount(row.StandardPrice, 'StandardPrice'),
      effective_from: toDate(row.EffectiveFrom, 'EffectiveFrom', { required: true }),
      effective_to: toDate(row.EffectiveTo, 'EffectiveTo'),
      is_active: toBool(row.IsActive, true),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildServices(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'services'), 'services', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      service_id: requiredText(row.ServiceID, 'ServiceID'),
      service_code: requiredText(row.ServiceCode, 'ServiceCode'),
      service_name: requiredText(row.ServiceName, 'ServiceName'),
      category: requiredText(row.Category, 'Category'),
      unit: requiredText(row.Unit, 'Unit'),
      standard_price: toAmount(row.StandardPrice, 'StandardPrice'),
      cost_price: toAmount(row.CostPrice, 'CostPrice'),
      is_available: toBool(row.IsAvailable !== undefined ? row.IsAvailable : row.IsActive, true),
      description: text(row.Description),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildTransactions(snapshot, errors, warnings) {
  return mapRows(snapshotRows(snapshot, 'transactions'), 'transactions', (row, index) => {
    const id = requiredText(row.TransactionID, 'TransactionID');
    let idempotencyKey = text(row.IdempotencyKey);
    if (!idempotencyKey) {
      idempotencyKey = `LEGACY:${id}`;
      warnings.push(`transactions ${id}: IdempotencyKey kosong, memakai ${idempotencyKey}.`);
    }
    return makeRow({
      transaction_id: id,
      transaction_date: toDate(row.TransactionDate, 'TransactionDate', { required: true }),
      transaction_type: requiredText(row.TransactionType, 'TransactionType'),
      direction: toEnum(row.Direction, DIRECTION_VALUES, 'Direction'),
      category: text(row.Category),
      reference_type: text(row.ReferenceType),
      reference_id: text(row.ReferenceID),
      tenant_id: optionalText(row.TenantID),
      room_id: optionalText(row.RoomID),
      description: requiredText(row.Description, 'Description'),
      amount: toAmount(row.Amount, 'Amount', { allowZero: false }),
      payment_method: text(row.PaymentMethod),
      payment_status: toEnum(row.PaymentStatus, ['Pending', 'Confirmed', 'Voided'], 'PaymentStatus', 'Confirmed'),
      staff_id: optionalText(row.StaffID),
      related_transaction_id: optionalText(row.RelatedTransactionID),
      idempotency_key: idempotencyKey,
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || new Date().toISOString(),
    });
  }, errors);
}

function buildReservations(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'reservations'), 'reservations', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      reservation_id: requiredText(row.ReservationID, 'ReservationID'),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      room_id: requiredText(row.RoomID, 'RoomID'),
      reservation_date: toDate(row.ReservationDate, 'ReservationDate') || now.slice(0, 10),
      planned_check_in: toDate(row.PlannedCheckIn, 'PlannedCheckIn', { required: true }),
      planned_check_out: toDate(row.PlannedCheckOut, 'PlannedCheckOut'),
      agreed_monthly_price: toAmount(row.AgreedMonthlyPrice, 'AgreedMonthlyPrice'),
      deposit_amount: toAmount(row.DepositAmount, 'DepositAmount'),
      reservation_status: toEnum(row.ReservationStatus, RESERVATION_VALUES, 'ReservationStatus', 'Pending'),
      created_by: actor(row.CreatedBy),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildOccupancies(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'occupancies'), 'occupancies', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      occupancy_id: requiredText(row.OccupancyID, 'OccupancyID'),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      room_id: requiredText(row.RoomID, 'RoomID'),
      check_in_date: toDate(row.CheckInDate, 'CheckInDate', { required: true }),
      planned_check_out: toDate(row.PlannedCheckOut, 'PlannedCheckOut'),
      actual_check_out: toDate(row.ActualCheckOut, 'ActualCheckOut'),
      rental_plan: text(row.RentalPlan, 'Monthly'),
      agreed_monthly_price: toAmount(row.AgreedMonthlyPrice, 'AgreedMonthlyPrice'),
      billing_day: toInteger(row.BillingDay, 'BillingDay'),
      due_day: toInteger(row.DueDay, 'DueDay'),
      deposit_amount: toAmount(row.DepositAmount, 'DepositAmount'),
      agreement_status: toEnum(row.AgreementStatus, OCCUPANCY_VALUES, 'AgreementStatus', 'Active'),
      previous_occupancy_id: optionalText(row.PreviousOccupancyID),
      created_by: actor(row.CreatedBy),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildDeposits(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'deposits'), 'deposits', (row, index) => {
    const now = new Date().toISOString();
    const depositAmount = toAmount(row.DepositAmount, 'DepositAmount');
    const amountReturned = toAmount(row.AmountReturned, 'AmountReturned');
    const amountDeducted = toAmount(row.AmountDeducted, 'AmountDeducted');
    const outstanding = row.OutstandingDepositLiability === undefined || row.OutstandingDepositLiability === ''
      ? depositAmount - amountReturned - amountDeducted
      : toAmount(row.OutstandingDepositLiability, 'OutstandingDepositLiability');
    return makeRow({
      deposit_record_id: requiredText(row.DepositRecordID, 'DepositRecordID'),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      occupancy_id: requiredText(row.OccupancyID, 'OccupancyID'),
      deposit_type: text(row.DepositType, 'Security Deposit'),
      deposit_amount: depositAmount,
      amount_returned: amountReturned,
      amount_deducted: amountDeducted,
      outstanding_deposit_liability: outstanding,
      receipt_transaction_id: optionalText(row.ReceiptTransactionID),
      return_transaction_id: optionalText(row.ReturnTransactionID),
      deposit_status: toEnum(row.DepositStatus, DEPOSIT_VALUES, 'DepositStatus', 'Held'),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildInvoices(snapshot, errors, warnings, options) {
  return mapRows(snapshotRows(snapshot, 'invoices'), 'invoices', (row, index) => {
    const now = new Date().toISOString();
    const rental = toAmount(row.RentalAmount, 'RentalAmount');
    const service = toAmount(row.ServiceCharges, 'ServiceCharges');
    const other = toAmount(row.OtherCharges, 'OtherCharges');
    const discount = toAmount(row.DiscountAmount, 'DiscountAmount');
    const computed = rental + service + other - discount;
    const sourceTotal = toAmount(row.TotalAmount, 'TotalAmount');
    if (Math.abs(sourceTotal - computed) > 0.005) {
      if (!options.repairTotals) {
        throw new ImportError(`TotalAmount ${sourceTotal} tidak sama dengan total hitung ${computed}. Jalankan dengan --repair-totals jika ingin memakai total hitung.`);
      }
      warnings.push(`invoices ${row.InvoiceID}: TotalAmount ${sourceTotal} diganti menjadi ${computed}.`);
    }
    return makeRow({
      invoice_id: requiredText(row.InvoiceID, 'InvoiceID'),
      invoice_number: requiredText(row.InvoiceNumber, 'InvoiceNumber'),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      occupancy_id: requiredText(row.OccupancyID, 'OccupancyID'),
      room_id: requiredText(row.RoomID, 'RoomID'),
      period_start: toDate(row.PeriodStart, 'PeriodStart', { required: true }),
      period_end: toDate(row.PeriodEnd, 'PeriodEnd', { required: true }),
      invoice_date: toDate(row.InvoiceDate, 'InvoiceDate') || now.slice(0, 10),
      due_date: toDate(row.DueDate, 'DueDate', { required: true }),
      rental_amount: rental,
      service_charges: service,
      other_charges: other,
      discount_amount: discount,
      total_amount: computed,
      invoice_status: toEnum(row.InvoiceStatus, INVOICE_VALUES, 'InvoiceStatus', 'Issued'),
      late_fee_applied: toBool(row.LateFeeApplied, false),
      created_by: actor(row.CreatedBy),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildPayments(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'payments'), 'payments', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      payment_id: requiredText(row.PaymentID, 'PaymentID'),
      receipt_number: requiredText(row.ReceiptNumber, 'ReceiptNumber'),
      payment_date: toDate(row.PaymentDate, 'PaymentDate', { required: true }),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      payment_method: toEnum(row.PaymentMethod, PAYMENT_METHOD_VALUES, 'PaymentMethod'),
      amount_received: toAmount(row.AmountReceived, 'AmountReceived', { allowZero: false }),
      reference_number: text(row.ReferenceNumber),
      payment_status: toEnum(row.PaymentStatus, PAYMENT_VALUES, 'PaymentStatus', 'Confirmed'),
      received_by: actor(row.ReceivedBy),
      idempotency_key: requiredText(row.IdempotencyKey, 'IdempotencyKey'),
      notes: text(row.Notes),
      voided_at: toTimestamp(row.VoidedAt, 'VoidedAt'),
      voided_by: optionalText(row.VoidedBy),
      void_reason: text(row.VoidReason),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildAllocations(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'allocations'), 'allocations', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      allocation_id: requiredText(row.AllocationID, 'AllocationID'),
      payment_id: requiredText(row.PaymentID, 'PaymentID'),
      invoice_id: requiredText(row.InvoiceID, 'InvoiceID'),
      allocated_amount: toAmount(row.AllocatedAmount, 'AllocatedAmount', { allowZero: false }),
      allocation_status: toEnum(row.AllocationStatus, ALLOCATION_VALUES, 'AllocationStatus', 'Valid'),
      created_by: actor(row.CreatedBy),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildCredits(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'credits'), 'credits', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      credit_id: requiredText(row.CreditID, 'CreditID'),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      payment_id: requiredText(row.PaymentID, 'PaymentID'),
      amount: toAmount(row.Amount, 'Amount', { allowZero: false }),
      remaining_amount: toAmount(row.RemainingAmount, 'RemainingAmount'),
      status: toEnum(row.Status, CREDIT_VALUES, 'Status', 'Available'),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildServiceOrders(snapshot, errors, warnings, options) {
  return mapRows(snapshotRows(snapshot, 'serviceOrders'), 'serviceOrders', (row, index) => {
    const now = new Date().toISOString();
    const quantity = toAmount(row.Quantity, 'Quantity', { allowZero: false });
    const unitPrice = toAmount(row.UnitPrice, 'UnitPrice');
    const computed = quantity * unitPrice;
    const sourceTotal = toAmount(row.TotalAmount, 'TotalAmount');
    if (Math.abs(sourceTotal - computed) > 0.005) {
      if (!options.repairTotals) {
        throw new ImportError(`TotalAmount ${sourceTotal} tidak sama dengan quantity x UnitPrice (${computed}).`);
      }
      warnings.push(`serviceOrders ${row.ServiceOrderID}: TotalAmount ${sourceTotal} diganti menjadi ${computed}.`);
    }
    return makeRow({
      service_order_id: requiredText(row.ServiceOrderID, 'ServiceOrderID'),
      order_date: toDate(row.OrderDate, 'OrderDate') || now.slice(0, 10),
      tenant_id: requiredText(row.TenantID, 'TenantID'),
      room_id: optionalText(row.RoomID),
      service_id: requiredText(row.ServiceID, 'ServiceID'),
      quantity,
      unit_price: unitPrice,
      total_amount: computed,
      order_status: toEnum(row.OrderStatus, SERVICE_ORDER_VALUES, 'OrderStatus', 'Billed'),
      billing_method: toEnum(row.BillingMethod, BILLING_METHOD_VALUES, 'BillingMethod'),
      invoice_id: optionalText(row.InvoiceID),
      payment_id: optionalText(row.PaymentID),
      requested_by: actor(row.RequestedBy),
      processed_by: actor(row.ProcessedBy),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildExpenses(snapshot, errors, warnings, options) {
  return mapRows(snapshotRows(snapshot, 'expenses'), 'expenses', (row, index) => {
    const now = new Date().toISOString();
    const quantity = toAmount(row.Quantity, 'Quantity', { allowZero: false });
    const unitCost = toAmount(row.UnitCost, 'UnitCost');
    const computed = quantity * unitCost;
    const sourceTotal = toAmount(row.TotalAmount, 'TotalAmount');
    if (Math.abs(sourceTotal - computed) > 0.005) {
      if (!options.repairTotals) {
        throw new ImportError(`TotalAmount ${sourceTotal} tidak sama dengan quantity x UnitCost (${computed}).`);
      }
      warnings.push(`expenses ${row.ExpenseID}: TotalAmount ${sourceTotal} diganti menjadi ${computed}.`);
    }
    return makeRow({
      expense_id: requiredText(row.ExpenseID, 'ExpenseID'),
      expense_date: toDate(row.ExpenseDate, 'ExpenseDate', { required: true }),
      category: requiredText(row.Category, 'Category'),
      description: requiredText(row.Description, 'Description'),
      vendor: text(row.Vendor),
      quantity,
      unit_cost: unitCost,
      total_amount: computed,
      payment_method: text(row.PaymentMethod),
      receipt_url: text(row.ReceiptURL),
      requested_by: actor(row.RequestedBy),
      payment_status: toEnum(row.PaymentStatus, EXPENSE_VALUES, 'PaymentStatus', 'Pending'),
      transaction_id: optionalText(row.TransactionID),
      approved_by: optionalText(row.ApprovedBy),
      approved_at: toTimestamp(row.ApprovedAt, 'ApprovedAt'),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildActivities(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'activities'), 'activities', (row, index) => {
    const now = new Date().toISOString();
    return makeRow({
      activity_id: requiredText(row.ActivityID, 'ActivityID'),
      activity_date: toDate(row.ActivityDate, 'ActivityDate') || now.slice(0, 10),
      staff_id: requiredText(row.StaffID, 'StaffID'),
      category: toEnum(row.Category, ACTIVITY_CATEGORIES, 'Category'),
      room_id: optionalText(row.RoomID),
      tenant_id: optionalText(row.TenantID),
      description: requiredText(row.Description, 'Description'),
      priority: toEnum(row.Priority, PRIORITY_VALUES, 'Priority', 'Normal'),
      due_date: toDate(row.DueDate, 'DueDate', { required: true }),
      status: toEnum(row.Status, ACTIVITY_VALUES, 'Status', 'Pending'),
      started_at: toTimestamp(row.StartedAt, 'StartedAt'),
      completed_at: toTimestamp(row.CompletedAt, 'CompletedAt'),
      verified_by: optionalText(row.VerifiedBy),
      notes: text(row.Notes),
      created_at: toTimestamp(row.CreatedAt, 'CreatedAt') || now,
      updated_at: toTimestamp(row.UpdatedAt, 'UpdatedAt') || now,
    });
  }, errors);
}

function buildAuditLog(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'auditLog'), 'auditLog', (row, index) => {
    return makeRow({
      audit_id: requiredText(row.AuditID, 'AuditID'),
      timestamp: toTimestamp(row.Timestamp, 'Timestamp') || new Date().toISOString(),
      user_id: actor(row.UserID),
      action: requiredText(row.Action, 'Action'),
      module: requiredText(row.Module, 'Module'),
      record_id: text(row.RecordID),
      previous_value: jsonb(row.PreviousValue),
      new_value: jsonb(row.NewValue),
      reason: text(row.Reason),
      request_id: text(row.RequestID),
    });
  }, errors);
}

function buildSystemLog(snapshot, errors) {
  return mapRows(snapshotRows(snapshot, 'systemLog'), 'systemLog', (row, index) => {
    return makeRow({
      log_id: requiredText(row.LogID, 'LogID'),
      timestamp: toTimestamp(row.Timestamp, 'Timestamp') || new Date().toISOString(),
      function_name: requiredText(row.FunctionName, 'FunctionName'),
      severity: text(row.Severity, 'ERROR'),
      request_id: text(row.RequestID),
      record_id: text(row.RecordID),
      error_message: text(row.ErrorMessage),
      status: text(row.Status, 'Failed'),
    });
  }, errors);
}

function deriveCounters(snapshot, warnings) {
  const counters = Object.assign({}, snapshot.meta && snapshot.meta.counters ? snapshot.meta.counters : {});
  const definitions = [
    ['room', 'rooms', 'RoomID'],
    ['roomType', 'roomTypes', 'RoomTypeID'],
    ['tenant', 'tenants', 'TenantID'],
    ['staff', 'staff', 'StaffID'],
    ['user', 'users', 'UserID'],
    ['service', 'services', 'ServiceID'],
    ['price', 'priceList', 'PriceID'],
    ['occupancy', 'occupancies', 'OccupancyID'],
    ['deposit', 'deposits', 'DepositRecordID'],
    ['reservation', 'reservations', 'ReservationID'],
    ['invoice', 'invoices', 'InvoiceID'],
    ['payment', 'payments', 'PaymentID'],
    ['allocation', 'allocations', 'AllocationID'],
    ['serviceOrder', 'serviceOrders', 'ServiceOrderID'],
    ['expense', 'expenses', 'ExpenseID'],
    ['activity', 'activities', 'ActivityID'],
    ['transaction', 'transactions', 'TransactionID'],
    ['credit', 'credits', 'CreditID'],
    ['audit', 'auditLog', 'AuditID'],
    ['systemLog', 'systemLog', 'LogID'],
  ];

  for (const [key, collection, field] of definitions) {
    const max = snapshotRows(snapshot, collection).reduce((highest, row) => {
      const match = String(row[field] || '').match(/-(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    if (max > Number(counters[key] || 0)) counters[key] = max;
  }

  const monthly = [
    ['invoice-', 'invoices', 'InvoiceNumber'],
    ['receipt-', 'payments', 'ReceiptNumber'],
  ];
  for (const [prefix, collection, field] of monthly) {
    for (const row of snapshotRows(snapshot, collection)) {
      const match = String(row[field] || '').match(/\/(\d{4})(\d{2})\/(\d+)$/);
      if (!match) continue;
      const key = `${prefix}${match[1]}-${match[2]}`;
      const value = Number(match[3]);
      if (value > Number(counters[key] || 0)) counters[key] = value;
    }
  }

  for (const [key, value] of Object.entries(counters)) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) delete counters[key];
    else counters[key] = Math.trunc(number);
  }
  return counters;
}

function insertSql(table, columns, rows, conflictColumns) {
  if (!rows.length) return `-- ${table}: 0 rows\n`;
  const lines = [`-- ${table}: ${rows.length} rows`];
  for (const row of rows) {
    const values = columns.map((column) => {
      const value = row[column];
      if (value === null || value === undefined) return 'null';
      if (typeof value === 'number') return String(value);
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      const quoted = `'${String(value).replace(/'/g, "''")}'`;
      return column.endsWith('_value') && (table === 'audit_log') ? `${quoted}::jsonb` : quoted;
    });
    lines.push(`insert into ${table} (${columns.join(', ')}) values (${values.join(', ')}) on conflict (${conflictColumns.join(', ')}) do nothing;`);
  }
  return `${lines.join('\n')}\n`;
}

function buildTables(prepared) {
  const definitions = [
    ['settings', ['setting_key', 'setting_value', 'description', 'updated_at', 'updated_by'], ['setting_key']],
    ['staff', ['staff_id', 'full_name', 'position', 'phone', 'email', 'start_date', 'end_date', 'employment_status', 'app_role', 'notes', 'created_at', 'updated_at'], ['staff_id']],
    ['users', ['user_id', 'staff_id', 'email', 'password_hash', 'role', 'is_active', 'created_at', 'updated_at'], ['user_id']],
    ['room_types', ['room_type_id', 'type_name', 'description', 'default_capacity', 'default_monthly_price', 'facilities', 'is_active', 'created_at', 'updated_at'], ['room_type_id']],
    ['rooms', ['room_id', 'room_number', 'building', 'floor', 'room_type_id', 'capacity', 'facilities', 'standard_monthly_price', 'operational_status', 'notes', 'created_at', 'updated_at'], ['room_id']],
    ['tenants', ['tenant_id', 'full_name', 'identity_type', 'identity_number', 'phone', 'email', 'address', 'emergency_contact', 'emergency_phone', 'occupation', 'registration_date', 'tenant_status', 'notes', 'created_at', 'updated_at'], ['tenant_id']],
    ['price_list', ['price_id', 'item_code', 'item_name', 'item_category', 'room_type_id', 'billing_unit', 'standard_price', 'effective_from', 'effective_to', 'is_active', 'notes', 'created_at', 'updated_at'], ['price_id']],
    ['services', ['service_id', 'service_code', 'service_name', 'category', 'unit', 'standard_price', 'cost_price', 'is_available', 'description', 'created_at', 'updated_at'], ['service_id']],
    ['transactions', ['transaction_id', 'transaction_date', 'transaction_type', 'direction', 'category', 'reference_type', 'reference_id', 'tenant_id', 'room_id', 'description', 'amount', 'payment_method', 'payment_status', 'staff_id', 'related_transaction_id', 'idempotency_key', 'notes', 'created_at'], ['transaction_id']],
    ['reservations', ['reservation_id', 'tenant_id', 'room_id', 'reservation_date', 'planned_check_in', 'planned_check_out', 'agreed_monthly_price', 'deposit_amount', 'reservation_status', 'created_by', 'notes', 'created_at', 'updated_at'], ['reservation_id']],
    ['occupancies', ['occupancy_id', 'tenant_id', 'room_id', 'check_in_date', 'planned_check_out', 'actual_check_out', 'rental_plan', 'agreed_monthly_price', 'billing_day', 'due_day', 'deposit_amount', 'agreement_status', 'previous_occupancy_id', 'created_by', 'notes', 'created_at', 'updated_at'], ['occupancy_id']],
    ['deposits', ['deposit_record_id', 'tenant_id', 'occupancy_id', 'deposit_type', 'deposit_amount', 'amount_returned', 'amount_deducted', 'outstanding_deposit_liability', 'receipt_transaction_id', 'return_transaction_id', 'deposit_status', 'notes', 'created_at', 'updated_at'], ['deposit_record_id']],
    ['invoices', ['invoice_id', 'invoice_number', 'tenant_id', 'occupancy_id', 'room_id', 'period_start', 'period_end', 'invoice_date', 'due_date', 'rental_amount', 'service_charges', 'other_charges', 'discount_amount', 'total_amount', 'invoice_status', 'late_fee_applied', 'created_by', 'notes', 'created_at', 'updated_at'], ['invoice_id']],
    ['payments', ['payment_id', 'receipt_number', 'payment_date', 'tenant_id', 'payment_method', 'amount_received', 'reference_number', 'payment_status', 'received_by', 'idempotency_key', 'notes', 'voided_at', 'voided_by', 'void_reason', 'created_at', 'updated_at'], ['payment_id']],
    ['payment_allocations', ['allocation_id', 'payment_id', 'invoice_id', 'allocated_amount', 'allocation_status', 'created_by', 'notes', 'created_at', 'updated_at'], ['allocation_id']],
    ['credits', ['credit_id', 'tenant_id', 'payment_id', 'amount', 'remaining_amount', 'status', 'notes', 'created_at', 'updated_at'], ['credit_id']],
    ['service_orders', ['service_order_id', 'order_date', 'tenant_id', 'room_id', 'service_id', 'quantity', 'unit_price', 'total_amount', 'order_status', 'billing_method', 'invoice_id', 'payment_id', 'requested_by', 'processed_by', 'notes', 'created_at', 'updated_at'], ['service_order_id']],
    ['expenses', ['expense_id', 'expense_date', 'category', 'description', 'vendor', 'quantity', 'unit_cost', 'total_amount', 'payment_method', 'receipt_url', 'requested_by', 'payment_status', 'transaction_id', 'approved_by', 'approved_at', 'notes', 'created_at', 'updated_at'], ['expense_id']],
    ['activities', ['activity_id', 'activity_date', 'staff_id', 'category', 'room_id', 'tenant_id', 'description', 'priority', 'due_date', 'status', 'started_at', 'completed_at', 'verified_by', 'notes', 'created_at', 'updated_at'], ['activity_id']],
    ['audit_log', ['audit_id', 'timestamp', 'user_id', 'action', 'module', 'record_id', 'previous_value', 'new_value', 'reason', 'request_id'], ['audit_id']],
    ['system_log', ['log_id', 'timestamp', 'function_name', 'severity', 'request_id', 'record_id', 'error_message', 'status'], ['log_id']],
  ];
  return definitions.map(([table, columns, conflict]) => ({
    table,
    columns,
    conflict,
    rows: prepared.rows[table] || [],
  }));
}

function renderSql(prepared) {
  const tables = buildTables(prepared);
  const parts = [
    '-- Generated by scripts/import-supabase.js',
    `-- Source: ${prepared.sourceName}`,
    `-- Generated: ${prepared.generatedAt}`,
    '-- Safe to rerun in an empty or partially imported database: existing primary keys are skipped.',
    '',
    'begin;',
    'set constraints all deferred;',
    '',
    '-- id_counters',
  ];
  for (const [key, value] of Object.entries(prepared.counters).sort(([a], [b]) => a.localeCompare(b))) {
    const safeKey = String(key).replace(/'/g, "''");
    parts.push(`insert into id_counters (counter_key, last_value) values ('${safeKey}', ${Number(value)}) on conflict (counter_key) do update set last_value = greatest(id_counters.last_value, excluded.last_value);`);
  }
  parts.push('');
  for (const table of tables) {
    parts.push(insertSql(table.table, table.columns, table.rows, table.conflict));
  }
  parts.push(`insert into id_counters (counter_key, last_value) values ('__data_version', 1) on conflict (counter_key) do update set last_value = id_counters.last_value + 1;`);
  parts.push('');
  parts.push('commit;');
  parts.push('');
  return parts.join('\n');
}

function checkUnique(rows, columns, label, errors) {
  const seen = new Set();
  for (const row of rows) {
    const key = columns.map((column) => String(row[column])).join('\u0000');
    if (seen.has(key)) errors.push(`${label} duplikat: ${columns.map((column) => row[column]).join(' / ')}`);
    seen.add(key);
  }
}

function checkRefs(rows, column, targetRows, targetColumn, label, errors) {
  const allowed = new Set(targetRows.map((row) => row[targetColumn]));
  for (const row of rows) {
    const value = row[column];
    if (value !== null && value !== undefined && !allowed.has(value)) {
      errors.push(`${label}: ${column}=${value} tidak ditemukan.`);
    }
  }
}

function validate(prepared) {
  const { rows, counters, warnings } = prepared;
  const errors = [];
  const groups = {
    settings: rows.settings,
    staff: rows.staff,
    users: rows.users,
    roomTypes: rows.room_types,
    rooms: rows.rooms,
    tenants: rows.tenants,
    priceList: rows.price_list,
    services: rows.services,
    transactions: rows.transactions,
    reservations: rows.reservations,
    occupancies: rows.occupancies,
    deposits: rows.deposits,
    invoices: rows.invoices,
    payments: rows.payments,
    allocations: rows.payment_allocations,
    credits: rows.credits,
    serviceOrders: rows.service_orders,
    expenses: rows.expenses,
    activities: rows.activities,
    audit: rows.audit_log,
    systemLog: rows.system_log,
  };

  checkUnique(groups.settings, ['setting_key'], 'settings', errors);
  checkUnique(groups.staff, ['staff_id'], 'staff', errors);
  checkUnique(groups.users, ['user_id'], 'users', errors);
  checkUnique(groups.users.map((row) => ({ email: row.email.toLowerCase() })), ['email'], 'users email', errors);
  checkUnique(groups.roomTypes, ['room_type_id'], 'room_types', errors);
  checkUnique(groups.rooms, ['room_id'], 'rooms', errors);
  checkUnique(groups.rooms, ['room_number'], 'rooms room_number', errors);
  checkUnique(groups.tenants, ['tenant_id'], 'tenants', errors);
  checkUnique(groups.priceList, ['price_id'], 'price_list', errors);
  checkUnique(groups.services, ['service_id'], 'services', errors);
  checkUnique(groups.services, ['service_code'], 'services service_code', errors);
  checkUnique(groups.transactions, ['transaction_id'], 'transactions', errors);
  checkUnique(groups.transactions, ['idempotency_key'], 'transactions idempotency_key', errors);
  checkUnique(groups.reservations, ['reservation_id'], 'reservations', errors);
  checkUnique(groups.occupancies, ['occupancy_id'], 'occupancies', errors);
  checkUnique(groups.deposits, ['deposit_record_id'], 'deposits', errors);
  checkUnique(groups.invoices, ['invoice_id'], 'invoices', errors);
  checkUnique(groups.invoices, ['invoice_number'], 'invoices invoice_number', errors);
  checkUnique(groups.invoices, ['occupancy_id', 'period_start'], 'invoices period', errors);
  checkUnique(groups.payments, ['payment_id'], 'payments', errors);
  checkUnique(groups.payments, ['receipt_number'], 'payments receipt_number', errors);
  checkUnique(groups.payments, ['idempotency_key'], 'payments idempotency_key', errors);
  checkUnique(groups.allocations, ['allocation_id'], 'payment_allocations', errors);
  checkUnique(groups.allocations, ['payment_id', 'invoice_id'], 'payment_allocations pair', errors);
  checkUnique(groups.credits, ['credit_id'], 'credits', errors);
  checkUnique(groups.serviceOrders, ['service_order_id'], 'service_orders', errors);
  checkUnique(groups.expenses, ['expense_id'], 'expenses', errors);
  checkUnique(groups.activities, ['activity_id'], 'activities', errors);
  checkUnique(groups.audit, ['audit_id'], 'audit_log', errors);
  checkUnique(groups.systemLog, ['log_id'], 'system_log', errors);

  checkRefs(groups.users, 'staff_id', groups.staff, 'staff_id', 'users', errors);
  checkRefs(groups.rooms, 'room_type_id', groups.roomTypes, 'room_type_id', 'rooms', errors);
  checkRefs(groups.priceList, 'room_type_id', groups.roomTypes, 'room_type_id', 'price_list', errors);
  checkRefs(groups.transactions, 'tenant_id', groups.tenants, 'tenant_id', 'transactions tenant', errors);
  checkRefs(groups.transactions, 'room_id', groups.rooms, 'room_id', 'transactions room', errors);
  checkRefs(groups.transactions, 'related_transaction_id', groups.transactions, 'transaction_id', 'transactions related', errors);
  checkRefs(groups.reservations, 'tenant_id', groups.tenants, 'tenant_id', 'reservations tenant', errors);
  checkRefs(groups.reservations, 'room_id', groups.rooms, 'room_id', 'reservations room', errors);
  checkRefs(groups.occupancies, 'tenant_id', groups.tenants, 'tenant_id', 'occupancies tenant', errors);
  checkRefs(groups.occupancies, 'room_id', groups.rooms, 'room_id', 'occupancies room', errors);
  checkRefs(groups.occupancies, 'previous_occupancy_id', groups.occupancies, 'occupancy_id', 'occupancies previous', errors);
  checkRefs(groups.deposits, 'tenant_id', groups.tenants, 'tenant_id', 'deposits tenant', errors);
  checkRefs(groups.deposits, 'occupancy_id', groups.occupancies, 'occupancy_id', 'deposits occupancy', errors);
  checkRefs(groups.deposits, 'receipt_transaction_id', groups.transactions, 'transaction_id', 'deposits receipt transaction', errors);
  checkRefs(groups.deposits, 'return_transaction_id', groups.transactions, 'transaction_id', 'deposits return transaction', errors);
  checkRefs(groups.invoices, 'tenant_id', groups.tenants, 'tenant_id', 'invoices tenant', errors);
  checkRefs(groups.invoices, 'occupancy_id', groups.occupancies, 'occupancy_id', 'invoices occupancy', errors);
  checkRefs(groups.invoices, 'room_id', groups.rooms, 'room_id', 'invoices room', errors);
  checkRefs(groups.payments, 'tenant_id', groups.tenants, 'tenant_id', 'payments tenant', errors);
  checkRefs(groups.allocations, 'payment_id', groups.payments, 'payment_id', 'allocations payment', errors);
  checkRefs(groups.allocations, 'invoice_id', groups.invoices, 'invoice_id', 'allocations invoice', errors);
  checkRefs(groups.credits, 'tenant_id', groups.tenants, 'tenant_id', 'credits tenant', errors);
  checkRefs(groups.credits, 'payment_id', groups.payments, 'payment_id', 'credits payment', errors);
  checkRefs(groups.serviceOrders, 'tenant_id', groups.tenants, 'tenant_id', 'service_orders tenant', errors);
  checkRefs(groups.serviceOrders, 'room_id', groups.rooms, 'room_id', 'service_orders room', errors);
  checkRefs(groups.serviceOrders, 'service_id', groups.services, 'service_id', 'service_orders service', errors);
  checkRefs(groups.serviceOrders, 'invoice_id', groups.invoices, 'invoice_id', 'service_orders invoice', errors);
  checkRefs(groups.serviceOrders, 'payment_id', groups.payments, 'payment_id', 'service_orders payment', errors);
  checkRefs(groups.expenses, 'transaction_id', groups.transactions, 'transaction_id', 'expenses transaction', errors);
  checkRefs(groups.activities, 'staff_id', groups.staff, 'staff_id', 'activities staff', errors);
  checkRefs(groups.activities, 'room_id', groups.rooms, 'room_id', 'activities room', errors);
  checkRefs(groups.activities, 'tenant_id', groups.tenants, 'tenant_id', 'activities tenant', errors);
  checkRefs(groups.activities, 'verified_by', groups.staff, 'staff_id', 'activities verifier', errors);

  const activeRooms = groups.occupancies.filter((row) => row.agreement_status === 'Active');
  checkUnique(activeRooms, ['room_id'], 'active occupancy per room', errors);
  checkUnique(activeRooms, ['tenant_id'], 'active occupancy per tenant', errors);

  for (const row of groups.users) {
    if (!String(row.password_hash).startsWith('scrypt$')) {
      errors.push(`users ${row.user_id}: PasswordHash bukan hash scrypt Node. Reset password sebelum migrasi.`);
    }
  }

  for (const invoice of groups.invoices) {
    const allocated = groups.allocations
      .filter((row) => row.invoice_id === invoice.invoice_id && row.allocation_status === 'Valid')
      .reduce((total, row) => total + row.allocated_amount, 0);
    if (allocated > invoice.total_amount + 0.005) {
      errors.push(`invoices ${invoice.invoice_id}: alokasi ${allocated} melebihi total ${invoice.total_amount}.`);
    }
  }

  for (const payment of groups.payments) {
    const allocated = groups.allocations
      .filter((row) => row.payment_id === payment.payment_id && row.allocation_status === 'Valid')
      .reduce((total, row) => total + row.allocated_amount, 0);
    const credit = groups.credits
      .filter((row) => row.payment_id === payment.payment_id && row.status !== 'Voided')
      .reduce((total, row) => total + row.amount, 0);
    if (allocated + credit > payment.amount_received + 0.005) {
      errors.push(`payments ${payment.payment_id}: alokasi ${allocated} + kredit ${credit} melebihi pembayaran ${payment.amount_received}.`);
    }
  }

  for (const deposit of groups.deposits) {
    const total = deposit.amount_returned + deposit.amount_deducted + deposit.outstanding_deposit_liability;
    if (Math.abs(total - deposit.deposit_amount) > 0.005) {
      errors.push(`deposits ${deposit.deposit_record_id}: returned + deducted + outstanding (${total}) tidak sama dengan deposit ${deposit.deposit_amount}.`);
    }
    if (deposit.outstanding_deposit_liability < 0) {
      errors.push(`deposits ${deposit.deposit_record_id}: outstanding negatif.`);
    }
  }

  if (!Object.keys(counters).length) errors.push('id_counters kosong.');
  return errors;
}

function prepareImport(snapshot, options = {}) {
  if (!snapshot || typeof snapshot !== 'object') throw new ImportError('Snapshot harus berupa objek JSON.');
  const errors = [];
  const warnings = [];
  const rows = {
    settings: buildSettings(snapshot, errors),
    staff: buildStaff(snapshot, errors),
    users: buildUsers(snapshot, errors),
    room_types: buildRoomTypes(snapshot, errors),
    rooms: buildRooms(snapshot, errors),
    tenants: buildTenants(snapshot, errors),
    price_list: buildPriceList(snapshot, errors),
    services: buildServices(snapshot, errors),
    transactions: buildTransactions(snapshot, errors, warnings),
    reservations: buildReservations(snapshot, errors),
    occupancies: buildOccupancies(snapshot, errors),
    deposits: buildDeposits(snapshot, errors),
    invoices: buildInvoices(snapshot, errors, warnings, options),
    payments: buildPayments(snapshot, errors),
    payment_allocations: buildAllocations(snapshot, errors),
    credits: buildCredits(snapshot, errors),
    service_orders: buildServiceOrders(snapshot, errors, warnings, options),
    expenses: buildExpenses(snapshot, errors, warnings, options),
    activities: buildActivities(snapshot, errors),
    audit_log: buildAuditLog(snapshot, errors),
    system_log: buildSystemLog(snapshot, errors),
  };
  const counters = deriveCounters(snapshot, warnings);
  const prepared = {
    rows,
    counters,
    errors,
    warnings,
    sourceName: options.sourceName || 'data/db.json',
    generatedAt: new Date().toISOString(),
  };
  prepared.errors.push(...validate(prepared));
  return prepared;
}

function executeSql(sqlPath) {
  const databaseUrl = process.env.SUPABASE_DB_URL;
  if (!databaseUrl) throw new Error('SUPABASE_DB_URL belum diset.');
  const check = spawnSync('psql', ['--version'], { encoding: 'utf8' });
  if (check.error) {
    throw new Error('psql tidak ditemukan. Buka Supabase SQL Editor dan tempel isi file SQL.');
  }
  const url = new URL(databaseUrl);
  const port = url.port || '5432';
  const database = url.pathname.replace(/^\//, '');
  const sslmode = url.searchParams.get('sslmode') || 'require';
  const result = spawnSync('psql', [
    '-h', url.hostname,
    '-p', port,
    '-U', decodeURIComponent(url.username),
    '-d', database,
    '-v', 'ON_ERROR_STOP=1',
    '-f', sqlPath,
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: decodeURIComponent(url.password),
      PGSSLMODE: sslmode,
    },
  });
  if (result.status !== 0) throw new Error(`psql gagal dengan status ${result.status}.`);
}

function printHelp() {
  console.log(`Pemakaian: node scripts/import-supabase.js [opsi]

Opsi:
  --input <file>     Sumber JSON. Default: data/db.json
  --output <file>    Hasil SQL. Default: data/supabase-import.sql
  --report <file>    Laporan validasi. Default: data/supabase-import-report.json
  --repair-totals    Pakai total hitung jika TotalAmount sumber berbeda
  --execute          Jalankan file SQL memakai psql dan SUPABASE_DB_URL
  --help             Tampilkan bantuan

Tanpa --execute, importer hanya membuat file SQL. Buka Supabase SQL Editor,
tempel isi file SQL, lalu Run. File aman dijalankan ulang: baris dengan primary
key yang sudah ada akan dilewati.`);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (options.help) {
    printHelp();
    return;
  }

  let snapshot;
  try {
    snapshot = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  } catch (error) {
    console.error(`Tidak dapat membaca ${options.input}: ${error.message}`);
    process.exit(1);
  }

  let prepared;
  try {
    prepared = prepareImport(snapshot, {
      repairTotals: options.repairTotals,
      sourceName: path.basename(options.input),
    });
  } catch (error) {
    console.error(`Tidak dapat memproses ${options.input}: ${error.message}`);
    process.exit(1);
  }
  const report = {
    generatedAt: prepared.generatedAt,
    source: options.input,
    output: options.output,
    counts: Object.fromEntries(Object.entries(prepared.rows).map(([name, rows]) => [name, rows.length])),
    counters: prepared.counters,
    warnings: prepared.warnings,
    errors: prepared.errors,
  };
  fs.mkdirSync(path.dirname(options.report), { recursive: true });
  fs.writeFileSync(options.report, `${JSON.stringify(report, null, 2)}\n`);

  if (prepared.errors.length) {
    console.error(`Validasi gagal: ${prepared.errors.length} masalah. Lihat ${options.report}`);
    for (const error of prepared.errors.slice(0, 30)) console.error(`- ${error}`);
    if (prepared.errors.length > 30) console.error(`- ... dan ${prepared.errors.length - 30} lainnya`);
    process.exit(1);
  }

  const sql = renderSql(prepared);
  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.writeFileSync(options.output, sql);
  const totalRows = Object.values(report.counts).reduce((sum, value) => sum + value, 0);
  console.log(`Siap: ${options.output}`);
  console.log(`Data: ${totalRows} baris, counter: ${Object.keys(prepared.counters).length}, ukuran SQL: ${Buffer.byteLength(sql)} bytes`);
  if (prepared.warnings.length) console.log(`Peringatan: ${prepared.warnings.length}. Lihat ${options.report}`);
  console.log('Langkah berikutnya: buka Supabase SQL Editor, tempel isi file SQL, lalu klik Run.');

  if (options.execute) {
    try {
      executeSql(options.output);
      console.log('Import selesai melalui psql.');
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) main();

module.exports = {
  prepareImport,
  renderSql,
  deriveCounters,
};
