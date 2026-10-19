'use strict';

App.registerPage('reservations', async (container) => {
  UI.loading(container);
  try {
    const [rows, tenants, rooms] = await Promise.all([
      API.get('/reservations'),
      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),
      API.get('/rooms'),
    ]);
    const tableHost = document.createElement('div');
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Reservasi Kamar</h1><p>Kunci kamar untuk calon penghuni. Sistem menolak reservasi yang bentrok dengan hunian atau reservasi lain pada periode yang sama.</p></div>
        <div class="page-actions">${App.can('reservations', 'write') ? '<button class="btn btn-primary" type="button" id="add-reservation">Buat reservasi</button>' : ''}</div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Total reservasi</div><div class="stat-value">${rows.length}</div></div>
        <div class="stat-card blue"><div class="stat-label">Terkonfirmasi</div><div class="stat-value">${rows.filter((r) => r.ReservationStatus === 'Confirmed').length}</div><div class="stat-foot">Menunggu check-in</div></div>
        <div class="stat-card amber"><div class="stat-label">Pending</div><div class="stat-value">${rows.filter((r) => r.ReservationStatus === 'Pending').length}</div></div>
        <div class="stat-card"><div class="stat-label">Dikonversi</div><div class="stat-value">${rows.filter((r) => r.ReservationStatus === 'Converted').length}</div><div class="stat-foot">Menjadi hunian aktif</div></div>
      </div>
      <div id="reservation-table" class="mt-16"></div>
    `;
    container.querySelector('#reservation-table').appendChild(tableHost);
    build(rows);

    const add = container.querySelector('#add-reservation');
    if (add) add.addEventListener('click', openForm);

    function build(data) {
      UI.table(tableHost, {
        rows: data,
        searchKeys: ['TenantName', 'RoomNumber', 'ReservationID', 'Notes'],
        exportName: 'reservasi',
        rowKey: (row) => row.ReservationID,
        defaultSort: 'PlannedCheckIn',
        defaultSortDir: 'asc',
        columns: [
          { key: 'ReservationID', label: 'Reservasi', render: (row) => `<strong>${UI.esc(row.ReservationID)}</strong><span class="sub">${UI.date(row.ReservationDate)}</span>` },
          { key: 'TenantName', label: 'Calon penghuni', render: (row) => UI.cellUser(row.TenantName, row.TenantPhone) },
          { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong>` },
          { key: 'PlannedCheckIn', label: 'Rencana masuk', render: (row) => `${UI.date(row.PlannedCheckIn)}${row.PlannedCheckOut ? `<span class="sub">keluar ${UI.date(row.PlannedCheckOut)}</span>` : ''}` },
          { key: 'AgreedMonthlyPrice', label: 'Harga', className: 'numeric', render: (row) => UI.currency(row.AgreedMonthlyPrice) },
          { key: 'DepositAmount', label: 'Deposit', className: 'numeric', render: (row) => UI.currency(row.DepositAmount) },
          { key: 'ReservationStatus', label: 'Status', render: (row) => UI.badge(row.ReservationStatus) },
          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => {
            if (!App.can('reservations', 'write') || ['Converted', 'Cancelled', 'Expired'].includes(row.ReservationStatus)) return '';
            return `<div class="btn-group">
              ${row.ReservationStatus === 'Pending' ? '<button class="btn btn-sm" type="button" data-act="confirm">Konfirmasi</button>' : ''}
              ${App.can('agreements', 'write') ? '<button class="btn btn-sm" type="button" data-act="checkin">Check-in</button>' : ''}
              <button class="btn btn-sm" type="button" data-act="cancel">Batal</button>
            </div>`;
          } },
        ],
        onAction: async (action, row) => {
          if (action === 'confirm') {
            try {
              await API.post(`/reservations/${row.ReservationID}`, { ReservationStatus: 'Confirmed' });
              UI.toast('Reservasi dikonfirmasi.');
              App.navigate('#/reservations');
            } catch (error) { UI.toast(error.message, 'error'); }
          }
          if (action === 'cancel') {
            const confirmed = await UI.confirmDialog({ title: 'Batalkan reservasi', message: `Reservasi ${row.ReservationID} untuk ${row.TenantName} akan dibatalkan. Kamar kembali tersedia untuk periode tersebut.`, confirmText: 'Batalkan reservasi', danger: true });
            if (!confirmed) return;
            try {
              await API.post(`/reservations/${row.ReservationID}`, { ReservationStatus: 'Cancelled' });
              UI.toast('Reservasi dibatalkan.');
              App.navigate('#/reservations');
            } catch (error) { UI.toast(error.message, 'error'); }
          }
          if (action === 'checkin') openCheckIn(row);
        },
      });
    }

    function openForm() {
      const tenantOptions = tenants.filter((t) => t.TenantStatus !== 'Inactive').map((t) => `<option value="${t.TenantID}">${UI.esc(t.FullName)} &middot; ${UI.esc(t.Phone)}</option>`).join('');
      const roomOptions = rooms.filter((room) => ['Available', 'Reserved'].includes(room.AvailabilityStatus)).map((room) => `<option value="${room.RoomID}" data-price="${room.StandardMonthlyPrice}">${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)}</option>`).join('');
      UI.formModal({
        title: 'Buat reservasi kamar',
        subtitle: 'Reservasi akan memvalidasi bentrok jadwal secara server-side.',
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Calon penghuni <em>*</em></span><select name="TenantID" required>${tenantOptions || '<option value="">Belum ada penghuni</option>'}</select></label>
          <label class="field"><span>Kamar <em>*</em></span><select name="RoomID" required>${roomOptions || '<option value="">Tidak ada kamar</option>'}</select></label>
          <label class="field"><span>Rencana check-in <em>*</em></span><input type="date" name="PlannedCheckIn" required value="${UI.todayISO()}"></label>
          <label class="field"><span>Rencana check-out</span><input type="date" name="PlannedCheckOut"></label>
          <label class="field"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="AgreedMonthlyPrice" required value="${rooms[0] ? rooms[0].StandardMonthlyPrice : ''}"></label>
          <label class="field"><span>Deposit (Rp)</span><input type="number" min="0" step="1000" name="DepositAmount" value="0"></label>
          <label class="field"><span>Status awal</span><select name="ReservationStatus"><option value="Confirmed">Terkonfirmasi</option><option value="Pending">Pending</option></select></label>
          <label class="field full"><span>Catatan</span><textarea name="Notes"></textarea></label>
        </div>
        <div class="notice mt-16">Reservasi tidak mengurangi pendapatan. Konversi menjadi hunian dilakukan melalui tombol Check-in.</div>`,
        submitText: 'Simpan reservasi',
        onMount: (overlay) => {
          const tenant = overlay.querySelector('[name="TenantID"]');
          const room = overlay.querySelector('[name="RoomID"]');
          const price = overlay.querySelector('[name="AgreedMonthlyPrice"]');
          tenant.innerHTML = tenantOptions || '<option value="">Belum ada penghuni</option>';
          if (!tenantOptions) { tenant.closest('.field').insertAdjacentHTML('afterend', '<div class="notice warn full">Daftarkan penghuni terlebih dahulu pada menu Penghuni.</div>'); }
          room.addEventListener('change', () => { const opt = room.selectedOptions[0]; if (opt && opt.dataset.price) price.value = opt.dataset.price; });
        },
        onSubmit: async (values) => {
          await API.post('/reservations', values);
          UI.toast('Reservasi berhasil dibuat.');
          App.navigate('#/reservations');
        },
      });
    }

    function openCheckIn(row) {
      UI.formModal({
        title: `Check-in ${row.TenantName}`,
        subtitle: `Dari reservasi ${row.ReservationID} &middot; kamar ${row.RoomNumber}`,
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Tanggal check-in <em>*</em></span><input type="date" name="CheckInDate" required value="${row.PlannedCheckIn}"></label>
          <label class="field"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="AgreedMonthlyPrice" required value="${row.AgreedMonthlyPrice}"></label>
          <label class="field"><span>Deposit keamanan (Rp)</span><input type="number" min="0" step="1000" name="DepositAmount" value="${row.DepositAmount || 0}"></label>
          <label class="field"><span>Metode deposit</span><select name="DepositMethod"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
          <label class="field"><span>Rencana check-out</span><input type="date" name="PlannedCheckOut" value="${row.PlannedCheckOut || ''}"></label>
          <label class="field full"><span>Catatan</span><textarea name="Notes">${UI.esc(row.Notes || '')}</textarea></label>
        </div>`,
        submitText: 'Konversi & check-in',
        onSubmit: async (values) => {
          values.TenantID = row.TenantID;
          values.RoomID = row.RoomID;
          values.ReservationID = row.ReservationID;
          const result = await API.post('/check-in', values);
          UI.toast(`Check-in berhasil. ${result.invoicesCreated || 0} invoice dibuat.`, 'success', 'Hunian aktif');
          await App.refreshMeta();
          App.navigate('#/agreements');
        },
      });
    }
  } catch (error) { UI.pageError(container, error); }
});

