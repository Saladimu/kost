'use strict';

const crypto = require('crypto');
const { AppError } = require('./util');
const { verifyPassword } = require('./password');

const SESSION_COOKIE = 'kos_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();

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
  const normalized = String(email || '').trim().toLowerCase();
  const user = db.users.find((u) => u.Email.toLowerCase() === normalized);
  if (!user || user.IsActive !== 'TRUE' || !verifyPassword(String(password || ''), user.PasswordHash)) {
    throw new AppError('Email atau password salah.', 401, 'INVALID_CREDENTIALS');
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { UserID: user.UserID, createdAt: Date.now(), lastSeen: Date.now() });
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
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  session.lastSeen = Date.now();
  const user = db.users.find((u) => u.UserID === session.UserID && u.IsActive === 'TRUE');
  if (!user) return null;
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

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
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
