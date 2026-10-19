'use strict';

const { nowISO, makeId, AppError, requireFields, requireAmount, requireEnum, cleanText, isDate } = require('../util');
const { audit, setSetting, findById } = require('./common');

const PRICE_CATEGORIES = ['Room Rental', 'Laundry', 'Cleaning', 'Parking', 'Utilities', 'Other Services'];

function listSettings(db) {
  return db.settings.slice().sort((a, b) => a.SettingKey.localeCompare(b.SettingKey));
}

function saveSettings(db, updates, user) {
  if (!updates || typeof updates !== 'object') throw new AppError('Data pengaturan tidak valid.');
  const allowed = new Set(db.settings.map((s) => s.SettingKey));
  for (const [key, value] of Object.entries(updates)) {
    if (!allowed.has(key)) continue;
    setSetting(db, key, value, user.StaffID || 'SYSTEM');
  }
  audit(db, { user: user.StaffID, action: 'UPDATE_SETTINGS', module: 'Settings', recordId: 'SETTINGS', next: JSON.stringify(updates) });
  return listSettings(db);
}

function listPriceList(db) {
  return db.priceList.slice().sort((a, b) => `${a.ItemCategory}${a.ItemName}`.localeCompare(`${b.ItemCategory}${b.ItemName}`));
}

function savePrice(db, data, user) {
  if (data.PriceID) {
    const price = findById(db.priceList, 'PriceID', data.PriceID);
    const previous = JSON.stringify(price);
    if (data.ItemName !== undefined) price.ItemName = cleanText(data.ItemName, 120);
    if (data.ItemCode !== undefined) price.ItemCode = cleanText(data.ItemCode, 30);
    if (data.ItemCategory !== undefined) price.ItemCategory = requireEnum(data.ItemCategory, PRICE_CATEGORIES, 'Kategori harga');
    if (data.BillingUnit !== undefined) price.BillingUnit = cleanText(data.BillingUnit, 20);
    if (data.StandardPrice !== undefined) price.StandardPrice = requireAmount(data.StandardPrice, 'Harga standar');
    if (data.EffectiveFrom !== undefined) price.EffectiveFrom = isDate(data.EffectiveFrom) ? data.EffectiveFrom : price.EffectiveFrom;
    if (data.EffectiveTo !== undefined) price.EffectiveTo = data.EffectiveTo && isDate(data.EffectiveTo) ? data.EffectiveTo : '';
    if (data.IsActive !== undefined) price.IsActive = String(data.IsActive).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    if (data.Notes !== undefined) price.Notes = cleanText(data.Notes, 300);
    audit(db, { user: user.StaffID, action: 'UPDATE_PRICE', module: 'PriceList', recordId: price.PriceID, previous, next: JSON.stringify(price) });
    return price;
  }
  requireFields(data, ['ItemName', 'ItemCategory', 'StandardPrice', 'EffectiveFrom']);
  if (!isDate(data.EffectiveFrom)) throw new AppError('Tanggal efektif tidak valid.');
  const price = {
    PriceID: makeId(db, 'price', 'PRC'),
    ItemCode: cleanText(data.ItemCode, 30) || `ITEM${db.priceList.length + 1}`,
    ItemName: cleanText(data.ItemName, 120),
    ItemCategory: requireEnum(data.ItemCategory, PRICE_CATEGORIES, 'Kategori harga'),
    RoomTypeID: data.RoomTypeID || '',
    BillingUnit: cleanText(data.BillingUnit, 20) || 'bulan',
    StandardPrice: requireAmount(data.StandardPrice, 'Harga standar'),
    EffectiveFrom: data.EffectiveFrom,
    EffectiveTo: '',
    IsActive: 'TRUE',
    Notes: cleanText(data.Notes, 300),
  };
  db.priceList.push(price);
  audit(db, { user: user.StaffID, action: 'CREATE_PRICE', module: 'PriceList', recordId: price.PriceID, next: JSON.stringify(price) });
  return price;
}

function listAudit(db, filters = {}) {
  let rows = db.auditLog.slice();
  if (filters.module) rows = rows.filter((row) => row.Module === filters.module);
  if (filters.userId) rows = rows.filter((row) => row.UserID === filters.userId);
  if (filters.from) rows = rows.filter((row) => row.Timestamp.slice(0, 10) >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.Timestamp.slice(0, 10) <= filters.to);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.Action} ${row.Module} ${row.RecordID} ${row.UserID}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.Timestamp.localeCompare(a.Timestamp));
  return rows.slice(0, 1000);
}

function listSystemLog(db) {
  return db.systemLog.slice().sort((a, b) => b.Timestamp.localeCompare(a.Timestamp)).slice(0, 500);
}

module.exports = { PRICE_CATEGORIES, listSettings, saveSettings, listPriceList, savePrice, listAudit, listSystemLog };