App.registerPage('agreements', async (container) => {
  UI.loading(container);
  try {
    const [rows, tenants, rooms] = await Promise.all([
      API.get('/occupancies'),
      App.can('tenants', 'read') ? API.get('/tenants') : Promise.resolve([]),
      API.get('/rooms'),
    ]);
    const tableHost = document.createElement('div');
    const active = rows.filter((r) => r.AgreementStatus === 'Active');
    const counts = {
      active: active.length,
      ended: rows.filter((r) => r.AgreementStatus === 'Ended').length,
      transfers: rows.filter((r) => r.AgreementStatus === 'Transferred' || r.PreviousOccupancyID).length,
      outstanding: active.reduce((sum, r) => sum + Number(r.OutstandingBalance || 0), 0),
    };
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Perjanjian Sewa</h1><p>Setiap hunian memiliki catatan yang dapat dilacak. Transfer, perpanjangan, dan check-out tidak menimpa riwayat sebelumnya.</p></div>
        <div class="page-actions">${App.can('agreements', 'write') ? '<button class="btn btn-primary" type="button" id="new-checkin">Check-in penghuni</button>' : ''}</div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Hunian aktif</div><div class="stat-value">${counts.active}</div><div class="stat-foot">Perjanjian berjalan</div></div>
        <div class="stat-card purple"><div class="stat-label">Transfer & perpanjangan</div><div class="stat-value">${counts.transfers}</div><div class="stat-foot">Riwayat tetap tersimpan</div></div>
        <div class="stat-card"><div class="stat-label">Selesai</div><div class="stat-value">${counts.ended}</div><div class="stat-foot">Sudah check-out</div></div>
        <div class="stat-card ${counts.outstanding ? 'red' : ''}"><div class="stat-label">Saldo hunian aktif</div><div class="stat-value" style="font-size:20px">${UI.currency(counts.outstanding)}</div><div class="stat-foot">Tagihan belum dibayar</div></div>
      </div>
      <div id="agreement-table" class="mt-16"></div>
    `;
    container.querySelector('#agreement-table').appendChild(tableHost);
    build(rows);

    const checkin = container.querySelector('#new-checkin');
    if (checkin) checkin.addEventListener('click', openCheckInForm);

    function build(data) {
      UI.table(tableHost, {
        rows: data,
        searchKeys: ['TenantName', 'RoomNumber', 'OccupancyID', 'Notes'],
        exportName: 'perjanjian-sewa',
        rowKey: (row) => row.OccupancyID,
        defaultSort: 'CheckInDate',
        defaultSortDir: 'desc',
        columns: [
          { key: 'TenantName', label: 'Penghuni', render: (row) => UI.cellUser(row.TenantName, row.TenantPhone) },
          { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong><span class="sub">${row.PreviousOccupancyID ? 'dari ' + UI.esc(row.PreviousOccupancyID) : 'hunian awal'}</span>` },
          { key: 'CheckInDate', label: 'Check-in', render: (row) => `${UI.date(row.CheckInDate)}${row.ActualCheckOut ? `<span class="sub">keluar ${UI.date(row.ActualCheckOut)}</span>` : row.PlannedCheckOut ? `<span class="sub">rencana keluar ${UI.date(row.PlannedCheckOut)}</span>` : ''}` },
          { key: 'AgreedMonthlyPrice', label: 'Sewa / bulan', className: 'numeric', render: (row) => `${UI.currency(row.AgreedMonthlyPrice)}<span class="sub">jatuh tempo tgl ${row.DueDay}</span>` },
          { key: 'DepositAmount', label: 'Deposit', className: 'numeric', render: (row) => UI.currency(row.DepositAmount) },
          { key: 'OutstandingBalance', label: 'Saldo', className: 'numeric', render: (row) => row.OutstandingBalance > 0 ? `<strong style="color:#b42318">${UI.currency(row.OutstandingBalance)}</strong>` : UI.currency(0) },
          { key: 'AgreementStatus', label: 'Status', render: (row) => UI.badge(row.AgreementStatus) },
          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => `<div class="btn-group">
            <button class="btn btn-sm" type="button" data-act="detail">Detail</button>
            ${App.can('agreements', 'write') && row.AgreementStatus === 'Active' ? `
              <button class="btn btn-sm" type="button" data-act="transfer">Pindah</button>
              <button class="btn btn-sm" type="button" data-act="renew">Perpanjang</button>
              <button class="btn btn-sm btn-danger" type="button" data-act="checkout">Check-out</button>` : ''}
          </div>` },
        ],
        onAction: async (action, row) => {
          if (action === 'detail') showDetail(row);
          if (action === 'transfer') openTransfer(row);
          if (action === 'renew') openRenew(row);
          if (action === 'checkout') openCheckout(row);
        },
      });
    }

    function showDetail(row) {
      UI.openModal({
        title: `Perjanjian ${row.OccupancyID}`,
        subtitle: `${row.TenantName} &middot; kamar ${row.RoomNumber}`,
        size: 'lg',
        body: `<div class="grid grid-2">
          <div class="card"><div class="card-body"><div class="section-title">Perjanjian sewa</div><div class="detail-list">
            <div class="detail-row"><dt>Penghuni</dt><dd>${UI.esc(row.TenantName)}</dd></div>
            <div class="detail-row"><dt>Kamar</dt><dd>${UI.esc(row.RoomNumber)}</dd></div>
            <div class="detail-row"><dt>Mulai</dt><dd>${UI.date(row.CheckInDate)}</dd></div>
            <div class="detail-row"><dt>Selesai / keluar</dt><dd>${row.ActualCheckOut ? UI.date(row.ActualCheckOut) : row.PlannedCheckOut ? UI.date(row.PlannedCheckOut) : '-'}</dd></div>
            <div class="detail-row"><dt>Sewa bulanan</dt><dd>${UI.currency(row.AgreedMonthlyPrice)}</dd></div>
            <div class="detail-row"><dt>Tanggal penagihan</dt><dd>Tanggal ${row.BillingDay}</dd></div>
            <div class="detail-row"><dt>Jatuh tempo</dt><dd>${row.DueDay} hari setelah periode</dd></div>
            <div class="detail-row"><dt>Deposit</dt><dd>${UI.currency(row.DepositAmount)}</dd></div>
            <div class="detail-row"><dt>Status</dt><dd>${UI.badge(row.AgreementStatus)}</dd></div>
            <div class="detail-row"><dt>Hunian sebelumnya</dt><dd>${UI.esc(row.PreviousOccupancyID || '-')}</dd></div>
          </div></div></div>
          <div class="card"><div class="card-body"><div class="section-title">Catatan</div><p class="small" style="color:#4a5c59">${UI.esc(row.Notes || 'Tidak ada catatan.')}</p>
            <div class="notice mt-16">Perjanjian aktif: <strong>${row.AgreementStatus === 'Active' ? 'Ya' : 'Tidak'}</strong>. Tagihan dan pembayaran masa lalu tetap merujuk pada hunian ini.</div>
          </div></div>
        </div>`,
        footer: `<button class="btn" type="button" data-print>Cetak perjanjian</button><button class="btn btn-primary" type="button" data-close>Tutup</button>`,
        onMount: (overlay, close) => {
          overlay.querySelector('[data-close]').addEventListener('click', close);
          overlay.querySelector('[data-print]').addEventListener('click', () => {
            UI.printDocument(`Perjanjian ${row.OccupancyID}`, `${UI.docHeader(App.property, 'Perjanjian Sewa', [['No. Hunian', row.OccupancyID], ['Tanggal cetak', UI.date(UI.todayISO())]])}
              <h3>Penghuni</h3><p>${UI.esc(row.TenantName)}<br>${UI.esc(row.TenantPhone)}</p>
              <h3>Kamar dan ketentuan</h3><table><tbody>
                <tr><td>Kamar</td><td>${UI.esc(row.RoomNumber)}</td></tr>
                <tr><td>Mulai hunian</td><td>${UI.date(row.CheckInDate)}</td></tr>
                <tr><td>Sewa bulanan</td><td>${UI.currency(row.AgreedMonthlyPrice)}</td></tr>
                <tr><td>Deposit</td><td>${UI.currency(row.DepositAmount)}</td></tr>
                <tr><td>Status</td><td>${UI.esc(row.AgreementStatus)}</td></tr>
              </tbody></table>
              <p style="margin-top:20px">Penghuni menyetujui ketentuan sewa, jadwal pembayaran, dan kebijakan deposit yang berlaku di ${UI.esc(App.property.name)}.</p>
              <div style="display:flex;justify-content:space-between;margin-top:50px"><div>Penghuni<br><br><br>____________________</div><div>Pengelola<br><br><br>____________________</div></div>
              <div class="doc-foot">${UI.esc(App.property.name)} &middot; ${UI.esc(App.property.address)}</div>`);
          });
        },
      });
    }

    function roomOptions(selected) {
      return rooms.filter((room) => room.OperationalStatus !== 'Inactive' && room.OperationalStatus !== 'Maintenance' && (room.AvailabilityStatus === 'Available' || (room.AvailabilityStatus === 'Occupied' && room.ActiveOccupants < room.Capacity)))
        .map((room) => `<option value="${room.RoomID}" data-price="${room.StandardMonthlyPrice}" ${selected === room.RoomID ? 'selected' : ''}>${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)} (${room.ActiveOccupants}/${room.Capacity})</option>`).join('');
    }

    function openCheckInForm() {
      const tenantOptions = tenants.filter((t) => t.TenantStatus !== 'Inactive').map((t) => `<option value="${t.TenantID}" data-status="${t.TenantStatus}">${UI.esc(t.FullName)} &middot; ${UI.esc(t.Phone)} &middot; ${t.TenantStatus}</option>`).join('');
      UI.formModal({
        title: 'Check-in penghuni',
        subtitle: 'Buat perjanjian sewa baru dan invoice periode pertama.',
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Penghuni <em>*</em></span><select name="TenantID" required>${tenantOptions || '<option value="">Belum ada penghuni</option>'}</select></label>
          <label class="field"><span>Kamar <em>*</em></span><select name="RoomID" required>${roomOptions() || '<option value="">Tidak ada kamar tersedia</option>'}</select></label>
          <label class="field"><span>Tanggal check-in <em>*</em></span><input type="date" name="CheckInDate" required value="${UI.todayISO()}"></label>
          <label class="field"><span>Rencana check-out</span><input type="date" name="PlannedCheckOut"></label>
          <label class="field"><span>Harga sewa disepakati (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="AgreedMonthlyPrice" required value="${rooms[0] ? rooms[0].StandardMonthlyPrice : ''}"></label>
          <label class="field"><span>Deposit keamanan (Rp)</span><input type="number" min="0" step="1000" name="DepositAmount" value="0"></label>
          <label class="field"><span>Metode deposit</span><select name="DepositMethod"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
          <label class="field"><span>Catatan</span><input name="Notes"></label>
        </div>
        <div class="notice mt-16">Kebijakan penagihan: sewa penuh per periode bulanan sejak tanggal check-in. Tanggal 29-31 mengikuti hari terakhir bulan.</div>`,
        submitText: 'Proses check-in',
        onMount: (overlay) => {
          const room = overlay.querySelector('[name="RoomID"]');
          const price = overlay.querySelector('[name="AgreedMonthlyPrice"]');
          room.addEventListener('change', () => { const opt = room.selectedOptions[0]; if (opt && opt.dataset.price) price.value = opt.dataset.price; });
        },
        onSubmit: async (values) => {
          const result = await API.post('/check-in', values);
          UI.toast(`Check-in berhasil. ${result.invoicesCreated || 0} invoice dibuat.`, 'success', 'Hunian aktif');
          await App.refreshMeta();
          App.navigate('#/agreements');
        },
      });
    }

    function openTransfer(row) {
      UI.formModal({
        title: `Pindahkan ${row.TenantName}`,
        subtitle: `Dari kamar ${row.RoomNumber}. Riwayat hunian lama tidak diubah.`,
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Kamar tujuan <em>*</em></span><select name="ToRoomID" required>${roomOptions() || '<option value="">Tidak ada kamar tersedia</option>'}</select></label>
          <label class="field"><span>Tanggal pindah <em>*</em></span><input type="date" name="TransferDate" required value="${UI.todayISO()}"></label>
          <label class="field"><span>Harga sewa baru (Rp)</span><input type="number" min="1" step="1000" name="NewMonthlyPrice" value="${row.AgreedMonthlyPrice}"></label>
          <label class="field"><span>Alasan</span><input name="Reason" placeholder="Permintaan penghuni"></label>
        </div>
        <div class="notice warn mt-16">Kebijakan transfer: periode berjalan yang sudah ditagihkan tetap berlaku. Periode kamar baru dimulai setelah periode terakhir kamar lama berakhir agar tidak terjadi tagihan ganda. Deposit dialihkan ke hunian baru.</div>`,
        submitText: 'Proses transfer',
        onSubmit: async (values) => {
          values.OccupancyID = row.OccupancyID;
          await API.post('/transfers', values);
          UI.toast('Transfer kamar berhasil.');
          await App.refreshMeta();
          App.navigate('#/agreements');
        },
      });
    }

    function openRenew(row) {
      const nextMonth = new Date();
      nextMonth.setDate(1);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const suggested = nextMonth.toLocaleDateString('en-CA');
      UI.formModal({
        title: `Perpanjang sewa ${row.TenantName}`,
        subtitle: `Hunian ${row.OccupancyID} &middot; kamar ${row.RoomNumber}`,
        body: `<div class="form-grid">
          <label class="field"><span>Tanggal efektif <em>*</em></span><input type="date" name="EffectiveDate" required value="${suggested}"></label>
          <label class="field"><span>Harga sewa baru (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="NewMonthlyPrice" required value="${row.AgreedMonthlyPrice}"></label>
          <label class="field full"><span>Catatan</span><textarea name="Notes"></textarea></label>
        </div>
        <div class="notice mt-16">Perpanjangan membuat catatan hunian baru dengan referensi ke hunian sebelumnya. Invoice dan pembayaran lama tidak berubah.</div>`,
        submitText: 'Perpanjang perjanjian',
        onSubmit: async (values) => {
          values.OccupancyID = row.OccupancyID;
          await API.post('/renew', values);
          UI.toast('Perjanjian diperpanjang.');
          await App.refreshMeta();
          App.navigate('#/agreements');
        },
      });
    }

    function openCheckout(row) {
      UI.formModal({
        title: `Check-out ${row.TenantName}`,
        subtitle: `Kamar ${row.RoomNumber}. Deposito dan tagihan akan diselesaikan.`,
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Tanggal check-out <em>*</em></span><input type="date" name="CheckOutDate" required value="${UI.todayISO()}"></label>
          <label class="field"><span>Potongan deposit (Rp)</span><input type="number" min="0" step="1000" name="DepositDeduction" value="0"></label>
          <label class="field full"><span>Alasan potongan / kerusakan</span><input name="DeductionReason" placeholder="Contoh: kerusakan kunci, pembersihan ekstra"></label>
          <label class="field"><span>Metode pengembalian deposit</span><select name="ReturnMethod"><option>Cash</option><option>Bank Transfer</option><option>QRIS</option><option>Other</option></select></label>
          <label class="field"><span>Catatan</span><input name="Notes"></label>
        </div>
        <div class="notice warn mt-16">Tagihan yang belum dibayar tetap menjadi kewajiban penghuni. Kamar akan masuk status perbaikan sampai tugas pembersihan diselesaikan.</div>`,
        submitText: 'Proses check-out',
        onSubmit: async (values) => {
          values.OccupancyID = row.OccupancyID;
          const result = await API.post('/check-out', values);
          showSettlement(row, result.settlement);
          await App.refreshMeta();
        },
      });
    }

    function showSettlement(row, settlement) {
      const deposit = settlement.deposit;
      UI.openModal({
        title: 'Ringkasan check-out',
        subtitle: `${row.TenantName} &middot; ${row.RoomNumber} &middot; ${UI.date(settlement.checkOutDate)}`,
        size: 'lg',
        body: `<div class="settlement-hero">
          <div class="stat-label">Sisa tagihan penghuni</div>
          <div class="money-lg ${settlement.outstandingTotal ? 'money-negative' : 'money-positive'}">${UI.currency(settlement.outstandingTotal)}</div>
          <div class="settlement-note">${settlement.outstandingInvoices.length} invoice belum lunas</div>
        </div>
        <div class="grid grid-2">
          <div class="card"><div class="card-body"><div class="section-title">Deposit</div>
            ${deposit ? `<div class="detail-list">
              <div class="detail-row"><dt>Deposit awal</dt><dd>${UI.currency(deposit.deposit.DepositAmount)}</dd></div>
              <div class="detail-row"><dt>Potongan</dt><dd>${UI.currency(deposit.deduction)}</dd></div>
              <div class="detail-row"><dt>Dikembalikan</dt><dd>${UI.currency(deposit.returnAmount)}</dd></div>
              <div class="detail-row"><dt>Status</dt><dd>${UI.badge(deposit.deposit.DepositStatus)}</dd></div>
            </div>` : '<div class="notice">Tidak ada deposit yang tercatat.</div>'}
          </div></div>
          <div class="card"><div class="card-body"><div class="section-title">Tindak lanjut</div><div class="detail-list">
            <div class="detail-row"><dt>Status kamar</dt><dd>${UI.badge(settlement.roomStatus)}</dd></div>
            <div class="detail-row"><dt>Tugas kebersihan</dt><dd>${settlement.cleaningActivity ? 'Dibuat otomatis' : 'Tidak diperlukan'}</dd></div>
            <div class="detail-row"><dt>Hunian</dt><dd>Selesai (riwayat tersimpan)</dd></div>
          </div></div></div>
        </div>
        ${settlement.outstandingInvoices.length ? `<div class="card mt-16"><div class="card-head"><h3>Invoice belum lunas</h3></div><div class="table-wrap"><table class="data"><thead><tr><th>Invoice</th><th>Periode</th><th class="numeric">Sisa</th><th>Status</th></tr></thead><tbody>
          ${settlement.outstandingInvoices.map((inv) => `<tr><td class="strong">${UI.esc(inv.InvoiceNumber)}</td><td>${UI.date(inv.PeriodStart)} - ${UI.date(inv.PeriodEnd)}</td><td class="numeric">${UI.currency(inv.OutstandingBalance)}</td><td>${UI.badge(inv.InvoiceStatus)}</td></tr>`).join('')}
        </tbody></table></div></div>` : ''}`,
        footer: `<a class="btn" href="#/invoices" data-close>Lihat invoice</a><button class="btn btn-primary" type="button" data-close>Tutup</button>`,
        onMount: (overlay, close) => {
          overlay.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', () => { close(); App.navigate('#/agreements'); }));
        },
      });
    }
  } catch (error) { UI.pageError(container, error); }
});
