const SETUP_HTML = '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Setup Sistem Operasional Kos</title><style>body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:40px}main{max-width:680px;margin:0 auto;background:#1e293b;padding:32px;border-radius:16px}h1{margin-top:0;color:#5eead4}code{background:#0f172a;padding:2px 6px;border-radius:4px}ol{line-height:1.9}</style></head><body><main><h1>Setup diperlukan</h1><p>Google Sheets belum terhubung ke aplikasi ini.</p><ol><li>Buka editor Apps Script.</li><li>Jalankan fungsi <code>setup()</code> satu kali.</li><li>Izinkan akses Spreadsheet, Drive, dan Triggers.</li><li>Deploy ulang sebagai Web App dan buka URL deployment.</li></ol><p>Fungsi <code>setup()</code> membuat spreadsheet baru, seluruh tab, data awal, dan trigger harian.</p></main></body></html>';

const SCRIPT_END = '</' + 'script>';

function bridgeResponseHtml(result, id, origin) {
  const safeResult = JSON.stringify(result).replace(/</g, '\\u003c');
  const safeId = JSON.stringify(String(id || ''));
  const safeOrigin = JSON.stringify(String(origin || '*'));
  return '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>KOS Bridge</title>' +
    '<style>html,body{margin:0;padding:0;background:transparent}</style></head><body>' +
    '<' + 'script>(function(){try{window.top.postMessage({channel:"kos-bridge",type:"response",id:' +
    safeId + ',result:' + safeResult + '},' + safeOrigin + ');}catch(error){}})();' + SCRIPT_END +
    '</body></html>';
}

function setup() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty('SPREADSHEET_ID');
  let spreadsheet;
  if (!id) {
    spreadsheet = SpreadsheetApp.create('Sistem Operasional Kos - Production DB');
    id = spreadsheet.getId();
    properties.setProperty('SPREADSHEET_ID', id);
  } else {
    spreadsheet = SpreadsheetApp.openById(id);
  }

  const db = __require('db').load();
  if (!db.meta.demoPaymentsSeeded) {
    __require('bootstrap').seedDemoOperations(db);
  }
  __require('jobs').installTriggers();

  const webUrl = ScriptApp.getService().getUrl() || '(deploy sebagai Web App untuk mendapatkan URL)';
  return [
    'Setup selesai.',
    `SPREADSHEET_ID: ${id}`,
    `Spreadsheet: ${spreadsheet.getUrl()}`,
    `Web App: ${webUrl}`,
    'Langkah berikutnya: ganti password akun demo, lalu deploy sebagai Web App dengan akses "Anyone".',
  ].join('\n');
}


