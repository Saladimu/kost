'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.join(__dirname, '..');
const port = 3200 + Math.floor(Math.random() * 300);
const base = `http://127.0.0.1:${port}`;
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

let cookie = '';
let server = null;

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch (error) { /* not ready */ }
    await sleep(100);
  }
  throw new Error('Server uji tidak siap.');
}

async function request(method, endpoint, body, status = 200) {
  const response = await fetch(`${base}/api${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.status, status, `${method} ${endpoint} -> ${response.status}: ${text.slice(0, 240)}`);
  const payload = JSON.parse(text);
  assert.equal(payload.ok, true, `${method} ${endpoint} gagal: ${payload.error}`);
  return payload.data;
}

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kos-acceptance-'));
  const dbPath = path.join(dir, 'db.json');

  server = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), DB_PATH: dbPath },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

  await waitForServer();
  const health = await request('GET', '/health');
  assert.equal(health.status, 'ok');

  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@kos.id', password: 'owner123' }),
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get('set-cookie').split(';')[0];

  const me = await request('GET', '/auth/me');
  assert.equal(me.user.Role, 'Owner');

  const dashboardPage = await request('GET', '/dashboard-page');
  assert.ok(dashboardPage.dashboard, 'Dashboard page harus memuat ringkasan.');
  assert.ok(Array.isArray(dashboardPage.revenue), 'Dashboard page harus memuat tren pendapatan.');

  const rooms = await request('GET', '/rooms');
  assert.equal(rooms.length, 21, 'Seed harus memiliki 21 kamar.');
  const room = rooms.find((item) => item.AvailabilityStatus === 'Available');
  assert.ok(room, 'Harus ada kamar tersedia untuk pengujian.');

  const tenant = await request('POST', '/tenants', {
    FullName: 'Penghuni Uji Acceptance',
    Phone: '081200000099',
    Email: 'acceptance@example.com',
    TenantStatus: 'Prospective',
  });
  assert.equal(tenant.TenantStatus, 'Prospective');

  const reservation = await request('POST', '/reservations', {
    TenantID: tenant.TenantID,
    RoomID: room.RoomID,
    PlannedCheckIn: today,
    AgreedMonthlyPrice: 1800000,
  });
  assert.equal(reservation.ReservationStatus, 'Confirmed');

  const checkIn = await request('POST', '/check-in', {
    TenantID: tenant.TenantID,
    RoomID: room.RoomID,
    ReservationID: reservation.ReservationID,
    CheckInDate: today,
    AgreedMonthlyPrice: 1800000,
    DepositAmount: 500000,
    DepositMethod: 'Cash',
  });
  assert.equal(checkIn.occupancy.AgreementStatus, 'Active');
  const occupancyId = checkIn.occupancy.OccupancyID;

  const conflictTenant = await request('POST', '/tenants', {
    FullName: 'Penghuni Konflik',
    Phone: '081200000098',
    TenantStatus: 'Prospective',
  });
  const conflictResponse = await fetch(`${base}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      TenantID: conflictTenant.TenantID,
      RoomID: room.RoomID,
      PlannedCheckIn: today,
      AgreedMonthlyPrice: 1800000,
    }),
  });
  assert.ok(conflictResponse.status >= 400, 'Reservasi pada kamar yang terisi harus ditolak.');

  await request('POST', '/invoices/generate', { asOf: today });
  await request('POST', '/invoices/generate', { asOf: today });
  const invoices = await request('GET', `/invoices?tenantId=${tenant.TenantID}`);
  const invoice = invoices.find((item) => item.OccupancyID === occupancyId && item.InvoiceStatus !== 'Cancelled');
  assert.ok(invoice, 'Invoice bulanan harus dibuat untuk hunian baru.');
  const outstanding = Number(invoice.OutstandingBalance);
  assert.ok(outstanding > 0);

  const key = `ACC-${Date.now()}`;
  const payment = await request('POST', '/payments', {
    TenantID: tenant.TenantID,
    AmountReceived: Math.round(outstanding / 2),
    PaymentMethod: 'Cash',
    PaymentDate: today,
    IdempotencyKey: key,
  });
  assert.ok(payment.allocated > 0);
  const duplicate = await request('POST', '/payments', {
    TenantID: tenant.TenantID,
    AmountReceived: Math.round(outstanding / 2),
    PaymentMethod: 'Cash',
    PaymentDate: today,
    IdempotencyKey: key,
  });
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.payment.PaymentID, payment.payment.PaymentID);

  const afterPayment = (await request('GET', `/invoices?tenantId=${tenant.TenantID}`))
    .find((item) => item.InvoiceID === invoice.InvoiceID);
  assert.equal(afterPayment.InvoiceStatus, 'Partially Paid');
  assert.equal(Number(afterPayment.OutstandingBalance), outstanding - Math.round(outstanding / 2));
  const sameOccupationInvoices = invoices.filter((item) => item.OccupancyID === occupancyId && item.InvoiceStatus !== 'Cancelled');
  assert.equal(sameOccupationInvoices.length, 1, 'Tagihan bulanan tidak boleh dibuat ganda.');

  const concurrentKey = `ACC-CONCURRENT-${Date.now()}`;
  const concurrentPayload = {
    TenantID: tenant.TenantID,
    AmountReceived: 1000,
    PaymentMethod: 'Cash',
    PaymentDate: today,
    IdempotencyKey: concurrentKey,
  };
  const concurrent = await Promise.all([
    request('POST', '/payments', concurrentPayload),
    request('POST', '/payments', concurrentPayload),
  ]);
  assert.equal(concurrent[0].payment.PaymentID, concurrent[1].payment.PaymentID, 'Pengiriman bersamaan harus menghasilkan satu pembayaran.');
  assert.equal(concurrent.filter((item) => item.duplicate).length, 1);

  const secondRoom = rooms.find((item) => item.AvailabilityStatus === 'Available' && item.RoomID !== room.RoomID);
  assert.ok(secondRoom, 'Harus ada kamar kedua untuk pengujian transfer.');
  const transfer = await request('POST', '/transfers', {
    OccupancyID: occupancyId,
    ToRoomID: secondRoom.RoomID,
    TransferDate: today,
    NewMonthlyPrice: 1900000,
    Reason: 'Pengujian transfer kamar',
  });
  assert.equal(transfer.previous.AgreementStatus, 'Transferred');
  assert.equal(transfer.occupancy.AgreementStatus, 'Active');
  assert.equal(transfer.occupancy.RoomID, secondRoom.RoomID);
  const occupiedId = transfer.occupancy.OccupancyID;

  const services = await request('GET', '/services');
  const order = await request('POST', '/service-orders', {
    TenantID: tenant.TenantID,
    ServiceID: services[0].ServiceID,
    Quantity: 2,
    OrderDate: today,
    BillingMethod: 'Add to Invoice',
    UnitPrice: services[0].StandardPrice,
  });
  assert.equal(order.order.OrderStatus, 'Billed');
  const withService = (await request('GET', `/invoices?tenantId=${tenant.TenantID}`))
    .find((item) => item.InvoiceID === invoice.InvoiceID);
  assert.ok(Number(withService.ServiceCharges) >= Number(services[0].StandardPrice) * 2);

  const expense = await request('POST', '/expenses', {
    ExpenseDate: today,
    Category: 'Cleaning Supplies',
    Description: 'Peralatan kebersihan untuk pengujian',
    Quantity: 1,
    UnitCost: 35000,
    PaymentMethod: 'Cash',
    PaymentStatus: 'Pending',
  });
  const approved = await request('POST', '/expenses', { ExpenseID: expense.ExpenseID, PaymentStatus: 'Approved' });
  assert.equal(approved.PaymentStatus, 'Approved');
  const paid = await request('POST', '/expenses', { ExpenseID: expense.ExpenseID, PaymentStatus: 'Paid' });
  assert.equal(paid.PaymentStatus, 'Paid');
  assert.ok(paid.TransactionID);

  const checkOut = await request('POST', '/check-out', {
    OccupancyID: occupiedId,
    CheckOutDate: today,
    DepositDeduction: 100000,
    DeductionReason: 'Pembersihan kamar',
    ReturnMethod: 'Cash',
  });
  assert.equal(checkOut.occupancy.AgreementStatus, 'Ended');
  assert.equal(checkOut.settlement.deposit.returnAmount, 400000);
  assert.ok(checkOut.settlement.cleaningActivity);

  const reconcile = await request('GET', '/reports/reconcile');
  assert.equal(reconcile.ok, true, `Rekonsiliasi menemukan masalah: ${JSON.stringify(reconcile.issues)}`);

  const financial = await request('GET', `/reports/financial?from=${today}&to=${today}`);
  assert.ok(financial.summary.paymentsReceived > 0);
  assert.ok(financial.summary.invoicesIssued > 0);

  const daily = await request('GET', `/reports/daily?date=${today}`);
  assert.ok(daily.payments.length > 0);

  const statement = await request('GET', `/reports/statement?tenantId=${tenant.TenantID}&from=${today}&to=${today}`);
  assert.ok(statement.summary.totalInvoiced > 0);

  const audit = await request('GET', '/audit');
  assert.ok(audit.length > 0);

  const staffLogin = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'staf@kos.id', password: 'staff123' }),
  });
  assert.equal(staffLogin.status, 200);
  const staffCookie = staffLogin.headers.get('set-cookie').split(';')[0];
  for (const endpoint of ['/payments', '/transactions', '/invoices', '/reports/financial']) {
    const forbidden = await fetch(`${base}/api${endpoint}`, { headers: { Cookie: staffCookie } });
    assert.equal(forbidden.status, 403, `Operational Staff tidak boleh mengakses ${endpoint}.`);
  }

  const backup = await request('POST', '/system/backup', {});
  const backupPath = path.join(dir, backup.file);
  assert.ok(fs.existsSync(backupPath), 'File backup harus dibuat.');
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  assert.equal(backupData.rooms.length, 21);
  assert.ok(backupData.invoices.length > 0);
  assert.ok(backupData.deposits.length > 0);

  console.log('Acceptance test lulus: alur check-in, tagihan, pembayaran sebagian, layanan, pengeluaran, check-out, dan rekonsiliasi.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (server) server.kill();
  });
