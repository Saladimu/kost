'use strict';

const UI = (() => {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const STATUS_COLORS = {
    Available: 'green', Occupied: 'teal', Reserved: 'purple', Maintenance: 'amber', Inactive: 'gray',
    Active: 'green', Prospective: 'purple', 'Checked Out': 'gray',
    Pending: 'amber', Confirmed: 'green', Cancelled: 'gray', Converted: 'green', Expired: 'red',
    Ended: 'gray', Transferred: 'purple', Renewed: 'blue',
    Draft: 'gray', Issued: 'blue', 'Partially Paid': 'amber', Paid: 'green', Overdue: 'red',
    Voided: 'red', Refunded: 'purple',
    'In Progress': 'blue', Completed: 'green',
    Held: 'blue', 'Partially Returned': 'amber', Returned: 'green',
    Approved: 'blue', Billed: 'blue',
    'Immediate Payment': 'blue', 'Add to Invoice': 'amber',
    IN: 'green', OUT: 'red',
  };

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function currency(value) {
    const n = Number(value || 0);
    const negative = n < 0;
    const formatted = Math.abs(n).toLocaleString('id-ID');
    return `${negative ? '-' : ''}Rp${formatted}`;
  }

  function compactCurrency(value) {
    const n = Number(value || 0);
    if (Math.abs(n) >= 1000000000) return `Rp${(n / 1000000000).toFixed(1).replace('.', ',')} M`;
    if (Math.abs(n) >= 1000000) return `Rp${(n / 1000000).toFixed(1).replace('.', ',')} jt`;
    if (Math.abs(n) >= 1000) return `Rp${(n / 1000).toFixed(0)} rb`;
    return currency(n);
  }

  function num(value) { return Number(value || 0).toLocaleString('id-ID'); }

  function date(value, style = 'short') {
    if (!value) return '-';
    const raw = String(value).slice(0, 10);
    const parts = raw.split('-');
    if (parts.length !== 3) return raw;
    const [y, m, d] = parts.map(Number);
    if (style === 'long') return `${d} ${MONTHS_LONG[m - 1]} ${y}`;
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  function dateTime(value) {
    if (!value) return '-';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  }

  function monthLabel(value) {
    const [y, m] = String(value).split('-').map(Number);
    return `${MONTHS_LONG[(m || 1) - 1]} ${y}`;
  }

  function todayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  }

  function monthStartISO(offset = 0) {
    const dt = new Date();
    dt.setDate(1);
    dt.setMonth(dt.getMonth() + offset);
    return dt.toLocaleDateString('en-CA');
  }

  function monthEndISO(offset = 0) {
    const dt = new Date();
    dt.setDate(1);
    dt.setMonth(dt.getMonth() + offset + 1);
    dt.setDate(0);
    return dt.toLocaleDateString('en-CA');
  }

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();
  }

  function badge(status, custom) {
    const label = custom || status || '-';
    const color = STATUS_COLORS[status] || 'gray';
    return `<span class="badge ${color}">${esc(label)}</span>`;
  }

  function directionBadge(direction) {
    return `<span class="badge ${direction === 'IN' ? 'green' : 'red'}">${esc(direction)}</span>`;
  }

  function toast(message, type = 'success', title) {
    const root = document.getElementById('toast-root');
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.innerHTML = `<div><strong>${esc(title || (type === 'error' ? 'Terjadi kesalahan' : type === 'info' ? 'Informasi' : 'Berhasil'))}</strong><span>${esc(message)}</span></div><button class="toast-close" type="button" aria-label="Tutup">&times;</button>`;
    root.appendChild(node);
    const remove = () => node.remove();
    node.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, type === 'error' ? 6000 : 4200);
  }

  function loading(container, message = 'Memuat data...') {
    container.innerHTML = `<div class="loading-inline"><span class="spinner"></span>${esc(message)}</div>`;
  }

  function emptyState(title, description = '') {
    return `<div class="empty"><div class="empty-icon"><svg viewBox="0 0 24 24" width="21" height="21"><path d="M4 7h16v12H4zM4 7l2-3h12l2 3M9 11h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div><strong>${esc(title)}</strong><p>${esc(description)}</p></div>`;
  }

  function pageError(container, error, retry) {
    container.innerHTML = `<div class="card"><div class="empty"><div class="empty-icon" style="background:#fdeceb;color:#b42318">!</div><strong>Gagal memuat halaman</strong><p>${esc(error.message || error)}</p><button class="btn btn-sm mt-12" type="button" id="retry-page">Coba lagi</button></div></div>`;
    const btn = container.querySelector('#retry-page');
    if (btn && retry) btn.addEventListener('click', retry);
  }

  function openModal({ title, subtitle = '', body = '', size = '', footer = '', onMount }) {
    const root = document.getElementById('modal-root');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true">
      <div class="modal-head"><div><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div><button class="modal-close" type="button" aria-label="Tutup">&times;</button></div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
    root.appendChild(overlay);
    const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (event) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    if (onMount) onMount(overlay, close);
    return { overlay, close, root };
  }

  function formModal({ title, subtitle, body, submitText = 'Simpan', cancelText = 'Batal', size = '', onSubmit, onMount, extraFooter = '', danger = false }) {
    return new Promise((resolve) => {
      const modal = openModal({
        title,
        subtitle,
        size,
        body: `<form id="modal-form" novalidate>${body}<div class="form-error hidden" id="modal-error"></div></form>`,
        footer: `${extraFooter ? `<div class="left">${extraFooter}</div>` : ''}<button class="btn" type="button" data-cancel>${esc(cancelText)}</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="submit" form="modal-form">${esc(submitText)}</button>`,
        onMount: (overlay, close) => {
          const form = overlay.querySelector('#modal-form');
          const submitBtn = overlay.querySelector('[type="submit"]');
          const errorBox = overlay.querySelector('#modal-error');
          overlay.querySelector('[data-cancel]').addEventListener('click', () => { close(); resolve(null); });
          overlay.querySelector('.modal-close').addEventListener('click', () => resolve(null));
          if (onMount) onMount(overlay, close, form);
          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorBox.classList.add('hidden');
            const values = Object.fromEntries(new FormData(form).entries());
            form.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => { values[checkbox.name] = checkbox.checked; });
            submitBtn.disabled = true;
            const original = submitBtn.textContent;
            submitBtn.textContent = 'Memproses...';
            try {
              const result = await onSubmit(values, form, close);
              if (result !== false) { close(); resolve(result || values); }
            } catch (error) {
              errorBox.textContent = error.message || 'Terjadi kesalahan.';
              errorBox.classList.remove('hidden');
              errorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = original;
            }
          });
        },
      });
      const cancelBtn = modal.overlay.querySelector('[data-cancel]');
      if (cancelBtn) cancelBtn.addEventListener('click', () => {});
    });
  }

  function confirmDialog({ title = 'Konfirmasi', message = '', confirmText = 'Ya, lanjutkan', cancelText = 'Batal', danger = false, details = '' }) {
    return new Promise((resolve) => {
      const modal = openModal({
        title,
        size: '',
        body: `<div class="confirm-icon">!</div><p style="font-size:13px;color:#4a5c59">${esc(message)}</p>${details ? `<div class="mt-16">${details}</div>` : ''}`,
        footer: `<button class="btn" type="button" data-cancel>${esc(cancelText)}</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-confirm>${esc(confirmText)}</button>`,
        onMount: (overlay, close) => {
          overlay.querySelector('[data-cancel]').addEventListener('click', () => { close(); resolve(false); });
          overlay.querySelector('.modal-close').addEventListener('click', () => resolve(false));
          overlay.addEventListener('click', (event) => { if (event.target === overlay) resolve(false); });
          overlay.querySelector('[data-confirm]').addEventListener('click', () => { close(); resolve(true); });
        },
      });
      modal.overlay.addEventListener('remove', () => resolve(false));
    });
  }

  function badgeCell(status) { return badge(status); }

  function cellUser(name, sub) {
    return `<div class="cell-user"><span class="avatar-sm">${esc(initials(name))}</span><span><strong>${esc(name)}</strong>${sub ? `<small>${esc(sub)}</small>` : ''}</span></div>`;
  }

  function table(container, options) {
    const state = {
      rows: options.rows || [],
      page: 1,
      pageSize: options.pageSize || 10,
      search: '',
      sortKey: options.defaultSort || null,
      sortDir: options.defaultSortDir || 'desc',
    };
    const searchKeys = options.searchKeys || [];
    const columns = options.columns || [];
    const rowKey = options.rowKey || ((row, index) => row.id || index);

    function filteredRows() {
      let rows = [...state.rows];
      if (state.search && searchKeys.length) {
        const term = state.search.toLowerCase();
        rows = rows.filter((row) => searchKeys.some((key) => String(row[key] === undefined ? '' : row[key]).toLowerCase().includes(term)));
      }
      if (state.sortKey) {
        const key = state.sortKey;
        const dir = state.sortDir === 'asc' ? 1 : -1;
        rows.sort((a, b) => {
          const av = a[key]; const bv = b[key];
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
          return String(av === undefined ? '' : av).localeCompare(String(bv === undefined ? '' : bv), 'id') * dir;
        });
      }
      return rows;
    }

    function pageRows(rows) {
      const start = (state.page - 1) * state.pageSize;
      return rows.slice(start, start + state.pageSize);
    }

    function render() {
      const rows = filteredRows();
      const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
      if (state.page > totalPages) state.page = totalPages;
      const current = pageRows(rows);
      const start = rows.length ? (state.page - 1) * state.pageSize + 1 : 0;
      const end = Math.min(state.page * state.pageSize, rows.length);
      const head = columns.map((col) => {
        const sortable = col.sortable !== false && col.key;
        const active = state.sortKey === col.key;
        return `<th class="${sortable ? 'sortable' : ''} ${col.className || ''}" ${sortable ? `data-sort="${esc(col.key)}"` : ''}>${esc(col.label)}${active ? `<span class="sort-arrow">${state.sortDir === 'asc' ? '▲' : '▼'}</span>` : ''}</th>`;
      }).join('');
      const body = current.length ? current.map((row, index) => {
        const id = rowKey(row, index);
        const cells = columns.map((col) => `<td class="${col.className || ''}">${col.render ? col.render(row) : esc(row[col.key])}</td>`).join('');
        return `<tr data-row-id="${esc(id)}">${cells}</tr>`;
      }).join('') : `<tr><td colspan="${columns.length}">${emptyState(options.emptyTitle || 'Belum ada data', options.emptyText || 'Data akan tampil di sini setelah ditambahkan.')}</td></tr>`;

      const pageButtons = [];
      const from = Math.max(1, state.page - 2);
      const to = Math.min(totalPages, from + 4);
      for (let i = from; i <= to; i += 1) pageButtons.push(`<button type="button" class="${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`);

      container.innerHTML = `<div class="card">
        <div class="table-toolbar">
          <div class="search-box"><svg viewBox="0 0 24 24" width="15" height="15"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><input type="search" placeholder="${esc(options.searchPlaceholder || 'Cari data...')}" value="${esc(state.search)}" data-search></div>
          <div class="flex flex-wrap">${options.toolbar || ''}${options.exportName !== false ? `<button class="btn btn-sm" type="button" data-export>Ekspor CSV</button>` : ''}</div>
        </div>
        <div class="table-wrap"><table class="data"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
        <div class="table-foot"><span class="small muted">Menampilkan ${start}-${end} dari ${rows.length} data</span><div class="pagination"><button type="button" data-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''}>Sebelumnya</button>${pageButtons.join('')}<button type="button" data-page="${state.page + 1}" ${state.page >= totalPages ? 'disabled' : ''}>Berikutnya</button></div></div>
      </div>`;

      const search = container.querySelector('[data-search]');
      if (search) {
        search.addEventListener('input', (event) => {
          state.search = event.target.value;
          state.page = 1;
          render();
          const newSearch = container.querySelector('[data-search]');
          if (newSearch) { newSearch.focus(); newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length); }
        });
      }
      container.querySelectorAll('[data-sort]').forEach((th) => {
        th.addEventListener('click', () => {
          const key = th.dataset.sort;
          if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          else { state.sortKey = key; state.sortDir = 'asc'; }
          render();
        });
      });
      container.querySelectorAll('.pagination [data-page]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const page = Number(btn.dataset.page);
          if (page >= 1 && page <= totalPages) { state.page = page; render(); }
        });
      });
      const exportBtn = container.querySelector('[data-export]');
      if (exportBtn) exportBtn.addEventListener('click', () => exportCSV(options.exportName || 'data', columns, filteredRows()));
      container.querySelectorAll('tbody tr[data-row-id]').forEach((tr) => {
        if (options.onRow) {
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', (event) => {
            if (event.target.closest('button, a')) return;
            const row = current.find((r, i) => String(rowKey(r, i)) === tr.dataset.rowId);
            if (row) options.onRow(row);
          });
        }
      });
      if (options.onAction) {
        container.querySelectorAll('tbody [data-act]').forEach((btn) => {
          btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const tr = btn.closest('tr[data-row-id]');
            const row = current.find((r, i) => String(rowKey(r, i)) === (tr ? tr.dataset.rowId : ''));
            if (row) options.onAction(btn.dataset.act, row, btn);
          });
        });
      }
    }

    render();
    return {
      refresh(rows) { state.rows = rows || state.rows; render(); },
      getState: () => state,
      setRows(rows) { state.rows = rows; state.page = 1; render(); },
    };
  }

  function exportCSV(name, columns, rows) {
    const usable = columns.filter((c) => c.export !== false && c.key !== 'actions');
    const lines = [usable.map((c) => `"${String(c.label).replace(/"/g, '""')}"`).join(',')];
    rows.forEach((row) => {
      lines.push(usable.map((c) => {
        const value = c.exportValue ? c.exportValue(row) : row[c.key];
        return `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;
      }).join(','));
    });
    csvDownload(name, lines.join('\r\n'));
  }

  function csvDownload(name, content) {
    const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}-${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    toast('File CSV berhasil diunduh.', 'success', 'Ekspor selesai');
  }

  function printDocument(title, bodyHTML) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { toast('Popup diblokir. Izinkan popup untuk mencetak.', 'error'); return; }
    win.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      *{box-sizing:border-box}body{font-family:"Segoe UI",Arial,sans-serif;color:#111;margin:32px;font-size:13px;line-height:1.5}
      h1{font-size:20px;margin:0 0 3px}h2{font-size:15px;margin:20px 0 8px}h3{font-size:13px;margin:0}
      table{width:100%;border-collapse:collapse;margin-top:10px}th,td{padding:7px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:12px;vertical-align:top}
      th{background:#f4f4f4;text-transform:uppercase;letter-spacing:.05em;font-size:10px}
      .doc-head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px}
      .doc-meta{text-align:right;font-size:12px}.doc-foot{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#555}
      .numeric{text-align:right}.badge{padding:2px 7px;border:1px solid #ddd;border-radius:9px;font-size:10px}.muted{color:#666}
      .summary{display:flex;gap:24px;margin-top:12px}.summary div{flex:1}.summary span{display:block;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:.05em}.summary strong{font-size:16px}
      @media print{body{margin:16px}.no-print{display:none}}
    </style></head><body>${bodyHTML}<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`);
    win.document.close();
  }

  function docHeader(property, docTitle, metaRows) {
    return `<div class="doc-head"><div><h1>${esc(property.name)}</h1><div class="muted">${esc(property.address)}<br>${esc(property.phone)}</div></div><div class="doc-meta"><h2>${esc(docTitle)}</h2>${metaRows.map(([k, v]) => `<div>${esc(k)}: <strong>${esc(v)}</strong></div>`).join('')}</div></div>`;
  }


  function receiptHTML(payment, allocations, property) {
    return `${docHeader(property, 'Kuitansi Pembayaran', [['No. Kuitansi', payment.ReceiptNumber], ['Tanggal', date(payment.PaymentDate)]])}
      <div class="summary"><div><span>Diterima dari</span><strong>${esc(payment.TenantName || payment.TenantID)}</strong></div><div><span>Metode</span><strong>${esc(payment.PaymentMethod)}</strong></div><div><span>Status</span><strong>${esc(payment.PaymentStatus)}</strong></div></div>
      <h3 style="margin-top:20px">Rincian</h3>
      <table><thead><tr><th>Referensi</th><th>Tanggal</th><th class="numeric">Jumlah</th></tr></thead><tbody>
        ${allocations && allocations.length ? allocations.map((a) => `<tr><td>${esc(a.InvoiceNumber || a.InvoiceID)}</td><td>${date(payment.PaymentDate)}</td><td class="numeric">${currency(a.AllocatedAmount)}</td></tr>`).join('') : `<tr><td>${esc(payment.Notes || 'Pembayaran layanan')}</td><td>${date(payment.PaymentDate)}</td><td class="numeric">${currency(payment.AmountReceived)}</td></tr>`}
      </tbody></table>
      <div class="summary"><div><span>Total diterima</span><strong>${currency(payment.AmountReceived)}</strong></div></div>
      ${payment.ReferenceNumber ? `<p class="muted">Referensi: ${esc(payment.ReferenceNumber)}</p>` : ''}
      <div class="doc-foot">Kuitansi ini dibuat secara elektronik oleh ${esc(property.name)}. ${esc(property.address)} &middot; ${esc(property.phone)}</div>`;
  }

  function showReceipt(payment, allocations = []) {
    const property = (window.App && App.property) || { name: 'Kos', address: '', phone: '' };
    openModal({
      title: `Kuitansi ${payment.ReceiptNumber}`,
      subtitle: `${payment.TenantName || payment.TenantID} &middot; ${currency(payment.AmountReceived)}`,
      size: 'lg',
      body: `<div class="print-doc">${receiptHTML(payment, allocations, property)}</div>`,
      footer: `<button class="btn" type="button" data-print>Cetak kuitansi</button><button class="btn btn-primary" type="button" data-close>Tutup</button>`,
      onMount: (overlay, close) => {
        overlay.querySelector('[data-close]').addEventListener('click', close);
        overlay.querySelector('[data-print]').addEventListener('click', () => printDocument(`Kuitansi ${payment.ReceiptNumber}`, receiptHTML(payment, allocations, property)));
      },
    });
  }

  function formValues(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    form.querySelectorAll('input[type="checkbox"]').forEach((cb) => { values[cb.name] = cb.checked; });
    return values;
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function debounce(fn, wait = 250) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  return {
    MONTHS, MONTHS_LONG, esc, currency, compactCurrency, num, date, dateTime, monthLabel,
    todayISO, monthStartISO, monthEndISO, initials, badge, directionBadge, toast, loading,
    emptyState, pageError, openModal, formModal, confirmDialog, cellUser, table, exportCSV,
    csvDownload, printDocument, docHeader, receiptHTML, showReceipt, formValues, qs, debounce, uuid,
  };
})();
