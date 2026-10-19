'use strict';

const { nowISO, makeId, AppError, requireFields, requireEnum, cleanText } = require('../util');
const { audit, findById } = require('./common');

const TENANT_STATUSES = ['Prospective', 'Active', 'Checked Out', 'Inactive'];

function canSeeIdentity(user) {
  return user && ['Owner', 'Manager', 'Receptionist'].includes(user.Role);
}

function sanitizeTenant(tenant, user) {
  if (canSeeIdentity(user)) return tenant;
  return { ...tenant, IdentityNumber: '***', Address: '***', EmergencyContact: '', EmergencyPhone: '' };
}

function listTenants(db, filters = {}, user = null) {
  let rows = db.tenants.map((tenant) => {
    const active = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active');
    const room = active ? db.rooms.find((r) => r.RoomID === active.RoomID) : null;
    return {
      ...tenant,
      RoomNumber: room ? room.RoomNumber : '',
      OccupancyID: active ? active.OccupancyID : '',
      ActiveBalance: db.invoices
        .filter((invoice) => invoice.TenantID === tenant.TenantID && invoice.InvoiceStatus !== 'Cancelled')
        .reduce((sum, invoice) => sum + Number(invoice.OutstandingBalance || 0), 0),
    };
  });
  if (filters.status) rows = rows.filter((tenant) => tenant.TenantStatus === filters.status);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((tenant) => `${tenant.FullName} ${tenant.Phone} ${tenant.Email} ${tenant.IdentityNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => a.FullName.localeCompare(b.FullName));
  return rows.map((tenant) => sanitizeTenant(tenant, user));
}

function saveTenant(db, data, user) {
  if (data.TenantID) {
    const tenant = findById(db.tenants, 'TenantID', data.TenantID);
    const previous = JSON.stringify(tenant);
    const textFields = ['FullName', 'IdentityType', 'IdentityNumber', 'Phone', 'Email', 'Address', 'EmergencyContact', 'EmergencyPhone', 'Occupation', 'Notes'];
    for (const field of textFields) {
      if (data[field] !== undefined) tenant[field] = cleanText(data[field], field === 'Notes' || field === 'Address' ? 500 : 120);
    }
    if (data.TenantStatus !== undefined) tenant.TenantStatus = requireEnum(data.TenantStatus, TENANT_STATUSES, 'Status penghuni');
    tenant.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_TENANT', module: 'Tenants', recordId: tenant.TenantID, previous, next: JSON.stringify(tenant) });
    return sanitizeTenant(tenant, user);
  }
  requireFields(data, ['FullName', 'Phone']);
  const tenant = {
    TenantID: makeId(db, 'tenant', 'T'),
    FullName: cleanText(data.FullName, 120),
    IdentityType: cleanText(data.IdentityType || 'KTP', 30),
    IdentityNumber: cleanText(data.IdentityNumber, 60),
    Phone: cleanText(data.Phone, 40),
    Email: cleanText(data.Email, 120),
    Address: cleanText(data.Address, 500),
    EmergencyContact: cleanText(data.EmergencyContact, 120),
    EmergencyPhone: cleanText(data.EmergencyPhone, 40),
    Occupation: cleanText(data.Occupation, 80),
    RegistrationDate: cleanText(data.RegistrationDate, 10) || nowISO().slice(0, 10),
    TenantStatus: requireEnum(data.TenantStatus || 'Prospective', TENANT_STATUSES, 'Status penghuni'),
    Notes: cleanText(data.Notes, 500),
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  if (tenant.Email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(tenant.Email)) throw new AppError('Format email tidak valid.');
  db.tenants.push(tenant);
  audit(db, { user: user.StaffID, action: 'CREATE_TENANT', module: 'Tenants', recordId: tenant.TenantID, next: JSON.stringify(tenant) });
  return sanitizeTenant(tenant, user);
}

function tenantStatement(db, tenantId, filters = {}) {
  const tenant = findById(db.tenants, 'TenantID', tenantId);
  const invoices = db.invoices.filter((invoice) => invoice.TenantID === tenantId)
    .filter((invoice) => !filters.from || invoice.InvoiceDate >= filters.from)
    .filter((invoice) => !filters.to || invoice.InvoiceDate <= filters.to);
  const payments = db.payments.filter((payment) => payment.TenantID === tenantId)
    .filter((payment) => !filters.from || payment.PaymentDate >= filters.from)
    .filter((payment) => !filters.to || payment.PaymentDate <= filters.to);
  const deposits = db.deposits.filter((deposit) => deposit.TenantID === tenantId);
  const credits = db.credits.filter((credit) => credit.TenantID === tenantId);
  const totalInvoiced = invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((sum, i) => sum + Number(i.TotalAmount), 0);
  const totalPaid = payments.filter((p) => p.PaymentStatus === 'Confirmed').reduce((sum, p) => sum + Number(p.AmountReceived), 0);
  const outstanding = invoices.filter((i) => i.InvoiceStatus !== 'Cancelled').reduce((sum, i) => sum + Number(i.OutstandingBalance), 0);
  return {
    tenant,
    invoices,
    payments,
    deposits,
    credits,
    summary: { totalInvoiced, totalPaid, outstanding, depositLiability: deposits.reduce((s, d) => s + Number(d.OutstandingDepositLiability), 0) },
  };
}

module.exports = { TENANT_STATUSES, listTenants, saveTenant, tenantStatement, sanitizeTenant };
