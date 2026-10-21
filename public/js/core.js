'use strict';

window.App = {
  user: null,
  meta: {},
  storage: 'Buku besar operasional',
  storageState: 'checking',
  statusTimer: null,
  statusInFlight: false,
  statusHandlers: null,
  property: { name: 'Kelola Kos', address: '', phone: '', currency: 'IDR' },
  pages: {},
  currentRoute: '',

  registerPage(name, renderer) {
    this.pages[name] = renderer;
  },

  can(module, action = 'read') {
    if (!this.user) return false;
    const permissions = this.user.Permissions || {};
    if (permissions['*'] && permissions['*'].includes('*')) return true;
    const actions = permissions[module];
    return Array.isArray(actions) && (actions.includes('*') || actions.includes(action));
  },

  applyBranding() {
    const name = this.property.name || 'Kelola Kos';
    const nameEl = document.getElementById('property-name');
    if (nameEl) nameEl.textContent = name;
    const loginName = document.getElementById('login-property-name');
    if (loginName) loginName.textContent = name;
    const storageEl = document.getElementById('storage-backend');
    if (storageEl) storageEl.textContent = this.storage || 'Buku besar operasional';
  },

  applyMeta(meta) {
    this.meta = meta || {};
    if (this.meta.user) this.user = this.meta.user;
    if (this.meta.storage) this.storage = this.meta.storage;
    this.property = this.meta.property || this.property;
    this.applyBranding();
    if (this.user) this.startStatusMonitor();
    return this.meta;
  },

  setStorageState(state) {
    this.storageState = state;
    const backend = this.storage || 'Buku besar operasional';
    const label = state === 'ok'
      ? `Terhubung ke ${backend}`
      : state === 'warning'
        ? `Koneksi ke ${backend} bermasalah`
        : state === 'error'
          ? `Tidak terhubung ke ${backend}`
          : `Memeriksa koneksi ke ${backend}`;
    const dot = document.getElementById('storage-dot');
    if (dot) {
      dot.className = `dot is-${state}`;
      dot.title = label;
      dot.setAttribute('aria-label', `Status koneksi: ${label}`);
    }
    const storageEl = document.getElementById('storage-backend');
    if (storageEl) storageEl.title = label;
  },

  checkStorageStatus() {
    if (this.statusInFlight) return;
    if (navigator.onLine === false) {
      this.setStorageState('error');
      return;
    }
    this.statusInFlight = true;
    this.setStorageState('checking');
    let timeoutId = null;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), 20000);
    });
    Promise.race([API.health(), timeout]).then((data) => {
      if (navigator.onLine === false) {
        this.setStorageState('error');
        return;
      }
      if (data && data.storage) {
        this.storage = data.storage;
        this.applyBranding();
      }
      const ready = data && data.status === 'ok' && data.configured !== false;
      this.setStorageState(ready ? 'ok' : 'warning');
    }).catch(() => {
      this.setStorageState('error');
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
      this.statusInFlight = false;
    });
  },

  startStatusMonitor() {
    if (this.statusTimer) return;
    if (!this.statusHandlers) {
      this.statusHandlers = {
        visibility: () => { if (!document.hidden) this.checkStorageStatus(); },
        online: () => this.checkStorageStatus(),
        offline: () => this.setStorageState('error'),
      };
      document.addEventListener('visibilitychange', this.statusHandlers.visibility);
      window.addEventListener('online', this.statusHandlers.online);
      window.addEventListener('offline', this.statusHandlers.offline);
    }
    this.checkStorageStatus();
    this.statusTimer = setInterval(() => {
      if (!document.hidden) this.checkStorageStatus();
    }, 120000);
  },

  stopStatusMonitor() {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
      this.statusTimer = null;
    }
    if (this.statusHandlers) {
      document.removeEventListener('visibilitychange', this.statusHandlers.visibility);
      window.removeEventListener('online', this.statusHandlers.online);
      window.removeEventListener('offline', this.statusHandlers.offline);
      this.statusHandlers = null;
    }
  },

  async loadPublicBranding() {
    try {
      const data = await API.get('/public-config');
      if (data && data.property) {
        this.property = Object.assign({}, this.property, data.property);
        this.applyBranding();
      }
    } catch (error) {
      // Keep the neutral fallback when the public branding endpoint is unavailable.
    }
  },

  async refreshMeta() {
    return this.applyMeta(await API.get('/bootstrap'));
  },

  navigate(hash) {
    if (window.location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = hash;
    }
  },
};
