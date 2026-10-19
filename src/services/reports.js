'use strict';

const { today, monthStart, monthEnd, addDays, addMonthsClamped, daysBetween, inRange } = require('../util');
const { getSetting } = require('./common');
const { roomAvailability } = require('./rooms');
const { recalculateAllInvoices } = require('./billing');
const { depositSummary } = require('./deposits');
const { tenantStatement } = require('./tenants');

function sanitizeRange(filters = {}) {
  const from = filters.from || monthStart();
  const to = filters.to || monthEnd(from);
  return { from, to };
}

function roomStats(db) {
  const counts = { total: db.rooms.length, Available: 0, Occupied: 0, Reserved: 0, Maintenance: 0, Inactive: 0 };
  for (const room of db.rooms) {
    const status = roomAvailability(db, room);
    counts[status] += 1;
  }
  const denominator = counts.total - counts.Inactive;
  counts.occupancyRate = denominator > 0 ? Math.round((counts.Occupied / denominator) * 1000) / 10 : 0;
  return counts;
}

function transactionTotals(db, from, to) {
  const rows = db.transactions.filter((t) => inRange(t.TransactionDate, from, to));
  const confirmed = (t) => t.PaymentStatus !== 'Voided' && t.PaymentStatus !== 'Cancelled';
  const sum = (filter) => rows.filter(filter).reduce((total, t) => total + Number(t.Amount || 0), 0);
  const deposits = ['Deposit Received', 'Deposit Returned'];
  const operating = rows.filter((t) => !deposits.includes(t.TransactionType));
  return {
    inflow: operating.filter((t) => t.Direction === 'IN' && confirmed(t)).reduce((s, t) => s + Number(t.Amount), 0),
    outflow: operating.filter((t) => t.Direction === 'OUT' && confirmed(t)).reduce((s, t) => s + Number(t.Amount), 0),
    net: operating.reduce((s, t) => s + (t.Direction === 'IN' ? 1 : -1) * Number(t.Amount), 0),
    rentalCollections: sum((t) => t.TransactionType === 'Rental Payment' && t.Direction === 'IN' && confirmed(t)),
    serviceCollections: sum((t) => t.TransactionType === 'Service Payment' && t.Direction === 'IN' && confirmed(t)),
    expensePayments: sum((t) => t.TransactionType === 'Expense Payment' && t.Direction === 'OUT' && confirmed(t)),
    depositReceived: sum((t) => t.TransactionType === 'Deposit Received' && t.Direction === 'IN' && confirmed(t)),
    depositReturned: sum((t) => t.TransactionType === 'Deposit Returned' && t.Direction === 'OUT' && confirmed(t)),
    rows,
  };
}

