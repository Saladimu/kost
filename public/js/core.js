'use strict';

window.App = {
  user: null,
  meta: {},
  property: { name: 'Kos Mawar Indah', address: '', phone: '', currency: 'IDR' },
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

  async refreshMeta() {
    const meta = await API.get('/bootstrap');
    this.meta = meta;
    this.property = meta.property || this.property;
    const nameEl = document.getElementById('property-name');
    if (nameEl) nameEl.textContent = this.property.name || 'Sistem Operasional Kos';
    const loginName = document.getElementById('login-property-name');
    if (loginName) loginName.textContent = this.property.name || 'Sistem Operasional Kos';
    return meta;
  },

  navigate(hash) {
    if (window.location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = hash;
    }
  },
};
