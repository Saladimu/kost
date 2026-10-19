'use strict';

App.registerPage('reports', async (container) => {
  const state = {
    tab: 'financial',
    from: UI.monthStartISO(),
    to: UI.monthEndISO(),
    date: UI.todayISO(),
    tenantId: '',
    tenants: [],
    data: null,
  };
  UI.loading(container);
  try {
    if (App.can('tenants', 'read')) state.tenants = await API.get('/tenants');
    state.tenantId = (state.tenants.find((t) => t.TenantStatus === 'Active') || state.tenants[0] || {}).TenantID || '';
    await load();
  } catch (error) { UI.pageError(container, error); }

  async function load() {
    if (state.tab === 'financial') state.data = await API.get('/reports/financial', { from: state.from, to: state.to });
    else if (state.tab === 'daily') state.data = await API.get('/reports/daily', { date: state.date });
    else if (state.tab === 'occupancy') state.data = await API.get('/reports/occupancy', { from: state.from, to: state.to });
    else if (state.tab === 'statement') {
      if (!state.tenantId) { state.data = null; }
      else state.data = await API.get('/reports/statement', { tenantId: state.tenantId, from: state.from, to: state.to });
    } else if (state.tab === 'reconcile') state.data = await API.get('/reports/reconcile');
    render();
  }

  function render() {
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Laporan</h1><p>Laporan keuangan, harian, hunian, kartu penghuni, dan pemeriksaan konsistensi pembukuan.</p></div>
        <div class="page-actions"><button class="btn" type="button" id="print-report">Cetak laporan</button></div>
      </div>
      <div class="tabs">
        ${tabButton('financial', 'Keuangan')}
        ${tabButton('daily', 'Harian')}
        ${tabButton('occupancy', 'Hunian')}
        ${tabButton('statement', 'Kartu Penghuni')}
        ${tabButton('reconcile', 'Rekonsiliasi')}
      </div>
      <div class="card mt-16 filter-bar" id="report-filters"></div>
      <div id="report-content" class="mt-16"></div>
    `;
    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {
      state.tab = button.dataset.tab;
      UI.loading(container.querySelector('#report-content'));
      try { await load(); } catch (error) { UI.pageError(container.querySelector('#report-content'), error); }
    }));
    const print = container.querySelector('#print-report');
    if (print) print.addEventListener('click', printReport);
    renderFilters();
    renderContent();
  }

  function tabButton(key, label) {
    return `<button class="tab ${state.tab === key ? 'active' : ''}" type="button" data-tab="${key}">${label}</button>`;
  }

  function renderFilters() {
    const host = container.querySelector('#report-filters');
    if (state.tab === 'daily') {
      host.innerHTML = `<div class="flex flex-wrap" style="align-items:flex-end;gap:12px"><label class="field inline"><span>Tanggal laporan</span><input type="date" id="report-date" value="${state.date}"></label><button class="btn btn-sm btn-primary" type="button" id="apply-filter">Tampilkan</button></div>`;
    } else if (state.tab === 'statement') {
      host.innerHTML = `<div class="flex flex-wrap" style="align-items:flex-end;gap:12px">
        <label class="field inline"><span>Penghuni</span><select id="report-tenant">${state.tenants.map((t) => `<option value="${t.TenantID}" ${t.TenantID === state.tenantId ? 'selected' : ''}>${UI.esc(t.FullName)} &middot; ${UI.esc(t.RoomNumber || 'tanpa kamar')}</option>`).join('')}</select></label>
        <label class="field inline"><span>Dari</span><input type="date" id="report-from" value="${state.from}"></label>
        <label class="field inline"><span>Sampai</span><input type="date" id="report-to" value="${state.to}"></label>
        <button class="btn btn-sm btn-primary" type="button" id="apply-filter">Tampilkan</button>
      </div>`;
    } else if (state.tab === 'reconcile') {
      host.innerHTML = `<div class="flex" style="justify-content:space-between;align-items:center;gap:12px"><span class="small muted">Pemeriksaan dijalankan terhadap saldo invoice, alokasi pembayaran, kredit, dan deposit.</span><button class="btn btn-sm btn-primary" type="button" id="apply-filter">Periksa ulang</button></div>`;
    } else {
      host.innerHTML = `<div class="flex flex-wrap" style="align-items:flex-end;gap:12px">
        <label class="field inline"><span>Dari</span><input type="date" id="report-from" value="${state.from}"></label>
        <label class="field inline"><span>Sampai</span><input type="date" id="report-to" value="${state.to}"></label>
        <button class="btn btn-sm btn-primary" type="button" id="apply-filter">Tampilkan</button>
        <button class="btn btn-sm" type="button" data-preset="month">Bulan ini</button>
        <button class="btn btn-sm" type="button" data-preset="last">Bulan lalu</button>
      </div>`;
    }
    const apply = host.querySelector('#apply-filter');
    if (apply) apply.addEventListener('click', async () => {
      if (state.tab === 'daily') state.date = host.querySelector('#report-date').value;
      else if (state.tab === 'statement') {
        state.tenantId = host.querySelector('#report-tenant').value;
        state.from = host.querySelector('#report-from').value;
        state.to = host.querySelector('#report-to').value;
      } else if (state.tab !== 'reconcile') {
        state.from = host.querySelector('#report-from').value;
        state.to = host.querySelector('#report-to').value;
      }
      UI.loading(container.querySelector('#report-content'));
      try { await load(); } catch (error) { UI.pageError(container.querySelector('#report-content'), error); }
    });
    host.querySelectorAll('[data-preset]').forEach((button) => button.addEventListener('click', async () => {
      const offset = button.dataset.preset === 'last' ? -1 : 0;
      state.from = UI.monthStartISO(offset);
      state.to = UI.monthEndISO(offset);
      UI.loading(container.querySelector('#report-content'));
      try { await load(); } catch (error) { UI.pageError(container.querySelector('#report-content'), error); }
    }));
  }

  function renderContent() {
    const host = container.querySelector('#report-content');
    if (!host) return;
    if (state.tab === 'financial') renderFinancial(host);
    else if (state.tab === 'daily') renderDaily(host);
    else if (state.tab === 'occupancy') renderOccupancy(host);
    else if (state.tab === 'statement') renderStatement(host);
    else renderReconcile(host);
  }

  function summaryCard(label, value, foot, tone = '') {
    return `<div class="stat-card ${tone}"><div class="stat-label">${UI.esc(label)}</div><div class="stat-value" style="font-size:20px">${value}</div><div class="stat-foot">${foot || ''}</div></div>`;
  }

  function breakdown(title, entries, tone = '') {
    const total = Object.values(entries).reduce((s, v) => s + Number(v), 0);
    const rows = Object.entries(entries).sort((a, b) => b[1] - a[1]);
    return `<div class="card"><div class="card-head"><h3>${UI.esc(title)}</h3><span class="small muted">${UI.currency(total)}</span></div><div class="card-body">
      ${rows.length ? rows.map(([label, value]) => `<div class="report-row"><span>${UI.esc(label)}</span><span class="numeric">${UI.currency(value)}</span><div class="progress"><span style="width:${total ? (value / total) * 100 : 0}%" class="${tone}"></span></div></div>`).join('') : '<div class="notice">Belum ada data pada periode ini.</div>'}
    </div></div>`;
  }

  function renderFinancial(host) {
    const d = state.data;
    const s = d.summary;
    const receivables = d.receivableByTenant.slice(0, 8);
    host.innerHTML = `
      <div class="grid grid-4">
        ${summaryCard('Invoice diterbitkan', UI.currency(s.invoiceTotal), `${s.invoicesIssued} invoice`)}
        ${summaryCard('Penerimaan pembayaran', UI.currency(s.paymentsReceived), `${s.paymentCount} kuitansi`, 'blue')}
        ${summaryCard('Pengeluaran dibayar', UI.currency(s.expensesPaid), `${s.expenseCount} transaksi`, 'amber')}
        ${summaryCard('Arus kas bersih', UI.currency(s.netCashFlow), `Masuk ${UI.currency(s.cashIn)} &middot; keluar ${UI.currency(s.cashOut)}`, s.netCashFlow < 0 ? 'red' : '')}
      </div>
      <div class="grid grid-2 mt-16">
        ${breakdown('Pendapatan per tipe kamar', d.revenueByRoomType)}
        ${breakdown('Pengeluaran per kategori', d.expenseByCategory, 'amber')}
      </div>
      <div class="grid grid-2 mt-16">
        <div class="card"><div class="card-head"><h3>Piutang per penghuni</h3><span class="small muted">Total ${UI.currency(s.outstandingReceivables)}</span></div>
          <div class="table-wrap"><table class="data"><thead><tr><th>Penghuni</th><th class="numeric">Invoice terbuka</th><th class="numeric">Piutang</th><th class="numeric">Jatuh tempo</th></tr></thead><tbody>
          ${receivables.length ? receivables.map((r) => `<tr><td>${UI.esc(r.TenantName)}</td><td class="numeric">${r.InvoiceCount}</td><td class="numeric strong">${UI.currency(r.Outstanding)}</td><td class="numeric" style="color:#b42318">${UI.currency(r.Overdue)}</td></tr>`).join('') : `<tr><td colspan="4">${UI.emptyState('Tidak ada piutang', 'Semua invoice pada periode ini sudah lunas.')}</td></tr>`}
          </tbody></table></div>
        </div>
        <div class="card"><div class="card-head"><h3>Ringkasan kewajiban</h3></div><div class="card-body">
          <div class="report-row"><span>Deposit ditahan</span><span class="numeric">${UI.currency(s.depositLiabilities)}</span></div>
          <div class="report-row"><span>Total piutang berjalan</span><span class="numeric">${UI.currency(s.outstandingReceivables)}</span></div>
          <div class="report-row"><span>Piutang jatuh tempo</span><span class="numeric" style="color:#b42318">${UI.currency(s.overdueAmount)}</span></div>
          <div class="report-row"><span>Pendapatan sewa</span><span class="numeric">${UI.currency(s.rentalInvoiced)}</span></div>
          <div class="report-row"><span>Pendapatan layanan</span><span class="numeric">${UI.currency(s.serviceInvoiced)}</span></div>
        </div></div>
      </div>`;
  }

  function renderDaily(host) {
    const d = state.data;
    host.innerHTML = `
      <div class="grid grid-3">
        ${summaryCard('Penerimaan', UI.currency(d.summary.paymentTotal), `${d.payments.length} pembayaran`)}
        ${summaryCard('Pengeluaran', UI.currency(d.summary.expenseTotal), `${d.expenses.length} pengeluaran`, 'amber')}
        ${summaryCard('Kas bersih', UI.currency(d.summary.net), `Masuk ${UI.currency(d.summary.cashIn)} &middot; keluar ${UI.currency(d.summary.cashOut)}`, d.summary.net < 0 ? 'red' : 'blue')}
      </div>
      <div class="grid grid-2 mt-16">
        <div class="card"><div class="card-head"><h3>Pembayaran ${UI.date(d.date)}</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Kuitansi</th><th>Penghuni</th><th>Metode</th><th class="numeric">Jumlah</th></tr></thead><tbody>
          ${d.payments.length ? d.payments.map((p) => `<tr><td class="strong">${UI.esc(p.ReceiptNumber)}</td><td>${UI.esc(p.TenantName)}</td><td>${UI.esc(p.PaymentMethod)}</td><td class="numeric">${UI.currency(p.AmountReceived)}</td></tr>`).join('') : `<tr><td colspan="4">${UI.emptyState('Tidak ada pembayaran', 'Belum ada penerimaan pada tanggal ini.')}</td></tr>`}
        </tbody></table></div></div>
        <div class="card"><div class="card-head"><h3>Pengeluaran ${UI.date(d.date)}</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Deskripsi</th><th>Kategori</th><th class="numeric">Jumlah</th></tr></thead><tbody>
          ${d.expenses.length ? d.expenses.map((e) => `<tr><td class="strong">${UI.esc(e.Description)}</td><td>${UI.esc(e.Category)}</td><td class="numeric">${UI.currency(e.TotalAmount)}</td></tr>`).join('') : `<tr><td colspan="3">${UI.emptyState('Tidak ada pengeluaran', 'Belum ada biaya dibayar pada tanggal ini.')}</td></tr>`}
        </tbody></table></div></div>
      </div>`;
  }

  function renderOccupancy(host) {
    const d = state.data;
    host.innerHTML = `
      <div class="grid grid-4">
        ${summaryCard('Tingkat hunian', `${d.summary.occupancyRate}%`, `${d.summary.occupied} dari ${d.summary.activeRooms} kamar aktif`)}
        ${summaryCard('Total kamar', d.summary.totalRooms, 'Seluruh kamar terdaftar', 'blue')}
        ${summaryCard('Kamar aktif', d.summary.activeRooms, `${d.summary.totalRooms - d.summary.activeRooms} nonaktif`, 'purple')}
        ${summaryCard('Terisi', d.summary.occupied, `${d.summary.activeRooms - d.summary.occupied} belum terisi`, 'amber')}
      </div>
      <div class="mt-16" id="occupancy-table"></div>`;
    const tableHost = document.createElement('div');
    host.querySelector('#occupancy-table').appendChild(tableHost);
    UI.table(tableHost, {
      rows: d.rooms,
      searchKeys: ['RoomNumber', 'RoomTypeName', 'AvailabilityStatus'],
      searchPlaceholder: 'Cari kamar, tipe, status...',
      exportName: 'laporan-hunian',
      rowKey: (row) => row.RoomID,
      pageSize: 12,
      columns: [
        { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong><span class="sub">${UI.esc(row.RoomTypeName || '')}</span>` },
        { key: 'AvailabilityStatus', label: 'Status', render: (row) => UI.badge(row.AvailabilityStatus) },
        { key: 'History', label: 'Penghuni / riwayat', render: (row) => row.History.length ? row.History.map((h) => `<div class="small">${UI.esc(h.TenantName)} <span class="muted">(${UI.date(h.CheckInDate)} - ${h.CheckOutDate ? UI.date(h.CheckOutDate) : 'sekarang'})</span></div>`).join('') : '<span class="muted">Tidak ada hunian pada periode</span>' },
        { key: 'InvoicesIssued', label: 'Invoice', className: 'numeric', render: (row) => UI.currency(row.InvoicesIssued) },
        { key: 'RentCollected', label: 'Terkumpul', className: 'numeric', render: (row) => UI.currency(row.RentCollected) },
      ],
    });
  }

  function renderStatement(host) {
    const d = state.data;
    if (!d) { host.innerHTML = `<div class="card">${UI.emptyState('Pilih penghuni', 'Belum ada penghuni yang dapat ditampilkan.')}</div>`; return; }
    const invoiceRows = d.invoices.map((i) => `<tr><td class="strong">${UI.esc(i.InvoiceNumber)}<span class="sub">${UI.date(i.InvoiceDate)}</span></td><td>${UI.date(i.PeriodStart)} s.d. ${UI.date(i.PeriodEnd)}</td><td class="numeric">${UI.currency(i.TotalAmount)}</td><td class="numeric">${UI.currency(i.AmountPaid)}</td><td class="numeric">${UI.currency(i.OutstandingBalance)}</td><td>${UI.badge(i.InvoiceStatus)}</td></tr>`).join('');
    const paymentRows = d.payments.map((p) => `<tr><td class="strong">${UI.esc(p.ReceiptNumber)}<span class="sub">${UI.date(p.PaymentDate)}</span></td><td>${UI.esc(p.PaymentMethod)}</td><td>${UI.esc(p.ReferenceNumber || '-')}</td><td class="numeric">${UI.currency(p.AmountReceived)}</td><td>${UI.badge(p.PaymentStatus)}</td></tr>`).join('');
    host.innerHTML = `
      <div class="card"><div class="card-body">
        <div class="statement-head"><div><h2>${UI.esc(d.tenant.FullName)}</h2><p class="muted">${UI.esc(d.tenant.Email || '-')} &middot; ${UI.esc(d.tenant.Phone || '-')} &middot; ${UI.esc(d.tenant.RoomNumber || 'tanpa kamar')}</p></div>
          <div class="grid grid-3" style="min-width:480px">
            ${summaryCard('Total ditagihkan', UI.currency(d.summary.totalInvoiced), 'Periode terpilih')}
            ${summaryCard('Total dibayar', UI.currency(d.summary.totalPaid), 'Pembayaran dikonfirmasi', 'blue')}
            ${summaryCard('Saldo', UI.currency(d.summary.outstanding), `Deposit ${UI.currency(d.summary.depositLiability)}`, d.summary.outstanding > 0 ? 'amber' : '')}
          </div>
        </div>
      </div></div>
      <div class="card mt-16"><div class="card-head"><h3>Invoice</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Invoice</th><th>Periode</th><th class="numeric">Total</th><th class="numeric">Dibayar</th><th class="numeric">Sisa</th><th>Status</th></tr></thead><tbody>${invoiceRows || `<tr><td colspan="6">${UI.emptyState('Tidak ada invoice', 'Tidak ada tagihan pada periode ini.')}</td></tr>`}</tbody></table></div></div>
      <div class="card mt-16"><div class="card-head"><h3>Pembayaran</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Kuitansi</th><th>Metode</th><th>Referensi</th><th class="numeric">Jumlah</th><th>Status</th></tr></thead><tbody>${paymentRows || `<tr><td colspan="5">${UI.emptyState('Tidak ada pembayaran', 'Belum ada pembayaran pada periode ini.')}</td></tr>`}</tbody></table></div></div>
      ${d.deposits.length ? `<div class="card mt-16"><div class="card-head"><h3>Deposit</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Deposit</th><th>Tipe</th><th class="numeric">Nilai</th><th class="numeric">Sisa kewajiban</th><th>Status</th></tr></thead><tbody>${d.deposits.map((dep) => `<tr><td>${UI.esc(dep.DepositRecordID)}</td><td>${UI.esc(dep.DepositType)}</td><td class="numeric">${UI.currency(dep.DepositAmount)}</td><td class="numeric">${UI.currency(dep.OutstandingDepositLiability)}</td><td>${UI.badge(dep.DepositStatus)}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
  }

  function renderReconcile(host) {
    const d = state.data;
    const t = d.totals;
    host.innerHTML = `
      <div class="notice ${d.ok ? 'ok' : 'warn'}"><strong>${d.ok ? 'Pembukuan konsisten' : `${d.issues.length} temuan perlu diperiksa`}</strong><div class="small mt-8">Pemeriksaan terakhir ${UI.dateTime(d.checkedAt)}</div></div>
      <div class="grid grid-4 mt-16">
        ${summaryCard('Total invoice', UI.currency(t.invoicesTotal), `Dibayar ${UI.currency(t.invoicesPaid)}`)}
        ${summaryCard('Piutang', UI.currency(t.invoicesOutstanding), 'Saldo invoice berjalan', t.invoicesOutstanding > 0 ? 'amber' : '')}
        ${summaryCard('Pembayaran terkonfirmasi', UI.currency(t.confirmedPayments), `Alokasi valid ${UI.currency(t.validAllocations)}`, 'blue')}
        ${summaryCard('Kewajiban deposit', UI.currency(t.depositLiability), `Kredit ${UI.currency(t.credits)}`, 'purple')}
      </div>
      ${d.issues.length ? `<div class="card mt-16"><div class="card-head"><h3>Temuan</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Tingkat</th><th>Modul</th><th>Record</th><th>Pesan</th></tr></thead><tbody>${d.issues.map((issue) => `<tr><td>${UI.badge(issue.level === 'critical' ? 'Overdue' : 'Pending', issue.level)}</td><td>${UI.esc(issue.module)}</td><td>${UI.esc(issue.recordId)}</td><td>${UI.esc(issue.message)}</td></tr>`).join('')}</tbody></table></div></div>` : `<div class="card mt-16"><div class="card-body">${UI.emptyState('Tidak ada selisih', 'Saldo invoice, alokasi pembayaran, kredit, dan deposit konsisten.')}</div></div>`}
      <div class="card mt-16"><div class="card-head"><h3>Total ledger</h3></div><div class="card-body">
        <div class="report-row"><span>Transaksi masuk</span><span class="numeric">${UI.currency(t.transactionsIn)}</span></div>
        <div class="report-row"><span>Transaksi keluar</span><span class="numeric">${UI.currency(t.transactionsOut)}</span></div>
        <div class="report-row"><span>Saldo kas</span><span class="numeric strong">${UI.currency(t.transactionsIn - t.transactionsOut)}</span></div>
      </div></div>`;
  }

  function printReport() {
    const property = App.property || { name: 'Kos', address: '', phone: '' };
    let title = 'Laporan Keuangan';
    let body = '';
    if (state.tab === 'financial') {
      const d = state.data;
      const s = d.summary;
      title = 'Laporan Keuangan';
      body = `${UI.docHeader(property, title, [['Periode', `${UI.date(d.range.from)} s.d. ${UI.date(d.range.to)}`]])}
        <div class="summary"><div><span>Invoice</span><strong>${UI.currency(s.invoiceTotal)}</strong></div><div><span>Penerimaan</span><strong>${UI.currency(s.paymentsReceived)}</strong></div><div><span>Pengeluaran</span><strong>${UI.currency(s.expensesPaid)}</strong></div><div><span>Arus kas bersih</span><strong>${UI.currency(s.netCashFlow)}</strong></div></div>
        <h2>Pendapatan per tipe kamar</h2><table><thead><tr><th>Tipe</th><th class="numeric">Nilai</th></tr></thead><tbody>${Object.entries(d.revenueByRoomType).map(([k, v]) => `<tr><td>${UI.esc(k)}</td><td class="numeric">${UI.currency(v)}</td></tr>`).join('') || '<tr><td colspan="2">Tidak ada data</td></tr>'}</tbody></table>
        <h2>Pengeluaran per kategori</h2><table><thead><tr><th>Kategori</th><th class="numeric">Nilai</th></tr></thead><tbody>${Object.entries(d.expenseByCategory).map(([k, v]) => `<tr><td>${UI.esc(k)}</td><td class="numeric">${UI.currency(v)}</td></tr>`).join('') || '<tr><td colspan="2">Tidak ada data</td></tr>'}</tbody></table>
        <div class="doc-foot">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;
    } else if (state.tab === 'daily') {
      const d = state.data;
      title = 'Laporan Harian';
      body = `${UI.docHeader(property, title, [['Tanggal', UI.date(d.date)]])}
        <div class="summary"><div><span>Penerimaan</span><strong>${UI.currency(d.summary.paymentTotal)}</strong></div><div><span>Pengeluaran</span><strong>${UI.currency(d.summary.expenseTotal)}</strong></div><div><span>Kas bersih</span><strong>${UI.currency(d.summary.net)}</strong></div></div>
        <h2>Pembayaran</h2><table><thead><tr><th>Kuitansi</th><th>Penghuni</th><th>Metode</th><th class="numeric">Jumlah</th></tr></thead><tbody>${d.payments.map((p) => `<tr><td>${UI.esc(p.ReceiptNumber)}</td><td>${UI.esc(p.TenantName)}</td><td>${UI.esc(p.PaymentMethod)}</td><td class="numeric">${UI.currency(p.AmountReceived)}</td></tr>`).join('') || '<tr><td colspan="4">Tidak ada pembayaran</td></tr>'}</tbody></table>
        <h2>Pengeluaran</h2><table><thead><tr><th>Deskripsi</th><th>Kategori</th><th class="numeric">Jumlah</th></tr></thead><tbody>${d.expenses.map((e) => `<tr><td>${UI.esc(e.Description)}</td><td>${UI.esc(e.Category)}</td><td class="numeric">${UI.currency(e.TotalAmount)}</td></tr>`).join('') || '<tr><td colspan="3">Tidak ada pengeluaran</td></tr>'}</tbody></table>
        <div class="doc-foot">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;
    } else if (state.tab === 'statement') {
      const d = state.data;
      if (!d) { UI.toast('Tidak ada data untuk dicetak.', 'error'); return; }
      title = `Kartu Penghuni ${d.tenant.FullName}`;
      body = `${UI.docHeader(property, 'Kartu Penghuni', [['Nama', d.tenant.FullName], ['Kamar', d.tenant.RoomNumber || '-'], ['Periode', `${UI.date(state.from)} s.d. ${UI.date(state.to)}`]])}
        <div class="summary"><div><span>Ditagihkan</span><strong>${UI.currency(d.summary.totalInvoiced)}</strong></div><div><span>Dibayar</span><strong>${UI.currency(d.summary.totalPaid)}</strong></div><div><span>Saldo</span><strong>${UI.currency(d.summary.outstanding)}</strong></div></div>
        <h2>Invoice</h2><table><thead><tr><th>Invoice</th><th>Periode</th><th class="numeric">Total</th><th class="numeric">Dibayar</th><th class="numeric">Sisa</th><th>Status</th></tr></thead><tbody>${d.invoices.map((i) => `<tr><td>${UI.esc(i.InvoiceNumber)}</td><td>${UI.date(i.PeriodStart)} s.d. ${UI.date(i.PeriodEnd)}</td><td class="numeric">${UI.currency(i.TotalAmount)}</td><td class="numeric">${UI.currency(i.AmountPaid)}</td><td class="numeric">${UI.currency(i.OutstandingBalance)}</td><td>${UI.esc(i.InvoiceStatus)}</td></tr>`).join('') || '<tr><td colspan="6">Tidak ada invoice</td></tr>'}</tbody></table>
        <div class="doc-foot">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;
    } else if (state.tab === 'occupancy') {
      const d = state.data;
      title = 'Laporan Hunian';
      body = `${UI.docHeader(property, title, [['Periode', `${UI.date(d.range.from)} s.d. ${UI.date(d.range.to)}`]])}
        <div class="summary"><div><span>Tingkat hunian</span><strong>${d.summary.occupancyRate}%</strong></div><div><span>Kamar aktif</span><strong>${d.summary.activeRooms}</strong></div><div><span>Terisi</span><strong>${d.summary.occupied}</strong></div></div>
        <table><thead><tr><th>Kamar</th><th>Tipe</th><th>Status</th><th class="numeric">Invoice</th><th class="numeric">Terkumpul</th></tr></thead><tbody>${d.rooms.map((r) => `<tr><td>${UI.esc(r.RoomNumber)}</td><td>${UI.esc(r.RoomTypeName || '')}</td><td>${UI.esc(r.AvailabilityStatus)}</td><td class="numeric">${UI.currency(r.InvoicesIssued)}</td><td class="numeric">${UI.currency(r.RentCollected)}</td></tr>`).join('')}</tbody></table>
        <div class="doc-foot">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;
    } else {
      const d = state.data;
      title = 'Rekonsiliasi Pembukuan';
      const t = d.totals;
      body = `${UI.docHeader(property, title, [['Waktu', UI.dateTime(d.checkedAt)]])}
        <div class="summary"><div><span>Status</span><strong>${d.ok ? 'Konsisten' : `${d.issues.length} temuan`}</strong></div><div><span>Piutang</span><strong>${UI.currency(t.invoicesOutstanding)}</strong></div><div><span>Deposit</span><strong>${UI.currency(t.depositLiability)}</strong></div></div>
        <table><thead><tr><th>Tingkat</th><th>Modul</th><th>Record</th><th>Pesan</th></tr></thead><tbody>${d.issues.map((i) => `<tr><td>${UI.esc(i.level)}</td><td>${UI.esc(i.module)}</td><td>${UI.esc(i.recordId)}</td><td>${UI.esc(i.message)}</td></tr>`).join('') || '<tr><td colspan="4">Tidak ada temuan</td></tr>'}</tbody></table>
        <div class="doc-foot">Dicetak ${UI.dateTime(new Date().toISOString())} oleh ${UI.esc(App.user.FullName)}.</div>`;
    }
    UI.printDocument(title, body);
  }
});
