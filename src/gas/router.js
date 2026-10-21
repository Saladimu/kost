function parseApiTarget_(rawPath) {
  const raw = String(rawPath || '/');
  const question = raw.indexOf('?');
  const pathPart = question >= 0 ? raw.slice(0, question) : raw;
  const queryPart = question >= 0 ? raw.slice(question + 1) : '';
  let path = pathPart.replace(/\/+$/, '') || '/';
  if (!path.startsWith('/api')) path = `/api${path.startsWith('/') ? '' : '/'}${path}`;
  const query = {};
  if (queryPart) {
    queryPart.split('&').forEach((pair) => {
      const index = pair.indexOf('=');
      const key = decodeURIComponent(index >= 0 ? pair.slice(0, index) : pair);
      const value = decodeURIComponent(index >= 0 ? pair.slice(index + 1) : '');
      if (key) query[key] = value;
    });
  }
  return { path, query };
}

function bootstrapPayload_(db, user, services, token) {
  const { can } = services.auth;
  const payload = {
    user,
    storage: 'Google Sheets',
    property: {
      name: services.common.getSetting(db, 'PropertyName', 'Kos'),
      address: services.common.getSetting(db, 'PropertyAddress', ''),
      phone: services.common.getSetting(db, 'PropertyPhone', ''),
      currency: services.common.getSetting(db, 'Currency', 'IDR'),
      timezone: services.common.getSetting(db, 'Timezone', 'Asia/Jakarta'),
      invoicePrefix: services.common.getSetting(db, 'InvoicePrefix', 'INV'),
      receiptPrefix: services.common.getSetting(db, 'ReceiptPrefix', 'KWT'),
      dueDays: services.common.getSetting(db, 'DefaultDueDays', '5'),
    },
    today: services.util.today(),
    roomTypes: can(user, 'roomTypes', 'read') ? services.rooms.listRoomTypes(db).filter((row) => row.IsActive === 'TRUE') : [],
    rooms: can(user, 'rooms', 'read') ? services.rooms.listRooms(db) : [],
    tenants: can(user, 'tenants', 'read') ? services.tenants.listTenants(db, {}, user) : [],
    services: can(user, 'services', 'read') ? services.serviceOrders.listServices(db) : [],
    staff: can(user, 'staff', 'read')
      ? services.staff.listStaff(db)
      : (user.Role === 'Operational Staff' ? services.staff.listStaff(db).filter((row) => row.StaffID === user.StaffID) : []),
    settings: can(user, 'settings', 'read') ? services.masters.listSettings(db) : [],
    users: can(user, 'users', 'read') ? services.users.listUsers(db) : [],
  };
  if (can(user, 'dashboard', 'read')) {
    try {
      const from = services.util.monthStart();
      const to = services.util.monthEnd();
      const page = dashboardPage_(db, user, services, { from, to });
      writeApiCache_(apiCacheKey_(token || '', '/api/dashboard-page', { from, to }), ok_(page));
    } catch (error) {
      // Dashboard prefetch is best effort; the page falls back to its own request.
    }
  }
  return payload;
}

function dashboardPage_(db, user, services, filters) {
  const { can } = services.auth;
  return {
    dashboard: services.reports.getDashboard(db, filters || {}, user),
    revenue: can(user, 'reports', 'read') ? services.reports.getRevenueSummary(db) : [],
    activities: can(user, 'activities', 'read') ? services.activities.listActivities(db, { status: 'Pending' }, user) : [],
  };
}

function ok_(data) {
  return { ok: true, data };
}

function mutate_(work) {
  return __require('db').withLock(work);
}

const API_CACHE_PREFIX = 'kos_api_';
const API_CACHE_TTL_SECONDS = 30;
const API_CACHE_MAX_CHARS = 45000;

function apiCache_() {
  try {
    const documentCache = CacheService.getDocumentCache();
    if (documentCache) return documentCache;
  } catch (error) {
    // Standalone scripts have no document cache; use the script cache instead.
  }
  return CacheService.getScriptCache();
}

function apiCacheVersion_() {
  try {
    return PropertiesService.getScriptProperties().getProperty('API_CACHE_VERSION') || '0';
  } catch (error) {
    return '0';
  }
}

function apiCacheKey_(token, path, query) {
  const source = `${apiCacheVersion_()}\n${path}\n${JSON.stringify(query || {})}\n${token || ''}`;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, source);
  let hex = '';
  for (let index = 0; index < digest.length; index += 1) {
    const value = digest[index] < 0 ? digest[index] + 256 : digest[index];
    hex += (value < 16 ? '0' : '') + value.toString(16);
  }
  return `${API_CACHE_PREFIX}${hex}`;
}

