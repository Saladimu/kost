'use strict';

const crypto = require('crypto');
const { load, sync, isPostgres } = require('./db');
const { guard, can, sessionUser, login, logout, setSessionCookie, clearSessionCookie } = require('./auth');
const { AppError, today, cleanText } = require('./util');
const { getSetting } = require('./services/common');
const rooms = require('./services/rooms');
const tenants = require('./services/tenants');
const reservations = require('./services/occupancy');
const billing = require('./services/billing');
const payments = require('./services/payments');
const serviceOrders = require('./services/serviceOrders');
const expenses = require('./services/expenses');
const deposits = require('./services/deposits');
const staffService = require('./services/staff');
const usersService = require('./services/users');
const activities = require('./services/activities');
const masters = require('./services/masters');
const reports = require('./services/reports');
const jobs = require('./jobs');

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store' });
  res.end(body);
}

function ok(res, data, status = 200) {
  send(res, status, { ok: true, data });
}

function fail(res, error) {
  const status = error.status || 400;
  send(res, status, { ok: false, error: error.message || 'Terjadi kesalahan.', code: error.code || 'ERROR' });
}

function query(url) {
  const result = {};
  for (const [key, value] of url.searchParams.entries()) result[key] = value;
  return result;
}

function requestId(req) {
  return cleanText(req.headers['x-request-id'], 60) || `REQ-${crypto.randomBytes(6).toString('hex')}`;
}

function bootstrapPayload(db, user) {
  return {
    user,
    property: {
      name: getSetting(db, 'PropertyName', 'Kos'),
      address: getSetting(db, 'PropertyAddress', ''),
      phone: getSetting(db, 'PropertyPhone', ''),
      currency: getSetting(db, 'Currency', 'IDR'),
      timezone: getSetting(db, 'Timezone', 'Asia/Jakarta'),
      invoicePrefix: getSetting(db, 'InvoicePrefix', 'INV'),
      receiptPrefix: getSetting(db, 'ReceiptPrefix', 'KWT'),
      dueDays: getSetting(db, 'DefaultDueDays', '5'),
    },
    today: today(),
    roomTypes: can(user, 'roomTypes', 'read') ? rooms.listRoomTypes(db).filter((t) => t.IsActive === 'TRUE') : [],
    rooms: can(user, 'rooms', 'read') ? rooms.listRooms(db) : [],
    tenants: can(user, 'tenants', 'read') ? tenants.listTenants(db, {}, user) : [],
    services: can(user, 'services', 'read') ? serviceOrders.listServices(db) : [],
    staff: can(user, 'staff', 'read') ? staffService.listStaff(db) : (user.Role === 'Operational Staff' ? staffService.listStaff(db).filter((s) => s.StaffID === user.StaffID) : []),
    settings: can(user, 'settings', 'read') ? masters.listSettings(db) : [],
    users: can(user, 'users', 'read') ? usersService.listUsers(db) : [],
  };
}

