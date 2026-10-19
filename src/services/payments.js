'use strict';

const {
  today, nowISO, makeId, makeReceiptNumber, AppError, requireFields, requireDate,
  requireEnum, requireAmount, cleanText,
} = require('../util');
const { audit, getSetting, findById } = require('./common');
const { recalculateAllInvoices, recalculateInvoice, validAllocatedAmount } = require('./billing');

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'QRIS', 'Other'];
const PAYMENT_STATUSES = ['Pending', 'Confirmed', 'Voided', 'Refunded'];

function listPayments(db, filters = {}) {
  recalculateAllInvoices(db, today());
  let rows = db.payments.map((payment) => {
    const tenant = db.tenants.find((t) => t.TenantID === payment.TenantID);
    const staff = db.staff.find((s) => s.StaffID === payment.ReceivedBy);
    const allocated = db.allocations
      .filter((a) => a.PaymentID === payment.PaymentID && a.AllocationStatus === 'Valid')
      .reduce((sum, a) => sum + Number(a.AllocatedAmount), 0);
    const serviceApplied = db.serviceOrders
      .filter((order) => order.PaymentID === payment.PaymentID)
      .reduce((sum, order) => sum + Number(order.TotalAmount), 0);
    return {
      ...payment,
      TenantName: tenant ? tenant.FullName : payment.TenantID,
      ReceivedByName: staff ? staff.FullName : payment.ReceivedBy,
      AmountAllocated: allocated + serviceApplied,
      UnallocatedAmount: Math.max(0, Number(payment.AmountReceived) - allocated - serviceApplied),
      AllocationCount: db.allocations.filter((a) => a.PaymentID === payment.PaymentID && a.AllocationStatus === 'Valid').length,
    };
  });
  if (filters.status) rows = rows.filter((row) => row.PaymentStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.from) rows = rows.filter((row) => row.PaymentDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.PaymentDate <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.ReceiptNumber} ${row.TenantName} ${row.ReferenceNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    if (a.PaymentDate === b.PaymentDate) return b.CreatedAt.localeCompare(a.CreatedAt);
    return b.PaymentDate.localeCompare(a.PaymentDate);
  });
  return rows;
}

function validateAndPlanAllocations(db, data, amount, tenantId) {
  const plans = [];
  if (Array.isArray(data.Allocations) && data.Allocations.length) {
    for (const raw of data.Allocations) {
      const invoice = findById(db.invoices, 'InvoiceID', raw.InvoiceID);
      if (invoice.TenantID !== tenantId) throw new AppError('Invoice tidak belongs to tenant yang dipilih.');
      if (invoice.InvoiceStatus === 'Cancelled') throw new AppError(`Invoice ${invoice.InvoiceNumber} sudah dibatalkan.`);
      const value = requireAmount(raw.Amount !== undefined ? raw.Amount : raw.AllocatedAmount, 'Jumlah alokasi');
      const available = Number(invoice.OutstandingBalance) - plans.filter((p) => p.invoice.InvoiceID === invoice.InvoiceID).reduce((sum, p) => sum + p.amount, 0);
      if (value > available) {
        throw new AppError(`Alokasi ke ${invoice.InvoiceNumber} melebihi saldo yang dapat dibayar (Rp${Math.max(0, available).toLocaleString('id-ID')}).`);
      }
      plans.push({ invoice, amount: value });
    }
  } else if (data.InvoiceID) {
    const invoice = findById(db.invoices, 'InvoiceID', data.InvoiceID);
    if (invoice.TenantID !== tenantId) throw new AppError('Invoice tidak belongs to tenant yang dipilih.');
    if (invoice.InvoiceStatus === 'Cancelled') throw new AppError('Invoice sudah dibatalkan.');
    plans.push({ invoice, amount: Math.min(amount, Number(invoice.OutstandingBalance)) });
  } else {
    let remaining = amount;
    const open = db.invoices
      .filter((invoice) => invoice.TenantID === tenantId && !['Paid', 'Cancelled'].includes(invoice.InvoiceStatus) && Number(invoice.OutstandingBalance) > 0)
      .sort((a, b) => a.DueDate.localeCompare(b.DueDate) || a.PeriodStart.localeCompare(b.PeriodStart));
    for (const invoice of open) {
      if (remaining <= 0) break;
      const allocate = Math.min(remaining, Number(invoice.OutstandingBalance));
      plans.push({ invoice, amount: allocate });
      remaining -= allocate;
    }
  }
  const totalPlanned = plans.reduce((sum, p) => sum + p.amount, 0);
  if (totalPlanned > amount) throw new AppError('Total alokasi melebihi jumlah pembayaran.');
  return plans;
}

