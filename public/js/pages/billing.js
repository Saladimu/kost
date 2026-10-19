'use strict';

App.registerPage('invoices', async (container) => {
  const state = { rows: [], status: '', query: '' };
  UI.loading(container);
  try {
    state.rows = await API.get('/invoices');
    render();
  } catch (error) { UI.pageError(container, error); }

  function stats() {
    const rows = state.rows.filter((r) => r.InvoiceStatus !== 'Cancelled');
    return {
      issued: rows.reduce((s, r) => s + Number(r.TotalAmount), 0),
      paid: rows.reduce((s, r) => s + Number(r.AmountPaid), 0),
      outstanding: rows.reduce((s, r) => s + Number(r.OutstandingBalance), 0),
      overdue: rows.filter((r) => r.InvoiceStatus === 'Overdue').reduce((s, r) => s + Number(r.OutstandingBalance), 0),
      count: rows.length,
    };
  }

  function render() {
    const s = stats();
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Invoice Bulanan</h1><p>Tagihan sewa dan layanan. Saldo dihitung dari alokasi pembayaran yang valid, bukan dari input manual.</p></div>
        <div class="page-actions">
          <button class="btn" type="button" id="print-list">Cetak daftar</button>
          ${App.can('invoices', 'generate') ? '<button class="btn btn-primary" type="button" id="generate">Jalankan penagihan</button>' : ''}
        </div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Total invoice</div><div class="stat-value" style="font-size:20px">${UI.currency(s.issued)}</div><div class="stat-foot">${s.count} invoice aktif</div></div>
        <div class="stat-card"><div class="stat-label">Sudah dibayar</div><div class="stat-value" style="font-size:20px">${UI.currency(s.paid)}</div><div class="stat-foot">Alokasi valid</div></div>
        <div class="stat-card amber"><div class="stat-label">Piutang</div><div class="stat-value" style="font-size:20px">${UI.currency(s.outstanding)}</div><div class="stat-foot">Belum dibayar</div></div>
        <div class="stat-card red"><div class="stat-label">Jatuh tempo</div><div class="stat-value" style="font-size:20px">${UI.currency(s.overdue)}</div><div class="stat-foot">Perlu tindak lanjut</div></div>
      </div>
      <div class="filters mt-16"><div class="chip-select" id="invoice-filters">
        <button class="chip ${state.status === '' ? 'active' : ''}" type="button" data-status="">Semua</button>
        ${['Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].map((status) => `<button class="chip ${state.status === status ? 'active' : ''}" type="button" data-status="${status}">${status === 'Issued' ? 'Terbit' : status === 'Partially Paid' ? 'Dibayar sebagian' : status === 'Paid' ? 'Lunas' : status === 'Overdue' ? 'Jatuh tempo' : 'Dibatalkan'}</button>`).join('')}
      </div></div>
      <div id="invoice-table" class="mt-16"></div>
    `;
    const host = document.createElement('div');
    container.querySelector('#invoice-table').appendChild(host);

    const filtered = state.status ? state.rows.filter((r) => r.InvoiceStatus === state.status) : state.rows;
    UI.table(host, {
      rows: filtered,
      searchKeys: ['InvoiceNumber', 'TenantName', 'RoomNumber', 'PeriodStart'],
      searchPlaceholder: 'Cari nomor invoice atau penghuni...',
      exportName: 'invoice',
      rowKey: (row) => row.InvoiceID,
      defaultSort: 'InvoiceDate',
      defaultSortDir: 'desc',
      columns: [
        { key: 'InvoiceNumber', label: 'Invoice', render: (row) => `<strong>${UI.esc(row.InvoiceNumber)}</strong><span class="sub">${UI.esc(row.TenantName)}</span>` },
        { key: 'RoomNumber', label: 'Kamar' },
        { key: 'PeriodStart', label: 'Periode', render: (row) => `${UI.date(row.PeriodStart)}<span class="sub">s.d. ${UI.date(row.PeriodEnd)}</span>` },
        { key: 'DueDate', label: 'Jatuh tempo', render: (row) => `${UI.date(row.DueDate)}${row.InvoiceStatus === 'Overdue' ? `<span class="sub" style="color:#b42318">${row.DaysOverdue} hari lewat</span>` : ''}` },
        { key: 'TotalAmount', label: 'Total', className: 'numeric', render: (row) => UI.currency(row.TotalAmount) },
        { key: 'AmountPaid', label: 'Dibayar', className: 'numeric', render: (row) => UI.currency(row.AmountPaid) },
        { key: 'OutstandingBalance', label: 'Sisa', className: 'numeric', render: (row) => row.OutstandingBalance > 0 ? `<strong style="color:#b42318">${UI.currency(row.OutstandingBalance)}</strong>` : UI.currency(0) },
        { key: 'InvoiceStatus', label: 'Status', render: (row) => UI.badge(row.InvoiceStatus) },
        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class="btn-group">
          <button class="btn btn-sm" type="button" data-act="detail">Detail</button>
          ${App.can('payments', 'write') && !['Paid', 'Cancelled'].includes(row.InvoiceStatus) && row.OutstandingBalance > 0 ? '<button class="btn btn-sm btn-primary" type="button" data-act="pay">Bayar</button>' : ''}
        </div>` },
      ],
      onAction: (action, row) => {
        if (action === 'detail') openDetail(row.InvoiceID);
        if (action === 'pay') openPayment(row);
      },
    });

    container.querySelectorAll('[data-status]').forEach((button) => {
      button.addEventListener('click', () => { state.status = button.dataset.status; render(); });
    });
    const generate = container.querySelector('#generate');
    if (generate) generate.addEventListener('click', async () => {
      const confirmed = await UI.confirmDialog({
        title: 'Jalankan penagihan bulanan',
        message: 'Invoice dibuat untuk perjanjian aktif yang belum memiliki tagihan pada periode berjalan. Proses idempoten: menjalankannya dua kali tidak membuat invoice ganda.',
        confirmText: 'Jalankan penagihan',
        details: `<div class="notice">Tanggal proses: <strong>${UI.date(UI.todayISO())}</strong> &middot; prefix <strong>${UI.esc(App.property.invoicePrefix || 'INV')}</strong></div>`,
      });
      if (!confirmed) return;
      try {
        const result = await API.post('/invoices/generate', { asOf: UI.todayISO() });
        UI.toast(`${result.count} invoice baru dibuat, ${result.skipped.length} periode dilewati karena sudah ada.`, 'success', 'Penagihan selesai');
        state.rows = await API.get('/invoices');
        render();
      } catch (error) { UI.toast(error.message, 'error'); }
    });
    const printList = container.querySelector('#print-list');
    if (printList) printList.addEventListener('click', () => {
      UI.printDocument('Daftar Invoice', `${UI.docHeader(App.property, 'Daftar Invoice', [['Dicetak', UI.date(UI.todayISO())], ['Jumlah', String(filtered.length)]])}
        <table><thead><tr><th>Invoice</th><th>Penghuni</th><th>Kamar</th><th>Periode</th><th>Jatuh tempo</th><th class="numeric">Total</th><th class="numeric">Sisa</th><th>Status</th></tr></thead><tbody>
        ${filtered.map((row) => `<tr><td>${UI.esc(row.InvoiceNumber)}</td><td>${UI.esc(row.TenantName)}</td><td>${UI.esc(row.RoomNumber)}</td><td>${UI.date(row.PeriodStart)} - ${UI.date(row.PeriodEnd)}</td><td>${UI.date(row.DueDate)}</td><td class="numeric">${UI.currency(row.TotalAmount)}</td><td class="numeric">${UI.currency(row.OutstandingBalance)}</td><td>${UI.esc(row.InvoiceStatus)}</td></tr>`).join('')}
        </tbody></table>
        <div class="summary"><div><span>Total</span><strong>${UI.currency(filtered.reduce((s, r) => s + Number(r.TotalAmount), 0))}</strong></div><div><span>Sisa</span><strong>${UI.currency(filtered.reduce((s, r) => s + Number(r.OutstandingBalance), 0))}</strong></div></div>
        <div class="doc-foot">${UI.esc(App.property.name)} &middot; ${UI.esc(App.property.address)}</div>`);
    });
  }

  async function openDetail(invoiceId) {
    try {
      const detail = await API.get(`/invoices/${invoiceId}`);
      const inv = detail.invoice;
      const allocations = detail.allocations.filter((a) => a.AllocationStatus === 'Valid');
      const modal = UI.openModal({
        title: `Invoice ${inv.InvoiceNumber}`,
        subtitle: `${inv.TenantName} &middot; kamar ${inv.RoomNumber} &middot; ${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}`,
        size: 'lg',
        body: `<div class="grid grid-2">
          <div class="card"><div class="card-body"><div class="section-title">Rincian tagihan</div>
            <div class="detail-list">
              <div class="detail-row"><dt>Status</dt><dd>${UI.badge(inv.InvoiceStatus)}</dd></div>
              <div class="detail-row"><dt>Sewa</dt><dd>${UI.currency(inv.RentalAmount)}</dd></div>
              <div class="detail-row"><dt>Layanan</dt><dd>${UI.currency(inv.ServiceCharges)}</dd></div>
              <div class="detail-row"><dt>Biaya lain</dt><dd>${UI.currency(inv.OtherCharges)}</dd></div>
              <div class="detail-row"><dt>Diskon</dt><dd>-${UI.currency(inv.DiscountAmount)}</dd></div>
              <div class="detail-row"><dt>Total</dt><dd>${UI.currency(inv.TotalAmount)}</dd></div>
              <div class="detail-row"><dt>Dibayar</dt><dd>${UI.currency(inv.AmountPaid)}</dd></div>
              <div class="detail-row"><dt>Sisa</dt><dd>${UI.currency(inv.OutstandingBalance)}</dd></div>
              <div class="detail-row"><dt>Jatuh tempo</dt><dd>${UI.date(inv.DueDate)}</dd></div>
            </div>
          </div></div>
          <div class="card"><div class="card-body"><div class="section-title">Alokasi pembayaran</div>
            ${allocations.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Kuitansi</th><th>Tanggal</th><th class="numeric">Jumlah</th></tr></thead><tbody>${allocations.map((a) => `<tr><td>${UI.esc(a.ReceiptNumber)}</td><td>${UI.date(a.PaymentDate)}</td><td class="numeric">${UI.currency(a.AllocatedAmount)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="notice">Belum ada pembayaran yang dialokasikan.</div>'}
            <div class="notice mt-16">${UI.esc(inv.Notes || 'Tidak ada catatan.')}</div>
          </div></div>
        </div>`,
        footer: `<button class="btn" type="button" data-print>Cetak invoice</button>
          ${App.can('invoices', 'write') && inv.InvoiceStatus !== 'Cancelled' ? '<button class="btn" type="button" data-adjust>Penyesuaian</button><button class="btn btn-danger" type="button" data-cancel>Batalkan</button>' : ''}
          ${App.can('payments', 'write') && inv.OutstandingBalance > 0 && inv.InvoiceStatus !== 'Cancelled' ? '<button class="btn btn-primary" type="button" data-pay>Catat pembayaran</button>' : ''}
          <button class="btn" type="button" data-close>Tutup</button>`,
        onMount: (overlay, close) => {
          overlay.querySelector('[data-close]').addEventListener('click', close);
          overlay.querySelector('[data-print]').addEventListener('click', () => printInvoice(inv, allocations));
          const pay = overlay.querySelector('[data-pay]');
          if (pay) pay.addEventListener('click', () => { close(); openPayment(inv); });
          const adjust = overlay.querySelector('[data-adjust]');
          if (adjust) adjust.addEventListener('click', () => { close(); openAdjust(inv); });
          const cancel = overlay.querySelector('[data-cancel]');
          if (cancel) cancel.addEventListener('click', () => { close(); openCancel(inv); });
        },
      });
      return modal;
    } catch (error) { UI.toast(error.message, 'error'); }
  }

  function openPayment(inv) {
    const key = UI.uuid();
    UI.formModal({
      title: `Pembayaran ${inv.InvoiceNumber}`,
      subtitle: `${inv.TenantName} &middot; sisa tagihan ${UI.currency(inv.OutstandingBalance)}`,
      body: `<div class="form-grid">
        <label class="field full"><span>Jumlah diterima (Rp) <em>*</em></span><input class="amount-input" type="number" min="1" step="1000" name="AmountReceived" required value="${inv.OutstandingBalance}"></label>
        <label class="field"><span>Tanggal pembayaran <em>*</em></span><input type="date" name="PaymentDate" required value="${UI.todayISO()}"></label>
        <label class="field"><span>Metode <em>*</em></span><select name="PaymentMethod" required><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
        <label class="field full"><span>Referensi bank / QRIS</span><input name="ReferenceNumber" placeholder="Nomor referensi transaksi"></label>
        <label class="field full"><span>Catatan</span><textarea name="Notes" placeholder="Cicilan ke-..."></textarea></label>
      </div>
      <div class="notice mt-16">Pembayaran dapat dilakukan sebagian. Setiap pembayaran memiliki kuitansi sendiri dan dialokasikan ke invoice ini. Kelebihan pembayaran dicatat sebagai kredit penghuni.</div>
      <input type="hidden" name="TenantID" value="${inv.TenantID}">
      <input type="hidden" name="InvoiceID" value="${inv.InvoiceID}">
      <input type="hidden" name="IdempotencyKey" value="${key}">
      <input type="hidden" name="PaymentStatus" value="Confirmed">`,
      submitText: 'Konfirmasi pembayaran',
      onSubmit: async (values) => {
        const result = await API.post('/payments', values);
        const detail = await API.get(`/payments/${result.payment.PaymentID}`);
        UI.toast(`Pembayaran ${UI.currency(result.payment.AmountReceived)} tersimpan.`, 'success', 'Kuitansi dibuat');
        UI.showReceipt(detail.payment, detail.allocations);
        state.rows = await API.get('/invoices');
        render();
      },
    });
  }

  function openAdjust(inv) {
    UI.formModal({
      title: `Penyesuaian ${inv.InvoiceNumber}`,
      subtitle: 'Biaya tambahan dan diskon akan mengubah saldo invoice ini saja.',
      body: `<div class="form-grid">
        <label class="field"><span>Biaya lain-lain (Rp)</span><input type="number" min="0" step="1000" name="OtherCharges" value="${inv.OtherCharges}"></label>
        <label class="field"><span>Diskon (Rp)</span><input type="number" min="0" step="1000" name="DiscountAmount" value="${inv.DiscountAmount}"></label>
        <label class="field full"><span>Alasan penyesuaian <em>*</em></span><input name="Reason" required placeholder="Contoh: kompensasi gangguan air"></label>
        <label class="field full"><span>Catatan</span><textarea name="Notes">${UI.esc(inv.Notes || '')}</textarea></label>
      </div>
      <div class="notice warn mt-16">Penyesuaian tercatat pada audit log. Invoice yang sudah memiliki pembayaran tidak dapat dibatalkan, tetapi dapat disesuaikan selama tidak mengurangi total di bawah jumlah yang sudah dibayar.</div>`,
      submitText: 'Simpan penyesuaian',
      onSubmit: async (values) => {
        await API.post(`/invoices/${inv.InvoiceID}/adjust`, values);
        UI.toast('Invoice berhasil disesuaikan.');
        state.rows = await API.get('/invoices');
        render();
      },
    });
  }

  function openCancel(inv) {
    UI.formModal({
      title: `Batalkan ${inv.InvoiceNumber}`,
      subtitle: 'Invoice tidak dihapus; statusnya diubah menjadi dibatalkan untuk menjaga jejak audit.',
      body: `<label class="field"><span>Alasan pembatalan <em>*</em></span><textarea name="reason" required placeholder="Contoh: duplikasi tagihan"></textarea></label>
      <div class="notice danger mt-16">Invoice dengan pembayaran valid tidak dapat dibatalkan. Lakukan void pembayaran terlebih dahulu.</div>`,
      submitText: 'Batalkan invoice',
      danger: true,
      onSubmit: async (values) => {
        await API.post(`/invoices/${inv.InvoiceID}/cancel`, values);
        UI.toast('Invoice dibatalkan.');
        state.rows = await API.get('/invoices');
        render();
      },
    });
  }

  function printInvoice(inv, allocations) {
    UI.printDocument(`Invoice ${inv.InvoiceNumber}`, `${UI.docHeader(App.property, 'Invoice', [['No. Invoice', inv.InvoiceNumber], ['Tanggal', UI.date(inv.InvoiceDate)], ['Jatuh tempo', UI.date(inv.DueDate)]])}
      <div class="summary"><div><span>Ditagihkan kepada</span><strong>${UI.esc(inv.TenantName)}</strong><br>${UI.esc(inv.TenantPhone || '')}</div><div><span>Kamar</span><strong>${UI.esc(inv.RoomNumber)}</strong></div><div><span>Periode</span><strong>${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}</strong></div></div>
      <table><thead><tr><th>Deskripsi</th><th class="numeric">Jumlah</th></tr></thead><tbody>
        <tr><td>Sewa bulanan</td><td class="numeric">${UI.currency(inv.RentalAmount)}</td></tr>
        <tr><td>Layanan tambahan</td><td class="numeric">${UI.currency(inv.ServiceCharges)}</td></tr>
        <tr><td>Biaya lain-lain</td><td class="numeric">${UI.currency(inv.OtherCharges)}</td></tr>
        <tr><td>Diskon</td><td class="numeric">-${UI.currency(inv.DiscountAmount)}</td></tr>
        <tr><td><strong>Total</strong></td><td class="numeric"><strong>${UI.currency(inv.TotalAmount)}</strong></td></tr>
        <tr><td>Sudah dibayar</td><td class="numeric">${UI.currency(inv.AmountPaid)}</td></tr>
        <tr><td><strong>Sisa tagihan</strong></td><td class="numeric"><strong>${UI.currency(inv.OutstandingBalance)}</strong></td></tr>
      </tbody></table>
      ${allocations && allocations.length ? `<h3>Riwayat pembayaran</h3><table><thead><tr><th>Kuitansi</th><th>Tanggal</th><th class="numeric">Jumlah</th></tr></thead><tbody>${allocations.map((a) => `<tr><td>${UI.esc(a.ReceiptNumber)}</td><td>${UI.date(a.PaymentDate)}</td><td class="numeric">${UI.currency(a.AllocatedAmount)}</td></tr>`).join('')}</tbody></table>` : ''}
      <div class="doc-foot">${UI.esc(inv.Notes || '')}<br>${UI.esc(App.property.name)} &middot; ${UI.esc(App.property.address)} &middot; ${UI.esc(App.property.phone)}</div>`);
  }
});
