'use strict';

App.registerPage('dashboard', async (container, route) => {
  const state = {
    preset: 'month',
    from: UI.monthStartISO(),
    to: UI.monthEndISO(),
  };

  function presetRange(preset) {
    if (preset === 'today') return { from: UI.todayISO(), to: UI.todayISO() };
    if (preset === 'last') return { from: UI.monthStartISO(-1), to: UI.monthEndISO(-1) };
    return { from: UI.monthStartISO(), to: UI.monthEndISO() };
  }

  async function load() {
    UI.loading(container, 'Menyiapkan ringkasan operasional...');
    try {
      let data;
      let revenue;
      let activities;
      try {
        const page = await API.get('/dashboard-page', { from: state.from, to: state.to });
        data = page.dashboard;
        revenue = page.revenue || [];
        activities = page.activities || [];
      } catch (error) {
        if (error.status !== 404) throw error;
        [data, revenue, activities] = await Promise.all([
          API.get('/dashboard', { from: state.from, to: state.to }),
          App.can('reports', 'read') ? API.get('/reports/revenue') : Promise.resolve([]),
          App.can('activities', 'read') ? API.get('/activities', { status: 'Pending' }) : Promise.resolve([]),
        ]);
      }
      render(data, revenue, activities);
    } catch (error) {
      UI.pageError(container, error, load);
    }
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 19) return 'Selamat sore';
    return 'Selamat malam';
  }

  function statCard(label, value, foot, icon, tone = '') {
    return `<div class="stat-card ${tone}"><div class="stat-icon">${icon}</div><div class="stat-label">${UI.esc(label)}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot || ''}</div></div>`;
  }

  const icons = {
    room: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 20V6l8-3 8 3v14M4 20h16M9 20v-5h6v5M8 9h.01M16 9h.01" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    people: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 20c.4-3.4 2.7-5.4 5.5-5.4s5.1 2 5.5 5.4M16 5.5a3 3 0 010 5.6M17 14.6c2.2.5 3.6 2.3 3.9 5.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    money: '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 9v6M18 9v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    invoice: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    expense: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 18l5-6 4 3 7-9M16 6h4v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cash: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 7h16v10H4zM7 12h.01M17 12h.01M12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    warning: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4l9 16H3zM12 9v5M12 17h.01" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    task: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 5h14v15H5zM8 3v4M16 3v4M8 12l2 2 5-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  function render(data, revenue, activities) {
    const r = data.rooms;
    const t = data.tenants;
    const f = data.financial;
    const statusSegments = [
      { key: 'Occupied', color: '#0f766e', label: 'Terisi' },
      { key: 'Reserved', color: '#6941c6', label: 'Reservasi' },
      { key: 'Available', color: '#9fd8ce', label: 'Tersedia' },
      { key: 'Maintenance', color: '#d7a84b', label: 'Perbaikan' },
      { key: 'Inactive', color: '#c9d4d1', label: 'Nonaktif' },
    ];
    const bar = statusSegments.map((segment) => {
      const width = r.total ? (r[segment.key] / r.total) * 100 : 0;
      return `<span style="width:${width}%;background:${segment.color}" title="${segment.label}: ${r[segment.key]}"></span>`;
    }).join('');
    const today = UI.todayISO();
    const preset = state.preset;
    const roomTiles = (App.meta.rooms || []).slice(0, 12).map((room) => `<div class="room-tile"><div class="room-no">${UI.esc(room.RoomNumber)}${UI.badge(room.AvailabilityStatus)}</div><small>${UI.esc(room.RoomTypeName)} &middot; ${UI.esc(room.OccupantNames || 'Kosong')}</small></div>`).join('');

    const financeRow = f ? `
      <div class="grid grid-4 mt-16">
        ${statCard('Invoice diterbitkan', UI.currency(f.invoicedThisMonth), `${f.invoiceCount} invoice dalam periode`, icons.invoice, 'blue')}
        ${statCard('Penerimaan kas', UI.currency(f.collectionsThisMonth), `${f.paymentCount} pembayaran dikonfirmasi`, icons.cash, '')}
        ${statCard('Pengeluaran operasional', UI.currency(f.expensesPaid), 'Pengeluaran berstatus dibayar', icons.expense, 'amber')}
        ${statCard('Arus kas operasional', UI.currency(f.netCashFlow), `Masuk ${UI.currency(f.inflow)} &middot; keluar ${UI.currency(f.outflow)}`, icons.money, f.netCashFlow < 0 ? 'red' : '')}
      </div>` : '';

    const revenueBars = revenue.length ? (() => {
      const max = Math.max(...revenue.map((m) => Math.max(m.invoiced, m.collected, m.expenses)), 1);
      return revenue.map((m) => `<div class="bar-group"><div class="bars">
        <span class="bar" style="height:${(m.invoiced / max) * 100}%" title="Invoice ${UI.currency(m.invoiced)}"></span>
        <span class="bar" style="height:${(m.collected / max) * 100}%;background:#5ba89b" title="Penerimaan ${UI.currency(m.collected)}"></span>
        <span class="bar expense" style="height:${(m.expenses / max) * 100}%" title="Pengeluaran ${UI.currency(m.expenses)}"></span>
      </div><div class="bar-label">${UI.MONTHS[Number(m.month.slice(5, 7)) - 1]}</div></div>`).join('');
    })() : '';

    const recent = (data.recentInvoices || []).length ? data.recentInvoices.map((inv) => `<tr><td class="strong">${UI.esc(inv.InvoiceNumber)}<span class="sub">${UI.esc(inv.TenantName)} &middot; ${UI.esc(inv.RoomNumber)}</span></td><td>${UI.date(inv.PeriodStart)}</td><td class="numeric">${UI.currency(inv.TotalAmount)}</td><td class="numeric">${UI.currency(inv.OutstandingBalance)}</td><td>${UI.badge(inv.InvoiceStatus)}</td></tr>`).join('') : `<tr><td colspan="5">${UI.emptyState('Belum ada invoice', 'Invoice bulanan akan tampil di sini.')}</td></tr>`;

    const overdue = (data.overdueInvoices || []).length ? data.overdueInvoices.map((inv) => `<a class="quick-item" href="#/invoices">
      <span class="quick-icon" style="background:#fdeceb;color:#b42318">${icons.warning}</span>
      <span style="min-width:0"><strong>${UI.esc(inv.TenantName)} &middot; ${UI.esc(inv.RoomNumber)}</strong><small>${UI.esc(inv.InvoiceNumber)} &middot; jatuh tempo ${UI.date(inv.DueDate)}</small></span>
      <span class="numeric" style="margin-left:auto;color:#b42318;font-weight:700">${UI.currency(inv.OutstandingBalance)}</span>
    </a>`).join('') : `<div class="notice ok">Tidak ada invoice jatuh tempo. Piutang berjalan ${UI.currency(f ? f.outstandingReceivables : 0)}.</div>`;

    const taskList = activities.slice(0, 5).map((task) => `<a class="quick-item" href="#/activities"><span class="quick-icon">${icons.task}</span><span style="min-width:0"><strong>${UI.esc(task.Description)}</strong><small>${UI.esc(task.RoomNumber || 'Tanpa kamar')} &middot; ${UI.esc(task.StaffName)} &middot; ${UI.date(task.DueDate)}</small></span><span style="margin-left:auto">${UI.badge(task.Status)}</span></a>`).join('') || `<div class="notice">Tidak ada tugas tertunda.</div>`;

    container.innerHTML = `
      <div class="page-header">
        <div><h1>${greeting()}, ${UI.esc(App.user.FullName.split(' ')[0])}</h1><p>Ringkasan operasional ${UI.esc(data.propertyName)} untuk periode ${UI.date(state.from)} s.d. ${UI.date(state.to)}.</p></div>
        <div class="page-actions">
          ${App.can('payments', 'write') ? '<a class="btn btn-primary" href="#/payments">Catat pembayaran</a>' : ''}
          ${App.can('agreements', 'write') ? '<a class="btn" href="#/agreements">Check-in penghuni</a>' : ''}
          ${App.can('invoices', 'generate') ? '<button class="btn" type="button" id="dash-generate">Jalankan tagihan</button>' : ''}
        </div>
      </div>

      <div class="dashboard-hero">
        <div><h2>${UI.esc(data.propertyName)}</h2><p>${r.Occupied} dari ${r.total - r.Inactive} kamar aktif terisi. ${r.Available} kamar siap disewakan, ${r.Reserved} dalam reservasi, ${r.Maintenance} dalam perbaikan.</p></div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/rooms">Lihat kamar</a>
          <a class="btn" href="#/reports">Buka laporan</a>
        </div>
      </div>

      <div class="grid grid-4 mt-16">
        ${statCard('Tingkat hunian', `${r.occupancyRate}%`, `${r.Occupied} kamar terisi`, icons.room, '')}
        ${statCard('Total kamar', r.total, `${r.Available} tersedia &middot; ${r.Inactive} nonaktif`, icons.room, 'blue')}
        ${statCard('Penghuni aktif', t.active, `${t.upcomingCheckIns} check-in &middot; ${t.upcomingCheckOuts} check-out mendatang`, icons.people, 'purple')}
        ${f
          ? statCard('Piutang penghuni', UI.currency(f.outstandingReceivables), `${f.overdueCount} invoice jatuh tempo &middot; ${UI.currency(f.overdueTotal)}`, icons.invoice, f.overdueCount ? 'red' : '')
          : statCard('Tugas tertunda', t.pendingActivities, 'Aktivitas operasional belum selesai', icons.task, 'amber')}
      </div>
      ${financeRow}

      <div class="grid grid-2 mt-16" style="grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)">
        <div class="card">
          <div class="card-head"><div><h3>Komposisi status kamar</h3><p>Dihitung dari hunian dan reservasi aktif</p></div><span class="badge teal">${r.occupancyRate}% terisi</span></div>
          <div class="card-body">
            <div class="occupancy-bar">${bar}</div>
            <div class="legend">${statusSegments.map((s) => `<span><i style="background:${s.color}"></i>${s.label} <strong>${r[s.key]}</strong></span>`).join('')}</div>
            <div class="room-grid mt-24">${roomTiles || UI.emptyState('Belum ada kamar', 'Tambahkan kamar pada menu Kamar.')}</div>
            <div class="mt-16"><a class="btn btn-sm" href="#/rooms">Kelola seluruh kamar</a></div>
          </div>
        </div>
        <div class="stack">
          ${f ? `<div class="card"><div class="card-head"><div><h3>Arus kas 6 bulan</h3><p>Invoice, penerimaan, dan pengeluaran</p></div></div>
            <div class="card-body">
              <div class="bar-chart">${revenueBars || UI.emptyState('Belum ada data', '')}</div>
              <div class="chart-legend"><span><i style="background:#0f766e"></i>Invoice</span><span><i style="background:#5ba89b"></i>Penerimaan</span><span><i style="background:#d7a84b"></i>Pengeluaran</span></div>
              <div class="detail-list mt-24">
                <div class="detail-row"><dt>Koleksi sewa</dt><dd>${UI.currency(f.rentalCollections)}</dd></div>
                <div class="detail-row"><dt>Koleksi layanan</dt><dd>${UI.currency(f.serviceCollections)}</dd></div>
                <div class="detail-row"><dt>Kewajiban deposit</dt><dd>${UI.currency(f.depositLiabilities)}</dd></div>
              </div>
            </div></div>` : ''}
          <div class="card">
            <div class="card-head"><div><h3>Tugas operasional</h3><p>${t.pendingActivities} aktivitas belum selesai</p></div><a class="btn btn-sm" href="#/activities">Semua tugas</a></div>
            <div class="card-body"><div class="quick-list">${taskList}</div></div>
          </div>
        </div>
      </div>

      ${f ? `<div class="grid grid-2 mt-16" style="grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)">
        <div class="card">
          <div class="card-head"><div><h3>Invoice terbaru</h3><p>Penerbitan tagihan terakhir</p></div><a class="btn btn-sm" href="#/invoices">Lihat semua</a></div>
          <div class="table-wrap"><table class="data"><thead><tr><th>Invoice</th><th>Periode</th><th class="numeric">Total</th><th class="numeric">Sisa</th><th>Status</th></tr></thead><tbody>${recent}</tbody></table></div>
        </div>
        <div class="card">
          <div class="card-head"><div><h3>Perlu perhatian</h3><p>Invoice lewat jatuh tempo</p></div><span class="badge ${f.overdueCount ? 'red' : 'green'}">${f.overdueCount} tagihan</span></div>
          <div class="card-body"><div class="quick-list">${overdue}</div></div>
        </div>
      </div>` : ''}

      <div class="card mt-16">
        <div class="card-head"><div><h3>Akses cepat</h3><p>Sesuai peran ${UI.esc(App.user.Role)}</p></div></div>
        <div class="card-body"><div class="grid grid-4">
          ${App.can('tenants', 'write') ? '<a class="quick-item" href="#/tenants"><span class="quick-icon">' + icons.people + '</span><span><strong>Daftarkan penghuni</strong><small>Data dan identitas</small></span></a>' : ''}
          ${App.can('reservations', 'write') ? '<a class="quick-item" href="#/reservations"><span class="quick-icon">' + icons.room + '</span><span><strong>Buat reservasi</strong><small>Kunci kamar calon penghuni</small></span></a>' : ''}
          ${App.can('services', 'write') ? '<a class="quick-item" href="#/services"><span class="quick-icon">' + icons.invoice + '</span><span><strong>Order layanan</strong><small>Laundry, cleaning, parkir</small></span></a>' : ''}
          ${App.can('expenses', 'write') ? '<a class="quick-item" href="#/expenses"><span class="quick-icon">' + icons.expense + '</span><span><strong>Catat pengeluaran</strong><small>Biaya operasional properti</small></span></a>' : ''}
          ${App.can('reports', 'read') ? '<a class="quick-item" href="#/reports"><span class="quick-icon">' + icons.money + '</span><span><strong>Laporan keuangan</strong><small>Kas, piutang, rekonsiliasi</small></span></a>' : ''}
          ${App.can('activities', 'write') ? '<a class="quick-item" href="#/activities"><span class="quick-icon">' + icons.task + '</span><span><strong>Tugas staf</strong><small>Kebersihan dan perawatan</small></span></a>' : ''}
        </div></div>
      </div>

      <div class="filters mt-24">
        <div class="chip-select">
          <button class="chip ${preset === 'today' ? 'active' : ''}" type="button" data-preset="today">Hari ini</button>
          <button class="chip ${preset === 'month' ? 'active' : ''}" type="button" data-preset="month">Bulan ini</button>
          <button class="chip ${preset === 'last' ? 'active' : ''}" type="button" data-preset="last">Bulan lalu</button>
          <button class="chip ${preset === 'custom' ? 'active' : ''}" type="button" data-preset="custom">Kustom</button>
        </div>
        ${preset === 'custom' ? `<div class="field"><span>Dari</span><input type="date" id="dash-from" value="${state.from}"></div><div class="field"><span>Sampai</span><input type="date" id="dash-to" value="${state.to}"></div><button class="btn btn-primary btn-sm" type="button" id="dash-apply">Terapkan</button>` : ''}
      </div>
    `;

    container.querySelectorAll('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        state.preset = button.dataset.preset;
        if (state.preset !== 'custom') {
          const range = presetRange(state.preset);
          state.from = range.from;
          state.to = range.to;
          load();
        } else {
          render(data, revenue, activities);
        }
      });
    });
    const apply = container.querySelector('#dash-apply');
    if (apply) apply.addEventListener('click', () => {
      const from = container.querySelector('#dash-from').value;
      const to = container.querySelector('#dash-to').value;
      if (!from || !to || from > to) { UI.toast('Rentang tanggal tidak valid.', 'error'); return; }
      state.from = from; state.to = to; load();
    });
    const generate = container.querySelector('#dash-generate');
    if (generate) generate.addEventListener('click', async () => {
      const confirmed = await UI.confirmDialog({
        title: 'Jalankan penagihan bulanan',
        message: 'Sistem akan membuat invoice untuk setiap perjanjian aktif yang belum memiliki invoice pada periode berjalan. Proses ini idempoten dan aman dijalankan ulang.',
        confirmText: 'Jalankan sekarang',
        details: `<div class="notice">Tanggal proses: <strong>${UI.date(today)}</strong></div>`,
      });
      if (!confirmed) return;
      try {
        const result = await API.post('/invoices/generate', { asOf: today });
        UI.toast(`${result.count} invoice baru dibuat.`, 'success', 'Penagihan selesai');
        load();
      } catch (error) { UI.toast(error.message, 'error'); }
    });
  }

  await load();
});