function createTransaction(db, { date, type, direction, category, referenceType, referenceId, tenantId, roomId, description, amount, method, status, staffId, relatedId = '', key, notes = '' }) {
  const existing = db.transactions.find((t) => t.IdempotencyKey && t.IdempotencyKey === key);
  if (existing) return existing;
  const transaction = {
    TransactionID: makeId(db, 'transaction', 'TXN'),
    TransactionDate: date,
    TransactionType: type,
    Direction: direction,
    Category: category,
    ReferenceType: referenceType,
    ReferenceID: referenceId,
    TenantID: tenantId || '',
    RoomID: roomId || '',
    Description: cleanText(description, 500),
    Amount: amount,
    PaymentMethod: method || '',
    PaymentStatus: status || 'Confirmed',
    StaffID: staffId || '',
    RelatedTransactionID: relatedId,
    IdempotencyKey: key,
    CreatedAt: nowISO(),
    Notes: notes,
  };
  db.transactions.push(transaction);
  return transaction;
}

function recordPayment(db, data, user) {
  requireFields(data, ['TenantID', 'AmountReceived', 'PaymentMethod', 'IdempotencyKey']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const amount = requireAmount(data.AmountReceived, 'Jumlah pembayaran');
  const method = requireEnum(data.PaymentMethod, PAYMENT_METHODS, 'Metode pembayaran');
  const date = requireDate(data.PaymentDate || today(), 'Tanggal pembayaran');
  const key = cleanText(data.IdempotencyKey, 120);
  const existing = db.payments.find((payment) => payment.IdempotencyKey === key);
  if (existing) return { payment: existing, duplicate: true };

  recalculateAllInvoices(db, today());
  const plans = validateAndPlanAllocations(db, data, amount, tenant.TenantID);
  const receiptNumber = makeReceiptNumber(db, getSetting(db, 'ReceiptPrefix', 'KWT'), date);
  const payment = {
    PaymentID: makeId(db, 'payment', 'PAY'),
    ReceiptNumber: receiptNumber,
    PaymentDate: date,
    TenantID: tenant.TenantID,
    PaymentMethod: method,
    AmountReceived: amount,
    ReferenceNumber: cleanText(data.ReferenceNumber, 120),
    PaymentStatus: 'Confirmed',
    ReceivedBy: user.StaffID || '',
    IdempotencyKey: key,
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.payments.push(payment);

  let allocated = 0;
  for (const plan of plans) {
    const allocation = {
      AllocationID: makeId(db, 'allocation', 'ALC'),
      PaymentID: payment.PaymentID,
      InvoiceID: plan.invoice.InvoiceID,
      AllocatedAmount: plan.amount,
      AllocationStatus: 'Valid',
      CreatedAt: nowISO(),
      CreatedBy: user.StaffID || '',
      Notes: '',
    };
    db.allocations.push(allocation);
    allocated += plan.amount;
    recalculateInvoice(db, plan.invoice, today());
  }

  const leftover = amount - allocated;
  if (leftover > 0) {
    db.credits.push({
      CreditID: makeId(db, 'credit', 'CRD'),
      TenantID: tenant.TenantID,
      PaymentID: payment.PaymentID,
      Amount: leftover,
      RemainingAmount: leftover,
      Status: 'Available',
      CreatedAt: nowISO(),
      Notes: 'Kelebihan pembayaran dicatat sebagai kredit penghuni',
    });
  }

  const roomId = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active')?.RoomID || '';
  createTransaction(db, {
    date, type: 'Rental Payment', direction: 'IN', category: 'Rental',
    referenceType: 'Payment', referenceId: payment.PaymentID, tenantId: tenant.TenantID,
    roomId, description: `Pembayaran sewa ${receiptNumber}`, amount, method,
    status: 'Confirmed', staffId: user.StaffID, key: `TXN:${key}`,
  });

  recalculateAllInvoices(db, today());
  audit(db, {
    user: user.StaffID, action: 'RECORD_PAYMENT', module: 'Payments', recordId: payment.PaymentID,
    next: JSON.stringify({ receipt: receiptNumber, amount, allocated, credit: leftover, tenant: tenant.TenantID }),
  });
  return { payment, allocations: plans.length, allocated, credit: leftover, duplicate: false };
}

function recordDirectPayment(db, data, user) {
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const amount = requireAmount(data.AmountReceived, 'Jumlah pembayaran');
  const method = requireEnum(data.PaymentMethod, PAYMENT_METHODS, 'Metode pembayaran');
  const date = requireDate(data.PaymentDate || today(), 'Tanggal pembayaran');
  const key = cleanText(data.IdempotencyKey, 120);
  const existing = db.payments.find((payment) => payment.IdempotencyKey === key);
  if (existing) return { payment: existing, duplicate: true };
  const receiptNumber = makeReceiptNumber(db, getSetting(db, 'ReceiptPrefix', 'KWT'), date);
  const payment = {
    PaymentID: makeId(db, 'payment', 'PAY'),
    ReceiptNumber: receiptNumber,
    PaymentDate: date,
    TenantID: tenant.TenantID,
    PaymentMethod: method,
    AmountReceived: amount,
    ReferenceNumber: cleanText(data.ReferenceNumber, 120),
    PaymentStatus: 'Confirmed',
    ReceivedBy: user.StaffID || '',
    IdempotencyKey: key,
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes || 'Pembayaran layanan langsung', 500),
  };
  db.payments.push(payment);
  createTransaction(db, {
    date,
    type: data.TransactionType || 'Service Payment',
    direction: 'IN',
    category: data.Category || 'Service',
    referenceType: data.ReferenceType || 'ServiceOrder',
    referenceId: data.ReferenceID || payment.PaymentID,
    tenantId: tenant.TenantID,
    roomId: data.RoomID || '',
    description: data.Description || `Pembayaran layanan ${receiptNumber}`,
    amount,
    method,
    status: 'Confirmed',
    staffId: user.StaffID,
    key: `TXN:${key}`,
  });
  audit(db, { user: user.StaffID, action: 'RECORD_SERVICE_PAYMENT', module: 'Payments', recordId: payment.PaymentID, next: JSON.stringify(payment) });
  return { payment, duplicate: false };
}

function voidPayment(db, paymentId, reason, user) {
  const payment = findById(db.payments, 'PaymentID', paymentId);
  if (payment.PaymentStatus === 'Voided') throw new AppError('Pembayaran sudah di-void.');
  if (!reason || !cleanText(reason)) throw new AppError('Alasan void wajib diisi.');
  const previous = JSON.stringify({ status: payment.PaymentStatus, amount: payment.AmountReceived });
  payment.PaymentStatus = 'Voided';
  payment.Notes = `${payment.Notes} | Void: ${cleanText(reason, 300)}`;
  db.allocations.filter((a) => a.PaymentID === paymentId).forEach((a) => { a.AllocationStatus = 'Voided'; });
  db.credits.filter((c) => c.PaymentID === paymentId).forEach((c) => { c.Status = 'Voided'; c.RemainingAmount = 0; });
  const related = db.transactions.find((t) => t.ReferenceType === 'Payment' && t.ReferenceID === paymentId && t.TransactionType !== 'Adjustment');
  db.transactions.forEach((t) => {
    if (t.ReferenceType === 'Payment' && t.ReferenceID === paymentId && t.TransactionType !== 'Adjustment') {
      t.PaymentStatus = 'Voided';
    }
  });
  createTransaction(db, {
    date: today(), type: 'Adjustment', direction: 'OUT', category: 'Reversal',
    referenceType: 'Payment', referenceId: paymentId, tenantId: payment.TenantID,
    roomId: related ? related.RoomID : '',
    description: `Void pembayaran ${payment.ReceiptNumber}`, amount: Number(payment.AmountReceived),
    method: payment.PaymentMethod, status: 'Confirmed', staffId: user.StaffID,
    relatedId: related ? related.TransactionID : '', key: `TXN:VOID:${payment.PaymentID}`,
  });
  recalculateAllInvoices(db, today());
  audit(db, { user: user.StaffID, action: 'VOID_PAYMENT', module: 'Payments', recordId: paymentId, previous, next: JSON.stringify(payment), reason });
  return payment;
}

function getPaymentDetail(db, paymentId) {
  const payment = findById(db.payments, 'PaymentID', paymentId);
  const tenant = db.tenants.find((t) => t.TenantID === payment.TenantID);
  const allocations = db.allocations.filter((a) => a.PaymentID === paymentId).map((a) => {
    const invoice = db.invoices.find((i) => i.InvoiceID === a.InvoiceID);
    return { ...a, InvoiceNumber: invoice ? invoice.InvoiceNumber : '' };
  });
  return { payment: { ...payment, TenantName: tenant ? tenant.FullName : '' }, allocations };
}

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  listPayments,
  recordPayment,
  recordDirectPayment,
  voidPayment,
  getPaymentDetail,
  createTransaction,
  validateAndPlanAllocations,
};