function getDashboard(db, filters = {}, user = null) {
  const { from, to } = sanitizeRange(filters);
  recalculateAllInvoices(db, today());
  const rooms = roomStats(db);
  const activeTenants = db.tenants.filter((t) => t.TenantStatus === 'Active').length;
  const upcomingCheckIns = db.reservations.filter(
    (r) => ['Pending', 'Confirmed'].includes(r.ReservationStatus) && r.PlannedCheckIn >= today() && r.PlannedCheckIn <= addDays(today(), 30)
  ).length;
  const upcomingCheckOuts = db.occupancies.filter(
    (o) => o.AgreementStatus === 'Active' && o.PlannedCheckOut && o.PlannedCheckOut >= today() && o.PlannedCheckOut <= addDays(today(), 30)
  ).length;
  const recentTransfers = db.occupancies.filter(
    (o) => o.PreviousOccupancyID && o.CheckInDate >= addDays(today(), -30)
  ).length;

  const invoicesInRange = db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled' && inRange(i.InvoiceDate, from, to));
  const invoicedTotal = invoicesInRange.reduce((sum, i) => sum + Number(i.TotalAmount), 0);
  const paymentsInRange = db.payments.filter((p) => p.PaymentStatus === 'Confirmed' && inRange(p.PaymentDate, from, to));
  const paymentTotal = paymentsInRange.reduce((sum, p) => sum + Number(p.AmountReceived), 0);
  const receivable = db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((sum, i) => sum + Number(i.OutstandingBalance), 0);
  const overdue = db.invoices.filter((i) => i.InvoiceStatus === 'Overdue');
  const overdueTotal = overdue.reduce((sum, i) => sum + Number(i.OutstandingBalance), 0);
  const deposits = depositSummary(db);
  const ledger = transactionTotals(db, from, to);

  const canSeeFinance = user && ['Owner', 'Manager', 'Cashier'].includes(user.Role);
  const financial = canSeeFinance ? {
    invoicedThisMonth: invoicedTotal,
    invoiceCount: invoicesInRange.length,
    collectionsThisMonth: paymentTotal,
    paymentCount: paymentsInRange.length,
    rentalCollections: ledger.rentalCollections,
    serviceCollections: ledger.serviceCollections,
    expensesPaid: ledger.expensePayments,
    outstandingReceivables: receivable,
    overdueCount: overdue.length,
    overdueTotal,
    depositLiabilities: deposits.totalHeld,
    netCashFlow: ledger.net,
    inflow: ledger.inflow,
    outflow: ledger.outflow,
  } : null;

  const recentInvoices = db.invoices
    .filter((i) => i.InvoiceStatus !== 'Cancelled')
    .sort((a, b) => b.CreatedAt.localeCompare(a.CreatedAt))
    .slice(0, 6)
    .map((invoice) => {
      const tenant = db.tenants.find((t) => t.TenantID === invoice.TenantID);
      const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
      return { ...invoice, TenantName: tenant ? tenant.FullName : invoice.TenantID, RoomNumber: room ? room.RoomNumber : '' };
    });

  const overdueList = overdue
    .sort((a, b) => a.DueDate.localeCompare(b.DueDate))
    .slice(0, 6)
    .map((invoice) => {
      const tenant = db.tenants.find((t) => t.TenantID === invoice.TenantID);
      const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
      return { ...invoice, TenantName: tenant ? tenant.FullName : invoice.TenantID, RoomNumber: room ? room.RoomNumber : '' };
    });

  const pendingActivities = db.activities.filter((a) => ['Pending', 'In Progress'].includes(a.Status)).length;

  return {
    range: { from, to },
    rooms,
    tenants: { active: activeTenants, upcomingCheckIns, upcomingCheckOuts, recentTransfers, pendingActivities },
    financial,
    recentInvoices: canSeeFinance ? recentInvoices : [],
    overdueInvoices: canSeeFinance ? overdueList : [],
    propertyName: getSetting(db, 'PropertyName', 'Kos'),
  };
}

function getFinancialReport(db, filters = {}) {
  const { from, to } = sanitizeRange(filters);
  recalculateAllInvoices(db, today());
  const invoices = db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled' && inRange(i.InvoiceDate, from, to));
  const payments = db.payments.filter((p) => p.PaymentStatus === 'Confirmed' && inRange(p.PaymentDate, from, to));
  const expenses = db.expenses.filter((e) => e.PaymentStatus === 'Paid' && inRange(e.ExpenseDate, from, to));
  const ledger = transactionTotals(db, from, to);

  const byType = {};
  for (const t of ledger.rows) {
    const key = `${t.TransactionType}|${t.Direction}`;
    byType[key] = (byType[key] || 0) + Number(t.Amount);
  }

  const revenueByRoomType = {};
  for (const invoice of invoices) {
    const room = db.rooms.find((r) => r.RoomID === invoice.RoomID);
    const type = room ? db.roomTypes.find((t) => t.RoomTypeID === room.RoomTypeID) : null;
    const key = type ? type.TypeName : 'Tanpa Kamar';
    revenueByRoomType[key] = (revenueByRoomType[key] || 0) + Number(invoice.RentalAmount);
  }

  const receivableByTenant = db.tenants.map((tenant) => {
    const open = db.invoices.filter((i) => i.TenantID === tenant.TenantID && i.InvoiceStatus !== 'Cancelled' && Number(i.OutstandingBalance) > 0);
    return {
      TenantID: tenant.TenantID,
      TenantName: tenant.FullName,
      InvoiceCount: open.length,
      Outstanding: open.reduce((s, i) => s + Number(i.OutstandingBalance), 0),
      Overdue: open.filter((i) => i.InvoiceStatus === 'Overdue').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
    };
  }).filter((row) => row.Outstanding > 0).sort((a, b) => b.Outstanding - a.Outstanding);

  const expenseByCategory = {};
  for (const expense of expenses) {
    expenseByCategory[expense.Category] = (expenseByCategory[expense.Category] || 0) + Number(expense.TotalAmount);
  }

  return {
    range: { from, to },
    summary: {
      invoicesIssued: invoices.length,
      invoiceTotal: invoices.reduce((s, i) => s + Number(i.TotalAmount), 0),
      rentalInvoiced: invoices.reduce((s, i) => s + Number(i.RentalAmount), 0),
      serviceInvoiced: invoices.reduce((s, i) => s + Number(i.ServiceCharges), 0),
      paymentsReceived: payments.reduce((s, p) => s + Number(p.AmountReceived), 0),
      paymentCount: payments.length,
      expensesPaid: expenses.reduce((s, e) => s + Number(e.TotalAmount), 0),
      expenseCount: expenses.length,
      outstandingReceivables: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
      overdueAmount: db.invoices.filter((i) => i.InvoiceStatus === 'Overdue').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
      depositLiabilities: depositSummary(db).totalHeld,
      cashIn: ledger.inflow,
      cashOut: ledger.outflow,
      netCashFlow: ledger.net,
    },
    ledgerByType: byType,
    revenueByRoomType,
    expenseByCategory,
    receivableByTenant,
    invoices,
    payments,
    expenses,
    transactions: ledger.rows.sort((a, b) => b.TransactionDate.localeCompare(a.TransactionDate)),
  };
}

