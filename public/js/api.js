'use strict';

const API = (() => {
  async function request(path, options = {}) {
    const config = { method: options.method || 'GET', headers: {}, credentials: 'same-origin' };
    if (options.body !== undefined) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(options.body);
    }
    let response;
    try {
      response = await fetch(`/api${path}`, config);
    } catch (error) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    }
    let payload = null;
    try { payload = await response.json(); } catch (error) { payload = null; }
    if (!response.ok || !payload || payload.ok === false) {
      if (response.status === 401 && !path.startsWith('/auth/')) {
        if (typeof window.onUnauthorized === 'function') window.onUnauthorized();
      }
      const err = new Error((payload && payload.error) || `Permintaan gagal (${response.status}).`);
      err.status = response.status;
      err.code = payload && payload.code;
      throw err;
    }
    return payload.data;
  }

  function get(path, params) {
    let query = '';
    if (params) {
      const usable = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
      if (usable.length) query = `?${new URLSearchParams(usable).toString()}`;
    }
    return request(`${path}${query}`);
  }

  return {
    get,
    post: (path, body) => request(path, { method: 'POST', body: body || {} }),
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    logout: () => request('/auth/logout', { method: 'POST', body: {} }),
    me: () => request('/auth/me'),
  };
})();
