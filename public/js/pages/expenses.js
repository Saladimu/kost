'use strict';

App.registerPage('expenses', async (container) => {
  let rows = [];
  UI.loading(container);
  try {
    rows = await API.get('/expenses');
    render();
  } catch (error) { UI.pageError(container, error); }

  function render() {
    const paid = rows.filter((r) => r.PaymentStatus === 'Paid');
    const pending = rows.filter((r) => r.PaymentStatus === 'Pending' || r.PaymentStatus === 'Approved');
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Pengeluaran Operasional</h1><p>Catat biaya listrik, perawatan, kebersihan, internet, gaji, dan peralatan. Setiap pembayaran masuk ke ledger sebagai arus kas keluar.</p></div>
        <div class="page-actions">${App.can('expenses', 'write') ? '<button class="btn btn-primary" type="button" id="add-expense">Catat pengeluaran</button>' : ''}</div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Pengeluaran dibayar</div><div class="stat-value" style="font-size:20px">${UI.currency(paid.reduce((s, r) => s + Number(r.TotalAmount), 0))}</div><div class="stat-foot">${paid.length} transaksi</div></div>
        <div class="stat-card amber"><div class="stat-label">Menunggu pembayaran</div><div class="stat-value" style="font-size:20px">${UI.currency(pending.reduce((s, r) => s + Number(r.TotalAmount), 0))}</div><div class="stat-foot">${pending.length} pengeluaran</div></div>
        <div class="stat-card"><div class="stat-label">Total tercatat</div><div class="stat-value" style="font-size:20px">${UI.currency(rows.reduce((s, r) => s + Number(r.TotalAmount), 0))}</div><div class="stat-foot">${rows.length} dokumen</div></div>
        <div class="stat-card blue"><div class="stat-label">Kategori terbanyak</div><div class="stat-value" style="font-size:18px">${topCategory()}</div><div class="stat-foot">Berdasarkan nilai pengeluaran</div></div>
      </div>
      <div id="expense-table" class="mt-16"></div>
    `;
    const host = document.createElement('div');
    container.querySelector('#expense-table').appendChild(host);
    UI.table(host, {
      rows,
      searchKeys: ['Description', 'Vendor', 'Category', 'RequestedByName'],
      searchPlaceholder: 'Cari deskripsi, vendor, kategori...',
      exportName: 'pengeluaran',
      rowKey: (row) => row.ExpenseID,
      defaultSort: 'ExpenseDate',
      defaultSortDir: 'desc',
      columns: [
        { key: 'ExpenseDate', label: 'Tanggal', render: (row) => `${UI.date(row.ExpenseDate)}<span class="sub">${UI.esc(row.ExpenseID)}</span>` },
        { key: 'Description', label: 'Deskripsi', render: (row) => `<strong>${UI.esc(row.Description)}</strong><span class="sub">${UI.esc(row.Vendor || '-')} &middot; ${UI.esc(row.Category)}</span>` },
        { key: 'Quantity', label: 'Qty', className: 'numeric' },
        { key: 'UnitCost', label: 'Biaya satuan', className: 'numeric', render: (row) => UI.currency(row.UnitCost) },
        { key: 'TotalAmount', label: 'Total', className: 'numeric', render: (row) => `<strong>${UI.currency(row.TotalAmount)}</strong>` },
        { key: 'PaymentMethod', label: 'Metode' },
        { key: 'PaymentStatus', label: 'Status', render: (row) => UI.badge(row.PaymentStatus) },
        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => {
          if (!App.can('expenses', 'write') || row.PaymentStatus === 'Cancelled') return '';
          const buttons = [];
          if (row.PaymentStatus === 'Pending') buttons.push('<button class="btn btn-sm" type="button" data-act="approve">Setujui</button>');
          if (row.PaymentStatus === 'Pending' || row.PaymentStatus === 'Approved') buttons.push('<button class="btn btn-sm btn-primary" type="button" data-act="pay">Bayar</button>');
          buttons.push('<button class="btn btn-sm btn-danger" type="button" data-act="cancel">Batal</button>');
          return `<div class="btn-group">${buttons.join('')}</div>`;
        } },
      ],
      onAction: async (action, row) => {
        if (action === 'approve') {
          try { await API.post('/expenses', { ExpenseID: row.ExpenseID, PaymentStatus: 'Approved' }); UI.toast('Pengeluaran disetujui.'); refresh(); } catch (error) { UI.toast(error.message, 'error'); }
        }
        if (action === 'pay') {
          const ok = await UI.confirmDialog({ title: 'Tandai pengeluaran dibayar', message: `Pengeluaran ${UI.currency(row.TotalAmount)} untuk "${row.Description}" akan dicatat sebagai arus kas keluar.`, confirmText: 'Tandai dibayar' });
          if (!ok) return;
          try { await API.post('/expenses', { ExpenseID: row.ExpenseID, PaymentStatus: 'Paid' }); UI.toast('Pengeluaran dibayar dan masuk ledger.'); refresh(); } catch (error) { UI.toast(error.message, 'error'); }
        }
        if (action === 'cancel') openCancel(row);
      },
    });

    const addBtn = container.querySelector('#add-expense');
    if (addBtn) addBtn.addEventListener('click', openForm);
  }

  function topCategory() {
    const totals = {};
    rows.filter((r) => r.PaymentStatus === 'Paid').forEach((r) => { totals[r.Category] = (totals[r.Category] || 0) + Number(r.TotalAmount); });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return entries.length ? UI.esc(entries[0][0]) : '-';
  }

  async function refresh() {
    rows = await API.get('/expenses');
    render();
  }

  function openForm() {
    UI.formModal({
      title: 'Catat pengeluaran',
      subtitle: 'Pengeluaran berstatus dibayar langsung tercatat di ledger.',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field"><span>Tanggal <em>*</em></span><input type="date" name="ExpenseDate" required value="${UI.todayISO()}"></label>
        <label class="field"><span>Kategori <em>*</em></span><select name="Category" required>${['Utilities', 'Maintenance', 'Cleaning Supplies', 'Internet', 'Salaries', 'Equipment', 'Other'].map((cat) => `<option>${cat}</option>`).join('')}</select></label>
        <label class="field full"><span>Deskripsi <em>*</em></span><input name="Description" required placeholder="Contoh: tagihan listrik area bersama"></label>
        <label class="field"><span>Vendor</span><input name="Vendor" placeholder="Nama vendor"></label>
        <label class="field"><span>Jumlah <em>*</em></span><input type="number" min="1" step="1" name="Quantity" required value="1"></label>
        <label class="field"><span>Biaya satuan (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="UnitCost" required></label>
        <label class="field"><span>Metode pembayaran <em>*</em></span><select name="PaymentMethod" required><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
        <label class="field"><span>Status</span><select name="PaymentStatus"><option value="Pending">Pending</option><option value="Paid">Langsung dibayar</option></select></label>
        <label class="field full"><span>URL bukti / nota</span><input name="ReceiptURL" placeholder="https://drive.google.com/..."></label>
        <label class="field full"><span>Catatan</span><textarea name="Notes"></textarea></label>
      </div>`,
      submitText: 'Simpan pengeluaran',
      onSubmit: async (values) => {
        await API.post('/expenses', values);
        UI.toast(values.PaymentStatus === 'Paid' ? 'Pengeluaran dibayar dan dicatat di ledger.' : 'Pengeluaran dicatat sebagai pending.');
        refresh();
      },
    });
  }

  function openCancel(row) {
    UI.formModal({
      title: `Batalkan ${row.ExpenseID}`,
      subtitle: 'Jika sudah dibayar, sistem membuat jurnal pembalik.',
      body: `<div class="notice warn">${UI.esc(row.Description)} &middot; ${UI.currency(row.TotalAmount)}</div>
        <label class="field mt-16"><span>Alasan pembatalan <em>*</em></span><textarea name="reason" required></textarea></label>`,
      submitText: 'Batalkan pengeluaran',
      danger: true,
      onSubmit: async (values) => {
        await API.post(`/expenses/${row.ExpenseID}/cancel`, values);
        UI.toast('Pengeluaran dibatalkan.');
        refresh();
      },
    });
  }
});