function setupProduction() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty('SPREADSHEET_ID');
  let spreadsheet;
  if (!id) {
    spreadsheet = SpreadsheetApp.create('Sistem Operasional Kos - Production DB');
    id = spreadsheet.getId();
    properties.setProperty('SPREADSHEET_ID', id);
  } else {
    spreadsheet = SpreadsheetApp.openById(id);
  }

  const db = __require('db').load({ seed: false });
  if (db.users.length > 0) {
    throw new Error('Spreadsheet ini sudah memiliki pengguna. Gunakan spreadsheet baru untuk setup produksi.');
  }
  const email = String(properties.getProperty('OWNER_EMAIL') || '').trim().toLowerCase();
  const password = String(properties.getProperty('OWNER_PASSWORD') || '');
  const name = String(properties.getProperty('OWNER_NAME') || 'Owner').trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error('Atur Script Property OWNER_EMAIL dengan alamat email owner yang valid.');
  }
  if (password.length < 8) {
    throw new Error('Atur Script Property OWNER_PASSWORD minimal 8 karakter.');
  }

  const util = __require('util');
  const now = util.nowISO();
  const staffId = util.makeId(db, 'staff', 'STF');
  db.staff.push({
    StaffID: staffId, FullName: name, Position: 'Owner', Phone: '', Email: email,
    StartDate: util.today(), EndDate: '', EmploymentStatus: 'Active', AppRole: 'Owner',
    Notes: 'Akun owner produksi',
  });
  db.users.push({
    UserID: util.makeId(db, 'user', 'USR'), StaffID: staffId, Email: email,
    PasswordHash: __require('password').hashPassword(password), Role: 'Owner',
    IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
  });
  db.settings = [
    ['PropertyName', 'Kos', 'Nama properti yang tampil pada invoice dan kuitansi'],
    ['PropertyAddress', '', 'Alamat properti'],
    ['PropertyPhone', '', 'Nomor telepon properti'],
    ['Currency', 'IDR', 'Mata uang transaksi'],
    ['Timezone', 'Asia/Jakarta', 'Zona waktu operasional'],
    ['InvoicePrefix', 'INV', 'Prefix nomor invoice'],
    ['ReceiptPrefix', 'KWT', 'Prefix nomor kuitansi'],
    ['DefaultDueDays', '5', 'Jatuh tempo invoice dalam hari sejak awal periode'],
    ['BillingAdvanceDays', '0', 'Invoice dibuat berapa hari sebelum periode dimulai'],
    ['ReminderIntervalDays', '7', 'Jeda minimum pengingat tagihan yang sama'],
    ['ProrateMidMonth', 'false', 'Kebijakan prorata untuk check-in/check-out di tengah bulan'],
    ['LateFeeEnabled', 'false', 'Denda keterlambatan hanya aktif jika owner mengaktifkan'],
    ['LateFeePercent', '0', 'Persentase denda keterlambatan (jika diaktifkan)'],
    ['DepositPolicy', 'Deposit dikembalikan setelah inspeksi kamar dan pelunasan tagihan.'],
    ['BillingPolicy', 'Sewa dibebankan penuh per periode bulanan sejak tanggal check-in.'],
    ['PaymentPolicy', 'Kelebihan pembayaran dicatat sebagai kredit penghuni.'],
    ['CompanyFooter', ''],
  ].map(([key, value, description]) => ({
    SettingKey: key, SettingValue: value, Description: description, UpdatedAt: now, UpdatedBy: 'SYSTEM',
  }));
  db.meta.createdAt = now;
  db.meta.demoPaymentsSeeded = true;
  __require('db').save(db);
  properties.deleteProperty('OWNER_PASSWORD');
  __require('jobs').installTriggers();

  const webUrl = ScriptApp.getService().getUrl() || '(deploy sebagai Web App untuk mendapatkan URL)';
  return [
    'Setup produksi selesai.',
    `SPREADSHEET_ID: ${id}`,
    `Spreadsheet: ${spreadsheet.getUrl()}`,
    `Web App: ${webUrl}`,
    `Owner: ${email}`,
    'Password owner telah dihapus dari Script Properties. Deploy ulang sebagai Web App.',
  ].join('\n');
}

function health() {
  return { status: 'ok', configured: __require('db').isConfigured(), time: new Date().toISOString() };
}

function dailyJobs() {
  return __require('jobs').dailyJobs();
}

function doGet(event) {
  const params = (event && event.parameter) || {};
  if (params.route || params.api) {
    const result = gasApi(
      params.token || '',
      params.method || 'GET',
      params.route || params.api,
      params
    );
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  if (!__require('db').isConfigured()) {
    return HtmlService.createHtmlOutput(SETUP_HTML).setTitle('Setup Sistem Operasional Kos');
  }
  return HtmlService.createHtmlOutput(FRONTEND_HTML)
    .setTitle('Sistem Operasional Kos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(event) {
  const params = (event && event.parameter) || {};
  let payload = {};
  try {
    if (event && event.postData && event.postData.contents) payload = JSON.parse(event.postData.contents);
  } catch (error) {
    payload = {};
  }
  if ((!payload || !payload.path) && params.payload) {
    try { payload = JSON.parse(params.payload); } catch (error) { payload = {}; }
  }
  const result = gasApi(
    payload.token || params.token || '',
    payload.method || params.method || 'POST',
    payload.path || params.path || '/',
    payload.body || payload.data || {}
  );
  if (params.bridgeResponse === '1') {
    return HtmlService.createHtmlOutput(bridgeResponseHtml(result, params.id, payload.origin || params.origin))
      .setTitle('KOS Bridge')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
