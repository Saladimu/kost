'use strict';

App.registerPage('tenants', async (container) => {
  UI.loading(container);
  try {
    const tenants = await API.get('/tenants');
    const tableHost = document.createElement('div');
    const counts = {
      active: tenants.filter((t) => t.TenantStatus === 'Active').length,
      prospective: tenants.filter((t) => t.TenantStatus === 'Prospective').length,
      out: tenants.filter((t) => t.TenantStatus === 'Checked Out').length,
      balance: tenants.reduce((sum, t) => sum + Number(t.ActiveBalance || 0), 0),
    };
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Manajemen Penghuni</h1><p>Data penghuni aktif, calon penghuni, dan riwayat hunian. Nomor identitas hanya ditampilkan kepada peran yang berwenang.</p></div>
        <div class="page-actions">${App.can('tenants', 'write') ? '<button class="btn btn-primary" type="button" id="add-tenant">Daftarkan penghuni</button>' : ''}</div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Penghuni aktif</div><div class="stat-value">${counts.active}</div><div class="stat-foot">Memiliki perjanjian sewa</div></div>
        <div class="stat-card blue"><div class="stat-label">Calon penghuni</div><div class="stat-value">${counts.prospective}</div><div class="stat-foot">Belum check-in</div></div>
        <div class="stat-card"><div class="stat-label">Sudah check-out</div><div class="stat-value">${counts.out}</div><div class="stat-foot">Riwayat tetap tersimpan</div></div>
        <div class="stat-card ${counts.balance ? 'red' : ''}"><div class="stat-label">Total saldo penghuni</div><div class="stat-value" style="font-size:21px">${UI.currency(counts.balance)}</div><div class="stat-foot">Piutang aktif</div></div>
      </div>
      <div id="tenants-table" class="mt-16"></div>
    `;
    container.querySelector('#tenants-table').appendChild(tableHost);
    build(tenants);

    const add = container.querySelector('#add-tenant');
    if (add) add.addEventListener('click', () => openForm(null));

    function build(rows) {
      UI.table(tableHost, {
        rows,
        searchKeys: ['FullName', 'Phone', 'Email', 'RoomNumber', 'IdentityNumber'],
        searchPlaceholder: 'Cari nama, telepon, kamar...',
        exportName: 'daftar-penghuni',
        rowKey: (row) => row.TenantID,
        defaultSort: 'FullName',
        defaultSortDir: 'asc',
        columns: [
          { key: 'FullName', label: 'Penghuni', render: (row) => UI.cellUser(row.FullName, row.Occupation || row.Email) },
          { key: 'Phone', label: 'Kontak', render: (row) => `${UI.esc(row.Phone)}<span class="sub">${UI.esc(row.Email || '-')}</span>` },
          { key: 'IdentityNumber', label: 'Identitas', render: (row) => `${UI.esc(row.IdentityType || '-')}<span class="sub">${UI.esc(row.IdentityNumber || '-')}</span>` },
          { key: 'RoomNumber', label: 'Kamar', render: (row) => row.RoomNumber ? `<strong>${UI.esc(row.RoomNumber)}</strong>` : '<span class="muted">-</span>' },
          { key: 'ActiveBalance', label: 'Saldo', className: 'numeric', render: (row) => row.ActiveBalance > 0 ? `<span style="color:#b42318;font-weight:700">${UI.currency(row.ActiveBalance)}</span>` : UI.currency(0) },
          { key: 'TenantStatus', label: 'Status', render: (row) => UI.badge(row.TenantStatus) },
          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class="btn-group">
            <button class="btn btn-sm" type="button" data-act="detail">Detail</button>
            ${App.can('tenants', 'write') ? '<button class="btn btn-sm" type="button" data-act="edit">Ubah</button>' : ''}
            ${App.can('agreements', 'write') && row.TenantStatus !== 'Active' && row.TenantStatus !== 'Inactive' ? '<button class="btn btn-sm" type="button" data-act="checkin">Check-in</button>' : ''}
          </div>` },
        ],
        onAction: async (action, row) => {
          if (action === 'edit') openForm(row);
          if (action === 'detail') showDetail(row);
          if (action === 'checkin') openCheckIn(row);
        },
      });
    }

    async function showDetail(tenant) {
      const canFinance = App.can('invoices', 'read');
      let statement = null;
      if (canFinance) {
        try { statement = await API.get('/reports/statement', { tenantId: tenant.TenantID }); } catch (error) { statement = null; }
      }
      const invoices = statement ? statement.invoices.slice(0, 6) : [];
      const payments = statement ? statement.payments.slice(0, 6) : [];
      UI.openModal({
        title: tenant.FullName,
        subtitle: `${tenant.TenantStatus} &middot; terdaftar ${UI.date(tenant.RegistrationDate)}`,
        size: 'lg',
        body: `<div class="grid grid-2">
          <div class="card"><div class="card-body">
            <div class="section-title">Identitas & kontak</div>
            <div class="detail-list">
              <div class="detail-row"><dt>Telepon</dt><dd>${UI.esc(tenant.Phone)}</dd></div>
              <div class="detail-row"><dt>Email</dt><dd>${UI.esc(tenant.Email || '-')}</dd></div>
              <div class="detail-row"><dt>${UI.esc(tenant.IdentityType || 'Identitas')}</dt><dd>${UI.esc(tenant.IdentityNumber || '-')}</dd></div>
              <div class="detail-row"><dt>Pekerjaan</dt><dd>${UI.esc(tenant.Occupation || '-')}</dd></div>
              <div class="detail-row"><dt>Kamar</dt><dd>${UI.esc(tenant.RoomNumber || '-')}</dd></div>
              <div class="detail-row"><dt>Kontak darurat</dt><dd>${UI.esc(tenant.EmergencyContact || '-')}<br>${UI.esc(tenant.EmergencyPhone || '')}</dd></div>
              <div class="detail-row"><dt>Alamat</dt><dd>${UI.esc(tenant.Address || '-')}</dd></div>
            </div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="section-title">Ringkasan akun</div>
            ${canFinance && statement ? `
              <div class="money-lg">${UI.currency(statement.summary.outstanding)}</div>
              <div class="muted small">Total tagihan belum dibayar</div>
              <div class="detail-list mt-16">
                <div class="detail-row"><dt>Total ditagihkan</dt><dd>${UI.currency(statement.summary.totalInvoiced)}</dd></div>
                <div class="detail-row"><dt>Total dibayar</dt><dd>${UI.currency(statement.summary.totalPaid)}</dd></div>
                <div class="detail-row"><dt>Kewajiban deposit</dt><dd>${UI.currency(statement.summary.depositLiability)}</dd></div>
              </div>` : `<div class="notice">Ringkasan keuangan hanya tersedia untuk peran dengan akses invoice.</div>`}
          </div></div>
        </div>
        ${canFinance && invoices.length ? `<div class="card mt-16"><div class="card-head"><h3>Invoice terakhir</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Invoice</th><th>Periode</th><th class="numeric">Total</th><th class="numeric">Sisa</th><th>Status</th></tr></thead><tbody>
          ${invoices.map((inv) => `<tr><td class="strong">${UI.esc(inv.InvoiceNumber)}</td><td>${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}</td><td class="numeric">${UI.currency(inv.TotalAmount)}</td><td class="numeric">${UI.currency(inv.OutstandingBalance)}</td><td>${UI.badge(inv.InvoiceStatus)}</td></tr>`).join('')}
        </tbody></table></div></div>` : ''}
        ${canFinance && payments.length ? `<div class="card mt-16"><div class="card-head"><h3>Pembayaran terakhir</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Kuitansi</th><th>Tanggal</th><th>Metode</th><th class="numeric">Jumlah</th><th>Status</th></tr></thead><tbody>
          ${payments.map((p) => `<tr><td class="strong">${UI.esc(p.ReceiptNumber)}</td><td>${UI.date(p.PaymentDate)}</td><td>${UI.esc(p.PaymentMethod)}</td><td class="numeric">${UI.currency(p.AmountReceived)}</td><td>${UI.badge(p.PaymentStatus)}</td></tr>`).join('')}
        </tbody></table></div></div>` : ''}
        ${tenant.Notes ? `<div class="notice mt-16">${UI.esc(tenant.Notes)}</div>` : ''}`,
        footer: `<button class="btn" type="button" data-close>Tutup</button>`,
        onMount: (overlay, close) => overlay.querySelector('[data-close]').addEventListener('click', close),
      });
    }

    function openForm(tenant) {
      const isEdit = !!tenant;
      UI.formModal({
        title: isEdit ? `Ubah data ${tenant.FullName}` : 'Daftarkan penghuni',
        subtitle: 'Simpan hanya informasi pribadi yang diperlukan untuk operasional.',
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Nama lengkap <em>*</em></span><input name="FullName" required value="${UI.esc(tenant ? tenant.FullName : '')}"></label>
          <label class="field"><span>Nomor telepon <em>*</em></span><input name="Phone" required value="${UI.esc(tenant ? tenant.Phone : '')}" placeholder="0812..."></label>
          <label class="field"><span>Email</span><input type="email" name="Email" value="${UI.esc(tenant ? tenant.Email : '')}"></label>
          <label class="field"><span>Pekerjaan</span><input name="Occupation" value="${UI.esc(tenant ? tenant.Occupation : '')}"></label>
          <label class="field"><span>Jenis identitas</span><select name="IdentityType">${['KTP', 'SIM', 'Paspor', 'Lainnya'].map((type) => `<option ${tenant && tenant.IdentityType === type ? 'selected' : ''}>${type}</option>`).join('')}</select></label>
          <label class="field"><span>Nomor identitas</span><input name="IdentityNumber" value="${UI.esc(tenant ? tenant.IdentityNumber : '')}"></label>
          <label class="field full"><span>Alamat asal</span><textarea name="Address">${UI.esc(tenant ? tenant.Address : '')}</textarea></label>
          <label class="field"><span>Kontak darurat</span><input name="EmergencyContact" value="${UI.esc(tenant ? tenant.EmergencyContact : '')}"></label>
          <label class="field"><span>Telepon darurat</span><input name="EmergencyPhone" value="${UI.esc(tenant ? tenant.EmergencyPhone : '')}"></label>
          <label class="field"><span>Status</span><select name="TenantStatus">${['Prospective', 'Active', 'Checked Out', 'Inactive'].map((status) => `<option value="${status}" ${tenant && tenant.TenantStatus === status ? 'selected' : (!tenant && status === 'Prospective' ? 'selected' : '')}>${status === 'Prospective' ? 'Calon penghuni' : status === 'Active' ? 'Aktif' : status === 'Checked Out' ? 'Sudah check-out' : 'Nonaktif'}</option>`).join('')}</select></label>
          <label class="field full"><span>Catatan</span><textarea name="Notes">${UI.esc(tenant ? tenant.Notes : '')}</textarea></label>
        </div>`,
        submitText: isEdit ? 'Simpan perubahan' : 'Daftarkan',
        onSubmit: async (values) => {
          if (isEdit) values.TenantID = tenant.TenantID;
          await API.post('/tenants', values);
          UI.toast(isEdit ? 'Data penghuni diperbarui.' : 'Penghuni baru terdaftar.');
          await App.refreshMeta();
          App.navigate('#/tenants');
        },
      });
    }

    async function openCheckIn(tenant) {
      let rooms;
      try { rooms = await API.get('/rooms', { status: 'Available' }); } catch (error) { UI.toast(error.message, 'error'); return; }
      if (!rooms.length) { UI.toast('Belum ada kamar tersedia untuk check-in.', 'error'); return; }
      UI.formModal({
        title: `Check-in ${tenant.FullName}`,
        subtitle: 'Buat perjanjian sewa dan catat deposit awal.',
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Kamar <em>*</em></span><select name="RoomID" required>${rooms.map((room) => `<option value="${room.RoomID}" data-price="${room.StandardMonthlyPrice}">${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)} &middot; ${UI.currency(room.StandardMonthlyPrice)}</option>`).join('')}</select></label>
          <label class="field"><span>Tanggal check-in <em>*</em></span><input type="date" name="CheckInDate" required value="${UI.todayISO()}"></label>
          <label class="field"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="AgreedMonthlyPrice" required value="${rooms[0].StandardMonthlyPrice}"></label>
          <label class="field"><span>Deposit keamanan (Rp)</span><input type="number" min="0" step="1000" name="DepositAmount" value="0"></label>
          <label class="field"><span>Rencana check-out</span><input type="date" name="PlannedCheckOut"></label>
          <label class="field"><span>Metode deposit</span><select name="DepositMethod"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
          <label class="field full"><span>Catatan</span><textarea name="Notes"></textarea></label>
        </div>
        <div class="notice mt-16">Invoice periode pertama akan dibuat otomatis setelah check-in berhasil. Sistem menolak check-in jika kamar tidak tersedia atau kapasitas sudah penuh.</div>`,
        submitText: 'Proses check-in',
        onMount: (overlay) => {
          const roomSelect = overlay.querySelector('[name="RoomID"]');
          const price = overlay.querySelector('[name="AgreedMonthlyPrice"]');
          roomSelect.addEventListener('change', () => { price.value = roomSelect.selectedOptions[0].dataset.price; });
        },
        onSubmit: async (values) => {
          values.TenantID = tenant.TenantID;
          const result = await API.post('/check-in', values);
          UI.toast(`Check-in berhasil. ${result.invoicesCreated || 0} invoice dibuat.`, 'success', 'Hunian aktif');
          await App.refreshMeta();
          App.navigate('#/agreements');
        },
      });
    }
  } catch (error) { UI.pageError(container, error); }
});
