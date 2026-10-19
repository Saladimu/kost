'use strict';

async function renderFinance(container, initialTab) {
  const canTransactions = App.can('transactions', 'read');
  const canDeposits = App.can('deposits', 'read');
  const state = {
    tab: initialTab === 'deposits' ? (canDeposits ? 'deposits' : 'transactions') : initialTab === 'transactions' ? (canTransactions ? 'transactions' : 'deposits') : (canTransactions ? 'transactions' : 'deposits'),
    from: UI.monthStartISO(),
    to: UI.monthEndISO(),
    transactions: [],
    deposits: [],
  };
  UI.loading(container);
  try {
    await load();
  } catch (error) { UI.pageError(container, error); }

  async function load() {
    const tasks = [state.tab === 'transactions' ? API.get('/transactions', { from: state.from, to: state.to }) : Promise.resolve(state.transactions)];
    if (canDeposits) {
      tasks.push(API.get('/deposits'));
    } else {
      tasks.push(Promise.resolve([]));
    }
    const [transactions, deposits] = await Promise.all(tasks);
    state.transactions = transactions;
    state.deposits = deposits;
    render();
  }

  function render() {
    const confirmed = state.transactions.filter((t) => t.PaymentStatus !== 'Voided' && t.PaymentStatus !== 'Cancelled');
    const inflow = confirmed.filter((t) => t.Direction === 'IN').reduce((s, t) => s + Number(t.Amount), 0);
    const outflow = confirmed.filter((t) => t.Direction === 'OUT').reduce((s, t) => s + Number(t.Amount), 0);
    const held = state.deposits.filter((d) => ['Held', 'Partially Returned'].includes(d.DepositStatus));
    const heldTotal = held.reduce((s, d) => s + Number(d.OutstandingDepositLiability), 0);
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Kas & Deposit</h1><p>Ledger transaksi operasional dan kewajiban deposit penghuni. Transaksi void tetap tersimpan dengan jurnal pembalik.</p></div>
        <div class="page-actions">
          <div class="range-picker"><label class="field inline"><span>Dari</span><input type="date" id="fin-from" value="${state.from}"></label><label class="field inline"><span>Sampai</span><input type="date" id="fin-to" value="${state.to}"></label><button class="btn btn-sm" type="button" id="fin-apply">Terapkan</button></div>
        </div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Kas masuk</div><div class="stat-value" style="font-size:20px">${UI.currency(inflow)}</div><div class="stat-foot">Periode terpilih</div></div>
        <div class="stat-card red"><div class="stat-label">Kas keluar</div><div class="stat-value" style="font-size:20px">${UI.currency(outflow)}</div><div class="stat-foot">Periode terpilih</div></div>
        <div class="stat-card blue"><div class="stat-label">Arus kas bersih</div><div class="stat-value" style="font-size:20px">${UI.currency(inflow - outflow)}</div><div class="stat-foot">Masuk dikurangi keluar</div></div>
        <div class="stat-card ${heldTotal ? 'amber' : ''}"><div class="stat-label">Kewajiban deposit</div><div class="stat-value" style="font-size:20px">${UI.currency(heldTotal)}</div><div class="stat-foot">${held.length} deposit ditahan</div></div>
      </div>
      <div class="tabs mt-16">
        ${canTransactions ? `<button class="tab ${state.tab === 'transactions' ? 'active' : ''}" type="button" data-tab="transactions">Transaksi</button>` : ''}
        ${canDeposits ? `<button class="tab ${state.tab === 'deposits' ? 'active' : ''}" type="button" data-tab="deposits">Deposit</button>` : ''}
      </div>
      <div id="finance-content"></div>
    `;
    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {
      state.tab = button.dataset.tab;
      UI.loading(container);
      try { await load(); } catch (error) { UI.pageError(container, error); }
    }));
    const apply = container.querySelector('#fin-apply');
    if (apply) apply.addEventListener('click', async () => {
      state.from = container.querySelector('#fin-from').value;
      state.to = container.querySelector('#fin-to').value;
      UI.loading(container);
      try { await load(); } catch (error) { UI.pageError(container, error); }
    });
    if (state.tab === 'deposits') renderDeposits(); else renderTransactions();
  }

  function renderTransactions() {
    const host = document.createElement('div');
    container.querySelector('#finance-content').appendChild(host);
    UI.table(host, {
      rows: state.transactions,
      searchKeys: ['TransactionID', 'Description', 'TransactionType', 'TenantName', 'ReferenceID'],
      searchPlaceholder: 'Cari transaksi, referensi, penghuni...',
      exportName: 'ledger-transaksi',
      rowKey: (row) => row.TransactionID,
      defaultSort: 'TransactionDate',
      defaultSortDir: 'desc',
      columns: [
        { key: 'TransactionDate', label: 'Tanggal', render: (row) => `${UI.date(row.TransactionDate)}<span class="sub">${UI.esc(row.TransactionID)}</span>` },
        { key: 'Description', label: 'Transaksi', render: (row) => `<strong>${UI.esc(row.Description)}</strong><span class="sub">${UI.esc(row.TransactionType)} &middot; ${UI.esc(row.Category)}</span>` },
        { key: 'TenantName', label: 'Penghuni', render: (row) => row.TenantName ? UI.esc(row.TenantName) : '-' },
        { key: 'Direction', label: 'Arah', render: (row) => UI.directionBadge(row.Direction) },
        { key: 'Amount', label: 'Jumlah', className: 'numeric', render: (row) => `<strong>${UI.currency(row.Amount)}</strong>` },
        { key: 'PaymentMethod', label: 'Metode' },
        { key: 'PaymentStatus', label: 'Status', render: (row) => UI.badge(row.PaymentStatus) },
      ],
    });
  }

  function renderDeposits() {
    const host = document.createElement('div');
    container.querySelector('#finance-content').appendChild(host);
    UI.table(host, {
      rows: state.deposits,
      searchKeys: ['DepositRecordID', 'TenantName', 'RoomNumber', 'DepositType'],
      searchPlaceholder: 'Cari deposit, penghuni, kamar...',
      exportName: 'deposit',
      rowKey: (row) => row.DepositRecordID,
      defaultSort: 'CreatedAt',
      defaultSortDir: 'desc',
      columns: [
        { key: 'DepositRecordID', label: 'Deposit', render: (row) => `<strong>${UI.esc(row.DepositRecordID)}</strong><span class="sub">${UI.esc(row.DepositType)}</span>` },
        { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.RoomNumber || '-') },
        { key: 'DepositAmount', label: 'Diterima', className: 'numeric', render: (row) => UI.currency(row.DepositAmount) },
        { key: 'AmountDeducted', label: 'Potongan', className: 'numeric', render: (row) => UI.currency(row.AmountDeducted) },
        { key: 'AmountReturned', label: 'Dikembalikan', className: 'numeric', render: (row) => UI.currency(row.AmountReturned) },
        { key: 'OutstandingDepositLiability', label: 'Sisa kewajiban', className: 'numeric', render: (row) => `<strong>${UI.currency(row.OutstandingDepositLiability)}</strong>` },
        { key: 'DepositStatus', label: 'Status', render: (row) => UI.badge(row.DepositStatus) },
        { key: 'actions', label: '', sortable: false, render: (row) => App.can('deposits', 'write') && ['Held', 'Partially Returned'].includes(row.DepositStatus) ? '<button class="btn btn-sm" type="button" data-act="return">Kembalikan</button>' : '' },
      ],
      onAction: (action, row) => { if (action === 'return') openReturn(row); },
    });
  }

  function openReturn(deposit) {
    UI.formModal({
      title: `Pengembalian ${deposit.DepositRecordID}`,
      subtitle: `${deposit.TenantName} &middot; sisa kewajiban ${UI.currency(deposit.OutstandingDepositLiability)}`,
      body: `<div class="form-grid">
        <label class="field"><span>Jumlah dikembalikan (Rp)</span><input type="number" min="0" step="1000" name="AmountReturned" value="${deposit.OutstandingDepositLiability}"></label>
        <label class="field"><span>Potongan (Rp)</span><input type="number" min="0" step="1000" name="AmountDeducted" value="0"></label>
        <label class="field"><span>Tanggal pengembalian</span><input type="date" name="ReturnDate" value="${UI.todayISO()}"></label>
        <label class="field"><span>Metode</span><select name="ReturnMethod"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
        <label class="field full"><span>Catatan / alasan potongan</span><textarea name="Notes" placeholder="Kerusakan, tunggakan, dll."></textarea></label>
      </div>
      <div class="notice mt-16">Potongan tidak mengurangi kas keluar. Pengembalian tunai dicatat sebagai transaksi keluar.</div>`,
      submitText: 'Proses pengembalian',
      onSubmit: async (values) => {
        await API.post('/deposits/return', { ...values, DepositRecordID: deposit.DepositRecordID });
        UI.toast('Pengembalian deposit tercatat.');
        state.deposits = await API.get('/deposits');
        render();
      },
    });
  }
}

App.registerPage('finance', (container) => renderFinance(container, 'auto'));
App.registerPage('transactions', (container) => renderFinance(container, 'transactions'));
App.registerPage('deposits', (container) => renderFinance(container, 'deposits'));
