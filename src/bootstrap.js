'use strict';

const { today } = require('./util');
const { load, save } = require('./db');
const { generateMonthlyInvoices, updateOverdueInvoices } = require('./services/billing');
const { recordPayment } = require('./services/payments');
const { createServiceOrder } = require('./services/serviceOrders');
const { saveExpense } = require('./services/expenses');
const { audit } = require('./services/common');

function userByEmail(db, email) {
  const user = db.users.find((u) => u.Email === email);
  if (!user) throw new Error(`User demo ${email} tidak ditemukan.`);
  return user;
}

function seedDemoOperations(db) {
  if (db.meta.demoPaymentsSeeded) return;
  const cashier = userByEmail(db, 'kasir@kos.id');
  const receptionist = userByEmail(db, 'resepsionis@kos.id');
  const owner = userByEmail(db, 'owner@kos.id');

  const invoicesForT1 = db.invoices.filter((i) => i.TenantID === 'T-0001').sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
  const invoicesForT2 = db.invoices.filter((i) => i.TenantID === 'T-0002').sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));

  createServiceOrder(db, {
    TenantID: 'T-0001',
    ServiceID: 'SV-0001',
    Quantity: 2,
    OrderDate: today(),
    BillingMethod: 'Add to Invoice',
    InvoiceID: invoicesForT1[0] ? invoicesForT1[0].InvoiceID : '',
    Notes: 'Laundry 2 kg ditagihkan bersama sewa',
  }, receptionist);

  if (invoicesForT1[0]) {
    recordPayment(db, {
      TenantID: 'T-0001', AmountReceived: 500000, PaymentMethod: 'Cash',
      InvoiceID: invoicesForT1[0].InvoiceID, IdempotencyKey: 'DEMO-PAY-T1-1',
      Notes: 'Cicilan pertama sewa', PaymentDate: today(),
    }, cashier);
    recordPayment(db, {
      TenantID: 'T-0001', AmountReceived: 400000, PaymentMethod: 'Bank Transfer',
      InvoiceID: invoicesForT1[0].InvoiceID, IdempotencyKey: 'DEMO-PAY-T1-2',
      ReferenceNumber: 'TRX-BCA-778812', Notes: 'Cicilan kedua sewa', PaymentDate: today(),
    }, cashier);
  }

  if (invoicesForT2[0]) {
    recordPayment(db, {
      TenantID: 'T-0002', AmountReceived: invoicesForT2[0].TotalAmount, PaymentMethod: 'Bank Transfer',
      InvoiceID: invoicesForT2[0].InvoiceID, IdempotencyKey: 'DEMO-PAY-T2-1',
      ReferenceNumber: 'TRX-MANDIRI-112233', Notes: 'Pembayaran lunas periode pertama', PaymentDate: today(),
    }, cashier);
  }
  if (invoicesForT2[1]) {
    recordPayment(db, {
      TenantID: 'T-0002', AmountReceived: 1200000, PaymentMethod: 'QRIS',
      InvoiceID: invoicesForT2[1].InvoiceID, IdempotencyKey: 'DEMO-PAY-T2-2',
      ReferenceNumber: 'QRIS-900812', Notes: 'Pembayaran sebagian', PaymentDate: today(),
    }, cashier);
  }

  createServiceOrder(db, {
    TenantID: 'T-0002',
    ServiceID: 'SV-0002',
    Quantity: 1,
    OrderDate: today(),
    BillingMethod: 'Immediate Payment',
    PaymentMethod: 'Cash',
    Notes: 'Pembersihan kamar dibayar langsung',
  }, receptionist);

  const existingExpense = db.expenses.find((e) => e.Notes === 'DEMO');
  if (!existingExpense) {
    saveExpense(db, {
      ExpenseDate: today(), Category: 'Utilities', Description: 'Tagihan listrik area bersama',
      Vendor: 'PLN', Quantity: 1, UnitCost: 750000, PaymentMethod: 'Bank Transfer',
      PaymentStatus: 'Paid', Notes: 'DEMO',
    }, owner);
    saveExpense(db, {
      ExpenseDate: today(), Category: 'Cleaning Supplies', Description: 'Pembelian sabun dan alat kebersihan',
      Vendor: 'Toko Bersih Jaya', Quantity: 5, UnitCost: 30000, PaymentMethod: 'Cash',
      PaymentStatus: 'Pending', Notes: 'DEMO',
    }, owner);
  }

  db.meta.demoPaymentsSeeded = true;
  db.meta.demoSeededAt = new Date().toISOString();
  audit(db, { user: 'SYSTEM', action: 'SEED_DEMO_DATA', module: 'System', recordId: 'DEMO', next: 'Demo operations seeded' });
  save(db);
}

function bootstrap() {
  const db = load();
  const billing = generateMonthlyInvoices(db, { asOf: today(), user: 'SYSTEM' });
  updateOverdueInvoices(db, { asOf: today(), user: 'SYSTEM' });
  save(db);
  seedDemoOperations(db);
  return { billingCount: billing.count };
}

module.exports = { bootstrap, seedDemoOperations };
