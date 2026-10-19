'use strict';

const {
  today, nowISO, addDays, addMonthsClamped, daysBetween, monthEnd, makeId, makeInvoiceNumber,
  AppError, requireDate, requireAmount, cleanText,
} = require('../util');
const { audit, getNumberSetting, getSetting, findById } = require('./common');

function proratedRental(db, occupancy, periodStart, periodEnd) {
  const price = Number(occupancy.AgreedMonthlyPrice);
  if (getSetting(db, 'ProrateMidMonth', 'false') !== 'true') return price;
  const naturalEnd = addDays(addMonthsClamped(periodStart, 1), -1);
  const checkIn = occupancy.CheckInDate > periodStart ? occupancy.CheckInDate : periodStart;
  let checkOut = periodEnd < naturalEnd ? periodEnd : naturalEnd;
  for (const candidate of [occupancy.ActualCheckOut, occupancy.PlannedCheckOut]) {
    if (candidate && candidate >= checkIn && candidate < checkOut) checkOut = candidate;
  }
  const totalDays = Math.max(1, daysBetween(periodStart, naturalEnd) + 1);
  const usedDays = Math.max(0, daysBetween(checkIn, checkOut) + 1);
  if (usedDays >= totalDays) return price;
  return Math.round((price * usedDays) / totalDays);
}

function invoiceTotal(invoice) {
  return Number(invoice.RentalAmount || 0)
    + Number(invoice.ServiceCharges || 0)
    + Number(invoice.OtherCharges || 0)
    - Number(invoice.DiscountAmount || 0);
}

function validAllocatedAmount(db, invoiceId) {
  return db.allocations
    .filter((allocation) => allocation.InvoiceID === invoiceId && allocation.AllocationStatus === 'Valid')
    .reduce((sum, allocation) => sum + Number(allocation.AllocatedAmount || 0), 0);
}

function recalculateInvoice(db, invoice, asOf = today()) {
  if (invoice.InvoiceStatus === 'Cancelled') {
    invoice.AmountPaid = 0;
    invoice.OutstandingBalance = 0;
    return invoice;
  }
  const total = invoiceTotal(invoice);
  const paid = validAllocatedAmount(db, invoice.InvoiceID);
  invoice.TotalAmount = total;
  invoice.AmountPaid = paid;
  invoice.OutstandingBalance = Math.max(0, total - paid);
  if (total > 0 && paid >= total) invoice.InvoiceStatus = 'Paid';
  else if (paid > 0) invoice.InvoiceStatus = 'Partially Paid';
  else if (invoice.DueDate && asOf > invoice.DueDate) invoice.InvoiceStatus = 'Overdue';
  else invoice.InvoiceStatus = 'Issued';
  return invoice;
}

function recalculateAllInvoices(db, asOf = today()) {
  db.invoices.forEach((invoice) => recalculateInvoice(db, invoice, asOf));
}

function decorateInvoice(db, invoice) {
  const tenant = db.tenants.find((t) => t.TenantID === invoice.TenantID);
  const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
  const occupancy = db.occupancies.find((o) => o.OccupancyID === invoice.OccupancyID);
  return {
    ...invoice,
    TenantName: tenant ? tenant.FullName : invoice.TenantID,
    TenantPhone: tenant ? tenant.Phone : '',
    RoomNumber: room ? room.RoomNumber : '',
    CheckInDate: occupancy ? occupancy.CheckInDate : '',
    DaysOverdue: invoice.InvoiceStatus === 'Overdue' && invoice.DueDate
      ? Math.max(0, Math.round((new Date(today()) - new Date(invoice.DueDate)) / 86400000))
      : 0,
  };
}

function listInvoices(db, filters = {}) {
  recalculateAllInvoices(db, filters.asOf || today());
  let rows = db.invoices.map((invoice) => decorateInvoice(db, invoice));
  if (filters.status) rows = rows.filter((row) => row.InvoiceStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.roomId) rows = rows.filter((row) => row.RoomID === filters.roomId);
  if (filters.from) rows = rows.filter((row) => row.InvoiceDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.InvoiceDate <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.InvoiceNumber} ${row.TenantName} ${row.RoomNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    if (a.InvoiceDate === b.InvoiceDate) return b.InvoiceNumber.localeCompare(a.InvoiceNumber);
    return b.InvoiceDate.localeCompare(a.InvoiceDate);
  });
  return rows;
}

function getInvoiceDetail(db, invoiceId) {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  recalculateInvoice(db, invoice);
  const allocations = db.allocations.filter((a) => a.InvoiceID === invoiceId).map((allocation) => {
    const payment = db.payments.find((p) => p.PaymentID === allocation.PaymentID);
    return { ...allocation, PaymentDate: payment ? payment.PaymentDate : '', ReceiptNumber: payment ? payment.ReceiptNumber : '', PaymentMethod: payment ? payment.PaymentMethod : '' };
  });
  return { invoice: decorateInvoice(db, invoice), allocations };
}

