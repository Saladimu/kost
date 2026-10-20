'use strict';

const crypto = require('crypto');
const { AppError } = require('./util');
const { verifyPassword } = require('./password');

const SESSION_COOKIE = 'kos_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = positiveNumber(process.env.LOGIN_MAX_ATTEMPTS, 5);
const LOGIN_WINDOW_MS = positiveNumber(process.env.LOGIN_WINDOW_MS, 15 * 60 * 1000);
const LOGIN_MAX_TRACKED = 1000;
const sessions = new Map();
const loginFailures = new Map();

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function credentialFingerprint(user) {
  return crypto.createHash('sha256').update(String(user.PasswordHash || '')).digest('base64');
}

function loginKey(email) {
  return crypto.createHash('sha256').update(email).digest('base64');
}

function ensureLoginAllowed(key, now) {
  const state = loginFailures.get(key);
  if (!state) return;
  if (state.lockedUntil && now < state.lockedUntil) {
    const minutes = Math.max(1, Math.ceil((state.lockedUntil - now) / 60000));
    throw new AppError(`Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`, 429, 'TOO_MANY_ATTEMPTS');
  }
  if (now - state.firstAt >= LOGIN_WINDOW_MS) loginFailures.delete(key);
}

function recordLoginFailure(key, now) {
  let state = loginFailures.get(key);
  if (!state || now - state.firstAt >= LOGIN_WINDOW_MS) {
    state = { count: 0, firstAt: now, lockedUntil: 0 };
  }
  state.count += 1;
  if (state.count >= LOGIN_MAX_ATTEMPTS) state.lockedUntil = now + LOGIN_WINDOW_MS;
  loginFailures.set(key, state);
}

function pruneAuthState(now) {
  if (sessions.size > 500) {
    for (const [token, session] of sessions) {
      if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(token);
    }
  }
  if (loginFailures.size <= LOGIN_MAX_TRACKED) return;
  for (const [key, state] of loginFailures) {
    if (loginFailures.size <= LOGIN_MAX_TRACKED) break;
    if (now - state.firstAt >= LOGIN_WINDOW_MS && (!state.lockedUntil || now >= state.lockedUntil)) {
      loginFailures.delete(key);
    }
  }
  for (const key of loginFailures.keys()) {
    if (loginFailures.size <= LOGIN_MAX_TRACKED) break;
    loginFailures.delete(key);
  }
}

const PERMISSIONS = {
  Owner: { '*': ['*'] },
  Manager: {
    dashboard: ['read'],
    rooms: ['read', 'write'],
    roomTypes: ['read', 'write'],
    tenants: ['read', 'write'],
    reservations: ['read', 'write'],
    agreements: ['read', 'write'],
    invoices: ['read', 'generate', 'write'],
    payments: ['read', 'void'],
    services: ['read', 'write'],
    expenses: ['read', 'write', 'approve'],
    transactions: ['read'],
    deposits: ['read', 'write'],
    staff: ['read'],
    activities: ['read', 'write'],
    reports: ['read'],
    master: ['read', 'write'],
    audit: ['read'],
    settings: ['read'],
    system: ['run'],
  },
  Receptionist: {
    dashboard: ['read'],
    rooms: ['read'],
    roomTypes: ['read'],
    tenants: ['read', 'write'],
    reservations: ['read', 'write'],
    agreements: ['read', 'write'],
    invoices: ['read'],
    services: ['read', 'write'],
    deposits: ['read'],
    activities: ['read', 'write'],
    reports: ['read'],
    master: ['read'],
    settings: ['read'],
  },
  Cashier: {
    dashboard: ['read'],
    tenants: ['read'],
    invoices: ['read'],
    payments: ['read', 'write'],
    services: ['read', 'write'],
    deposits: ['read'],
    transactions: ['read'],
    reports: ['read'],
    master: ['read'],
    settings: ['read'],
  },
  'Operational Staff': {
    dashboard: ['read'],
    rooms: ['read'],
    activities: ['read', 'write'],
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

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const result = {};
  header.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index > 0) result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  });
  return result;
}

function login(db, email, password) {
  const normalized = String(email || '').trim().toLowerCase().slice(0, 320);
  const key = loginKey(normalized);
  const candidate = String(password || '').slice(0, 1024);
  const now = Date.now();
  pruneAuthState(now);
  ensureLoginAllowed(key, now);
  const user = db.users.find((u) => u.Email.toLowerCase() === normalized);
  if (!user || user.IsActive !== 'TRUE' || !verifyPassword(candidate, user.PasswordHash)) {
    recordLoginFailure(key, now);
    throw new AppError('Email atau password salah.', 401, 'INVALID_CREDENTIALS');
  }
  loginFailures.delete(key);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    UserID: user.UserID,
    credential: credentialFingerprint(user),
    createdAt: now,
    lastSeen: now,
  });
  return { token, user };
}

function logout(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) sessions.delete(token);
}

function sessionUser(db, req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  const now = Date.now();
  if (now - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  const user = db.users.find((u) => u.UserID === session.UserID && u.IsActive === 'TRUE');
  if (!user || !session.credential || session.credential !== credentialFingerprint(user)) {
    sessions.delete(token);
    return null;
  }
  session.lastSeen = now;
  const staff = db.staff.find((s) => s.StaffID === user.StaffID);
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

function secureFlag() {
  return process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax${secureFlag()}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax${secureFlag()}; Max-Age=0`);
}

module.exports = {
  SESSION_COOKIE,
  PERMISSIONS,
  can,
  guard,
  login,
  logout,
  sessionUser,
  setSessionCookie,
  clearSessionCookie,
};
