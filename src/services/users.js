'use strict';

const { nowISO, makeId, AppError, requireFields, requireEnum, cleanText } = require('../util');
const { hashPassword } = require('../password');
const { audit, findById } = require('./common');
const { APP_ROLES } = require('./staff');

function listUsers(db) {
  return db.users.map((user) => {
    const staff = db.staff.find((s) => s.StaffID === user.StaffID);
    return {
      UserID: user.UserID,
      StaffID: user.StaffID,
      FullName: staff ? staff.FullName : '-',
      Email: user.Email,
      Role: user.Role,
      IsActive: user.IsActive,
      CreatedAt: user.CreatedAt,
      UpdatedAt: user.UpdatedAt,
    };
  });
}

function saveUser(db, data, user) {
  if (data.UserID) {
    const target = findById(db.users, 'UserID', data.UserID);
    const previous = JSON.stringify({ email: target.Email, role: target.Role, active: target.IsActive });
    if (data.Email !== undefined) {
      const email = cleanText(data.Email, 120).toLowerCase();
      if (db.users.some((u) => u.Email.toLowerCase() === email && u.UserID !== target.UserID)) throw new AppError('Email sudah digunakan.');
      target.Email = email;
    }
    if (data.Role !== undefined) target.Role = requireEnum(data.Role, APP_ROLES, 'Peran');
    if (data.IsActive !== undefined) target.IsActive = String(data.IsActive).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    if (data.Password) {
      if (String(data.Password).length < 6) throw new AppError('Password minimal 6 karakter.');
      target.PasswordHash = hashPassword(String(data.Password));
    }
    if (target.Role === 'Owner' && target.IsActive === 'TRUE') {
      // allowed
    }
    if (target.UserID === user.UserID && target.IsActive === 'FALSE') throw new AppError('Anda tidak dapat menonaktifkan akun sendiri.');
    target.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_USER', module: 'Users', recordId: target.UserID, previous, next: JSON.stringify({ email: target.Email, role: target.Role, active: target.IsActive }) });
    return target;
  }
  requireFields(data, ['StaffID', 'Email', 'Password', 'Role']);
  const staff = findById(db.staff, 'StaffID', data.StaffID);
  const email = cleanText(data.Email, 120).toLowerCase();
  if (db.users.some((u) => u.Email.toLowerCase() === email)) throw new AppError('Email sudah digunakan.');
  if (String(data.Password).length < 6) throw new AppError('Password minimal 6 karakter.');
  const target = {
    UserID: makeId(db, 'user', 'USR'),
    StaffID: staff.StaffID,
    Email: email,
    PasswordHash: hashPassword(String(data.Password)),
    Role: requireEnum(data.Role, APP_ROLES, 'Peran'),
    IsActive: 'TRUE',
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.users.push(target);
  if (!staff.Email) staff.Email = email;
  audit(db, { user: user.StaffID, action: 'CREATE_USER', module: 'Users', recordId: target.UserID, next: JSON.stringify({ email, role: target.Role, staff: staff.StaffID }) });
  return target;
}

module.exports = { listUsers, saveUser };