function getDailyReport(db, date = today()) {
  const payments = db.payments.filter((p) => p.PaymentDate === date && p.PaymentStatus === 'Confirmed');
  const expenses = db.expenses.filter((e) => e.ExpenseDate === date && e.PaymentStatus === 'Paid');
  const transactions = db.transactions.filter((t) => t.TransactionDate === date);
  return {
    date,
    payments: payments.map((p) => {
      const tenant = db.tenants.find((t) => t.TenantID === p.TenantID);
      return { ...p, TenantName: tenant ? tenant.FullName : p.TenantID };
    }),
    expenses,
    transactions,
    summary: {
      paymentTotal: payments.reduce((s, p) => s + Number(p.AmountReceived), 0),
      expenseTotal: expenses.reduce((s, e) => s + Number(e.TotalAmount), 0),
      cashIn: transactions.filter((t) => t.Direction === 'IN' && !['Deposit Received'].includes(t.TransactionType)).reduce((s, t) => s + Number(t.Amount), 0),
      cashOut: transactions.filter((t) => t.Direction === 'OUT' && !['Deposit Returned'].includes(t.TransactionType)).reduce((s, t) => s + Number(t.Amount), 0),
      net: transactions.filter((t) => !['Deposit Received', 'Deposit Returned'].includes(t.TransactionType)).reduce((s, t) => s + (t.Direction === 'IN' ? 1 : -1) * Number(t.Amount), 0),
    },
  };
}

function getOccupancyReport(db, filters = {}) {
  const { from, to } = sanitizeRange(filters);
  recalculateAllInvoices(db, today());
  const rooms = db.rooms.map((room) => {
    const history = db.occupancies.filter((o) => {
      if (o.RoomID !== room.RoomID) return false;
      const end = o.ActualCheckOut || '9999-12-31';
      return o.CheckInDate <= to && end >= from;
    }).map((o) => {
      const tenant = db.tenants.find((t) => t.TenantID === o.TenantID);
      return {
        OccupancyID: o.OccupancyID,
        TenantName: tenant ? tenant.FullName : o.TenantID,
        CheckInDate: o.CheckInDate,
        CheckOutDate: o.ActualCheckOut || '',
        AgreementStatus: o.AgreementStatus,
        MonthlyPrice: o.AgreedMonthlyPrice,
        ActiveDays: Math.max(1, daysBetween(o.CheckInDate < from ? from : o.CheckInDate, (o.ActualCheckOut && o.ActualCheckOut < to ? o.ActualCheckOut : to)) + 1),
      };
    });
    const invoices = db.invoices.filter((i) => i.RoomID === room.RoomID && i.InvoiceStatus !== 'Cancelled' && inRange(i.InvoiceDate, from, to));
    return {
      ...room,
      AvailabilityStatus: roomAvailability(db, room),
      History: history,
      InvoicesIssued: invoices.reduce((s, i) => s + Number(i.TotalAmount), 0),
      RentCollected: invoices.reduce((s, i) => s + Number(i.AmountPaid), 0),
    };
  });
  const occupied = rooms.filter((r) => r.AvailabilityStatus === 'Occupied').length;
  const activeRooms = rooms.filter((r) => r.AvailabilityStatus !== 'Inactive').length;
  return {
    range: { from, to },
    summary: { totalRooms: rooms.length, occupied, activeRooms, occupancyRate: activeRooms ? Math.round((occupied / activeRooms) * 1000) / 10 : 0 },
    rooms,
  };
}

function getTenantStatement(db, tenantId, filters = {}) {
  return tenantStatement(db, tenantId, filters);
}

