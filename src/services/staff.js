'use strict';

const { nowISO, makeId, AppError, requireFields, requireEnum, cleanText } = require('../util');
const { audit, findById } = require('./common');

const APP_ROLES = ['Owner', 'Manager', 'Receptionist', 'Cashier', 'Operational Staff'];
const EMPLOYMENT_STATUSES = ['Active', 'Inactive', 'Resigned'];

function listStaff(db) {
  return db.staff.map((staff) => {
    const user = db.users.find((u) => u.StaffID === staff.StaffID);
    return {
      ...staff,
      UserID: user ? user.UserID : '',
      LoginEmail: user ? user.Email : '',
      LoginRole: user ? user.Role : '',
      LoginActive: user ? user.IsActive : 'FALSE',
    };
  }).sort((a, b) => a.FullName.localeCompare(b.FullName));
}

function saveStaff(db, data, user) {
  if (data.StaffID) {
    const staff = findById(db.staff, 'StaffID', data.StaffID);
    const previous = JSON.stringify(staff);
    if (data.FullName !== undefined) staff.FullName = cleanText(data.FullName, 120) || staff.FullName;
    if (data.Position !== undefined) staff.Position = cleanText(data.Position, 80);
    if (data.Phone !== undefined) staff.Phone = cleanText(data.Phone, 40);
    if (data.Email !== undefined) staff.Email = cleanText(data.Email, 120);
    if (data.StartDate !== undefined) staff.StartDate = cleanText(data.StartDate, 10);
    if (data.EndDate !== undefined) staff.EndDate = cleanText(data.EndDate, 10);
    if (data.EmploymentStatus !== undefined) staff.EmploymentStatus = requireEnum(data.EmploymentStatus, EMPLOYMENT_STATUSES, 'Status kepegawaian');
    if (data.AppRole !== undefined) staff.AppRole = requireEnum(data.AppRole, APP_ROLES, 'Peran aplikasi');
    if (data.Notes !== undefined) staff.Notes = cleanText(data.Notes, 500);
    audit(db, { user: user.StaffID, action: 'UPDATE_STAFF', module: 'Staff', recordId: staff.StaffID, previous, next: JSON.stringify(staff) });
    return staff;
  }
  requireFields(data, ['FullName', 'AppRole']);
  const staff = {
    StaffID: makeId(db, 'staff', 'ST'),
    FullName: cleanText(data.FullName, 120),
    Position: cleanText(data.Position, 80),
    Phone: cleanText(data.Phone, 40),
    Email: cleanText(data.Email, 120),
    StartDate: cleanText(data.StartDate, 10) || new Date().toISOString().slice(0, 10),
    EndDate: cleanText(data.EndDate, 10),
    EmploymentStatus: requireEnum(data.EmploymentStatus || 'Active', EMPLOYMENT_STATUSES, 'Status kepegawaian'),
    AppRole: requireEnum(data.AppRole, APP_ROLES, 'Peran aplikasi'),
    Notes: cleanText(data.Notes, 500),
  };
  db.staff.push(staff);
  audit(db, { user: user.StaffID, action: 'CREATE_STAFF', module: 'Staff', recordId: staff.StaffID, next: JSON.stringify(staff) });
  return staff;
}

module.exports = { APP_ROLES, EMPLOYMENT_STATUSES, listStaff, saveStaff };
