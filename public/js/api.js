'use strict';

const API = (() => {
  const TOKEN_KEY = 'kos_gas_token';
  let memoryToken = '';

  function isGas() {
    return typeof google !== 'undefined' && google.script && google.script.run;
  }

  function readToken() {
    if (memoryToken) return memoryToken;
    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (error) { return ''; }
  }

  function writeToken(token) {
    memoryToken = token;
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (error) { /* storage may be unavailable */ }
  }

  function clearToken() {
    memoryToken = '';
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (error) { /* storage may be unavailable */ }
  }

  function gasRequest(path, method, body) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((payload) => {
          if (!payload || payload.ok === false) {
            const status = payload && payload.status ? payload.status : 500;
            if (status === 401 && !path.startsWith('/auth/')) {
              clearToken();
              if (typeof window.onUnauthorized === 'function') window.onUnauthorized();
            }
            const error = new Error((payload && payload.error) || 'Permintaan gagal.');
            error.status = status;
            error.code = payload && payload.code;
            reject(error);
            return;
          }
          if (path === '/auth/login' && payload.token) writeToken(payload.token);
          if (path === '/auth/logout') clearToken();
          resolve(payload.data);
        })
        .withFailureHandler((error) => {
          reject(new Error(error && error.message ? error.message : 'Tidak dapat terhubung ke server.'));
        })
        .gasApi(readToken(), method, path, body || {});
    });
  }

  async function request(path, options = {}) {
    if (isGas()) return gasRequest(path, options.method || 'GET', options.body);
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
    logout: async () => {
      try {
        return await request('/auth/logout', { method: 'POST', body: {} });
      } finally {
        if (isGas()) clearToken();
      }
    },
    me: () => request('/auth/me'),
  };
})();
