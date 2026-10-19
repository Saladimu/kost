'use strict';

const { today, nowISO, AppError, requireAmount, requireFields, cleanText } = require('../util');
const { audit, findById } = require('./common');
const { createTransaction } = require('./payments');

function listDeposits(db, filters = {}) {
  let rows = db.deposits.map((deposit) => {
    const tenant = db.tenants.find((t) => t.TenantID === deposit.TenantID);
    const occupancy = db.occupancies.find((o) => o.OccupancyID === deposit.OccupancyID);
    const room = occupancy ? db.rooms.find((r) => r.RoomID === occupancy.RoomID) : null;
    return {
      ...deposit,
      TenantName: tenant ? tenant.FullName : deposit.TenantID,
      RoomNumber: room ? room.RoomNumber : '',
      CheckInDate: occupancy ? occupancy.CheckInDate : '',
    };
  });
  if (filters.status) rows = rows.filter((row) => row.DepositStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  rows.sort((a, b) => b.CreatedAt.localeCompare(a.CreatedAt));
  return rows;
}

function recordDepositReturn(db, data, user) {
  requireFields(data, ['DepositRecordID']);
  const deposit = findById(db.deposits, 'DepositRecordID', data.DepositRecordID);
  if (['Returned', 'Voided'].includes(deposit.DepositStatus)) throw new AppError('Deposit ini sudah diselesaikan.');
  const outstanding = Number(deposit.OutstandingDepositLiability);
  const returned = requireAmount(data.AmountReturned || 0, 'Jumlah pengembalian', { allowZero: true });
  const deducted = requireAmount(data.AmountDeducted || 0, 'Jumlah potongan', { allowZero: true });
  if (returned + deducted <= 0) throw new AppError('Masukkan jumlah pengembalian atau potongan.');
  if (returned + deducted > outstanding) throw new AppError('Pengembalian dan potongan melebihi saldo deposit.');
  const previous = JSON.stringify(deposit);
  deposit.AmountReturned = Number(deposit.AmountReturned) + returned;
  deposit.AmountDeducted = Number(deposit.AmountDeducted) + deducted;
  deposit.OutstandingDepositLiability = outstanding - returned - deducted;
  deposit.DepositStatus = deposit.OutstandingDepositLiability === 0 ? 'Returned' : 'Partially Returned';
  deposit.Notes = `${deposit.Notes} | ${cleanText(data.Notes, 250)}`;
  if (returned > 0) {
    const occupancy = db.occupancies.find((o) => o.OccupancyID === deposit.OccupancyID);
    const tx = createTransaction(db, {
      date: data.ReturnDate || today(), type: 'Deposit Returned', direction: 'OUT', category: 'Deposit',
      referenceType: 'Deposit', referenceId: deposit.DepositRecordID,
      tenantId: deposit.TenantID, roomId: occupancy ? occupancy.RoomID : '',
      description: `Pengembalian deposit ${deposit.DepositRecordID}`,
      amount: returned, method: data.ReturnMethod || 'Cash', status: 'Confirmed', staffId: user.StaffID,
      key: `DEP:RET:${deposit.DepositRecordID}:${data.ReturnDate || today()}`,
    });
    deposit.ReturnTransactionID = tx.TransactionID;
  }
  audit(db, { user: user.StaffID, action: 'RETURN_DEPOSIT', module: 'Deposits', recordId: deposit.DepositRecordID, previous, next: JSON.stringify(deposit), reason: data.Notes || '' });
  return deposit;
}

function depositSummary(db) {
  const held = db.deposits.filter((d) => ['Held', 'Partially Returned'].includes(d.DepositStatus));
  return {
    totalHeld: held.reduce((sum, d) => sum + Number(d.OutstandingDepositLiability || 0), 0),
    totalReceived: db.deposits.reduce((sum, d) => sum + Number(d.DepositAmount || 0), 0),
    totalReturned: db.deposits.reduce((sum, d) => sum + Number(d.AmountReturned || 0), 0),
    totalDeducted: db.deposits.reduce((sum, d) => sum + Number(d.AmountDeducted || 0), 0),
    count: held.length,
  };
}

module.exports = { listDeposits, recordDepositReturn, depositSummary };
