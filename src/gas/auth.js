'use strict';

const { AppError } = require('./util');
const { verifyPassword } = require('./password');

const SESSION_CACHE = 'kos_sessions';
const SESSION_TTL_SECONDS = 21600;

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

function login(db, email, password) {
  const normalized = String(email || '').trim().toLowerCase();
  const user = db.users.find((row) => row.Email.toLowerCase() === normalized);
  if (!user || user.IsActive !== 'TRUE' || !verifyPassword(String(password || ''), user.PasswordHash)) {
    throw new AppError('Email atau password salah.', 401, 'INVALID_CREDENTIALS');
  }
  const token = `${Utilities.getUuid().replace(/-/g, '')}${Utilities.getUuid().replace(/-/g, '')}`;
  CacheService.getScriptCache().put(
    sessionKey_(token),
    JSON.stringify({ UserID: user.UserID, createdAt: Date.now() }),
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