async function handle(req, res, url) {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();
  const q = query(url);
  const rid = requestId(req);
  let body = {};
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    body = await readBody(req);
  }

  if (path === '/api/health') return ok(res, { status: 'ok', database: isPostgres() ? 'postgres' : 'json', time: new Date().toISOString() });

  await sync();
  const db = load();
  const user = sessionUser(db, req);

  if (path === '/api/public-config' && method === 'GET') {
    return ok(res, { property: { name: getSetting(db, 'PropertyName', 'Kos') } });
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const result = login(db, body.email, body.password);
    setSessionCookie(res, result.token);
    const fresh = sessionUser(db, { headers: { cookie: `kos_session=${result.token}` } });
    return ok(res, { user: fresh, bootstrap: bootstrapPayload(db, fresh) });
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    logout(req);
    clearSessionCookie(res);
    return ok(res, { loggedOut: true });
  }
  if (!user) return fail(res, new AppError('Silakan login terlebih dahulu.', 401, 'UNAUTHORIZED'));

  if (path === '/api/auth/me' && method === 'GET') return ok(res, { user });

  if (path === '/api/bootstrap' && method === 'GET') {
    guard(user, 'dashboard', 'read');
    return ok(res, bootstrapPayload(db, user));
  }

  if (path === '/api/dashboard' && method === 'GET') {
    guard(user, 'dashboard', 'read');
    return ok(res, reports.getDashboard(db, q, user));
  }

  if (path === '/api/dashboard-page' && method === 'GET') {
    guard(user, 'dashboard', 'read');
    return ok(res, {
      dashboard: reports.getDashboard(db, q, user),
      revenue: can(user, 'reports', 'read') ? reports.getRevenueSummary(db) : [],
      activities: can(user, 'activities', 'read') ? activities.listActivities(db, { status: 'Pending' }, user) : [],
    });
  }

  if (path === '/api/rooms' && method === 'GET') {
    guard(user, 'rooms', 'read');
    return ok(res, rooms.listRooms(db, q));
  }
  if (path === '/api/rooms' && method === 'POST') {
    guard(user, 'rooms', 'write');
    const saved = await mutate((tx) => rooms.saveRoom(tx, body, user));
    return ok(res, saved);
  }
  if (path === '/api/room-types' && method === 'GET') {
    guard(user, 'roomTypes', 'read');
    return ok(res, rooms.listRoomTypes(db));
  }
  if (path === '/api/room-types' && method === 'POST') {
    guard(user, 'roomTypes', 'write');
    return ok(res, await mutate((tx) => rooms.saveRoomType(tx, body, user)));
  }

  if (path === '/api/tenants' && method === 'GET') {
    guard(user, 'tenants', 'read');
    return ok(res, tenants.listTenants(db, q, user));
  }
  if (path === '/api/tenants' && method === 'POST') {
    guard(user, 'tenants', 'write');
    return ok(res, await mutate((tx) => tenants.saveTenant(tx, body, user)));
  }

  if (path === '/api/reservations' && method === 'GET') {
    guard(user, 'reservations', 'read');
    return ok(res, reservations.listReservations(db, q));
  }
  if (path === '/api/reservations' && method === 'POST') {
    guard(user, 'reservations', 'write');
    return ok(res, await mutate((tx) => reservations.createReservation(tx, body, user)));
  }
  const resMatch = path.match(/^\/api\/reservations\/([^/]+)$/);
  if (resMatch && method === 'POST') {
    guard(user, 'reservations', 'write');
    return ok(res, await mutate((tx) => reservations.updateReservation(tx, resMatch[1], body, user)));
  }

  if (path === '/api/occupancies' && method === 'GET') {
    guard(user, 'agreements', 'read');
    return ok(res, reservations.listOccupancies(db, q));
  }
  if (path === '/api/check-in' && method === 'POST') {
    guard(user, 'agreements', 'write');
    return ok(res, await mutate((tx) => reservations.checkInTenant(tx, body, user)));
  }
  if (path === '/api/transfers' && method === 'POST') {
    guard(user, 'agreements', 'write');
    return ok(res, await mutate((tx) => reservations.transferTenant(tx, body, user)));
  }
  if (path === '/api/renew' && method === 'POST') {
    guard(user, 'agreements', 'write');
    return ok(res, await mutate((tx) => reservations.renewAgreement(tx, body, user)));
  }
  if (path === '/api/check-out' && method === 'POST') {
    guard(user, 'agreements', 'write');
    return ok(res, await mutate((tx) => reservations.checkOutTenant(tx, body, user)));
  }

  if (path === '/api/invoices' && method === 'GET') {
    guard(user, 'invoices', 'read');
    return ok(res, billing.listInvoices(db, q));
  }
  if (path === '/api/invoices/generate' && method === 'POST') {
    guard(user, 'invoices', 'generate');
    return ok(res, await mutate((tx) => billing.generateMonthlyInvoices(tx, { asOf: body.asOf || today(), user: user.StaffID })));
  }
  const invMatch = path.match(/^\/api\/invoices\/([^/]+)$/);
  if (invMatch && method === 'GET') {
    guard(user, 'invoices', 'read');
    return ok(res, billing.getInvoiceDetail(db, invMatch[1]));
  }
  const invAction = path.match(/^\/api\/invoices\/([^/]+)\/(cancel|adjust)$/);
  if (invAction && method === 'POST') {
    guard(user, 'invoices', 'write');
    if (invAction[2] === 'cancel') {
      return ok(res, await mutate((tx) => billing.cancelInvoice(tx, invAction[1], body.reason, user)));
    }
    return ok(res, await mutate((tx) => billing.applyInvoiceAdjustment(tx, invAction[1], body, user)));
  }

  if (path === '/api/payments' && method === 'GET') {
    guard(user, 'payments', 'read');
    return ok(res, payments.listPayments(db, q));
  }
  if (path === '/api/payments' && method === 'POST') {
    guard(user, 'payments', 'write');
    return ok(res, await mutate((tx) => payments.recordPayment(tx, body, user)));
  }
  const payMatch = path.match(/^\/api\/payments\/([^/]+)$/);
  if (payMatch && method === 'GET') {
    guard(user, 'payments', 'read');
    return ok(res, payments.getPaymentDetail(db, payMatch[1]));
  }
  const payVoid = path.match(/^\/api\/payments\/([^/]+)\/void$/);
  if (payVoid && method === 'POST') {
    guard(user, 'payments', 'void');
    return ok(res, await mutate((tx) => payments.voidPayment(tx, payVoid[1], body.reason, user)));
  }

  if (path === '/api/services' && method === 'GET') {
    guard(user, 'services', 'read');
    return ok(res, serviceOrders.listServices(db));
  }
  if (path === '/api/services' && method === 'POST') {
    guard(user, 'services', 'write');
    return ok(res, await mutate((tx) => serviceOrders.saveService(tx, body, user)));
  }
  if (path === '/api/service-orders' && method === 'GET') {
    guard(user, 'services', 'read');
    return ok(res, serviceOrders.listServiceOrders(db, q));
  }
  if (path === '/api/service-orders' && method === 'POST') {
    guard(user, 'services', 'write');
    return ok(res, await mutate((tx) => serviceOrders.createServiceOrder(tx, body, user)));
  }

  if (path === '/api/expenses' && method === 'GET') {
    guard(user, 'expenses', 'read');
    return ok(res, expenses.listExpenses(db, q));
  }
  if (path === '/api/expenses' && method === 'POST') {
    guard(user, 'expenses', 'write');
    return ok(res, await mutate((tx) => expenses.saveExpense(tx, body, user)));
  }
  const expenseCancel = path.match(/^\/api\/expenses\/([^/]+)\/cancel$/);
  if (expenseCancel && method === 'POST') {
    guard(user, 'expenses', 'write');
    return ok(res, await mutate((tx) => expenses.cancelExpense(tx, expenseCancel[1], body.reason, user)));
  }

  if (path === '/api/transactions' && method === 'GET') {
    guard(user, 'transactions', 'read');
    let rows = db.transactions.slice();
    if (q.from) rows = rows.filter((t) => t.TransactionDate >= q.from);
    if (q.to) rows = rows.filter((t) => t.TransactionDate <= q.to);
    if (q.type) rows = rows.filter((t) => t.TransactionType === q.type);
    if (q.direction) rows = rows.filter((t) => t.Direction === q.direction);
    rows = rows.map((t) => {
      const tenant = db.tenants.find((x) => x.TenantID === t.TenantID);
      const staff = db.staff.find((s) => s.StaffID === t.StaffID);
      return { ...t, TenantName: tenant ? tenant.FullName : '', StaffName: staff ? staff.FullName : '' };
    }).sort((a, b) => b.TransactionDate.localeCompare(a.TransactionDate) || b.CreatedAt.localeCompare(a.CreatedAt));
    return ok(res, rows);
  }

  if (path === '/api/deposits' && method === 'GET') {
    guard(user, 'deposits', 'read');
    return ok(res, deposits.listDeposits(db, q));
  }
  if (path === '/api/deposits/return' && method === 'POST') {
    guard(user, 'deposits', 'write');
    return ok(res, await mutate((tx) => deposits.recordDepositReturn(tx, body, user)));
  }

  if (path === '/api/staff' && method === 'GET') {
    guard(user, 'staff', 'read');
    return ok(res, staffService.listStaff(db));
  }
  if (path === '/api/staff' && method === 'POST') {
    guard(user, 'staff', 'write');
    return ok(res, await mutate((tx) => staffService.saveStaff(tx, body, user)));
  }

  if (path === '/api/users' && method === 'GET') {
    guard(user, 'users', 'read');
    return ok(res, usersService.listUsers(db));
  }
  if (path === '/api/users' && method === 'POST') {
    guard(user, 'users', 'write');
    return ok(res, await mutate((tx) => usersService.saveUser(tx, body, user)));
  }

  if (path === '/api/activities' && method === 'GET') {
    guard(user, 'activities', 'read');
    return ok(res, activities.listActivities(db, q, user));
  }
  if (path === '/api/activities' && method === 'POST') {
    guard(user, 'activities', 'write');
    return ok(res, await mutate((tx) => activities.createActivity(tx, body, user)));
  }
  const actMatch = path.match(/^\/api\/activities\/([^/]+)$/);
  if (actMatch && method === 'POST') {
    guard(user, 'activities', 'write');
    return ok(res, await mutate((tx) => activities.updateActivity(tx, actMatch[1], body, user)));
  }

  if (path === '/api/settings' && method === 'GET') {
    guard(user, 'settings', 'read');
    return ok(res, masters.listSettings(db));
  }
  if (path === '/api/settings' && method === 'POST') {
    guard(user, 'settings', 'write');
    return ok(res, await mutate((tx) => masters.saveSettings(tx, body.settings || body, user)));
  }
  if (path === '/api/price-list' && method === 'GET') {
    guard(user, 'master', 'read');
    return ok(res, masters.listPriceList(db));
  }
  if (path === '/api/price-list' && method === 'POST') {
    guard(user, 'master', 'write');
    return ok(res, await mutate((tx) => masters.savePrice(tx, body, user)));
  }

  if (path === '/api/reports/financial' && method === 'GET') {
    guard(user, 'reports', 'read');
    return ok(res, reports.getFinancialReport(db, q));
  }
  if (path === '/api/reports/daily' && method === 'GET') {
    guard(user, 'reports', 'read');
    return ok(res, reports.getDailyReport(db, q.date || today()));
  }
  if (path === '/api/reports/occupancy' && method === 'GET') {
    guard(user, 'reports', 'read');
    return ok(res, reports.getOccupancyReport(db, q));
  }
  if (path === '/api/reports/statement' && method === 'GET') {
    guard(user, 'reports', 'read');
    if (!q.tenantId) throw new AppError('tenantId wajib diisi.');
    return ok(res, reports.getTenantStatement(db, q.tenantId, { from: q.from, to: q.to }));
  }
  if (path === '/api/reports/reconcile' && method === 'GET') {
    guard(user, 'reports', 'read');
    return ok(res, reports.reconcile(db));
  }
  if (path === '/api/reports/revenue' && method === 'GET') {
    guard(user, 'reports', 'read');
    return ok(res, reports.getRevenueSummary(db));
  }
  if (path === '/api/audit' && method === 'GET') {
    guard(user, 'audit', 'read');
    return ok(res, masters.listAudit(db, q));
  }
  if (path === '/api/system/logs' && method === 'GET') {
    guard(user, 'audit', 'read');
    return ok(res, masters.listSystemLog(db));
  }
  if (path === '/api/system/run-jobs' && method === 'POST') {
    guard(user, 'system', 'run');
    return ok(res, await mutate((tx) => jobs.runBillingJobs(tx, { user: user.StaffID, asOf: body.asOf || today() })));
  }
  if (path === '/api/system/backup' && method === 'POST') {
    guard(user, 'system', 'run');
    const target = jobs.backupDatabase(isPostgres() ? load() : undefined);
    return ok(res, { file: target.split('/').slice(-2).join('/') });
  }

  return fail(res, new AppError('Endpoint tidak ditemukan.', 404, 'NOT_FOUND'));
}

async function mutate(work) {
  const { withLock } = require('./db');
  return withLock(work);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new AppError('Ukuran data terlalu besar.', 413, 'PAYLOAD_TOO_LARGE'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new AppError('Format data tidak valid.', 400, 'INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = { handle, fail, send };
