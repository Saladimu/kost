'use strict';

(() => {
  const ICONS = {
    dashboard: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 13h7V4H4zM13 9h7V4h-7zM13 20h7v-9h-7zM4 20h7v-5H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    rooms: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 20V6l8-3 8 3v14M4 20h16M9 20v-5h6v5M8 9h.01M16 9h.01" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tenants: '<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 20c.4-3.4 2.7-5.4 5.5-5.4s5.1 2 5.5 5.4M16 5.5a3 3 0 010 5.6M17 14.6c2.2.5 3.6 2.3 3.9 5.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    reservations: '<svg viewBox="0 0 24 24" width="17" height="17"><rect x="4" y="5" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    agreements: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 13h6M9 17h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    invoices: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 12h7M9 16h7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    payments: '<svg viewBox="0 0 24 24" width="17" height="17"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 9v6M18 9v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    services: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9L9.6 8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    expenses: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 18l5-6 4 3 7-9M16 6h4v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    finance: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M3 19h18M6 16V9M11 16V5M16 16v-4M21 16v-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    activities: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M5 5h14v15H5zM8 3v4M16 3v4M8 12l2 2 5-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    staff: '<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c.5-4 3.2-6 7-6s6.5 2 7 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    reports: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 20V4M4 20h16M8 16v-4M13 16V7M18 16v-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="17" height="17"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  };

  const NAV = [
    { label: '', items: [{ route: 'dashboard', label: 'Dashboard', icon: 'dashboard', module: 'dashboard' }] },
    { label: 'Operasional', items: [
      { route: 'rooms', label: 'Kamar', icon: 'rooms', module: 'rooms' },
      { route: 'room-types', label: 'Tipe Kamar', icon: 'rooms', module: 'roomTypes' },
      { route: 'tenants', label: 'Penghuni', icon: 'tenants', module: 'tenants' },
      { route: 'reservations', label: 'Reservasi', icon: 'reservations', module: 'reservations' },
      { route: 'agreements', label: 'Perjanjian & Check-in', icon: 'agreements', module: 'agreements' },
      { route: 'activities', label: 'Tugas', icon: 'activities', module: 'activities' },
    ] },
    { label: 'Keuangan', items: [
      { route: 'invoices', label: 'Tagihan', icon: 'invoices', module: 'invoices' },
      { route: 'payments', label: 'Pembayaran', icon: 'payments', module: 'payments' },
      { route: 'services', label: 'Layanan', icon: 'services', module: 'services' },
      { route: 'expenses', label: 'Pengeluaran', icon: 'expenses', module: 'expenses' },
      { route: 'transactions', label: 'Transaksi', icon: 'finance', module: 'transactions' },
      { route: 'deposits', label: 'Deposit', icon: 'finance', module: 'deposits' },
    ] },
    { label: 'Analitik', items: [
      { route: 'reports', label: 'Laporan', icon: 'reports', module: 'reports' },
    ] },
    { label: 'Sistem', items: [
      { route: 'staff', label: 'Staf', icon: 'staff', module: 'staff' },
      { route: 'users', label: 'Akun Pengguna', icon: 'staff', module: 'users' },
      { route: 'master-data', label: 'Master Data', icon: 'services', module: 'master' },
      { route: 'settings', label: 'Pengaturan', icon: 'settings', can: () => App.can('settings', 'read') || App.can('audit', 'read') || App.can('system', 'run') },
    ] },
  ];

  const ROUTES = {
    dashboard: { title: 'Dashboard', subtitle: 'Ringkasan operasional hari ini', page: 'dashboard', module: 'dashboard' },
    rooms: { title: 'Kamar', subtitle: 'Ketersediaan, tipe, dan status kamar', page: 'rooms', module: 'rooms' },
    'room-types': { title: 'Tipe Kamar', subtitle: 'Harga sewa dan fasilitas kamar', page: 'room-types', module: 'roomTypes' },
    tenants: { title: 'Penghuni', subtitle: 'Data penghuni, kontak, dan status hunian', page: 'tenants', module: 'tenants' },
    reservations: { title: 'Reservasi', subtitle: 'Calon penghuni dan kamar yang dipesan', page: 'reservations', module: 'reservations' },
    agreements: { title: 'Perjanjian & Check-in', subtitle: 'Perjanjian sewa, check-in, transfer, dan check-out', page: 'agreements', module: 'agreements' },
    invoices: { title: 'Tagihan', subtitle: 'Invoice bulanan, pembayaran sebagian, dan penyesuaian', page: 'invoices', module: 'invoices' },
    payments: { title: 'Pembayaran', subtitle: 'Kuitansi, alokasi invoice, dan kredit penghuni', page: 'payments', module: 'payments' },
    services: { title: 'Layanan Tambahan', subtitle: 'Laundry, cleaning, parkir, dan layanan lain', page: 'services', module: 'services' },
    expenses: { title: 'Pengeluaran', subtitle: 'Biaya operasional dan pembayaran vendor', page: 'expenses', module: 'expenses' },
    finance: { title: 'Kas & Deposit', subtitle: 'Ledger transaksi dan kewajiban deposit', page: 'finance', can: () => App.can('transactions', 'read') || App.can('deposits', 'read') },
    transactions: { title: 'Transaksi', subtitle: 'Ledger kas masuk, kas keluar, dan jurnal pembalik', page: 'transactions', module: 'transactions' },
    deposits: { title: 'Security Deposit', subtitle: 'Deposit ditahan, potongan, dan pengembalian', page: 'deposits', module: 'deposits' },
    users: { title: 'Akun Pengguna', subtitle: 'Akun login, peran, dan status akses', page: 'users', module: 'users' },
    'master-data': { title: 'Master Data', subtitle: 'Daftar harga, layanan, dan tipe kamar', page: 'master-data', module: 'master' },
    activities: { title: 'Tugas Operasional', subtitle: 'Kebersihan, perawatan, dan inspeksi kamar', page: 'activities', module: 'activities' },
    staff: { title: 'Tim & Akun', subtitle: 'Staf, akun login, dan peran akses', page: 'staff', can: () => App.can('staff', 'read') || App.can('users', 'read') },
    reports: { title: 'Laporan', subtitle: 'Keuangan, hunian, kartu penghuni, dan rekonsiliasi', page: 'reports', module: 'reports' },
    settings: { title: 'Pengaturan', subtitle: 'Identitas properti, kebijakan, harga, dan sistem', page: 'settings', can: () => App.can('settings', 'read') || App.can('master', 'read') || App.can('audit', 'read') || App.can('system', 'run') },
  };

  let currentHash = '';
  let booting = false;

  function allowed(route) {
    const definition = ROUTES[route];
    if (!definition) return false;
    if (definition.can) return definition.can();
    return App.can(definition.module, 'read');
  }

  function showLogin() {
    document.getElementById('boot-screen').classList.add('hidden');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    const email = document.getElementById('login-email');
    if (email) setTimeout(() => email.focus(), 80);
  }

  function showApp() {
    document.getElementById('boot-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  }

  function renderNav() {
    const nav = document.getElementById('nav');
    nav.innerHTML = NAV.map((section) => {
      const items = section.items.filter((item) => item.can ? item.can() : App.can(item.module, 'read'));
      if (!items.length) return '';
      return `<div class="nav-section">${section.label ? `<div class="nav-label">${section.label}</div>` : ''}${items.map((item) => `<a class="nav-item" href="#/${item.route}" data-route="${item.route}">${ICONS[item.icon] || ''}<span>${UI.esc(item.label)}</span></a>`).join('')}</div>`;
    }).join('');
  }

  function markActive(route) {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.route === route));
  }

  function setUserChrome() {
    const user = App.user;
    if (!user) return;
    document.getElementById('user-name').textContent = user.FullName;
    document.getElementById('user-role').textContent = user.Role;
    document.getElementById('user-avatar').textContent = UI.initials(user.FullName);
    document.getElementById('dropdown-name').textContent = user.FullName;
    document.getElementById('dropdown-email').textContent = user.Email;
    const chip = document.getElementById('today-chip');
    if (chip) chip.textContent = UI.date(UI.todayISO(), 'long');
  }

  async function route() {
    if (!App.user) return;
    const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard';
    let key = ROUTES[raw] ? raw : 'dashboard';
    if (!allowed(key)) {
      if (currentHash === `#/${raw}`) {
        const container = document.getElementById('page');
        container.innerHTML = '';
        UI.pageError(container, new Error('Anda tidak memiliki akses ke halaman ini.'));
        return;
      }
      key = 'dashboard';
    }
    currentHash = `#/${key}`;
    if (window.location.hash !== currentHash) {
      history.replaceState(null, '', currentHash);
    }
    const definition = ROUTES[key];
    document.getElementById('page-title').textContent = definition.title;
    document.getElementById('page-subtitle').textContent = definition.subtitle;
    markActive(key);
    document.getElementById('app').classList.remove('sidebar-open');
    const container = document.getElementById('page');
    const renderer = App.pages[definition.page];
    if (!renderer) {
      UI.pageError(container, new Error(`Halaman "${definition.page}" belum tersedia.`));
      return;
    }
    container.innerHTML = '';
    try {
      await renderer(container, { route: key });
      container.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      UI.pageError(container, error);
    }
  }

  async function boot() {
    if (booting) return;
    booting = true;
    try {
      if (!API.hasToken()) {
        await App.loadPublicBranding();
        App.user = null;
        showLogin();
        return;
      }
      await App.refreshMeta();
      if (!App.user) {
        const me = await API.me();
        App.user = me.user;
      }
      setUserChrome();
      renderNav();
      showApp();
      await route();
    } catch (error) {
      App.user = null;
      await App.loadPublicBranding();
      showLogin();
    } finally {
      booting = false;
    }
  }

  function setupLogin() {
    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');
    const submit = document.getElementById('login-submit');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorBox.classList.add('hidden');
      submit.disabled = true;
      const original = submit.textContent;
      submit.textContent = 'Memeriksa akun...';
      try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const result = await API.login(email, password);
        App.user = result.user;
        if (result.bootstrap) App.applyMeta(result.bootstrap);
        else await App.refreshMeta();
        setUserChrome();
        renderNav();
        showApp();
        currentHash = '';
        if (!window.location.hash || window.location.hash === '#/') window.location.hash = '#/dashboard';
        await route();
        UI.toast(`Selamat datang, ${result.user.FullName}.`, 'success', 'Berhasil masuk');
      } catch (error) {
        errorBox.textContent = error.message || 'Gagal masuk.';
        errorBox.classList.remove('hidden');
      } finally {
        submit.disabled = false;
        submit.textContent = original;
      }
    });
    document.querySelectorAll('.demo-account').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('login-email').value = button.dataset.email;
        document.getElementById('login-password').value = button.dataset.password;
        errorBox.classList.add('hidden');
      });
    });
  }

  function setupChrome() {
    document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('app').classList.toggle('sidebar-open'));
    document.getElementById('sidebar-backdrop').addEventListener('click', () => document.getElementById('app').classList.remove('sidebar-open'));
    const userButton = document.getElementById('user-button');
    const dropdown = document.getElementById('user-dropdown');
    userButton.addEventListener('click', (event) => { event.stopPropagation(); dropdown.classList.toggle('hidden'); });
    document.addEventListener('click', (event) => { if (!event.target.closest('.user-menu')) dropdown.classList.add('hidden'); });
    document.getElementById('logout-button').addEventListener('click', async () => {
      try { await API.logout(); } catch (error) { /* session may already be gone */ }
      App.user = null;
      currentHash = '';
      document.getElementById('user-dropdown').classList.add('hidden');
      showLogin();
      UI.toast('Anda telah keluar dari sistem.', 'info', 'Sampai jumpa');
    });
    window.addEventListener('hashchange', route);
    window.onUnauthorized = () => {
      if (!App.user) return;
      App.user = null;
      currentHash = '';
      showLogin();
      UI.toast('Sesi berakhir. Silakan masuk kembali.', 'error', 'Sesi berakhir');
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    setupChrome();
    boot();
  });
})();