function reconcile(db) {
  recalculateAllInvoices(db, today());
  const issues = [];
  const confirmedPayments = db.payments.filter((p) => p.PaymentStatus === 'Confirmed');
  for (const payment of confirmedPayments) {
    const allocations = db.allocations.filter((a) => a.PaymentID === payment.PaymentID && a.AllocationStatus === 'Valid');
    const allocated = allocations.reduce((s, a) => s + Number(a.AllocatedAmount), 0);
    const serviceApplied = db.serviceOrders.filter((o) => o.PaymentID === payment.PaymentID).reduce((s, o) => s + Number(o.TotalAmount), 0);
    const credits = db.credits.filter((c) => c.PaymentID === payment.PaymentID && c.Status !== 'Voided');
    const creditTotal = credits.reduce((s, c) => s + Number(c.RemainingAmount), 0);
    const total = allocated + serviceApplied + creditTotal;
    if (total > Number(payment.AmountReceived)) {
      issues.push({
        level: 'critical',
        module: 'Payments',
        recordId: payment.PaymentID,
        message: `Alokasi + kredit (${total}) melebihi jumlah pembayaran (${payment.AmountReceived}).`,
      });
    }
  }
  for (const invoice of db.invoices) {
    if (invoice.InvoiceStatus === 'Cancelled') {
      if (db.allocations.some((a) => a.InvoiceID === invoice.InvoiceID && a.AllocationStatus === 'Valid')) {
        issues.push({ level: 'critical', module: 'Invoices', recordId: invoice.InvoiceID, message: 'Invoice dibatalkan masih memiliki alokasi valid.' });
      }
      continue;
    }
    const expected = Number(invoice.TotalAmount) - Number(invoice.AmountPaid);
    if (Math.abs(expected - Number(invoice.OutstandingBalance)) > 0.5) {
      issues.push({ level: 'critical', module: 'Invoices', recordId: invoice.InvoiceID, message: `Saldo invoice tidak konsisten (${invoice.OutstandingBalance} vs ${expected}).` });
    }
    if (Number(invoice.AmountPaid) > Number(invoice.TotalAmount) + 0.5) {
      issues.push({ level: 'warning', module: 'Invoices', recordId: invoice.InvoiceID, message: 'Pembayaran melebihi total invoice; periksa alokasi.' });
    }
  }
  for (const deposit of db.deposits) {
    const expected = Number(deposit.DepositAmount) - Number(deposit.AmountReturned) - Number(deposit.AmountDeducted);
    if (Math.abs(expected - Number(deposit.OutstandingDepositLiability)) > 0.5) {
      issues.push({ level: 'critical', module: 'Deposits', recordId: deposit.DepositRecordID, message: 'Saldo kewajiban deposit tidak konsisten.' });
    }
  }
  const totals = {
    invoicesTotal: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.TotalAmount), 0),
    invoicesPaid: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.AmountPaid), 0),
    invoicesOutstanding: db.invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((s, i) => s + Number(i.OutstandingBalance), 0),
    confirmedPayments: confirmedPayments.reduce((s, p) => s + Number(p.AmountReceived), 0),
    validAllocations: db.allocations.filter((a) => a.AllocationStatus === 'Valid').reduce((s, a) => s + Number(a.AllocatedAmount), 0),
    credits: db.credits.filter((c) => c.Status !== 'Voided').reduce((s, c) => s + Number(c.RemainingAmount), 0),
    depositLiability: depositSummary(db).totalHeld,
    transactionsIn: db.transactions.filter((t) => t.Direction === 'IN').reduce((s, t) => s + Number(t.Amount), 0),
    transactionsOut: db.transactions.filter((t) => t.Direction === 'OUT').reduce((s, t) => s + Number(t.Amount), 0),
  };
  return { checkedAt: new Date().toISOString(), issues, totals, ok: issues.length === 0 };
}

function getRevenueSummary(db) {
  recalculateAllInvoices(db, today());
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const from = monthStart(addMonthsClamped(today(), -i));
    const to = monthEnd(from);
    const invoices = db.invoices.filter((invoice) => invoice.InvoiceStatus !== 'Cancelled' && inRange(invoice.InvoiceDate, from, to));
    const payments = db.payments.filter((p) => p.PaymentStatus === 'Confirmed' && inRange(p.PaymentDate, from, to));
    const expenses = db.expenses.filter((e) => e.PaymentStatus === 'Paid' && inRange(e.ExpenseDate, from, to));
    months.push({
      month: from.slice(0, 7),
      invoiced: invoices.reduce((s, i) => s + Number(i.TotalAmount), 0),
      collected: payments.reduce((s, p) => s + Number(p.AmountReceived), 0),
      expenses: expenses.reduce((s, e) => s + Number(e.TotalAmount), 0),
    });
  }
  return months;
}

module.exports = {
  sanitizeRange,
  roomStats,
  getDashboard,
  getFinancialReport,
  getDailyReport,
  getOccupancyReport,
  getTenantStatement,
  reconcile,
  getRevenueSummary,
};
