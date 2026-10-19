'use strict';

App.registerPage('staff', (container) => renderTeam(container, 'staff'));
App.registerPage('users', (container) => renderTeam(container, 'users'));
App.registerPage('activities', (container) => renderTeam(container, 'activities'));

async function renderTeam(container, initialTab) {
  const ROLES = ['Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff'];
  const state = {
    tab: initialTab,
    staff: [],
    users: [],
    activities: [],
    loaded: false,
  };
  if (!App.can('staff', 'read') && !App.can('users', 'read') && !App.can('activities', 'read')) {
    UI.pageError(container, new Error('Anda tidak memiliki akses ke halaman ini.'));
    return;
  }
  if (!App.can('staff', 'read') && state.tab === 'staff') state.tab = 'activities';
  if (!App.can('users', 'read') && state.tab === 'users') state.tab = 'activities';

  UI.loading(container);
  try {
    await load();
  } catch (error) { UI.pageError(container, error); }

  async function load() {
    const [staff, users, activities] = await Promise.all([
      App.can('staff', 'read') ? API.get('/staff') : Promise.resolve([]),
      App.can('users', 'read') ? API.get('/users') : Promise.resolve([]),
      App.can('activities', 'read') ? API.get('/activities') : Promise.resolve([]),
    ]);
    state.staff = staff;
    state.users = users;
    state.activities = activities;
    render();
  }

  function render() {
    const activeStaff = state.staff.filter((s) => s.EmploymentStatus === 'Active');
    const openTasks = state.activities.filter((a) => ['Pending', 'In Progress'].includes(a.Status));
    container.innerHTML = `
      <div class="page-header">
        <div><h1>Tim & Tugas Operasional</h1><p>Kelola staf, akun login dengan peran terbatas, dan tugas kebersihan atau perawatan kamar.</p></div>
        <div class="page-actions">
          ${state.tab === 'activities' && App.can('activities', 'write') ? '<button class="btn btn-primary" type="button" id="new-task">Buat tugas</button>' : ''}
          ${state.tab === 'staff' && App.can('staff', 'write') ? '<button class="btn btn-primary" type="button" id="new-staff">Tambah staf</button>' : ''}
          ${state.tab === 'users' && App.can('users', 'write') ? '<button class="btn btn-primary" type="button" id="new-user">Tambah akun</button>' : ''}
        </div>
      </div>
      <div class="grid grid-4">
        <div class="stat-card"><div class="stat-label">Staf aktif</div><div class="stat-value">${activeStaff.length}</div><div class="stat-foot">${state.staff.length} total staf</div></div>
        <div class="stat-card blue"><div class="stat-label">Akun login</div><div class="stat-value">${state.users.filter((u) => u.IsActive === 'TRUE').length}</div><div class="stat-foot">${state.users.length} akun terdaftar</div></div>
        <div class="stat-card ${openTasks.length ? 'amber' : ''}"><div class="stat-label">Tugas terbuka</div><div class="stat-value">${openTasks.length}</div><div class="stat-foot">${state.activities.filter((a) => a.Status === 'Pending').length} belum dimulai</div></div>
        <div class="stat-card"><div class="stat-label">Selesai</div><div class="stat-value">${state.activities.filter((a) => a.Status === 'Completed').length}</div><div class="stat-foot">Sepanjang catatan</div></div>
      </div>
      <div class="tabs mt-16">
        ${App.can('staff', 'read') ? `<button class="tab ${state.tab === 'staff' ? 'active' : ''}" type="button" data-tab="staff">Staf</button>` : ''}
        ${App.can('users', 'read') ? `<button class="tab ${state.tab === 'users' ? 'active' : ''}" type="button" data-tab="users">Akun & Peran</button>` : ''}
        ${App.can('activities', 'read') ? `<button class="tab ${state.tab === 'activities' ? 'active' : ''}" type="button" data-tab="activities">Tugas</button>` : ''}
      </div>
      <div id="team-content"></div>
    `;
    container.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { state.tab = button.dataset.tab; render(); }));
    if (state.tab === 'staff') renderStaff();
    else if (state.tab === 'users') renderUsers();
    else renderActivities();
    const addStaff = container.querySelector('#new-staff');
    if (addStaff) addStaff.addEventListener('click', () => openStaffForm(null));
    const addUser = container.querySelector('#new-user');
    if (addUser) addUser.addEventListener('click', openUserForm);
    const addTask = container.querySelector('#new-task');
    if (addTask) addTask.addEventListener('click', openTaskForm);
  }

  function renderStaff() {
    const host = document.createElement('div');
    container.querySelector('#team-content').appendChild(host);
    UI.table(host, {
      rows: state.staff,
      searchKeys: ['FullName', 'Position', 'Phone', 'Email', 'AppRole'],
      searchPlaceholder: 'Cari staf, posisi, telepon...',
      exportName: 'staf',
      rowKey: (row) => row.StaffID,
      columns: [
        { key: 'FullName', label: 'Staf', render: (row) => `${UI.cellUser(row.FullName, row.StaffID)}` },
        { key: 'Position', label: 'Posisi', render: (row) => `${UI.esc(row.Position || '-')}<span class="sub">${UI.esc(row.AppRole)}</span>` },
        { key: 'Phone', label: 'Kontak', render: (row) => `${UI.esc(row.Phone || '-')}<span class="sub">${UI.esc(row.Email || '')}</span>` },
        { key: 'StartDate', label: 'Mulai', render: (row) => UI.date(row.StartDate) },
        { key: 'LoginEmail', label: 'Akun', render: (row) => row.LoginEmail ? `${UI.esc(row.LoginEmail)}<span class="sub">${UI.esc(row.LoginRole)}</span>` : '<span class="muted">Belum ada akun</span>' },
        { key: 'EmploymentStatus', label: 'Status', render: (row) => UI.badge(row.EmploymentStatus) },
        { key: 'actions', label: '', sortable: false, render: () => App.can('staff', 'write') ? '<button class="btn btn-sm" type="button" data-act="edit">Ubah</button>' : '' },
      ],
      onAction: (action, row) => { if (action === 'edit') openStaffForm(row); },
    });
  }

  function renderUsers() {
    const host = document.createElement('div');
    container.querySelector('#team-content').appendChild(host);
    UI.table(host, {
      rows: state.users,
      searchKeys: ['FullName', 'Email', 'Role'],
      searchPlaceholder: 'Cari nama, email, peran...',
      exportName: 'akun-pengguna',
      rowKey: (row) => row.UserID,
      columns: [
        { key: 'FullName', label: 'Pengguna', render: (row) => UI.cellUser(row.FullName, row.Email) },
        { key: 'Role', label: 'Peran', render: (row) => `<span class="badge blue">${UI.esc(row.Role)}</span>` },
        { key: 'IsActive', label: 'Status', render: (row) => UI.badge(row.IsActive === 'TRUE' ? 'Active' : 'Inactive') },
        { key: 'CreatedAt', label: 'Dibuat', render: (row) => UI.dateTime(row.CreatedAt) },
        { key: 'actions', label: '', sortable: false, render: () => App.can('users', 'write') ? '<button class="btn btn-sm" type="button" data-act="edit">Ubah</button>' : '' },
      ],
      onAction: (action, row) => { if (action === 'edit') openUserEdit(row); },
    });
  }

  function renderActivities() {
    const host = document.createElement('div');
    container.querySelector('#team-content').appendChild(host);
    UI.table(host, {
      rows: state.activities,
      searchKeys: ['ActivityID', 'Description', 'StaffName', 'RoomNumber', 'Category'],
      searchPlaceholder: 'Cari tugas, staf, kamar...',
      exportName: 'tugas-operasional',
      rowKey: (row) => row.ActivityID,
      defaultSort: 'DueDate',
      defaultSortDir: 'asc',
      columns: [
        { key: 'ActivityDate', label: 'Tanggal', render: (row) => `${UI.date(row.ActivityDate)}<span class="sub">${UI.esc(row.ActivityID)}</span>` },
        { key: 'Description', label: 'Tugas', render: (row) => `<strong>${UI.esc(row.Description)}</strong><span class="sub">${UI.esc(row.Category)}${row.RoomNumber ? ` &middot; ${UI.esc(row.RoomNumber)}` : ''}${row.Priority !== 'Normal' ? ` &middot; ${UI.esc(row.Priority)}` : ''}</span>` },
        { key: 'StaffName', label: 'Petugas', render: (row) => UI.esc(row.StaffName) },
        { key: 'DueDate', label: 'Batas', render: (row) => UI.date(row.DueDate) },
        { key: 'Status', label: 'Status', render: (row) => UI.badge(row.Status) },
        { key: 'actions', label: '', sortable: false, className: 'nowrap', render: (row) => {
          if (!App.can('activities', 'write')) return '';
          const buttons = [];
          if (row.Status === 'Pending') buttons.push('<button class="btn btn-sm" type="button" data-act="start">Mulai</button>');
          if (['Pending', 'In Progress'].includes(row.Status)) buttons.push('<button class="btn btn-sm btn-primary" type="button" data-act="complete">Selesai</button>');
          if (row.Status === 'Pending') buttons.push('<button class="btn btn-sm btn-danger" type="button" data-act="cancel">Batal</button>');
          return `<div class="btn-group">${buttons.join('')}</div>`;
        } },
      ],
      onAction: async (action, row) => {
        const statusMap = { start: 'In Progress', complete: 'Completed', cancel: 'Cancelled' };
        if (!statusMap[action]) return;
        if (action === 'cancel') {
          const ok = await UI.confirmDialog({ title: 'Batalkan tugas', message: `Tugas "${row.Description}" akan dibatalkan.`, confirmText: 'Batalkan tugas', danger: true });
          if (!ok) return;
        }
        try {
          await API.post(`/activities/${row.ActivityID}`, { Status: statusMap[action] });
          UI.toast(action === 'complete' ? 'Tugas ditandai selesai.' : 'Status tugas diperbarui.');
          state.activities = await API.get('/activities');
          render();
        } catch (error) { UI.toast(error.message, 'error'); }
      },
    });
  }

  function openStaffForm(staff) {
    const isEdit = !!staff;
    UI.formModal({
      title: isEdit ? `Ubah ${staff.FullName}` : 'Tambah staf',
      size: 'lg',
      body: `<div class="form-grid">
        <label class="field"><span>Nama lengkap <em>*</em></span><input name="FullName" required value="${UI.esc(staff ? staff.FullName : '')}"></label>
        <label class="field"><span>Posisi</span><input name="Position" value="${UI.esc(staff ? staff.Position : '')}" placeholder="Resepsionis, Teknisi..."></label>
        <label class="field"><span>Telepon</span><input name="Phone" value="${UI.esc(staff ? staff.Phone : '')}"></label>
        <label class="field"><span>Email</span><input type="email" name="Email" value="${UI.esc(staff ? staff.Email : '')}"></label>
        <label class="field"><span>Peran aplikasi <em>*</em></span><select name="AppRole" required>${ROLES.map((role) => `<option ${staff && staff.AppRole === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>
        <label class="field"><span>Status kepegawaian</span><select name="EmploymentStatus">${['Active', 'Inactive', 'Resigned'].map((status) => `<option ${staff && staff.EmploymentStatus === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label>
        <label class="field"><span>Tanggal mulai</span><input type="date" name="StartDate" value="${UI.esc(staff ? staff.StartDate : UI.todayISO())}"></label>
        <label class="field"><span>Tanggal selesai</span><input type="date" name="EndDate" value="${UI.esc(staff ? staff.EndDate : '')}"></label>
        <label class="field full"><span>Catatan</span><textarea name="Notes">${UI.esc(staff ? staff.Notes : '')}</textarea></label>
      </div>`,
      submitText: isEdit ? 'Simpan perubahan' : 'Tambah staf',
      onSubmit: async (values) => {
        if (isEdit) values.StaffID = staff.StaffID;
        await API.post('/staff', values);
        UI.toast(isEdit ? 'Data staf diperbarui.' : 'Staf ditambahkan.');
        state.staff = await API.get('/staff');
        state.users = App.can('users', 'read') ? await API.get('/users') : state.users;
        render();
      },
    });
  }

  function openUserForm() {
    const available = state.staff.filter((s) => !s.LoginEmail && s.EmploymentStatus !== 'Resigned');
    if (!available.length) { UI.toast('Semua staf sudah memiliki akun atau belum ada staf baru.', 'error'); return; }
    UI.formModal({
      title: 'Tambah akun login',
      subtitle: 'Setiap akun terhubung ke satu data staf dan peran akses.',
      body: `<div class="form-grid">
        <label class="field full"><span>Staf <em>*</em></span><select name="StaffID" required>${available.map((s) => `<option value="${s.StaffID}">${UI.esc(s.FullName)} &middot; ${UI.esc(s.Position || s.AppRole)}</option>`).join('')}</select></label>
        <label class="field"><span>Email <em>*</em></span><input type="email" name="Email" required placeholder="nama@kos.id"></label>
        <label class="field"><span>Password <em>*</em></span><input type="password" name="Password" required minlength="6" placeholder="Minimal 6 karakter"></label>
        <label class="field"><span>Peran <em>*</em></span><select name="Role" required>${ROLES.map((role) => `<option>${role}</option>`).join('')}</select></label>
      </div>`,
      submitText: 'Buat akun',
      onSubmit: async (values) => {
        await API.post('/users', values);
        UI.toast('Akun login dibuat.');
        state.users = await API.get('/users');
        state.staff = App.can('staff', 'read') ? await API.get('/staff') : state.staff;
        render();
      },
    });
  }

  function openUserEdit(user) {
    UI.formModal({
      title: `Ubah akun ${user.FullName}`,
      subtitle: user.Email,
      body: `<div class="form-grid">
        <label class="field"><span>Email <em>*</em></span><input type="email" name="Email" required value="${UI.esc(user.Email)}"></label>
        <label class="field"><span>Peran <em>*</em></span><select name="Role" required>${ROLES.map((role) => `<option ${user.Role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label>
        <label class="field"><span>Status</span><select name="IsActive"><option value="TRUE" ${user.IsActive === 'TRUE' ? 'selected' : ''}>Aktif</option><option value="FALSE" ${user.IsActive === 'FALSE' ? 'selected' : ''}>Nonaktif</option></select></label>
        <label class="field"><span>Password baru</span><input type="password" name="Password" minlength="6" placeholder="Kosongkan jika tidak diubah"></label>
      </div>`,
      submitText: 'Simpan akun',
      onSubmit: async (values) => {
        values.UserID = user.UserID;
        if (!values.Password) delete values.Password;
        await API.post('/users', values);
        UI.toast('Akun diperbarui.');
        state.users = await API.get('/users');
        render();
      },
    });
  }

  function openTaskForm() {
    const canAssign = App.can('staff', 'read') && state.staff.length;
    UI.formModal({
      title: 'Buat tugas operasional',
      size: 'lg',
      body: `<div class="form-grid">
        ${canAssign ? `<label class="field full"><span>Petugas <em>*</em></span><select name="StaffID" required>${state.staff.filter((s) => s.EmploymentStatus === 'Active').map((s) => `<option value="${s.StaffID}">${UI.esc(s.FullName)} &middot; ${UI.esc(s.Position || s.AppRole)}</option>`).join('')}</select></label>` : `<input type="hidden" name="StaffID" value="${App.user.StaffID}">`}
        <label class="field"><span>Kategori <em>*</em></span><select name="Category" required>${['Cleaning', 'Maintenance', 'Inspection', 'Security', 'Administration', 'Other'].map((cat) => `<option>${cat}</option>`).join('')}</select></label>
        <label class="field"><span>Prioritas</span><select name="Priority"><option>Low</option><option selected>Normal</option><option>High</option><option>Urgent</option></select></label>
        <label class="field"><span>Kamar</span><select name="RoomID"><option value="">Tanpa kamar</option>${(App.meta.rooms || []).map((room) => `<option value="${room.RoomID}">${UI.esc(room.RoomNumber)} &middot; ${UI.esc(room.RoomTypeName)}</option>`).join('')}</select></label>
        <label class="field"><span>Tanggal tugas</span><input type="date" name="ActivityDate" value="${UI.todayISO()}"></label>
        <label class="field"><span>Batas waktu</span><input type="date" name="DueDate" value="${UI.todayISO()}"></label>
        <label class="field full"><span>Deskripsi tugas <em>*</em></span><textarea name="Description" required placeholder="Contoh: bersihkan kamar 08 setelah check-out"></textarea></label>
      </div>`,
      submitText: 'Buat tugas',
      onSubmit: async (values) => {
        await API.post('/activities', values);
        UI.toast('Tugas dibuat.');
        state.activities = await API.get('/activities');
        state.tab = 'activities';
        render();
      },
    });
  }
}
