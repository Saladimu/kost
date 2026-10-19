'use strict';

async function renderSettings(container, initialTab = 'general') {
  const state = {
    tab: initialTab,
    settings: [],
    prices: [],
    audit: [],
    logs: [],
    lastBackup: '',
  };
  if (!App.can('settings', 'read') && !App.can('master', 'read') && !App.can('audit', 'read') && !App.can('system', 'run')) {
    UI.pageError(container, new Error('Anda tidak memiliki akses ke pengaturan.'));
    return;
  }
  if (!App.can('settings', 'read') && state.tab === 'general') state.tab = App.can('master', 'read') ? 'pricing' : App.can('audit', 'read') ? 'audit' : 'system';

  UI.loading(container);
  try { await load(); } catch (error) { UI.pageError(container, error); }

  async function load() {
    const [settings, prices, audit, logs] = await Promise.all([
      App.can('settings', 'read') ? API.get('/settings') : Promise.resolve([]),
      App.can('master', 'read') ? API.get('/price-list') : Promise.resolve([]),
      App.can('audit', 'read') ? API.get('/audit') : Promise.resolve([]),
      App.can('audit', 'read') ? API.get('/system/logs') : Promise.resolve([]),
    ]);
    state.settings = settings;
    state.prices = prices;
    state.audit = audit;
    state.logs = logs;
    render();
  }

  function setting(key, fallback = '') {
    const found = state.settings.find((s) => s.SettingKey === key);
    return found ? found.SettingValue : fallback;
  }

  function render() {
    const generalAllowed = App.can('settings', 'read');
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Pengaturan & Master</h1><p>Identitas properti, kebijakan tagihan, daftar harga, jejak audit, dan pemeliharaan sistem.</p></div>
        <div class="page-actions">
          ${state.tab === 'pricing' && App.can('master', 'write') ? '<button class="btn btn-primary" type="button" id="new-price">Tambah harga</button>' : ''}
          ${state.tab === 'system' && App.can('system', 'run') ? '<button class="btn" type="button" id="run-jobs">Jalankan tagihan harian</button><button class="btn btn-primary" type="button" id="backup-db">Backup data</button>' : ''}
        </div>
      </div>
      <div class="tabs">
        ${generalAllowed ? `<button class="tab ${state.tab === 'general' ? 'active' : ''}" type="button" data-tab="general">Umum & Kebijakan</button>` : ''}
        ${App.can('master', 'read') ? `<button class="tab ${state.tab === 'pricing' ? 'active' : ''}" type="button" data-tab="pricing">Daftar Harga</button>` : ''}
        ${App.can('audit', 'read') ? `<button class="tab ${state.tab === 'audit' ? 'active' : ''}" type="button" data-tab="audit">Jejak Audit</button>` : ''}
        ${App.can('system', 'run') || App.can('audit', 'read') ? `<button class="tab ${state.tab === 'system' ? 'active' : ''}" type="button" data-tab="system">Sistem</button>` : ''}
      </div>
      <div id="settings-content" class="mt-16"></div>
    `;
    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; render(); }));
    if (state.tab === 'general') renderGeneral();
    else if (state.tab === 'pricing') renderPricing();
    else if (state.tab === 'audit') renderAudit();
    else renderSystem();
    const priceBtn = container.querySelector('#new-price');
    if (priceBtn) priceBtn.addEventListener('click', () => openPriceForm(null));
    const jobsBtn = container.querySelector('#run-jobs');
    if (jobsBtn) jobsBtn.addEventListener('click', runJobs);
    const backupBtn = container.querySelector('#backup-db');
    if (backupBtn) backupBtn.addEventListener('click', backup);
  }

  function renderGeneral() {
    const host = container.querySelector('#settings-content');
    const editable = App.can('settings', 'write');
    host.innerHTML = `<form id="settings-form">
      <div class="grid grid-2">
        <div class="card"><div class="card-head"><h3>Identitas properti</h3></div><div class="card-body">
          ${field('PropertyName', 'Nama properti', 'text', editable)}
          ${field('PropertyAddress', 'Alamat', 'text', editable)}
          ${field('PropertyPhone', 'Telepon', 'text', editable)}
          ${field('Currency', 'Mata uang', 'text', editable, 'readonly')}
          ${field('Timezone', 'Zona waktu', 'text', editable, 'readonly')}
          ${field('CompanyFooter', 'Footer dokumen', 'textarea', editable)}
        </div></div>
        <div class="card"><div class="card-head"><h3>Penomoran dokumen</h3></div><div class="card-body">
          ${field('InvoicePrefix', 'Prefix invoice', 'text', editable)}
          ${field('ReceiptPrefix', 'Prefix kuitansi', 'text', editable)}
          ${field('DefaultDueDays', 'Jatuh tempo (hari)', 'number', editable)}
          ${field('BillingAdvanceDays', 'Invoice dibuat sebelum periode (hari)', 'number', editable)}
          ${field('ReminderIntervalDays', 'Jeda pengingat (hari)', 'number', editable)}
        </div></div>
        <div class="card"><div class="card-head"><h3>Kebijakan tagihan</h3></div><div class="card-body">
          ${selectField('ProrateMidMonth', 'Prorata check-in/check-out tengah bulan', [['false', 'Tidak aktif'], ['true', 'Aktif']], editable)}
          ${selectField('LateFeeEnabled', 'Denda keterlambatan', [['false', 'Tidak aktif'], ['true', 'Aktif']], editable)}
          ${field('LateFeePercent', 'Persentase denda (%)', 'number', editable)}
          ${field('BillingPolicy', 'Kebijakan sewa', 'textarea', editable)}
        </div></div>
        <div class="card"><div class="card-head"><h3>Kebijakan pembayaran</h3></div><div class="card-body">
          ${field('PaymentPolicy', 'Kebijakan pembayaran', 'textarea', editable)}
          ${field('DepositPolicy', 'Kebijakan deposit', 'textarea', editable)}
          <div class="notice mt-16">Perubahan pengaturan dicatat pada jejak audit dan hanya memengaruhi transaksi baru.</div>
        </div></div>
      </div>
      ${editable ? '<div class="page-actions mt-16"><button class="btn btn-primary" type="submit">Simpan pengaturan</button></div>' : '<div class="notice mt-16">Anda memiliki akses baca saja untuk pengaturan.</div>'}
    </form>`;
    const form = host.querySelector('#settings-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        state.settings = await API.post('/settings', { settings: values });
        UI.toast('Pengaturan disimpan.');
        await App.refreshMeta();
        render();
      } catch (error) { UI.toast(error.message, 'error'); }
    });
  }

  function field(key, label, type, editable, extra = '') {
    const value = UI.esc(setting(key));
    const disabled = editable ? '' : 'disabled';
    if (type === 'textarea') return `<label class="field"><span>${UI.esc(label)}</span><textarea name="${key}" rows="3" ${disabled}>${value}</textarea></label>`;
    return `<label class="field"><span>${UI.esc(label)}</span><input type="${type}" name="${key}" value="${value}" ${disabled} ${extra}></label>`;
  }

  function selectField(key, label, options, editable) {
    const current = setting(key, 'false');
    return `<label class="field"><span>${UI.esc(label)}</span><select name="${key}" ${editable ? '' : 'disabled'}>${options.map(([value, text]) => `<option value="${value}" ${current === value ? 'selected' : ''}>${UI.esc(text)}</option>`).join('')}</select></label>`;
  }

  function renderPricing() {
    const host = container.querySelector('#settings-content');
    host.innerHTML = '<div id="price-table"></div>';
    const tableHost = host.querySelector('#price-table');
    UI.table(tableHost, {
      rows: state.prices,
      searchKeys: ['ItemName', 'ItemCode', 'ItemCategory', 'BillingUnit'],
      searchPlaceholder: 'Cari item, kategori...',
      exportName: 'daftar-harga',
      rowKey: (row) => row.PriceID,
      columns: [
        { key: 'ItemName', label: 'Item', render: (row) => `<strong>${UI.esc(row.ItemName)}</strong><span class="sub">${UI.esc(row.ItemCode)} &middot; ${UI.esc(row.ItemCategory)}</span>` },
        { key: 'BillingUnit', label: 'Satuan' },
        { key: 'StandardPrice', label: 'Harga standar', className: 'numeric', render: (row) => `<strong>${UI.currency(row.StandardPrice)}</strong>` },
        { key: 'EffectiveFrom', label: 'Berlaku dari', render: (row) => UI.date(row.EffectiveFrom) },
        { key: 'EffectiveTo', label: 'Berlaku sampai', render: (row) => row.EffectiveTo ? UI.date(row.EffectiveTo) : 'Tanpa batas' },
        { key: 'IsActive', label: 'Status', render: (row) => UI.badge(row.IsActive === 'TRUE' ? 'Active' : 'Inactive') },
        { key: 'actions', label: '', sortable: false, render: () => App.can('master', 'write') ? '<button class="btn btn-sm" type="button" data-act="edit">Ubah</button>' : '' },
      ],
      onAction: (action, row) => { if (action === 'edit') openPriceForm(row); },
    });
  }

  function renderAudit() {
    const host = container.querySelector('#settings-content');
    host.innerHTML = '<div id="audit-table"></div>';
    UI.table(host.querySelector('#audit-table'), {
      rows: state.audit,
      searchKeys: ['Action', 'Module', 'RecordID', 'UserID', 'Reason'],
      searchPlaceholder: 'Cari aksi, modul, record, pengguna...',
      exportName: 'jejak-audit',
      rowKey: (row) => row.AuditID,
      pageSize: 15,
      defaultSort: 'Timestamp',
      defaultSortDir: 'desc',
      columns: [
        { key: 'Timestamp', label: 'Waktu', render: (row) => UI.dateTime(row.Timestamp) },
        { key: 'Action', label: 'Aksi', render: (row) => `<strong>${UI.esc(row.Action)}</strong><span class="sub">${UI.esc(row.Module)} &middot; ${UI.esc(row.RecordID)}</span>` },
        { key: 'UserName', label: 'Pengguna', render: (row) => UI.esc(row.UserName || row.UserID || 'SYSTEM') },
        { key: 'Reason', label: 'Alasan', render: (row) => UI.esc(row.Reason || '-') },
      ],
    });
  }

  function renderSystem() {
    const host = container.querySelector('#settings-content');
    host.innerHTML = `
      <div class="grid grid-2">
        <div class="card"><div class="card-head"><h3>Pemeliharaan data</h3></div><div class="card-body">
          <p class="small muted">Jalankan proses tagihan harian secara manual atau buat salinan basis data. Proses tagihan bersifat idempoten sehingga aman dijalankan berulang.</p>
          <div class="flex mt-16">${App.can('system', 'run') ? '<button class="btn btn-primary" type="button" id="sys-jobs">Jalankan tagihan</button><button class="btn" type="button" id="sys-backup">Backup sekarang</button>' : '<span class="small muted">Akses tindakan sistem terbatas untuk Owner/Manager.</span>'}</div>
          ${state.lastBackup ? `<div class="notice ok mt-16">Backup dibuat: ${UI.esc(state.lastBackup)}</div>` : ''}
        </div></div>
        <div class="card"><div class="card-head"><h3>Kebijakan operasional</h3></div><div class="card-body">
          <div class="report-row"><span>Zona waktu</span><span>${UI.esc(setting('Timezone', 'Asia/Jakarta'))}</span></div>
          <div class="report-row"><span>Prorata</span><span>${setting('ProrateMidMonth') === 'true' ? 'Aktif' : 'Tidak aktif'}</span></div>
          <div class="report-row"><span>Denda keterlambatan</span><span>${setting('LateFeeEnabled') === 'true' ? `${setting('LateFeePercent')}%` : 'Tidak aktif'}</span></div>
          <div class="report-row"><span>Jatuh tempo</span><span>${UI.esc(setting('DefaultDueDays', '5'))} hari</span></div>
        </div></div>
      </div>
      <div class="card mt-16"><div class="card-head"><h3>Log sistem</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Waktu</th><th>Level</th><th>Sumber</th><th>Pesan</th></tr></thead><tbody>
        ${state.logs.length ? state.logs.slice(0, 60).map((log) => `<tr><td>${UI.dateTime(log.Timestamp)}</td><td>${UI.badge(log.Level === 'ERROR' ? 'Overdue' : log.Level === 'WARN' ? 'Pending' : 'Issued', log.Level)}</td><td>${UI.esc(log.Source || '-')}</td><td>${UI.esc(log.Message)}</td></tr>`).join('') : `<tr><td colspan="4">${UI.emptyState('Belum ada log', 'Log sistem akan tampil di sini.')}</td></tr>`}
      </tbody></table></div></div>`;
    const jobsBtn = host.querySelector('#sys-jobs');
    if (jobsBtn) jobsBtn.addEventListener('click', runJobs);
    const backupBtn = host.querySelector('#sys-backup');
    if (backupBtn) backupBtn.addEventListener('click', backup);
  }

  async function runJobs() {
    try {
      const result = await API.post('/system/run-jobs', {});
      const created = result.billing && result.billing.count ? result.billing.count : 0;
      UI.toast(`Tagihan dijalankan. ${created ? `${created} invoice baru dibuat.` : 'Tidak ada invoice baru.'}`, 'success', 'Proses selesai');
      state.logs = App.can('audit', 'read') ? await API.get('/system/logs') : state.logs;
      render();
    } catch (error) { UI.toast(error.message, 'error'); }
  }

  async function backup() {
    try {
      const result = await API.post('/system/backup', {});
      state.lastBackup = result.file;
      UI.toast(`Backup tersimpan di ${result.file}.`, 'success', 'Backup selesai');
      render();
    } catch (error) { UI.toast(error.message, 'error'); }
  }

  function openPriceForm(price) {
    const isEdit = !!price;
    UI.formModal({
      title: isEdit ? `Ubah ${price.ItemName}` : 'Tambah daftar harga',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field"><span>Nama item <em>*</em></span><input name="ItemName" required value="${UI.esc(price ? price.ItemName : '')}"></label>
        <label class="field"><span>Kode item</span><input name="ItemCode" value="${UI.esc(price ? price.ItemCode : '')}"></label>
        <label class="field"><span>Kategori <em>*</em></span><select name="ItemCategory" required>${['Room Rental', 'Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'].map((cat) => `<option ${price && price.ItemCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></label>
        <label class="field"><span>Satuan</span><input name="BillingUnit" value="${UI.esc(price ? price.BillingUnit : 'bulan')}" placeholder="bulan / kg / kali"></label>
        <label class="field"><span>Harga standar (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="StandardPrice" required value="${price ? price.StandardPrice : ''}"></label>
        <label class="field"><span>Berlaku dari <em>*</em></span><input type="date" name="EffectiveFrom" required value="${UI.esc(price ? price.EffectiveFrom : UI.todayISO())}"></label>
        <label class="field"><span>Berlaku sampai</span><input type="date" name="EffectiveTo" value="${UI.esc(price ? price.EffectiveTo : '')}"></label>
        ${isEdit ? `<label class="field"><span>Status</span><select name="IsActive"><option value="TRUE" ${price.IsActive === 'TRUE' ? 'selected' : ''}>Aktif</option><option value="FALSE" ${price.IsActive === 'FALSE' ? 'selected' : ''}>Nonaktif</option></select></label>` : ''}
        <label class="field full"><span>Catatan</span><textarea name="Notes">${UI.esc(price ? price.Notes : '')}</textarea></label>
      </div>`,
      submitText: isEdit ? 'Simpan perubahan' : 'Tambah harga',
      onSubmit: async (values) => {
        if (isEdit) values.PriceID = price.PriceID;
        await API.post('/price-list', values);
        UI.toast(isEdit ? 'Harga diperbarui.' : 'Harga ditambahkan.');
        state.prices = await API.get('/price-list');
        render();
      },
    });
  }
}

App.registerPage('settings', (container) => renderSettings(container, 'general'));
App.registerPage('master-data', (container) => renderSettings(container, 'pricing'));
