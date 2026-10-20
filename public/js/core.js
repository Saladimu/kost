'use strict';

window.App = {
  user: null,
  meta: {},
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
  },

  applyMeta(meta) {
    this.meta = meta || {};
    if (this.meta.user) this.user = this.meta.user;
    this.property = this.meta.property || this.property;
    this.applyBranding();
    return this.meta;
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
