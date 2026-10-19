'use strict';

App.registerPage('services', async (container) => {
  const state = { tab: 'orders', orders: [], services: [], tenants: [] };
  UI.loading(container);
  try {
    [state.orders, state.services, state.tenants] = await Promise.all([
      API.get('/service-orders'),
      API.get('/services'),
      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),
    ]);
    render();
  } catch (error) { UI.pageError(container, error); }

  function render() {
    const paid = state.orders.filter((o) => o.OrderStatus === 'Paid');
    const billed = state.orders.filter((o) => o.OrderStatus === 'Billed');
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Layanan Tambahan</h1><p>Laundry, cleaning, parkir, dan layanan lain. Harga disepakati saat order dan tidak berubah oleh perubahan master harga.</p></div>
        <div class="page-actions">
          ${state.tab === 'orders' && App.can('services', 'write') ? '<button class="btn btn-primary" type="button" id="new-order">Buat order layanan</button>' : ''}
          ${state.tab === 'master' && App.can('services', 'write') ? '<button class="btn btn-primary" type="button" id="new-service">Tambah layanan</button>' : ''}
        </div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Total order</div><div class="stat-value">${state.orders.length}</div><div class="stat-foot">${state.services.length} layanan aktif</div></div>
        <div class="stat-card"><div class="stat-label">Langsung dibayar</div><div class="stat-value">${paid.length}</div><div class="stat-foot">${UI.currency(paid.reduce((s, o) => s + Number(o.TotalAmount), 0))}</div></div>
        <div class="stat-card blue"><div class="stat-label">Ditagihkan ke invoice</div><div class="stat-value">${billed.length}</div><div class="stat-foot">${UI.currency(billed.reduce((s, o) => s + Number(o.TotalAmount), 0))}</div></div>
        <div class="stat-card"><div class="stat-label">Nilai layanan</div><div class="stat-value" style="font-size:20px">${UI.currency(state.orders.reduce((s, o) => s + Number(o.TotalAmount), 0))}</div><div class="stat-foot">Seluruh order</div></div>
      </div>
      <div class="tabs mt-16">
        <button class="tab ${state.tab === 'orders' ? 'active' : ''}" type="button" data-tab="orders">Order Layanan</button>
        <button class="tab ${state.tab === 'master' ? 'active' : ''}" type="button" data-tab="master">Master Layanan</button>
      </div>
      <div id="services-content"></div>
    `;
    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; render(); }));
    if (state.tab === 'orders') renderOrders(); else renderMaster();
    const orderBtn = container.querySelector('#new-order');
    if (orderBtn) orderBtn.addEventListener('click', openOrderForm);
    const serviceBtn = container.querySelector('#new-service');
    if (serviceBtn) serviceBtn.addEventListener('click', () => openServiceForm(null));
  }

  function renderOrders() {
    const host = document.createElement('div');
    container.querySelector('#services-content').appendChild(host);
    UI.table(host, {
      rows: state.orders,
      searchKeys: ['TenantName', 'ServiceName', 'RoomNumber', 'ServiceOrderID'],
      searchPlaceholder: 'Cari order, penghuni, layanan...',
      exportName: 'order-layanan',
      rowKey: (row) => row.ServiceOrderID,
      defaultSort: 'OrderDate',
      defaultSortDir: 'desc',
      columns: [
        { key: 'ServiceOrderID', label: 'Order', render: (row) => `<strong>${UI.esc(row.ServiceOrderID)}</strong><span class="sub">${UI.date(row.OrderDate)}</span>` },
        { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.RoomNumber) },
        { key: 'ServiceName', label: 'Layanan', render: (row) => `${UI.esc(row.ServiceName)}<span class="sub">${row.Quantity} &times; ${UI.currency(row.UnitPrice)}</span>` },
        { key: 'TotalAmount', label: 'Total', className: 'numeric', render: (row) => `<strong>${UI.currency(row.TotalAmount)}</strong>` },
        { key: 'BillingMethod', label: 'Penagihan', render: (row) => UI.badge(row.BillingMethod) },
        { key: 'InvoiceID', label: 'Referensi', render: (row) => row.InvoiceID ? `Invoice ${UI.esc(row.InvoiceID)}` : row.PaymentID ? `Kuitansi ${UI.esc(row.PaymentID)}` : '-' },
        { key: 'OrderStatus', label: 'Status', render: (row) => UI.badge(row.OrderStatus) },
      ],
    });
  }

  function renderMaster() {
    const host = document.createElement('div');
    container.querySelector('#services-content').appendChild(host);
    UI.table(host, {
      rows: state.services,
      searchKeys: ['ServiceName', 'ServiceCode', 'Category'],
      exportName: 'master-layanan',
      rowKey: (row) => row.ServiceID,
      columns: [
        { key: 'ServiceName', label: 'Layanan', render: (row) => `<strong>${UI.esc(row.ServiceName)}</strong><span class="sub">${UI.esc(row.ServiceCode)} &middot; ${UI.esc(row.Description || '')}</span>` },
        { key: 'Category', label: 'Kategori' },
        { key: 'Unit', label: 'Satuan' },
        { key: 'StandardPrice', label: 'Harga jual', className: 'numeric', render: (row) => UI.currency(row.StandardPrice) },
        { key: 'CostPrice', label: 'Harga pokok', className: 'numeric', render: (row) => UI.currency(row.CostPrice) },
        { key: 'IsAvailable', label: 'Status', render: (row) => UI.badge(row.IsAvailable === 'TRUE' ? 'Active' : 'Inactive') },
        { key: 'actions', label: '', sortable: false, render: (row) => App.can('services', 'write') ? '<button class="btn btn-sm" type="button" data-act="edit">Ubah</button>' : '' },
      ],
      onAction: (action, row) => { if (action === 'edit') openServiceForm(row); },
    });
  }

  async function openOrderForm() {
    const activeTenants = state.tenants.filter((t) => t.TenantStatus === 'Active');
    if (!activeTenants.length) { UI.toast('Belum ada penghuni aktif.', 'error'); return; }
    UI.formModal({
      title: 'Buat order layanan',
      subtitle: 'Harga diambil saat order dan disimpan pada catatan order.',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field"><span>Penghuni <em>*</em></span><select name="TenantID" required>${activeTenants.map((t) => `<option value="${t.TenantID}">${UI.esc(t.FullName)} &middot; ${UI.esc(t.RoomNumber || '-')}</option>`).join('')}</select></label>
        <label class="field"><span>Layanan <em>*</em></span><select name="ServiceID" required>${state.services.filter((s) => s.IsAvailable === 'TRUE').map((s) => `<option value="${s.ServiceID}" data-price="${s.StandardPrice}" data-unit="${s.Unit}">${UI.esc(s.ServiceName)} &middot; ${UI.currency(s.StandardPrice)} / ${UI.esc(s.Unit)}</option>`).join('')}</select></label>
        <label class="field"><span>Jumlah <em>*</em></span><input type="number" min="1" step="1" name="Quantity" required value="1"></label>
        <label class="field"><span>Tanggal order <em>*</em></span><input type="date" name="OrderDate" required value="${UI.todayISO()}"></label>
        <label class="field"><span>Harga satuan (Rp)</span><input type="number" min="1" step="1000" name="UnitPrice" id="order-price" required></label>
        <label class="field"><span>Metode penagihan <em>*</em></span><select name="BillingMethod" id="billing-method" required><option value="Add to Invoice">Tambahkan ke invoice</option><option value="Immediate Payment">Bayar langsung</option></select></label>
        <div class="field" id="method-field" style="display:none"><span>Metode pembayaran</span><select name="PaymentMethod"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></div>
        <label class="field"><span>Referensi pembayaran</span><input name="ReferenceNumber" placeholder="Opsional"></label>
        <label class="field full"><span>Catatan</span><textarea name="Notes" placeholder="Detail permintaan layanan"></textarea></label>
      </div>
      <div class="notice mt-16">Untuk penagihan ke invoice, sistem memilih invoice terbuka tertua. Jika tidak ada, invoice layanan baru dibuat otomatis.</div>`,
      submitText: 'Simpan order',
      onMount: (overlay) => {
        const service = overlay.querySelector('[name="ServiceID"]');
        const price = overlay.querySelector('#order-price');
        const method = overlay.querySelector('#billing-method');
        const methodField = overlay.querySelector('#method-field');
        const setPrice = () => { price.value = service.selectedOptions[0].dataset.price; };
        setPrice();
        service.addEventListener('change', setPrice);
        method.addEventListener('change', () => { methodField.style.display = method.value === 'Immediate Payment' ? '' : 'none'; });
      },
      onSubmit: async (values) => {
        const result = await API.post('/service-orders', values);
        UI.toast(`Order ${result.order.ServiceOrderID} dibuat (${UI.currency(result.order.TotalAmount)}).`, 'success', 'Layanan tercatat');
        if (result.payment) {
          const detail = await API.get(`/payments/${result.payment.PaymentID}`);
          UI.showReceipt(detail.payment, detail.allocations);
        }
        state.orders = await API.get('/service-orders');
        state.services = await API.get('/services');
        render();
      },
    });
  }

  function openServiceForm(service) {
    const isEdit = !!service;
    UI.formModal({
      title: isEdit ? `Ubah ${service.ServiceName}` : 'Tambah layanan',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field"><span>Nama layanan <em>*</em></span><input name="ServiceName" required value="${UI.esc(service ? service.ServiceName : '')}"></label>
        <label class="field"><span>Kode</span><input name="ServiceCode" value="${UI.esc(service ? service.ServiceCode : '')}"></label>
        <label class="field"><span>Kategori <em>*</em></span><select name="Category">${['Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'].map((cat) => `<option ${service && service.Category === cat ? 'selected' : ''}>${cat}</option>`).join('')}</select></label>
        <label class="field"><span>Satuan <em>*</em></span><input name="Unit" required value="${UI.esc(service ? service.Unit : '')}" placeholder="kg / kali / bulan"></label>
        <label class="field"><span>Harga jual (Rp) <em>*</em></span><input type="number" min="1" step="500" name="StandardPrice" required value="${service ? service.StandardPrice : ''}"></label>
        <label class="field"><span>Harga pokok (Rp)</span><input type="number" min="0" step="500" name="CostPrice" value="${service ? service.CostPrice : 0}"></label>
        <label class="field"><span>Status</span><select name="IsAvailable"><option value="TRUE" ${!service || service.IsAvailable === 'TRUE' ? 'selected' : ''}>Tersedia</option><option value="FALSE" ${service && service.IsAvailable === 'FALSE' ? 'selected' : ''}>Tidak tersedia</option></select></label>
        <label class="field full"><span>Deskripsi</span><textarea name="Description">${UI.esc(service ? service.Description : '')}</textarea></label>
      </div>`,
      submitText: isEdit ? 'Simpan perubahan' : 'Tambah layanan',
      onSubmit: async (values) => {
        if (isEdit) values.ServiceID = service.ServiceID;
        await API.post('/services', values);
        UI.toast(isEdit ? 'Layanan diperbarui.' : 'Layanan ditambahkan.');
        state.services = await API.get('/services');
        await App.refreshMeta();
        render();
      },
    });
  }
});
