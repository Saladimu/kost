'use strict';

App.registerPage('payments', async (container) => {
  let rows = [];
  let tenants = [];
  UI.loading(container);
  try {
    [rows, tenants] = await Promise.all([
      API.get('/payments'),
      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),
    ]);
    render();
  } catch (error) { UI.pageError(container, error); }

  function render() {
    const confirmed = rows.filter((r) => r.PaymentStatus === 'Confirmed');
    const total = confirmed.reduce((s, r) => s + Number(r.AmountReceived), 0);
    const unallocated = confirmed.reduce((s, r) => s + Number(r.UnallocatedAmount || 0), 0);
    const voids = rows.filter((r) => r.PaymentStatus === 'Voided').length;
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Pembayaran & Kuitansi</h1><p>Setiap penerimaan tercatat dengan kuitansi unik. Pembayaran sebagian dialokasikan ke invoice dan saldo dihitung ulang secara server-side.</p></div>
        <div class="page-actions">${App.can('payments', 'write') ? '<button class="btn btn-primary" type="button" id="record-payment">Catat pembayaran</button>' : ''}</div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Penerimaan terkonfirmasi</div><div class="stat-value" style="font-size:20px">${UI.currency(total)}</div><div class="stat-foot">${confirmed.length} pembayaran</div></div>
        <div class="stat-card blue"><div class="stat-label">Kredit belum teralokasi</div><div class="stat-value" style="font-size:20px">${UI.currency(unallocated)}</div><div class="stat-foot">Kelebihan bayar penghuni</div></div>
        <div class="stat-card"><div class="stat-label">Kuitansi terbit</div><div class="stat-value">${rows.length}</div><div class="stat-foot">Termasuk void</div></div>
        <div class="stat-card ${voids ? 'red' : ''}"><div class="stat-label">Pembayaran void</div><div class="stat-value">${voids}</div><div class="stat-foot">Memiliki jurnal pembalik</div></div>
      </div>
      <div id="payment-table" class="mt-16"></div>
    `;
    const host = document.createElement('div');
    container.querySelector('#payment-table').appendChild(host);
    UI.table(host, {
      rows,
      searchKeys: ['ReceiptNumber', 'TenantName', 'ReferenceNumber', 'PaymentMethod'],
      searchPlaceholder: 'Cari kuitansi, penghuni, referensi...',
      exportName: 'pembayaran',
      rowKey: (row) => row.PaymentID,
      defaultSort: 'PaymentDate',
      defaultSortDir: 'desc',
      columns: [
        { key: 'ReceiptNumber', label: 'Kuitansi', render: (row) => `<strong>${UI.esc(row.ReceiptNumber)}</strong><span class="sub">${UI.esc(row.ReferenceNumber || '-')}</span>` },
        { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.PaymentMethod) },
        { key: 'PaymentDate', label: 'Tanggal', render: (row) => UI.date(row.PaymentDate) },
        { key: 'PaymentMethod', label: 'Metode' },
        { key: 'AmountReceived', label: 'Diterima', className: 'numeric', render: (row) => `<strong>${UI.currency(row.AmountReceived)}</strong>` },
        { key: 'AmountAllocated', label: 'Teralokasi', className: 'numeric', render: (row) => `${UI.currency(row.AmountAllocated)}${row.UnallocatedAmount > 0 ? `<span class="sub">kredit ${UI.currency(row.UnallocatedAmount)}</span>` : ''}` },
        { key: 'ReceivedByName', label: 'Petugas', render: (row) => UI.esc(row.ReceivedByName || '-') },
        { key: 'PaymentStatus', label: 'Status', render: (row) => UI.badge(row.PaymentStatus) },
        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class="btn-group">
          <button class="btn btn-sm" type="button" data-act="receipt">Kuitansi</button>
          ${App.can('payments', 'void') && row.PaymentStatus === 'Confirmed' ? '<button class="btn btn-sm btn-danger" type="button" data-act="void">Void</button>' : ''}
        </div>` },
      ],
      onAction: async (action, row) => {
        if (action === 'receipt') {
          try {
            const detail = await API.get(`/payments/${row.PaymentID}`);
            UI.showReceipt(detail.payment, detail.allocations);
          } catch (error) { UI.toast(error.message, 'error'); }
        }
        if (action === 'void') openVoid(row);
      },
    });
    const record = container.querySelector('#record-payment');
    if (record) record.addEventListener('click', openPaymentForm);
  }

  async function openPaymentForm() {
    const tenantOptions = tenants.filter((t) => t.TenantStatus === 'Active' || t.ActiveBalance > 0).map((t) => `<option value="${t.TenantID}">${UI.esc(t.FullName)} &middot; ${UI.esc(t.RoomNumber || 'tanpa kamar')} &middot; saldo ${UI.currency(t.ActiveBalance)}</option>`).join('');
    if (!tenantOptions) { UI.toast('Tidak ada penghuni aktif dengan tagihan.', 'error'); return; }
    const key = UI.uuid();
    UI.formModal({
      title: 'Catat pembayaran',
      subtitle: 'Pilih invoice atau biarkan sistem mengalokasikan otomatis ke tagihan tertua.',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field full"><span>Penghuni <em>*</em></span><select name="TenantID" id="pay-tenant" required>${tenantOptions}</select></label>
        <label class="field full"><span>Invoice tujuan</span><select name="InvoiceID" id="pay-invoice"><option value="">Alokasi otomatis ke tagihan tertua</option></select></label>
        <label class="field"><span>Jumlah diterima (Rp) <em>*</em></span><input class="amount-input" type="number" min="1" step="1000" name="AmountReceived" id="pay-amount" required></label>
        <label class="field"><span>Tanggal pembayaran <em>*</em></span><input type="date" name="PaymentDate" required value="${UI.todayISO()}"></label>
        <label class="field"><span>Metode <em>*</em></span><select name="PaymentMethod" required><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
        <label class="field"><span>Referensi</span><input name="ReferenceNumber" placeholder="Nomor referensi bank / QRIS"></label>
        <label class="field full"><span>Catatan</span><textarea name="Notes" placeholder="Cicilan, pembayaran gabungan, dll."></textarea></label>
      </div>
      <div id="pay-info" class="notice mt-16">Pilih penghuni untuk melihat tagihan terbuka.</div>
      <input type="hidden" name="IdempotencyKey" value="${key}">`,
      submitText: 'Konfirmasi pembayaran',
      onMount: (overlay) => {
        const tenantSelect = overlay.querySelector('#pay-tenant');
        const invoiceSelect = overlay.querySelector('#pay-invoice');
        const amount = overlay.querySelector('#pay-amount');
        const info = overlay.querySelector('#pay-info');
        async function loadInvoices() {
          invoiceSelect.innerHTML = '<option value="">Memuat invoice...</option>';
          try {
            const invoices = await API.get('/invoices', { tenantId: tenantSelect.value });
            const open = invoices.filter((inv) => !['Paid', 'Cancelled'].includes(inv.InvoiceStatus) && inv.OutstandingBalance > 0);
            invoiceSelect.innerHTML = '<option value="">Alokasi otomatis ke tagihan tertua</option>' + open.map((inv) => `<option value="${inv.InvoiceID}" data-outstanding="${inv.OutstandingBalance}">${UI.esc(inv.InvoiceNumber)} &middot; ${UI.date(inv.PeriodStart)} &middot; sisa ${UI.currency(inv.OutstandingBalance)}</option>`).join('');
            const total = open.reduce((s, inv) => s + Number(inv.OutstandingBalance), 0);
            amount.value = open.length ? (invoiceSelect.value ? open[0].OutstandingBalance : total) : '';
            info.className = `notice mt-16 ${open.length ? '' : 'warn'}`;
            info.innerHTML = open.length ? `Total saldo terbuka: <strong>${UI.currency(total)}</strong>. Pembayaran berlebih menjadi kredit penghuni.` : 'Tidak ada invoice terbuka. Pembayaran akan dicatat sebagai kredit penghuni.';
          } catch (error) { info.textContent = error.message; }
        }
        tenantSelect.addEventListener('change', loadInvoices);
        invoiceSelect.addEventListener('change', () => {
          const opt = invoiceSelect.selectedOptions[0];
          if (opt && opt.dataset.outstanding) amount.value = opt.dataset.outstanding;
        });
        loadInvoices();
      },
      onSubmit: async (values) => {
        const result = await API.post('/payments', values);
        const detail = await API.get(`/payments/${result.payment.PaymentID}`);
        UI.toast(`Pembayaran ${UI.currency(result.payment.AmountReceived)} tersimpan.`, 'success', 'Kuitansi dibuat');
        UI.showReceipt(detail.payment, detail.allocations);
        rows = await API.get('/payments');
        render();
      },
    });
  }

  function openVoid(row) {
    UI.formModal({
      title: `Void pembayaran ${row.ReceiptNumber}`,
      subtitle: 'Pembayaran tidak dihapus. Sistem mencatat jurnal pembalik dan membatalkan alokasi.',
      body: `<div class="detail-list">
        <div class="detail-row"><dt>Penghuni</dt><dd>${UI.esc(row.TenantName)}</dd></div>
        <div class="detail-row"><dt>Jumlah</dt><dd>${UI.currency(row.AmountReceived)}</dd></div>
        <div class="detail-row"><dt>Tanggal</dt><dd>${UI.date(row.PaymentDate)}</dd></div>
      </div>
      <label class="field mt-16"><span>Alasan void <em>*</em></span><textarea name="reason" required placeholder="Contoh: pembayaran ganda / salah input"></textarea></label>
      <div class="notice danger mt-16">Setelah void, saldo invoice akan naik kembali sebesar alokasi yang dibatalkan. Tindakan ini tercatat pada audit log.</div>`,
      submitText: 'Void pembayaran',
      danger: true,
      onSubmit: async (values) => {
        await API.post(`/payments/${row.PaymentID}/void`, values);
        UI.toast('Pembayaran di-void dan jurnal pembalik dibuat.');
        rows = await API.get('/payments');
        render();
      },
    });
  }
});
