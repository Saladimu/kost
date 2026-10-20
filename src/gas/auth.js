'use strict';

const { AppError } = require('./util');
const { verifyPassword } = require('./password');

const SESSION_CACHE = 'kos_sessions';
const SESSION_TTL_SECONDS = 21600;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

const PERMISSIONS = {
  Owner: { '*': ['*'] },
  Manager: {
    dashboard: ['read'], rooms: ['read', 'write'], roomTypes: ['read', 'write'],
    tenants: ['read', 'write'], reservations: ['read', 'write'], agreements: ['read', 'write'],
    invoices: ['read', 'generate', 'write'], payments: ['read', 'void'],
    services: ['read', 'write'], expenses: ['read', 'write', 'approve'],
    transactions: ['read'], deposits: ['read', 'write'], staff: ['read'],
    activities: ['read', 'write'], reports: ['read'], master: ['read', 'write'],
    audit: ['read'], settings: ['read'], system: ['run'],
  },
  Receptionist: {
    dashboard: ['read'], rooms: ['read'], roomTypes: ['read'], tenants: ['read', 'write'],
    reservations: ['read', 'write'], agreements: ['read', 'write'], invoices: ['read'],
    services: ['read', 'write'], deposits: ['read'], activities: ['read', 'write'],
    reports: ['read'], master: ['read'], settings: ['read'],
  },
  Cashier: {
    dashboard: ['read'], tenants: ['read'], invoices: ['read'], payments: ['read', 'write'],
    services: ['read', 'write'], deposits: ['read'], transactions: ['read'],
    reports: ['read'], master: ['read'], settings: ['read'],
  },
  'Operational Staff': {
    dashboard: ['read'], rooms: ['read'], activities: ['read', 'write'],
  },
};

function can(user, module, action) {
  if (!user) return false;
  const perms = PERMISSIONS[user.Role];
  if (!perms) return false;
  if (perms['*'] && perms['*'].includes('*')) return true;
  const actions = perms[module];
  return !!actions && (actions.includes('*') || actions.includes(action));
}

function guard(user, module, action) {
  if (!user) throw new AppError('Silakan login terlebih dahulu.', 401, 'UNAUTHORIZED');
  if (!can(user, module, action)) throw new AppError('Anda tidak memiliki akses untuk tindakan ini.', 403, 'FORBIDDEN');
}

function sessionKey_(token) {
  return `kos_session_${token}`;
}

function sha256Hex_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value || ''));
  return bytes.map((byte) => ((byte & 0xff) + 0x100).toString(16).slice(1)).join('');
}

function credentialFingerprint_(user) {
  return sha256Hex_(user.PasswordHash);
}

function loginAttemptKey_(email) {
  return `kos_login_${sha256Hex_(email)}`;
}

function loginState_(email) {
  const raw = CacheService.getScriptCache().get(loginAttemptKey_(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ensureLoginAllowed_(email) {
  const state = loginState_(email);
  if (!state) return;
  const now = Date.now();
  if (state.lockedUntil && now < state.lockedUntil) {
    const minutes = Math.max(1, Math.ceil((state.lockedUntil - now) / 60000));
    throw new AppError(`Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`, 429, 'TOO_MANY_ATTEMPTS');
  }
}

function recordLoginFailure_(email) {
  const now = Date.now();
  let state = loginState_(email);
  if (!state || now - Number(state.firstAt || 0) >= LOGIN_WINDOW_SECONDS * 1000) {
    state = { count: 0, firstAt: now, lockedUntil: 0 };
  }
  state.count = Number(state.count || 0) + 1;
  if (state.count >= LOGIN_MAX_ATTEMPTS) state.lockedUntil = now + LOGIN_WINDOW_SECONDS * 1000;
  CacheService.getScriptCache().put(loginAttemptKey_(email), JSON.stringify(state), LOGIN_WINDOW_SECONDS);
}

function clearLoginFailures_(email) {
  CacheService.getScriptCache().remove(loginAttemptKey_(email));
}

function login(db, email, password) {
  const normalized = String(email || '').trim().toLowerCase().slice(0, 320);
  const candidate = String(password || '').slice(0, 1024);
  ensureLoginAllowed_(normalized);
  const user = db.users.find((row) => row.Email.toLowerCase() === normalized);
  if (!user || user.IsActive !== 'TRUE' || !verifyPassword(candidate, user.PasswordHash)) {
    recordLoginFailure_(normalized);
    throw new AppError('Email atau password salah.', 401, 'INVALID_CREDENTIALS');
  }
  clearLoginFailures_(normalized);
  const token = `${Utilities.getUuid().replace(/-/g, '')}${Utilities.getUuid().replace(/-/g, '')}`;
  CacheService.getScriptCache().put(
    sessionKey_(token),
    JSON.stringify({ UserID: user.UserID, credential: credentialFingerprint_(user), createdAt: Date.now() }),
    SESSION_TTL_SECONDS
  );
  return { token, user };
}

function logout(token) {
  if (token) CacheService.getScriptCache().remove(sessionKey_(token));
}

function sessionUser(db, token) {
  if (!token) return null;
  const raw = CacheService.getScriptCache().get(sessionKey_(token));
  if (!raw) return null;
  let session;
  try { session = JSON.parse(raw); } catch (error) { return null; }
  if (!session || !session.UserID) return null;
  const user = db.users.find((row) => row.UserID === session.UserID && row.IsActive === 'TRUE');
  if (!user) return null;
  if (!session.credential || session.credential !== credentialFingerprint_(user)) {
    CacheService.getScriptCache().remove(sessionKey_(token));
    return null;
  }
  const staff = db.staff.find((row) => row.StaffID === user.StaffID);
  return {
    UserID: user.UserID,
    StaffID: user.StaffID,
    Email: user.Email,
    Role: user.Role,
    FullName: staff ? staff.FullName : user.Email,
    Position: staff ? staff.Position : '',
    Permissions: PERMISSIONS[user.Role] || {},
  };
}

module.exports = { PERMISSIONS, can, guard, login, logout, sessionUser };
