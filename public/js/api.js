'use strict';

const API = (() => {
  const TOKEN_KEY = 'kos_gas_token';
  const BRIDGE_CHANNEL = 'kos-bridge';
  const BRIDGE_TIMEOUT = 45000;
  const GET_TTL = 15000;
  let memoryToken = '';
  const bridgePending = {};
  const getCache = new Map();
  const inflight = new Map();
  let cacheGeneration = 0;

  function clearGetCache() {
    cacheGeneration += 1;
    getCache.clear();
    inflight.clear();
  }

  function clone(value) {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (error) { /* fall back to JSON */ }
    }
    return JSON.parse(JSON.stringify(value));
  }

  function isGas() {
    return typeof google !== 'undefined' && google.script && google.script.run;
  }

  function configuredBridgeUrl() {
    const config = window.KOS_CONFIG || {};
    return String(config.gasBridgeUrl || '').trim();
  }

  function isGoogleOrigin(origin) {
    return /^https:\/\/([a-z0-9-]+\.)*(script\.google\.com|googleusercontent\.com)$/i.test(origin);
  }

  function readToken() {
    if (memoryToken) return memoryToken;
    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (error) { return ''; }
  }

  function writeToken(token) {
    memoryToken = token;
    clearGetCache();
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (error) { /* storage may be unavailable */ }
  }

  function clearToken() {
    memoryToken = '';
    clearGetCache();
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (error) { /* storage may be unavailable */ }
  }

  function applyPayload(path, payload) {
    if (!payload || payload.ok === false) {
      const status = payload && payload.status ? payload.status : 500;
      if (status === 401 && !path.startsWith('/auth/')) {
        clearToken();
        if (typeof window.onUnauthorized === 'function') window.onUnauthorized();
      }
      const error = new Error((payload && payload.error) || 'Permintaan gagal.');
      error.status = status;
      error.code = payload && payload.code;
      throw error;
    }
    if (path === '/auth/login' && payload.token) writeToken(payload.token);
    if (path === '/auth/logout') clearToken();
    return payload.data;
  }

  function gasRequest(path, method, body) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((payload) => {
          try { resolve(applyPayload(path, payload)); } catch (error) { reject(error); }
        })
        .withFailureHandler((error) => {
          reject(new Error(error && error.message ? error.message : 'Tidak dapat terhubung ke server.'));
        })
        .gasApi(readToken(), method, path, body || {});
    });
  }

  function bridgeId() {
    if (window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(12);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }

  function onBridgeMessage(event) {
    const data = event.data || {};
    if (data.channel !== BRIDGE_CHANNEL || data.type !== 'response') return;
    const pending = bridgePending[data.id];
    if (!pending || !isGoogleOrigin(event.origin)) return;
    delete bridgePending[data.id];
    clearTimeout(pending.timer);
    pending.cleanup();
    try {
      pending.resolve(applyPayload(pending.path, data.result));
    } catch (error) {
      pending.reject(error);
    }
  }

  function bridgeRequest(path, method, body) {
    const url = configuredBridgeUrl();
    const id = bridgeId();
    const separator = url.indexOf('?') === -1 ? '?' : '&';
    return new Promise((resolve, reject) => {
      const frameName = `kos-bridge-${id}`;
      const iframe = document.createElement('iframe');
      iframe.name = frameName;
      iframe.title = 'KOS API Bridge';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';

      const form = document.createElement('form');
      form.method = 'POST';
      form.target = frameName;
      form.action = `${url}${separator}bridgeResponse=1&id=${encodeURIComponent(id)}`;
      form.style.display = 'none';
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify({
        token: readToken(),
        method: method || 'GET',
        path,
        body: body || {},
        origin: location.origin,
      });
      form.appendChild(input);

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        if (form.parentNode) form.parentNode.removeChild(form);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      };

      const timer = setTimeout(() => {
        delete bridgePending[id];
        cleanup();
        reject(new Error('Backend Apps Script tidak merespons. Periksa gasBridgeUrl dan akses deployment.'));
      }, BRIDGE_TIMEOUT);

      bridgePending[id] = { resolve, reject, timer, path, cleanup };
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      try {
        form.submit();
      } catch (error) {
        delete bridgePending[id];
        clearTimeout(timer);
        cleanup();
        reject(new Error('Tidak dapat mengirim permintaan ke Apps Script.'));
      }
    });
  }

  async function request(path, options = {}) {
    const method = options.method || 'GET';
    if (method !== 'GET') clearGetCache();
    if (isGas()) return gasRequest(path, method, options.body);
    if (configuredBridgeUrl()) return bridgeRequest(path, method, options.body);
    if (location.protocol === 'file:' || /(^|\.)github\.io$/.test(location.hostname)) {
      throw new Error('Backend Apps Script belum diatur. Isi gasBridgeUrl pada js/config.js dengan URL deployment /exec.');
    }
    const config = { method, headers: {}, credentials: 'same-origin' };
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
      const usable = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
      if (usable.length) query = `?${new URLSearchParams(usable).toString()}`;
    }
    const fullPath = `${path}${query}`;
    const cached = getCache.get(fullPath);
    if (cached && cached.expires > Date.now()) return Promise.resolve(clone(cached.data));
    if (inflight.has(fullPath)) return inflight.get(fullPath);
    const generation = cacheGeneration;
    const promise = request(fullPath).then((data) => {
      if (generation === cacheGeneration) getCache.set(fullPath, { data: clone(data), expires: Date.now() + GET_TTL });
      inflight.delete(fullPath);
      return data;
    }, (error) => {
      inflight.delete(fullPath);
      throw error;
    });
    inflight.set(fullPath, promise);
    return promise;
  }

  window.addEventListener('message', onBridgeMessage);

  return {
    get,
    post: (path, body) => request(path, { method: 'POST', body: body || {} }),
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    logout: async () => {
      try {
        return await request('/auth/logout', { method: 'POST', body: {} });
      } finally {
        if (isGas() || configuredBridgeUrl()) clearToken();
      }
    },
    me: () => request('/auth/me'),
  };
})();
