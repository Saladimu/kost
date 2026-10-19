'use strict';

const { today, nowISO, makeId, AppError, requireFields, requireAmount, requireEnum, cleanText, isDate } = require('../util');
const { audit, findById } = require('./common');
const { createTransaction } = require('./payments');

const EXPENSE_CATEGORIES = ['Utilities', 'Maintenance', 'Cleaning Supplies', 'Internet', 'Salaries', 'Equipment', 'Other'];
const EXPENSE_STATUSES = ['Pending', 'Approved', 'Paid', 'Cancelled'];

function listExpenses(db, filters = {}) {
  let rows = db.expenses.map((expense) => {
    const staff = db.staff.find((s) => s.StaffID === expense.RequestedBy);
    const approver = db.staff.find((s) => s.StaffID === expense.ApprovedBy);
    return {
      ...expense,
      RequestedByName: staff ? staff.FullName : expense.RequestedBy,
      ApprovedByName: approver ? approver.FullName : '',
    };
  });
  if (filters.status) rows = rows.filter((row) => row.PaymentStatus === filters.status);
  if (filters.category) rows = rows.filter((row) => row.Category === filters.category);
  if (filters.from) rows = rows.filter((row) => row.ExpenseDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.ExpenseDate <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.Description} ${row.Vendor}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.ExpenseDate.localeCompare(a.ExpenseDate) || b.CreatedAt.localeCompare(a.CreatedAt));
  return rows;
}

function expenseTotal(quantity, unitCost) {
  return Number(quantity) * Number(unitCost);
}

function saveExpense(db, data, user) {
  if (data.ExpenseID) {
    const expense = findById(db.expenses, 'ExpenseID', data.ExpenseID);
    if (expense.PaymentStatus === 'Cancelled') throw new AppError('Pengeluaran yang dibatalkan tidak dapat diubah.');
    const previous = JSON.stringify(expense);
    if (data.PaymentStatus !== undefined) {
      const status = requireEnum(data.PaymentStatus, ['Approved', 'Paid'], 'Status pengeluaran');
      if (status === 'Approved') {
        expense.PaymentStatus = 'Approved';
        expense.ApprovedBy = user.StaffID || '';
      }
      if (status === 'Paid') {
        expense.ApprovedBy = expense.ApprovedBy || user.StaffID || '';
        expense.PaymentStatus = 'Paid';
        if (!expense.TransactionID) {
          const tx = createTransaction(db, {
            date: expense.ExpenseDate, type: 'Expense Payment', direction: 'OUT', category: expense.Category,
            referenceType: 'Expense', referenceId: expense.ExpenseID, tenantId: '', roomId: '',
            description: `${expense.Description}${expense.Vendor ? ` - ${expense.Vendor}` : ''}`,
            amount: Number(expense.TotalAmount), method: expense.PaymentMethod,
            status: 'Confirmed', staffId: user.StaffID, key: `EXP:${expense.ExpenseID}`,
          });
          expense.TransactionID = tx.TransactionID;
        }
      }
    }
    if (data.Notes !== undefined) expense.Notes = cleanText(data.Notes, 500);
    if (data.ReceiptURL !== undefined) expense.ReceiptURL = cleanText(data.ReceiptURL, 500);
    audit(db, { user: user.StaffID, action: 'UPDATE_EXPENSE', module: 'Expenses', recordId: expense.ExpenseID, previous, next: JSON.stringify(expense) });
    return expense;
  }
  requireFields(data, ['ExpenseDate', 'Category', 'Description', 'Quantity', 'UnitCost', 'PaymentMethod']);
  if (!isDate(data.ExpenseDate)) throw new AppError('Tanggal pengeluaran tidak valid.');
  const quantity = requireAmount(data.Quantity, 'Jumlah');
  const unitCost = requireAmount(data.UnitCost, 'Biaya satuan');
  const category = requireEnum(data.Category, EXPENSE_CATEGORIES, 'Kategori pengeluaran');
  const status = requireEnum(data.PaymentStatus || 'Pending', ['Pending', 'Paid'], 'Status pembayaran');
  const expense = {
    ExpenseID: makeId(db, 'expense', 'EXP'),
    ExpenseDate: data.ExpenseDate,
    Category: category,
    Description: cleanText(data.Description, 300),
    Vendor: cleanText(data.Vendor, 120),
    Quantity: quantity,
    UnitCost: unitCost,
    TotalAmount: expenseTotal(quantity, unitCost),
    PaymentMethod: requireEnum(data.PaymentMethod, ['Cash', 'Bank Transfer', 'QRIS', 'Other'], 'Metode pembayaran'),
    PaymentStatus: status,
    ReceiptURL: cleanText(data.ReceiptURL, 500),
    RequestedBy: user.StaffID || '',
    ApprovedBy: status === 'Paid' ? (user.StaffID || '') : '',
    TransactionID: '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.expenses.push(expense);
  if (status === 'Paid') {
    const tx = createTransaction(db, {
      date: expense.ExpenseDate, type: 'Expense Payment', direction: 'OUT', category: expense.Category,
      referenceType: 'Expense', referenceId: expense.ExpenseID, tenantId: '', roomId: '',
      description: `${expense.Description}${expense.Vendor ? ` - ${expense.Vendor}` : ''}`,
      amount: expense.TotalAmount, method: expense.PaymentMethod, status: 'Confirmed',
      staffId: user.StaffID, key: `EXP:${expense.ExpenseID}`,
    });
    expense.TransactionID = tx.TransactionID;
  }
  audit(db, { user: user.StaffID, action: 'CREATE_EXPENSE', module: 'Expenses', recordId: expense.ExpenseID, next: JSON.stringify(expense) });
  return expense;
}

function cancelExpense(db, expenseId, reason, user) {
  const expense = findById(db.expenses, 'ExpenseID', expenseId);
  if (expense.PaymentStatus === 'Cancelled') throw new AppError('Pengeluaran sudah dibatalkan.');
  if (!reason) throw new AppError('Alasan pembatalan wajib diisi.');
  const previous = JSON.stringify(expense);
  if (expense.PaymentStatus === 'Paid' && expense.TransactionID) {
    createTransaction(db, {
      date: today(), type: 'Adjustment', direction: 'IN', category: 'Reversal',
      referenceType: 'Expense', referenceId: expense.ExpenseID, tenantId: '', roomId: '',
      description: `Pembatalan pengeluaran ${expense.ExpenseID}`, amount: Number(expense.TotalAmount),
      method: expense.PaymentMethod, status: 'Confirmed', staffId: user.StaffID,
      relatedId: expense.TransactionID, key: `EXP:CANCEL:${expense.ExpenseID}`,
    });
  }
  expense.PaymentStatus = 'Cancelled';
  expense.Notes = `${expense.Notes} | Dibatalkan: ${cleanText(reason, 300)}`;
  audit(db, { user: user.StaffID, action: 'CANCEL_EXPENSE', module: 'Expenses', recordId: expenseId, previous, next: JSON.stringify(expense), reason });
  return expense;
}

module.exports = { EXPENSE_CATEGORIES, EXPENSE_STATUSES, listExpenses, saveExpense, cancelExpense };