function createInvoiceForPeriod(db, occupancy, periodStart, user, periodEndOverride = '') {
  const invoiceDate = today();
  const dueDays = getNumberSetting(db, 'DefaultDueDays', 5);
  const periodEnd = periodEndOverride || addDays(addMonthsClamped(periodStart, 1), -1);
  const rentalAmount = proratedRental(db, occupancy, periodStart, periodEnd);
  const invoice = {
    InvoiceID: makeId(db, 'invoice', 'INV'),
    InvoiceNumber: makeInvoiceNumber(db, getSetting(db, 'InvoicePrefix', 'INV'), invoiceDate),
    TenantID: occupancy.TenantID,
    OccupancyID: occupancy.OccupancyID,
    RoomID: occupancy.RoomID,
    PeriodStart: periodStart,
    PeriodEnd: periodEnd,
    InvoiceDate: invoiceDate,
    DueDate: addDays(periodStart, dueDays),
    RentalAmount: rentalAmount,
    ServiceCharges: 0,
    OtherCharges: 0,
    DiscountAmount: 0,
    TotalAmount: rentalAmount,
    AmountPaid: 0,
    OutstandingBalance: rentalAmount,
    InvoiceStatus: 'Issued',
    CreatedAt: nowISO(),
    CreatedBy: user,
    Notes: `Sewa periode ${periodStart} s.d. ${periodEnd}`,
  };
  db.invoices.push(invoice);
  recalculateInvoice(db, invoice);
  audit(db, {
    user, action: 'CREATE_INVOICE', module: 'Invoices', recordId: invoice.InvoiceID,
    next: JSON.stringify({ InvoiceNumber: invoice.InvoiceNumber, OccupancyID: occupancy.OccupancyID, PeriodStart: periodStart, TotalAmount: invoice.TotalAmount }),
  });
  return invoice;
}

/**
 * Idempotent monthly billing. Invoices are unique by occupancy + period start.
 * A daily trigger can safely call this repeatedly; existing periods are skipped.
 */
function generateMonthlyInvoices(db, { asOf = today(), user = 'SYSTEM' } = {}) {
  const created = [];
  const skipped = [];
  const advance = getNumberSetting(db, 'BillingAdvanceDays', 0);
  const limitDate = addDays(asOf, advance);
  const occupancies = db.occupancies.filter((o) => o.AgreementStatus === 'Active' && o.CheckInDate <= limitDate);

  for (const occupancy of occupancies) {
    const existing = db.invoices
      .filter((invoice) => invoice.OccupancyID === occupancy.OccupancyID)
      .sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
    const prorate = getSetting(db, 'ProrateMidMonth', 'false') === 'true';
    const hardEnd = occupancy.ActualCheckOut || occupancy.PlannedCheckOut || '';
    let firstPeriodEnd = '';
    if (!existing.length && prorate && occupancy.CheckInDate.slice(8, 10) !== '01') {
      const end = monthEnd(occupancy.CheckInDate);
      if (end > occupancy.CheckInDate) firstPeriodEnd = end;
    }
    let periodStart = occupancy.CheckInDate;
    if (existing.length) {
      const lastEnd = existing[existing.length - 1].PeriodEnd;
      periodStart = addDays(lastEnd, 1);
    }
    let guard = 0;
    while (periodStart <= limitDate && guard < 120) {
      guard += 1;
      if (hardEnd && periodStart > hardEnd) break;
      const duplicate = db.invoices.find(
        (invoice) => invoice.OccupancyID === occupancy.OccupancyID && invoice.PeriodStart === periodStart
      );
      if (duplicate) {
        skipped.push({ OccupancyID: occupancy.OccupancyID, PeriodStart: periodStart });
        periodStart = addDays(duplicate.PeriodEnd, 1);
        continue;
      }
      let periodEndOverride = '';
      const naturalEnd = addDays(addMonthsClamped(periodStart, 1), -1);
      if (firstPeriodEnd && periodStart === occupancy.CheckInDate) periodEndOverride = firstPeriodEnd;
      else if (prorate && hardEnd && hardEnd >= periodStart && hardEnd < naturalEnd) periodEndOverride = hardEnd;
      const invoice = createInvoiceForPeriod(db, occupancy, periodStart, user, periodEndOverride);
      created.push(invoice);
      periodStart = addDays(invoice.PeriodEnd, 1);
    }
  }
  recalculateAllInvoices(db, asOf);
  return { created, skipped, count: created.length };
}

