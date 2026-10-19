'use strict';

const {
  today, nowISO, addDays, monthStart, monthEnd, makeId, makeInvoiceNumber,
  AppError, requireFields, requireAmount, requireEnum, cleanText, isDate,
} = require('../util');
const { audit, getSetting, getNumberSetting, findById } = require('./common');
const { findOpenInvoiceForTenant, addServiceCharge, recalculateInvoice } = require('./billing');
const { recordDirectPayment } = require('./payments');

const SERVICE_CATEGORIES = ['Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'];
const BILLING_METHODS = ['Immediate Payment', 'Add to Invoice'];

function listServices(db) {
  return db.services.slice().sort((a, b) => a.ServiceName.localeCompare(b.ServiceName));
}

function saveService(db, data, user) {
  if (data.ServiceID) {
    const service = findById(db.services, 'ServiceID', data.ServiceID);
    const previous = JSON.stringify(service);
    if (data.ServiceName !== undefined) service.ServiceName = cleanText(data.ServiceName, 120) || service.ServiceName;
    if (data.ServiceCode !== undefined) service.ServiceCode = cleanText(data.ServiceCode, 30);
    if (data.Category !== undefined) service.Category = requireEnum(data.Category, SERVICE_CATEGORIES, 'Kategori layanan');
    if (data.Unit !== undefined) service.Unit = cleanText(data.Unit, 30);
    if (data.StandardPrice !== undefined) service.StandardPrice = requireAmount(data.StandardPrice, 'Harga standar');
    if (data.CostPrice !== undefined) service.CostPrice = requireAmount(data.CostPrice, 'Harga pokok', { allowZero: true });
    if (data.IsAvailable !== undefined) service.IsAvailable = String(data.IsAvailable).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    if (data.Description !== undefined) service.Description = cleanText(data.Description, 500);
    service.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_SERVICE', module: 'Services', recordId: service.ServiceID, previous, next: JSON.stringify(service) });
    return service;
  }
  requireFields(data, ['ServiceName', 'Category', 'Unit', 'StandardPrice']);
  const service = {
    ServiceID: makeId(db, 'service', 'SV'),
    ServiceCode: cleanText(data.ServiceCode, 30) || `SVC${db.services.length + 1}`,
    ServiceName: cleanText(data.ServiceName, 120),
    Category: requireEnum(data.Category, SERVICE_CATEGORIES, 'Kategori layanan'),
    Unit: cleanText(data.Unit, 30),
    StandardPrice: requireAmount(data.StandardPrice, 'Harga standar'),
    CostPrice: requireAmount(data.CostPrice || 0, 'Harga pokok', { allowZero: true }),
    IsAvailable: 'TRUE',
    Description: cleanText(data.Description, 500),
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.services.push(service);
  audit(db, { user: user.StaffID, action: 'CREATE_SERVICE', module: 'Services', recordId: service.ServiceID, next: JSON.stringify(service) });
  return service;
}

function listServiceOrders(db, filters = {}) {
  let rows = db.serviceOrders.map((order) => {
    const tenant = db.tenants.find((t) => t.TenantID === order.TenantID);
    const service = db.services.find((s) => s.ServiceID === order.ServiceID);
    const room = db.rooms.find((r) => r.RoomID === order.RoomID);
    return {
      ...order,
      TenantName: tenant ? tenant.FullName : order.TenantID,
      ServiceName: service ? service.ServiceName : order.ServiceID,
      RoomNumber: room ? room.RoomNumber : '',
    };
  });
  if (filters.status) rows = rows.filter((row) => row.OrderStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.from) rows = rows.filter((row) => row.OrderDate >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.OrderDate <= filters.to);
  rows.sort((a, b) => b.OrderDate.localeCompare(a.OrderDate) || b.CreatedAt.localeCompare(a.CreatedAt));
  return rows;
}

function createServiceInvoice(db, tenantId, occupancy, amount, orderDate, user) {
  const invoiceDate = today();
  const invoice = {
    InvoiceID: makeId(db, 'invoice', 'INV'),
    InvoiceNumber: makeInvoiceNumber(db, getSetting(db, 'InvoicePrefix', 'INV'), invoiceDate),
    TenantID: tenantId,
    OccupancyID: occupancy ? occupancy.OccupancyID : '',
    RoomID: occupancy ? occupancy.RoomID : '',
    PeriodStart: monthStart(orderDate),
    PeriodEnd: monthEnd(orderDate),
    InvoiceDate: invoiceDate,
    DueDate: addDays(orderDate, getNumberSetting(db, 'DefaultDueDays', 5)),
    RentalAmount: 0,
    ServiceCharges: amount,
    OtherCharges: 0,
    DiscountAmount: 0,
    TotalAmount: amount,
    AmountPaid: 0,
    OutstandingBalance: amount,
    InvoiceStatus: 'Issued',
    CreatedAt: nowISO(),
    CreatedBy: user.StaffID || '',
    Notes: `Tagihan layanan tambahan tanggal ${orderDate}`,
  };
  db.invoices.push(invoice);
  recalculateInvoice(db, invoice);
  audit(db, { user: user.StaffID, action: 'CREATE_SERVICE_INVOICE', module: 'Invoices', recordId: invoice.InvoiceID, next: JSON.stringify({ amount, tenant: tenantId }) });
  return invoice;
}

function createServiceOrder(db, data, user) {
  requireFields(data, ['TenantID', 'ServiceID', 'Quantity', 'BillingMethod']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const service = findById(db.services, 'ServiceID', data.ServiceID);
  if (service.IsAvailable === 'FALSE') throw new AppError('Layanan ini sedang tidak tersedia.');
  const quantity = requireAmount(data.Quantity, 'Jumlah');
  const orderDate = data.OrderDate || today();
  if (!isDate(orderDate)) throw new AppError('Tanggal order tidak valid.');
  const billingMethod = requireEnum(data.BillingMethod, BILLING_METHODS, 'Metode penagihan');
  const occupancy = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active');
  if (!occupancy) throw new AppError('Penghuni tidak memiliki perjanjian sewa aktif.');
  const unitPrice = requireAmount(data.UnitPrice !== undefined ? data.UnitPrice : service.StandardPrice, 'Harga satuan');
  const total = unitPrice * quantity;
  const orderId = makeId(db, 'serviceOrder', 'SVO');

  let invoice = null;
  let payment = null;
  let paymentMethod = '';
  if (billingMethod === 'Add to Invoice') {
    invoice = data.InvoiceID ? findById(db.invoices, 'InvoiceID', data.InvoiceID) : findOpenInvoiceForTenant(db, tenant.TenantID);
    if (!invoice) invoice = createServiceInvoice(db, tenant.TenantID, occupancy, total, orderDate, user);
    else {
      if (invoice.TenantID !== tenant.TenantID) throw new AppError('Invoice tidak sesuai dengan penghuni.');
      addServiceCharge(db, invoice.InvoiceID, total, `${service.ServiceName} ${quantity} ${service.Unit}`);
    }
  } else {
    paymentMethod = requireEnum(data.PaymentMethod || 'Cash', ['Cash', 'Bank Transfer', 'QRIS', 'Other'], 'Metode pembayaran');
    const result = recordDirectPayment(db, {
      TenantID: tenant.TenantID,
      AmountReceived: total,
      PaymentMethod: paymentMethod,
      PaymentDate: orderDate,
      ReferenceNumber: data.ReferenceNumber,
      ReferenceType: 'ServiceOrder',
      ReferenceID: orderId,
      RoomID: occupancy.RoomID,
      TransactionType: 'Service Payment',
      Category: service.Category,
      Description: `Layanan ${service.ServiceName} ${quantity} ${service.Unit}`,
      IdempotencyKey: `SVC-ORDER:${orderId}`,
      Notes: cleanText(data.Notes, 400),
    }, user);
    payment = result.payment;
  }

  const order = {
    ServiceOrderID: orderId,
    OrderDate: orderDate,
    TenantID: tenant.TenantID,
    RoomID: occupancy.RoomID,
    ServiceID: service.ServiceID,
    Quantity: quantity,
    UnitPrice: unitPrice,
    TotalAmount: total,
    OrderStatus: billingMethod === 'Immediate Payment' ? 'Paid' : 'Billed',
    BillingMethod: billingMethod,
    InvoiceID: invoice ? invoice.InvoiceID : '',
    PaymentID: payment ? payment.PaymentID : '',
    RequestedBy: user.StaffID || '',
    ProcessedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.serviceOrders.push(order);
  audit(db, {
    user: user.StaffID, action: 'CREATE_SERVICE_ORDER', module: 'ServiceOrders', recordId: order.ServiceOrderID,
    next: JSON.stringify({ service: service.ServiceID, quantity, total, billingMethod, invoice: order.InvoiceID, payment: order.PaymentID }),
  });
  return { order, invoice, payment };
}

module.exports = { SERVICE_CATEGORIES, BILLING_METHODS, listServices, saveService, listServiceOrders, createServiceOrder };
