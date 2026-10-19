'use strict';

App.registerPage('rooms', async (container) => {
  UI.loading(container);
  try {
    const [rooms, roomTypes] = await Promise.all([API.get('/rooms'), App.can('roomTypes', 'read') ? API.get('/room-types') : Promise.resolve([])]);
    render(rooms, roomTypes);
  } catch (error) { UI.pageError(container, error, () => App.navigate('#/rooms')); }

  function render(rooms, roomTypes) {
    const counts = rooms.reduce((acc, room) => { acc[room.AvailabilityStatus] = (acc[room.AvailabilityStatus] || 0) + 1; return acc; }, {});
    let activeFilter = '';
    const tableHost = document.createElement('div');

    container.innerHTML = `
      <div class="page-header">
        <div><h1>Manajemen Kamar</h1><p>Status kamar dihitung dari hunian aktif dan reservasi, bukan sekadar status manual. Denah dan kapasitas setiap kamar tersaji di sini.</p></div>
        <div class="page-actions">
          ${App.can('roomTypes', 'write') ? '<a class="btn" href="#/room-types">Tipe kamar</a>' : ''}
          ${App.can('rooms', 'write') ? '<button class="btn btn-primary" type="button" id="add-room">Tambah kamar</button>' : ''}
        </div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Total kamar</div><div class="stat-value">${rooms.length}</div><div class="stat-foot">${counts.Inactive || 0} nonaktif</div></div>
        <div class="stat-card"><div class="stat-label">Tersedia</div><div class="stat-value">${counts.Available || 0}</div><div class="stat-foot">Siap disewakan</div></div>
        <div class="stat-card"><div class="stat-label">Terisi</div><div class="stat-value">${counts.Occupied || 0}</div><div class="stat-foot">Memiliki hunian aktif</div></div>
        <div class="stat-card amber"><div class="stat-label">Reservasi / perbaikan</div><div class="stat-value">${(counts.Reserved || 0) + (counts.Maintenance || 0)}</div><div class="stat-foot">${counts.Reserved || 0} reservasi &middot; ${counts.Maintenance || 0} perbaikan</div></div>
      </div>
      <div class="filters mt-16" id="room-filters">
        <div class="chip-select">
          <button class="chip active" type="button" data-status="">Semua</button>
          ${['Available', 'Occupied', 'Reserved', 'Maintenance', 'Inactive'].map((status) => `<button class="chip" type="button" data-status="${status}">${status === 'Available' ? 'Tersedia' : status === 'Occupied' ? 'Terisi' : status === 'Reserved' ? 'Reservasi' : status === 'Maintenance' ? 'Perbaikan' : 'Nonaktif'}</button>`).join('')}
        </div>
      </div>
      <div id="rooms-table" class="mt-16"></div>
    `;
    container.querySelector('#rooms-table').appendChild(tableHost);

    function buildTable(rows) {
      UI.table(tableHost, {
        rows,
        searchKeys: ['RoomNumber', 'RoomTypeName', 'Building', 'OccupantNames'],
        searchPlaceholder: 'Cari nomor kamar atau penghuni...',
        exportName: 'daftar-kamar',
        emptyTitle: 'Belum ada kamar',
        emptyText: 'Tambahkan kamar untuk memulai operasional.',
        rowKey: (row) => row.RoomID,
        defaultSort: 'RoomNumber',
        defaultSortDir: 'asc',
        columns: [
          { key: 'RoomNumber', label: 'Kamar', render: (row) => `<strong>${UI.esc(row.RoomNumber)}</strong><span class="sub">${UI.esc(row.Building || '-')} &middot; lantai ${UI.esc(row.Floor || '-')}</span>` },
          { key: 'RoomTypeName', label: 'Tipe', render: (row) => `${UI.esc(row.RoomTypeName)}<span class="sub">Kapasitas ${row.ActiveOccupants}/${row.Capacity}</span>` },
          { key: 'OccupantNames', label: 'Penghuni', render: (row) => row.OccupantNames ? UI.esc(row.OccupantNames) : '<span class="muted">Kosong</span>' },
          { key: 'StandardMonthlyPrice', label: 'Harga / bulan', className: 'numeric', render: (row) => UI.currency(row.StandardMonthlyPrice) },
          { key: 'AvailabilityStatus', label: 'Status', render: (row) => UI.badge(row.AvailabilityStatus) },
          { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => App.can('rooms', 'write') ? `<div class="btn-group">
            <button class="btn btn-sm" type="button" data-act="edit">Ubah</button>
            ${row.AvailabilityStatus === 'Maintenance' ? '<button class="btn btn-sm" type="button" data-act="activate">Aktifkan</button>' : '<button class="btn btn-sm" type="button" data-act="maintenance">Perbaikan</button>'}
          </div>` : '' },
        ],
        onAction: async (action, row) => {
          if (action === 'edit') return openRoomForm(row, roomTypes);
          if (action === 'maintenance') {
            const confirmed = await UI.confirmDialog({ title: 'Tandai kamar dalam perbaikan', message: `Kamar ${row.RoomNumber} akan ditandai dalam perbaikan. Kamar tidak dapat dipilih untuk check-in sampai status diaktifkan kembali.`, confirmText: 'Tandai perbaikan', danger: true });
            if (!confirmed) return;
            try {
              await API.post('/rooms', { RoomID: row.RoomID, OperationalStatus: 'Maintenance', Notes: row.Notes || 'Ditandai oleh ' + App.user.FullName });
              UI.toast('Kamar ditandai dalam perbaikan.');
              App.navigate('#/rooms');
            } catch (error) { UI.toast(error.message, 'error'); }
          }
          if (action === 'activate') {
            try {
              await API.post('/rooms', { RoomID: row.RoomID, OperationalStatus: 'Available' });
              UI.toast('Kamar aktif kembali.');
              App.navigate('#/rooms');
            } catch (error) { UI.toast(error.message, 'error'); }
          }
        },
      });
    }

    let allRooms = rooms;
    buildTable(allRooms);
    container.querySelectorAll('[data-status]').forEach((button) => {
      button.addEventListener('click', () => {
        container.querySelectorAll('[data-status]').forEach((b) => b.classList.remove('active'));
        button.classList.add('active');
        activeFilter = button.dataset.status;
        buildTable(activeFilter ? allRooms.filter((room) => room.AvailabilityStatus === activeFilter) : allRooms);
      });
    });

    const add = container.querySelector('#add-room');
    if (add) add.addEventListener('click', () => openRoomForm(null, roomTypes));
  }

  function typeOptions(roomTypes, selected) {
    return roomTypes.map((type) => `<option value="${UI.esc(type.RoomTypeID)}" data-price="${type.DefaultMonthlyPrice}" data-capacity="${type.DefaultCapacity}" ${type.RoomTypeID === selected ? 'selected' : ''}>${UI.esc(type.TypeName)} - ${UI.currency(type.DefaultMonthlyPrice)}</option>`).join('');
  }

  function openRoomForm(room, roomTypes) {
    const isEdit = !!room;
    UI.formModal({
      title: isEdit ? `Ubah kamar ${room.RoomNumber}` : 'Tambah kamar baru',
      subtitle: 'Status hunian dihitung otomatis; status operasional diatur manual.',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field"><span>Nomor kamar <em>*</em></span><input name="RoomNumber" required value="${UI.esc(room ? room.RoomNumber : '')}" placeholder="A-101"></label>
        <label class="field"><span>Gedung</span><input name="Building" value="${UI.esc(room ? room.Building : '')}" placeholder="A"></label>
        <label class="field"><span>Lantai</span><input name="Floor" value="${UI.esc(room ? room.Floor : '')}" placeholder="1"></label>
        <label class="field"><span>Tipe kamar <em>*</em></span><select name="RoomTypeID" required>${typeOptions(roomTypes, room ? room.RoomTypeID : '')}</select></label>
        <label class="field"><span>Kapasitas</span><input type="number" min="1" max="10" name="Capacity" value="${room ? room.Capacity : 1}"></label>
        <label class="field"><span>Harga bulanan (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="StandardMonthlyPrice" required value="${room ? room.StandardMonthlyPrice : ''}"></label>
        <label class="field full"><span>Fasilitas</span><textarea name="Facilities" placeholder="Kasur, lemari, AC...">${UI.esc(room ? room.Facilities : '')}</textarea></label>
        <label class="field"><span>Status operasional</span><select name="OperationalStatus">
          ${['Available', 'Maintenance', 'Inactive'].map((status) => `<option value="${status}" ${room && room.OperationalStatus === status ? 'selected' : ''}>${status === 'Available' ? 'Aktif / tersedia' : status === 'Maintenance' ? 'Perbaikan' : 'Nonaktif'}</option>`).join('')}
        </select></label>
        <label class="field"><span>Catatan</span><input name="Notes" value="${UI.esc(room ? room.Notes : '')}" placeholder="Catatan opsional"></label>
      </div>`,
      submitText: isEdit ? 'Simpan perubahan' : 'Tambah kamar',
      onMount: (overlay) => {
        const typeSelect = overlay.querySelector('[name="RoomTypeID"]');
        const capacity = overlay.querySelector('[name="Capacity"]');
        const price = overlay.querySelector('[name="StandardMonthlyPrice"]');
        typeSelect.addEventListener('change', () => {
          const option = typeSelect.selectedOptions[0];
          if (!option) return;
          capacity.value = option.dataset.capacity;
          price.value = option.dataset.price;
        });
        if (!isEdit) {
          const option = typeSelect.selectedOptions[0];
          if (option) { capacity.value = option.dataset.capacity; price.value = option.dataset.price; }
        }
      },
      onSubmit: async (values) => {
        if (isEdit) values.RoomID = room.RoomID;
        await API.post('/rooms', values);
        UI.toast(isEdit ? 'Data kamar diperbarui.' : 'Kamar baru ditambahkan.');
        await App.refreshMeta();
        App.navigate('#/rooms');
      },
    });
  }
});

App.registerPage('room-types', async (container) => {
  UI.loading(container);
  try {
    const types = await API.get('/room-types');
    const tableHost = document.createElement('div');
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Tipe Kamar</h1><p>Template kapasitas, harga dasar, dan fasilitas. Perubahan tipe tidak mengubah invoice atau perjanjian yang sudah terbit.</p></div>
        <div class="page-actions">${App.can('roomTypes', 'write') ? '<button class="btn btn-primary" type="button" id="add-type">Tambah tipe</button>' : ''}</div>
      </div>
      <div id="types-table"></div>
    `;
    container.querySelector('#types-table').appendChild(tableHost);
    function build(rows) {
      UI.table(tableHost, {
        rows,
        searchKeys: ['TypeName', 'Description', 'Facilities'],
        exportName: 'tipe-kamar',
        rowKey: (row) => row.RoomTypeID,
        columns: [
          { key: 'TypeName', label: 'Tipe', render: (row) => `<strong>${UI.esc(row.TypeName)}</strong><span class="sub">${UI.esc(row.Description || '-')}</span>` },
          { key: 'DefaultCapacity', label: 'Kapasitas', render: (row) => `${row.DefaultCapacity} orang` },
          { key: 'DefaultMonthlyPrice', label: 'Harga default', className: 'numeric', render: (row) => UI.currency(row.DefaultMonthlyPrice) },
          { key: 'RoomCount', label: 'Jumlah kamar', className: 'numeric' },
          { key: 'IsActive', label: 'Status', render: (row) => UI.badge(row.IsActive === 'TRUE' ? 'Active' : 'Inactive') },
          { key: 'actions', label: '', sortable: false, render: (row) => App.can('roomTypes', 'write') ? `<button class="btn btn-sm" type="button" data-act="edit">Ubah</button>` : '' },
        ],
        onAction: (action, row) => {
          if (action === 'edit') openForm(row);
        },
      });
    }
    build(types);
    const add = container.querySelector('#add-type');
    if (add) add.addEventListener('click', () => openForm(null));

    function openForm(type) {
      const isEdit = !!type;
      UI.formModal({
        title: isEdit ? `Ubah tipe ${type.TypeName}` : 'Tambah tipe kamar',
        size: 'lg',
        body: `<div class="form-grid">
          <label class="field"><span>Nama tipe <em>*</em></span><input name="TypeName" required value="${UI.esc(type ? type.TypeName : '')}" placeholder="Deluxe"></label>
          <label class="field"><span>Kapasitas default</span><input type="number" min="1" max="10" name="DefaultCapacity" value="${type ? type.DefaultCapacity : 1}"></label>
          <label class="field"><span>Harga bulanan default (Rp) <em>*</em></span><input type="number" min="1" step="1000" name="DefaultMonthlyPrice" required value="${type ? type.DefaultMonthlyPrice : ''}"></label>
          <label class="field"><span>Status</span><select name="IsActive"><option value="TRUE" ${!type || type.IsActive === 'TRUE' ? 'selected' : ''}>Aktif</option><option value="FALSE" ${type && type.IsActive === 'FALSE' ? 'selected' : ''}>Nonaktif</option></select></label>
          <label class="field full"><span>Deskripsi</span><textarea name="Description">${UI.esc(type ? type.Description : '')}</textarea></label>
          <label class="field full"><span>Fasilitas</span><textarea name="Facilities">${UI.esc(type ? type.Facilities : '')}</textarea></label>
        </div>`,
        submitText: isEdit ? 'Simpan perubahan' : 'Tambah tipe',
        onSubmit: async (values) => {
          if (isEdit) values.RoomTypeID = type.RoomTypeID;
          await API.post('/room-types', values);
          UI.toast(isEdit ? 'Tipe kamar diperbarui.' : 'Tipe kamar ditambahkan.');
          await App.refreshMeta();
          App.navigate('#/room-types');
        },
      });
    }
  } catch (error) { UI.pageError(container, error); }
});