function updateOverdueInvoices(db, { asOf = today(), user = 'SYSTEM' } = {}) {
  const changed = [];
  const lateFeeEnabled = getSetting(db, 'LateFeeEnabled', 'false') === 'true';
  const lateFeePercent = getNumberSetting(db, 'LateFeePercent', 0);
  for (const invoice of db.invoices) {
    if (invoice.InvoiceStatus === 'Cancelled') continue;
    const before = invoice.InvoiceStatus;
    recalculateInvoice(db, invoice, asOf);
    if (invoice.InvoiceStatus === 'Overdue' && lateFeeEnabled && lateFeePercent > 0 && invoice.LateFeeApplied !== 'TRUE') {
      const fee = Math.round((invoiceTotal(invoice) * lateFeePercent) / 100);
      if (fee > 0) {
        invoice.OtherCharges = Number(invoice.OtherCharges || 0) + fee;
        invoice.LateFeeApplied = 'TRUE';
        invoice.Notes = cleanText(`${invoice.Notes} | Denda keterlambatan ${lateFeePercent}% (${fee})`, 700);
        recalculateInvoice(db, invoice, asOf);
      }
    }
    if (invoice.InvoiceStatus === 'Overdue' && before !== 'Overdue') {
      changed.push(invoice);
    }
  }
  if (changed.length) {
    audit(db, { user, action: 'MARK_OVERDUE', module: 'Invoices', next: JSON.stringify(changed.map((i) => i.InvoiceID)) });
  }
  return changed;
}

function cancelInvoice(db, invoiceId, reason, user) {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  if (invoice.InvoiceStatus === 'Cancelled') throw new AppError('Invoice sudah dibatalkan.');
  if (validAllocatedAmount(db, invoiceId) > 0) {
    throw new AppError('Invoice yang sudah memiliki pembayaran tidak dapat dibatalkan. Lakukan void pembayaran atau koreksi.');
  }
  recalculateInvoice(db, invoice);
  const previous = JSON.stringify({ status: invoice.InvoiceStatus, outstanding: invoice.OutstandingBalance });
  invoice.InvoiceStatus = 'Cancelled';
  invoice.OutstandingBalance = 0;
  invoice.Notes = `${invoice.Notes} | Dibatalkan: ${cleanText(reason, 300)}`;
  audit(db, { user: user.StaffID, action: 'CANCEL_INVOICE', module: 'Invoices', recordId: invoiceId, previous, next: JSON.stringify(invoice), reason });
  return invoice;
}

function applyInvoiceAdjustment(db, invoiceId, data, user) {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  if (invoice.InvoiceStatus === 'Cancelled') throw new AppError('Invoice yang dibatalkan tidak dapat disesuaikan.');
  const previous = JSON.stringify(invoice);
  if (data.OtherCharges !== undefined) invoice.OtherCharges = requireAmount(data.OtherCharges, 'Biaya lain-lain', { allowZero: true });
  if (data.DiscountAmount !== undefined) invoice.DiscountAmount = requireAmount(data.DiscountAmount, 'Diskon', { allowZero: true });
  if (Number(data.DiscountAmount || invoice.DiscountAmount) > Number(invoice.RentalAmount) + Number(invoice.OtherCharges) + Number(invoice.ServiceCharges)) {
    throw new AppError('Diskon melebihi total tagihan.');
  }
  invoice.Notes = cleanText(data.Notes || invoice.Notes, 500);
  recalculateInvoice(db, invoice);
  audit(db, { user: user.StaffID, action: 'ADJUST_INVOICE', module: 'Invoices', recordId: invoiceId, previous, next: JSON.stringify(invoice), reason: data.Reason || '' });
  return invoice;
}

function addServiceCharge(db, invoiceId, amount, note = '') {
  const invoice = findById(db.invoices, 'InvoiceID', invoiceId);
  if (['Cancelled', 'Paid'].includes(invoice.InvoiceStatus)) {
    throw new AppError('Service tidak dapat ditambahkan ke invoice yang sudah lunas atau dibatalkan.');
  }
  invoice.ServiceCharges = Number(invoice.ServiceCharges || 0) + Number(amount);
  if (note) invoice.Notes = cleanText(`${invoice.Notes} | ${note}`, 700);
  recalculateInvoice(db, invoice);
  return invoice;
}

function findOpenInvoiceForTenant(db, tenantId) {
  recalculateAllInvoices(db);
  const open = db.invoices
    .filter((invoice) => invoice.TenantID === tenantId && !['Paid', 'Cancelled'].includes(invoice.InvoiceStatus))
    .sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
  return open[0] || null;
}

module.exports = {
  invoiceTotal,
  validAllocatedAmount,
  recalculateInvoice,
  recalculateAllInvoices,
  decorateInvoice,
  listInvoices,
  getInvoiceDetail,
  generateMonthlyInvoices,
  updateOverdueInvoices,
  cancelInvoice,
  applyInvoiceAdjustment,
  addServiceCharge,
  findOpenInvoiceForTenant,
  createInvoiceForPeriod,
  requireDate,
};