function readApiCache_(key) {
  try {
    const raw = apiCache_().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeApiCache_(key, result) {
  try {
    const text = JSON.stringify(result);
    if (text.length > API_CACHE_MAX_CHARS) return;
    apiCache_().put(key, text, API_CACHE_TTL_SECONDS);
  } catch (error) {
    // Read responses remain uncached when the script cache is unavailable or full.
  }
}

function handleApi_(token, method, path, q, body) {
  const DB = __require('db');
  const auth = __require('auth');
  const { AppError, today } = __require('util');
  const common = __require('services/common');
  const services = {
    auth,
    common,
    util: __require('util'),
    rooms: __require('services/rooms'),
    tenants: __require('services/tenants'),
    occupancy: __require('services/occupancy'),
    billing: __require('services/billing'),
    payments: __require('services/payments'),
    serviceOrders: __require('services/serviceOrders'),
    expenses: __require('services/expenses'),
    deposits: __require('services/deposits'),
    staff: __require('services/staff'),
    users: __require('services/users'),
    activities: __require('services/activities'),
    masters: __require('services/masters'),
    reports: __require('services/reports'),
    jobs: __require('jobs'),
  };

  if (path === '/api/health') {
    return ok_({ status: 'ok', storage: 'Google Sheets', configured: DB.isConfigured(), time: new Date().toISOString() });
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const db = DB.load();
    const result = auth.login(db, body.email, body.password);
    const fresh = auth.sessionUser(db, result.token);
    return {
      ok: true,
      data: { user: fresh, bootstrap: bootstrapPayload_(db, fresh, services, result.token) },
      token: result.token,
    };
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    auth.logout(token);
    return ok_({ loggedOut: true });
  }

  const db = DB.load();
  if (path === '/api/public-config' && method === 'GET') {
    return ok_({ property: { name: common.getSetting(db, 'PropertyName', 'Kos') } });
  }
  const user = auth.sessionUser(db, token);
  if (!user) throw new AppError('Silakan login terlebih dahulu.', 401, 'UNAUTHORIZED');
  if (path === '/api/auth/me' && method === 'GET') return ok_({ user });

  if (path === '/api/bootstrap' && method === 'GET') {
    auth.guard(user, 'dashboard', 'read');
    return ok_(bootstrapPayload_(db, user, services, token));
  }
  if (path === '/api/dashboard-page' && method === 'GET') {
    auth.guard(user, 'dashboard', 'read');
    return ok_(dashboardPage_(db, user, services, q));
  }
  if (path === '/api/dashboard' && method === 'GET') {
    auth.guard(user, 'dashboard', 'read');
    return ok_(services.reports.getDashboard(db, q, user));
  }

  if (path === '/api/rooms' && method === 'GET') {
    auth.guard(user, 'rooms', 'read');
    return ok_(services.rooms.listRooms(db, q));
  }
  if (path === '/api/rooms' && method === 'POST') {
    auth.guard(user, 'rooms', 'write');
    return ok_(mutate_((tx) => services.rooms.saveRoom(tx, body, user)));
  }
  if (path === '/api/room-types' && method === 'GET') {
    auth.guard(user, 'roomTypes', 'read');
    return ok_(services.rooms.listRoomTypes(db));
  }
  if (path === '/api/room-types' && method === 'POST') {
    auth.guard(user, 'roomTypes', 'write');
    return ok_(mutate_((tx) => services.rooms.saveRoomType(tx, body, user)));
  }

  if (path === '/api/tenants' && method === 'GET') {
    auth.guard(user, 'tenants', 'read');
    return ok_(services.tenants.listTenants(db, q, user));
  }
  if (path === '/api/tenants' && method === 'POST') {
    auth.guard(user, 'tenants', 'write');
    return ok_(mutate_((tx) => services.tenants.saveTenant(tx, body, user)));
  }

  if (path === '/api/reservations' && method === 'GET') {
    auth.guard(user, 'reservations', 'read');
    return ok_(services.occupancy.listReservations(db, q));
  }
  if (path === '/api/reservations' && method === 'POST') {
    auth.guard(user, 'reservations', 'write');
    return ok_(mutate_((tx) => services.occupancy.createReservation(tx, body, user)));
  }
  let match = path.match(/^\/api\/reservations\/([^/]+)$/);
  if (match && method === 'POST') {
    auth.guard(user, 'reservations', 'write');
    return ok_(mutate_((tx) => services.occupancy.updateReservation(tx, match[1], body, user)));
  }

  if (path === '/api/occupancies' && method === 'GET') {
    auth.guard(user, 'agreements', 'read');
    return ok_(services.occupancy.listOccupancies(db, q));
  }
  if (path === '/api/check-in' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.checkInTenant(tx, body, user)));
  }
  if (path === '/api/transfers' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.transferTenant(tx, body, user)));
  }
  if (path === '/api/renew' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.renewAgreement(tx, body, user)));
  }
  if (path === '/api/check-out' && method === 'POST') {
    auth.guard(user, 'agreements', 'write');
    return ok_(mutate_((tx) => services.occupancy.checkOutTenant(tx, body, user)));
  }

  if (path === '/api/invoices' && method === 'GET') {
    auth.guard(user, 'invoices', 'read');
    return ok_(services.billing.listInvoices(db, q));
  }
  if (path === '/api/invoices/generate' && method === 'POST') {
    auth.guard(user, 'invoices', 'generate');
    return ok_(mutate_((tx) => services.billing.generateMonthlyInvoices(tx, { asOf: body.asOf || today(), user: user.StaffID })));
  }
  match = path.match(/^\/api\/invoices\/([^/]+)$/);
  if (match && method === 'GET') {
    auth.guard(user, 'invoices', 'read');
    return ok_(services.billing.getInvoiceDetail(db, match[1]));
  }
  match = path.match(/^\/api\/invoices\/([^/]+)\/(cancel|adjust)$/);
  if (match && method === 'POST') {
    auth.guard(user, 'invoices', 'write');
    if (match[2] === 'cancel') return ok_(mutate_((tx) => services.billing.cancelInvoice(tx, match[1], body.reason, user)));
    return ok_(mutate_((tx) => services.billing.applyInvoiceAdjustment(tx, match[1], body, user)));
  }

  if (path === '/api/payments' && method === 'GET') {
    auth.guard(user, 'payments', 'read');
    return ok_(services.payments.listPayments(db, q));
  }
  if (path === '/api/payments' && method === 'POST') {
    auth.guard(user, 'payments', 'write');
    return ok_(mutate_((tx) => services.payments.recordPayment(tx, body, user)));
  }
  match = path.match(/^\/api\/payments\/([^/]+)$/);
  if (match && method === 'GET') {
    auth.guard(user, 'payments', 'read');
    return ok_(services.payments.getPaymentDetail(db, match[1]));
  }
  match = path.match(/^\/api\/payments\/([^/]+)\/void$/);
  if (match && method === 'POST') {
    auth.guard(user, 'payments', 'void');
    return ok_(mutate_((tx) => services.payments.voidPayment(tx, match[1], body.reason, user)));
  }

  if (path === '/api/services' && method === 'GET') {
    auth.guard(user, 'services', 'read');
    return ok_(services.serviceOrders.listServices(db));
  }
  if (path === '/api/services' && method === 'POST') {
    auth.guard(user, 'services', 'write');
    return ok_(mutate_((tx) => services.serviceOrders.saveService(tx, body, user)));
  }
  if (path === '/api/service-orders' && method === 'GET') {
    auth.guard(user, 'services', 'read');
    return ok_(services.serviceOrders.listServiceOrders(db, q));
  }
  if (path === '/api/service-orders' && method === 'POST') {
    auth.guard(user, 'services', 'write');
    return ok_(mutate_((tx) => services.serviceOrders.createServiceOrder(tx, body, user)));
  }

  if (path === '/api/expenses' && method === 'GET') {
    auth.guard(user, 'expenses', 'read');
    return ok_(services.expenses.listExpenses(db, q));
  }
  if (path === '/api/expenses' && method === 'POST') {
    auth.guard(user, 'expenses', 'write');
    return ok_(mutate_((tx) => services.expenses.saveExpense(tx, body, user)));
  }
  match = path.match(/^\/api\/expenses\/([^/]+)\/cancel$/);
  if (match && method === 'POST') {
    auth.guard(user, 'expenses', 'write');
    return ok_(mutate_((tx) => services.expenses.cancelExpense(tx, match[1], body.reason, user)));
  }

  if (path === '/api/transactions' && method === 'GET') {
    auth.guard(user, 'transactions', 'read');
    let rows = db.transactions.slice();
    if (q.from) rows = rows.filter((row) => row.TransactionDate >= q.from);
    if (q.to) rows = rows.filter((row) => row.TransactionDate <= q.to);
    if (q.type) rows = rows.filter((row) => row.TransactionType === q.type);
    if (q.direction) rows = rows.filter((row) => row.Direction === q.direction);
    rows = rows.map((row) => {
      const tenant = db.tenants.find((item) => item.TenantID === row.TenantID);
      const staff = db.staff.find((item) => item.StaffID === row.StaffID);
      return Object.assign({}, row, { TenantName: tenant ? tenant.FullName : '', StaffName: staff ? staff.FullName : '' });
    }).sort((a, b) => b.TransactionDate.localeCompare(a.TransactionDate) || b.CreatedAt.localeCompare(a.CreatedAt));
    return ok_(rows);
  }

  if (path === '/api/deposits' && method === 'GET') {
    auth.guard(user, 'deposits', 'read');
    return ok_(services.deposits.listDeposits(db, q));
  }
  if (path === '/api/deposits/return' && method === 'POST') {
    auth.guard(user, 'deposits', 'write');
    return ok_(mutate_((tx) => services.deposits.recordDepositReturn(tx, body, user)));
  }

  if (path === '/api/staff' && method === 'GET') {
    auth.guard(user, 'staff', 'read');
    return ok_(services.staff.listStaff(db));
  }
  if (path === '/api/staff' && method === 'POST') {
    auth.guard(user, 'staff', 'write');
    return ok_(mutate_((tx) => services.staff.saveStaff(tx, body, user)));
  }

  if (path === '/api/users' && method === 'GET') {
    auth.guard(user, 'users', 'read');
    return ok_(services.users.listUsers(db));
  }
  if (path === '/api/users' && method === 'POST') {
    auth.guard(user, 'users', 'write');
    return ok_(mutate_((tx) => services.users.saveUser(tx, body, user)));
  }

  if (path === '/api/activities' && method === 'GET') {
    auth.guard(user, 'activities', 'read');
    return ok_(services.activities.listActivities(db, q, user));
  }
  if (path === '/api/activities' && method === 'POST') {
    auth.guard(user, 'activities', 'write');
    return ok_(mutate_((tx) => services.activities.createActivity(tx, body, user)));
  }
  match = path.match(/^\/api\/activities\/([^/]+)$/);
  if (match && method === 'POST') {
    auth.guard(user, 'activities', 'write');
    return ok_(mutate_((tx) => services.activities.updateActivity(tx, match[1], body, user)));
  }

  if (path === '/api/settings' && method === 'GET') {
    auth.guard(user, 'settings', 'read');
    return ok_(services.masters.listSettings(db));
  }
  if (path === '/api/settings' && method === 'POST') {
    auth.guard(user, 'settings', 'write');
    return ok_(mutate_((tx) => services.masters.saveSettings(tx, body.settings || body, user)));
  }
  if (path === '/api/price-list' && method === 'GET') {
    auth.guard(user, 'master', 'read');
    return ok_(services.masters.listPriceList(db));
  }
  if (path === '/api/price-list' && method === 'POST') {
    auth.guard(user, 'master', 'write');
    return ok_(mutate_((tx) => services.masters.savePrice(tx, body, user)));
  }

  if (path === '/api/reports/financial' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getFinancialReport(db, q));
  }
  if (path === '/api/reports/daily' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getDailyReport(db, q.date || today()));
  }
  if (path === '/api/reports/occupancy' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getOccupancyReport(db, q));
  }
  if (path === '/api/reports/statement' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    if (!q.tenantId) throw new AppError('tenantId wajib diisi.');
    return ok_(services.reports.getTenantStatement(db, q.tenantId, { from: q.from, to: q.to }));
  }
  if (path === '/api/reports/reconcile' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.reconcile(db));
  }
  if (path === '/api/reports/revenue' && method === 'GET') {
    auth.guard(user, 'reports', 'read');
    return ok_(services.reports.getRevenueSummary(db));
  }
  if (path === '/api/audit' && method === 'GET') {
    auth.guard(user, 'audit', 'read');
    return ok_(services.masters.listAudit(db, q));
  }
  if (path === '/api/system/logs' && method === 'GET') {
    auth.guard(user, 'audit', 'read');
    return ok_(services.masters.listSystemLog(db));
  }
  if (path === '/api/system/run-jobs' && method === 'POST') {
    auth.guard(user, 'system', 'run');
    return ok_(mutate_((tx) => services.jobs.runBillingJobs(tx, { user: user.StaffID, asOf: body.asOf || today() })));
  }
  if (path === '/api/system/backup' && method === 'POST') {
    auth.guard(user, 'system', 'run');
    return ok_({ file: services.jobs.backupDatabase() });
  }

  throw new AppError('Endpoint tidak ditemukan.', 404, 'NOT_FOUND');
}

function gasApi(token, method, path, body) {
  try {
    const target = parseApiTarget_(path);
    const payload = body && typeof body === 'object' ? body : {};
    const verb = String(method || 'GET').toUpperCase();
    if (verb === 'GET' && target.path !== '/api/health') {
      const key = apiCacheKey_(token || '', target.path, target.query);
      const cached = readApiCache_(key);
      if (cached) return cached;
      const result = handleApi_(token || '', verb, target.path, target.query, payload);
      if (result && result.ok) writeApiCache_(key, result);
      return result;
    }
    return handleApi_(token || '', verb, target.path, target.query, payload);
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Terjadi kesalahan.',
      code: error.code || 'ERROR',
      status: error.status || 400,
    };
  }
}
