'use strict';

const { today, nowISO, makeId, AppError, requireFields, requireEnum, cleanText, isDate } = require('../util');
const { audit, findById } = require('./common');

const ACTIVITY_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const ACTIVITY_CATEGORIES = ['Cleaning', 'Maintenance', 'Inspection', 'Security', 'Administration', 'Other'];

function listActivities(db, filters = {}, user = null) {
  let rows = db.activities.map((activity) => {
    const staff = db.staff.find((s) => s.StaffID === activity.StaffID);
    const room = db.rooms.find((r) => r.RoomID === activity.RoomID);
    const tenant = db.tenants.find((t) => t.TenantID === activity.TenantID);
    return {
      ...activity,
      StaffName: staff ? staff.FullName : 'Belum ditugaskan',
      RoomNumber: room ? room.RoomNumber : '',
      TenantName: tenant ? tenant.FullName : '',
    };
  });
  if (user && user.Role === 'Operational Staff') {
    rows = rows.filter((row) => row.StaffID === user.StaffID);
  }
  if (filters.status) rows = rows.filter((row) => row.Status === filters.status);
  if (filters.staffId) rows = rows.filter((row) => row.StaffID === filters.staffId);
  if (filters.roomId) rows = rows.filter((row) => row.RoomID === filters.roomId);
  if (filters.from) rows = rows.filter((row) => row.ActivityDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.ActivityDate <= filters.to);
  rows.sort((a, b) => {
    const order = { Pending: 0, 'In Progress': 1, Completed: 2, Cancelled: 3 };
    if (order[a.Status] !== order[b.Status]) return order[a.Status] - order[b.Status];
    return b.ActivityDate.localeCompare(a.ActivityDate);
  });
  return rows;
}

function createActivity(db, data, user) {
  requireFields(data, ['StaffID', 'Category', 'Description']);
  const staff = findById(db.staff, 'StaffID', data.StaffID);
  const category = requireEnum(data.Category, ACTIVITY_CATEGORIES, 'Kategori');
  const activityDate = data.ActivityDate || today();
  if (!isDate(activityDate)) throw new AppError('Tanggal aktivitas tidak valid.');
  const activity = {
    ActivityID: makeId(db, 'activity', 'ACT'),
    ActivityDate: activityDate,
    StaffID: staff.StaffID,
    Category: category,
    RoomID: data.RoomID || '',
    TenantID: data.TenantID || '',
    Description: cleanText(data.Description, 500),
    Priority: requireEnum(data.Priority || 'Normal', ['Low', 'Normal', 'High', 'Urgent'], 'Prioritas'),
    DueDate: data.DueDate || activityDate,
    Status: 'Pending',
    StartedAt: '',
    CompletedAt: '',
    VerifiedBy: '',
    Notes: cleanText(data.Notes, 500),
  };
  db.activities.push(activity);
  audit(db, { user: user.StaffID, action: 'CREATE_ACTIVITY', module: 'Activities', recordId: activity.ActivityID, next: JSON.stringify(activity) });
  return activity;
}

function updateActivity(db, activityId, data, user) {
  const activity = findById(db.activities, 'ActivityID', activityId);
  if (user.Role === 'Operational Staff' && activity.StaffID !== user.StaffID) {
    throw new AppError('Anda hanya dapat memperbarui tugas yang ditugaskan kepada Anda.', 403, 'FORBIDDEN');
  }
  const previous = JSON.stringify(activity);
  if (data.Status) {
    const status = requireEnum(data.Status, ACTIVITY_STATUSES, 'Status aktivitas');
    if (status === 'In Progress' && !activity.StartedAt) activity.StartedAt = nowISO();
    if (status === 'Completed') {
      activity.CompletedAt = nowISO();
      if (!activity.StartedAt) activity.StartedAt = nowISO();
      activity.VerifiedBy = user.StaffID;
    }
    activity.Status = status;
  }
  if (data.Notes !== undefined) activity.Notes = cleanText(data.Notes, 500);
  if (data.Priority !== undefined) activity.Priority = requireEnum(data.Priority, ['Low', 'Normal', 'High', 'Urgent'], 'Prioritas');
  if (data.StaffID !== undefined && user.Role !== 'Operational Staff') {
    findById(db.staff, 'StaffID', data.StaffID);
    activity.StaffID = data.StaffID;
  }

  if (activity.Status === 'Completed' && activity.RoomID) {
    const room = db.rooms.find((r) => r.RoomID === activity.RoomID);
    const hasOccupant = db.occupancies.some((o) => o.RoomID === activity.RoomID && o.AgreementStatus === 'Active');
    if (room && room.OperationalStatus === 'Maintenance' && !hasOccupant) {
      room.OperationalStatus = 'Available';
      room.UpdatedAt = nowISO();
    }
  }
  audit(db, { user: user.StaffID, action: 'UPDATE_ACTIVITY', module: 'Activities', recordId: activityId, previous, next: JSON.stringify(activity) });
  return activity;
}

module.exports = { ACTIVITY_STATUSES, ACTIVITY_CATEGORIES, listActivities, createActivity, updateActivity };
