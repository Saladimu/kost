'use strict';

const TIMEZONE = 'Asia/Jakarta';

function nowISO() {
  return new Date().toISOString();
}

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}

function parseDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, day] = value.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1, day));
    if (d.getUTCFullYear() !== y || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== day) return null;
    return d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseDate(value);
  return !!d && d.toISOString().slice(0, 10) === value;
}

function addDays(value, days) {
  const d = parseDate(value);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonthsClamped(value, months) {
  const [y, m, day] = value.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const maxDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, maxDay));
  return target.toISOString().slice(0, 10);
}

function monthStart(value = today()) {
  return `${value.slice(0, 7)}-01`;
}

function monthEnd(value = today()) {
  const [y, m] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function previousMonthRange(value = today()) {
  const first = new Date(`${monthStart(value)}T00:00:00Z`);
  first.setUTCMonth(first.getUTCMonth() - 1);
  const from = first.toISOString().slice(0, 10);
  return { from, to: monthEnd(from) };
}

function daysBetween(a, b) {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  return Math.round((d2 - d1) / 86400000);
}

function overlaps(startA, endA, startB, endB) {
  const aEnd = endA || '9999-12-31';
  const bEnd = endB || '9999-12-31';
  return startA <= bEnd && startB <= aEnd;
}

function round(value) {
  return Math.round(Number(value) || 0);
}

function nextCounter(db, key) {
  db.meta.counters[key] = (db.meta.counters[key] || 0) + 1;
  return db.meta.counters[key];
}

function makeId(db, key, prefix, width = 4) {
  return `${prefix}-${pad(nextCounter(db, key), width)}`;
}

function makeInvoiceNumber(db, prefix, date = today()) {
  const seq = nextCounter(db, `invoice-${date.slice(0, 7)}`);
  return `${prefix}/${date.slice(0, 4)}${date.slice(5, 7)}/${pad(seq, 4)}`;
}

function makeReceiptNumber(db, prefix, date = today()) {
  const seq = nextCounter(db, `receipt-${date.slice(0, 7)}`);
  return `${prefix}/${date.slice(0, 7).replace('-', '')}/${pad(seq, 4)}`;
}

class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function requireFields(data, fields) {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new AppError(`Field ${field} wajib diisi.`);
    }
  }
}

function requireDate(value, label) {
  if (!isDate(value)) throw new AppError(`${label} harus berupa tanggal yang valid (YYYY-MM-DD).`);
  return value;
}

function requireEnum(value, allowed, label) {
  if (!allowed.includes(value)) throw new AppError(`${label} tidak valid. Pilihan: ${allowed.join(', ')}.`);
  return value;
}

function requireAmount(value, label, { allowZero = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new AppError(`${label} harus berupa angka.`);
  if (!Number.isInteger(n)) throw new AppError(`${label} harus berupa angka bulat Rupiah.`);
  if (n < 0 || (!allowZero && n === 0)) throw new AppError(`${label} harus lebih besar dari nol.`);
  return n;
}

function cleanText(value, max = 500) {
  return String(value === undefined || value === null ? '' : value).trim().slice(0, max);
}

function cleanOptional(value) {
  const text = cleanText(value);
  return text === '' ? '' : text;
}

function sortBy(rows, key, direction = 'asc') {
  const dir = direction === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });
}

function inRange(value, from, to) {
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

module.exports = {
  TIMEZONE,
  nowISO,
  today,
  pad,
  parseDate,
  isDate,
  addDays,
  addMonthsClamped,
  monthStart,
  monthEnd,
  previousMonthRange,
  daysBetween,
  overlaps,
  round,
  nextCounter,
  makeId,
  makeInvoiceNumber,
  makeReceiptNumber,
  AppError,
  requireFields,
  requireDate,
  requireEnum,
  requireAmount,
  cleanText,
  cleanOptional,
  sortBy,
  inRange,
};
