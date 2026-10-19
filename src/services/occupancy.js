'use strict';

const {
  today, nowISO, addDays, addMonthsClamped, makeId, AppError, requireFields,
  requireDate, requireAmount, requireEnum, cleanText,
} = require('../util');
const { audit, getNumberSetting, findById } = require('./common');
const { assignmentConflict, activeOccupanciesForRoom } = require('./rooms');
const { generateMonthlyInvoices, recalculateAllInvoices } = require('./billing');
const { createTransaction } = require('./payments');

const RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Converted', 'Expired'];
const AGREEMENT_STATUSES = ['Active', 'Ended', 'Transferred', 'Renewed'];

function expireReservations(db) {
  const days = getNumberSetting(db, 'ReservationExpiryDays', 3);
  const limit = addDays(today(), -days);
  for (const reservation of db.reservations) {
    if (reservation.ReservationStatus === 'Pending' && reservation.ReservationDate < limit) {
      reservation.ReservationStatus = 'Expired';
    }
  }
}

function decorateReservation(db, reservation) {
  const tenant = db.tenants.find((t) => t.TenantID === reservation.TenantID);
  const room = db.rooms.find((r) => r.RoomID === reservation.RoomID);
  return {
    ...reservation,
    TenantName: tenant ? tenant.FullName : reservation.TenantID,
    TenantPhone: tenant ? tenant.Phone : '',
    RoomNumber: room ? room.RoomNumber : '',
    RoomTypeID: room ? room.RoomTypeID : '',
  };
}

function listReservations(db, filters = {}) {
  expireReservations(db);
  let rows = db.reservations.map((r) => decorateReservation(db, r));
  if (filters.status) rows = rows.filter((row) => row.ReservationStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.from) rows = rows.filter((row) => row.PlannedCheckIn >= filters.from);
  if (filters.to) rows = rows.filter((row) => row.PlannedCheckIn <= filters.to);
  rows.sort((a, b) => a.PlannedCheckIn.localeCompare(b.PlannedCheckIn));
  return rows;
}

function createReservation(db, data, user) {
  requireFields(data, ['TenantID', 'RoomID', 'PlannedCheckIn']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const checkIn = requireDate(data.PlannedCheckIn, 'Rencana check-in');
  const checkOut = data.PlannedCheckOut ? requireDate(data.PlannedCheckOut, 'Rencana check-out') : '';
  if (checkOut && checkOut < checkIn) throw new AppError('Rencana check-out tidak boleh sebelum check-in.');
  const status = requireEnum(data.ReservationStatus || 'Confirmed', ['Pending', 'Confirmed'], 'Status reservasi');
  const endForConflict = checkOut || addDays(addMonthsClamped(checkIn, 1), -1);
  assignmentConflict(db, { roomId: data.RoomID, startDate: checkIn, endDate: endForConflict });
  const price = requireAmount(data.AgreedMonthlyPrice, 'Harga sewa disepakati');
  const reservation = {
    ReservationID: makeId(db, 'reservation', 'RSV'),
    TenantID: tenant.TenantID,
    RoomID: data.RoomID,
    ReservationDate: today(),
    PlannedCheckIn: checkIn,
    PlannedCheckOut: checkOut,
    AgreedMonthlyPrice: price,
    DepositAmount: requireAmount(data.DepositAmount || 0, 'Deposit', { allowZero: true }),
    ReservationStatus: status,
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.reservations.push(reservation);
  if (tenant.TenantStatus === 'Inactive') tenant.TenantStatus = 'Prospective';
  audit(db, { user: user.StaffID, action: 'CREATE_RESERVATION', module: 'Reservations', recordId: reservation.ReservationID, next: JSON.stringify(reservation) });
  return decorateReservation(db, reservation);
}

function updateReservation(db, reservationId, data, user) {
  const reservation = findById(db.reservations, 'ReservationID', reservationId);
  if (['Converted', 'Cancelled', 'Expired'].includes(reservation.ReservationStatus)) {
    throw new AppError('Reservasi ini tidak dapat diubah lagi.');
  }
  const previous = JSON.stringify(reservation);
  if (data.ReservationStatus) {
    if (data.ReservationStatus === 'Cancelled') {
      reservation.ReservationStatus = 'Cancelled';
    } else if (data.ReservationStatus === 'Confirmed') {
      reservation.ReservationStatus = 'Confirmed';
    }
  }
  if (data.PlannedCheckIn) reservation.PlannedCheckIn = requireDate(data.PlannedCheckIn, 'Rencana check-in');
  if (data.PlannedCheckOut !== undefined) reservation.PlannedCheckOut = data.PlannedCheckOut ? requireDate(data.PlannedCheckOut, 'Rencana check-out') : '';
  if (data.AgreedMonthlyPrice !== undefined) reservation.AgreedMonthlyPrice = requireAmount(data.AgreedMonthlyPrice, 'Harga sewa');
  if (data.Notes !== undefined) reservation.Notes = cleanText(data.Notes, 500);
  audit(db, { user: user.StaffID, action: 'UPDATE_RESERVATION', module: 'Reservations', recordId: reservationId, previous, next: JSON.stringify(reservation) });
  return decorateReservation(db, reservation);
}

function listOccupancies(db, filters = {}) {
  recalculateAllInvoices(db, today());
  let rows = db.occupancies.map((occupancy) => {
    const tenant = db.tenants.find((t) => t.TenantID === occupancy.TenantID);
    const room = db.rooms.find((r) => r.RoomID === occupancy.RoomID);
    const outstanding = db.invoices
      .filter((i) => i.OccupancyID === occupancy.OccupancyID && i.InvoiceStatus !== 'Cancelled')
      .reduce((sum, i) => sum + Number(i.OutstandingBalance || 0), 0);
    return {
      ...occupancy,
      TenantName: tenant ? tenant.FullName : occupancy.TenantID,
      TenantPhone: tenant ? tenant.Phone : '',
      RoomNumber: room ? room.RoomNumber : '',
      OutstandingBalance: outstanding,
    };
  });
  if (filters.status) rows = rows.filter((row) => row.AgreementStatus === filters.status);
  if (filters.tenantId) rows = rows.filter((row) => row.TenantID === filters.tenantId);
  if (filters.roomId) rows = rows.filter((row) => row.RoomID === filters.roomId);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    rows = rows.filter((row) => `${row.TenantName} ${row.RoomNumber}`.toLowerCase().includes(q));
  }
  rows.sort((a, b) => b.CheckInDate.localeCompare(a.CheckInDate));
  return rows;
}

function checkInTenant(db, data, user) {
  requireFields(data, ['TenantID', 'RoomID', 'AgreedMonthlyPrice']);
  const tenant = findById(db.tenants, 'TenantID', data.TenantID);
  const room = findById(db.rooms, 'RoomID', data.RoomID);
  const checkInDate = requireDate(data.CheckInDate || today(), 'Tanggal check-in');
  const plannedOut = data.PlannedCheckOut ? requireDate(data.PlannedCheckOut, 'Rencana check-out') : '';
  if (plannedOut && plannedOut < checkInDate) throw new AppError('Rencana check-out tidak boleh sebelum check-in.');
  const price = requireAmount(data.AgreedMonthlyPrice, 'Harga sewa disepakati');
  const depositAmount = requireAmount(data.DepositAmount || 0, 'Deposit', { allowZero: true });
  let reservation = null;
  if (data.ReservationID) {
    reservation = findById(db.reservations, 'ReservationID', data.ReservationID);
    if (reservation.TenantID !== tenant.TenantID || reservation.RoomID !== room.RoomID) {
      throw new AppError('Reservasi tidak sesuai dengan penghuni atau kamar yang dipilih.');
    }
    if (!['Pending', 'Confirmed'].includes(reservation.ReservationStatus)) {
      throw new AppError('Reservasi tidak dapat dikonversi karena statusnya tidak aktif.');
    }
  }
  assignmentConflict(db, {
    roomId: room.RoomID,
    startDate: checkInDate,
    endDate: plannedOut,
    excludeReservationId: reservation ? reservation.ReservationID : '',
  });

  const occupancy = {
    OccupancyID: makeId(db, 'occupancy', 'OCC'),
    TenantID: tenant.TenantID,
    RoomID: room.RoomID,
    CheckInDate: checkInDate,
    PlannedCheckOut: plannedOut,
    ActualCheckOut: '',
    RentalPlan: 'Monthly',
    AgreedMonthlyPrice: price,
    BillingDay: Number(checkInDate.slice(8, 10)),
    DueDay: getNumberSetting(db, 'DefaultDueDays', 5),
    DepositAmount: depositAmount,
    AgreementStatus: 'Active',
    PreviousOccupancyID: data.PreviousOccupancyID ? cleanText(data.PreviousOccupancyID, 30) : '',
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.occupancies.push(occupancy);
  tenant.TenantStatus = 'Active';
  tenant.UpdatedAt = nowISO();
  if (reservation) {
    reservation.ReservationStatus = 'Converted';
    reservation.Notes = `${reservation.Notes} | Dikonversi ke ${occupancy.OccupancyID}`;
  }

  let depositRecord = null;
  if (depositAmount > 0) {
    const method = data.DepositMethod || 'Cash';
    const tx = createTransaction(db, {
      date: checkInDate, type: 'Deposit Received', direction: 'IN', category: 'Deposit',
      referenceType: 'Deposit', referenceId: '', tenantId: tenant.TenantID, roomId: room.RoomID,
      description: `Deposit keamanan ${tenant.FullName}`, amount: depositAmount, method,
      status: 'Confirmed', staffId: user.StaffID, key: `DEP:RCPT:${occupancy.OccupancyID}`,
    });
    depositRecord = {
      DepositRecordID: makeId(db, 'deposit', 'DEP'),
      TenantID: tenant.TenantID,
      OccupancyID: occupancy.OccupancyID,
      DepositType: 'Security Deposit',
      DepositAmount: depositAmount,
      AmountReturned: 0,
      AmountDeducted: 0,
      OutstandingDepositLiability: depositAmount,
      ReceiptTransactionID: tx.TransactionID,
      ReturnTransactionID: '',
      DepositStatus: 'Held',
      CreatedAt: nowISO(),
      Notes: cleanText(data.DepositNotes, 300),
    };
    tx.ReferenceID = depositRecord.DepositRecordID;
    db.deposits.push(depositRecord);
  }

  const occupants = activeOccupanciesForRoom(db, room.RoomID, checkInDate);
  if (occupants.length >= Number(room.Capacity || 1)) room.OperationalStatus = 'Occupied';
  room.UpdatedAt = nowISO();

  const billing = generateMonthlyInvoices(db, { asOf: today(), user: user.StaffID });

  audit(db, {
    user: user.StaffID, action: 'CHECK_IN', module: 'Occupancy', recordId: occupancy.OccupancyID,
    next: JSON.stringify({ tenant: tenant.TenantID, room: room.RoomID, price, deposit: depositAmount, reservation: reservation ? reservation.ReservationID : '' }),
  });
  return { occupancy, deposit: depositRecord, invoicesCreated: billing.count };
}

function transferTenant(db, data, user) {
  requireFields(data, ['ToRoomID', 'TransferDate']);
  const transferDate = requireDate(data.TransferDate, 'Tanggal pindah');
  let occupancy = null;
  if (data.OccupancyID) occupancy = findById(db.occupancies, 'OccupancyID', data.OccupancyID);
  else {
    const tenant = findById(db.tenants, 'TenantID', data.TenantID);
    occupancy = db.occupancies.find((o) => o.TenantID === tenant.TenantID && o.AgreementStatus === 'Active');
  }
  if (!occupancy || occupancy.AgreementStatus !== 'Active') throw new AppError('Tidak ada perjanjian sewa aktif untuk dipindahkan.');
  if (transferDate < occupancy.CheckInDate) throw new AppError('Tanggal pindah tidak boleh sebelum check-in.');
  if (occupancy.RoomID === data.ToRoomID) throw new AppError('Kamar tujuan harus berbeda dari kamar saat ini.');
  const newRoom = findById(db.rooms, 'RoomID', data.ToRoomID);
  assignmentConflict(db, { roomId: newRoom.RoomID, startDate: transferDate, endDate: occupancy.PlannedCheckOut, excludeOccupancyId: occupancy.OccupancyID });

  const previous = JSON.stringify(occupancy);
  const price = data.NewMonthlyPrice !== undefined
    ? requireAmount(data.NewMonthlyPrice, 'Harga sewa baru')
    : Number(occupancy.AgreedMonthlyPrice);

  occupancy.ActualCheckOut = transferDate;
  occupancy.AgreementStatus = 'Transferred';
  occupancy.Notes = `${occupancy.Notes} | Dipindahkan ke ${newRoom.RoomNumber} pada ${transferDate}`;

  const newOccupancy = {
    OccupancyID: makeId(db, 'occupancy', 'OCC'),
    TenantID: occupancy.TenantID,
    RoomID: newRoom.RoomID,
    CheckInDate: transferDate,
    PlannedCheckOut: occupancy.PlannedCheckOut,
    ActualCheckOut: '',
    RentalPlan: 'Monthly',
    AgreedMonthlyPrice: price,
    BillingDay: Number(occupancy.CheckInDate.slice(8, 10)),
    DueDay: Number(occupancy.DueDay || getNumberSetting(db, 'DefaultDueDays', 5)),
    DepositAmount: Number(occupancy.DepositAmount || 0),
    AgreementStatus: 'Active',
    PreviousOccupancyID: occupancy.OccupancyID,
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes, 500),
  };
  db.occupancies.push(newOccupancy);

  db.deposits.filter((d) => d.OccupancyID === occupancy.OccupancyID && d.DepositStatus === 'Held').forEach((d) => { d.OccupancyID = newOccupancy.OccupancyID; });
  if (activeOccupanciesForRoom(db, newRoom.RoomID, transferDate).length >= Number(newRoom.Capacity || 1)) newRoom.OperationalStatus = 'Occupied';
  const oldRoom = db.rooms.find((r) => r.RoomID === occupancy.RoomID);
  if (oldRoom && activeOccupanciesForRoom(db, oldRoom.RoomID, transferDate).length === 0 && oldRoom.OperationalStatus === 'Occupied') oldRoom.OperationalStatus = 'Available';
  audit(db, { user: user.StaffID, action: 'TRANSFER_ROOM', module: 'Occupancy', recordId: newOccupancy.OccupancyID, previous, next: JSON.stringify(newOccupancy), reason: data.Reason || '' });
  return { previous: occupancy, occupancy: newOccupancy };
}

function renewAgreement(db, data, user) {
  const occupancy = findById(db.occupancies, 'OccupancyID', data.OccupancyID);
  if (occupancy.AgreementStatus !== 'Active') throw new AppError('Hanya perjanjian aktif yang dapat diperpanjang.');
  const lastInvoice = db.invoices
    .filter((i) => i.OccupancyID === occupancy.OccupancyID && i.InvoiceStatus !== 'Cancelled')
    .sort((a, b) => a.PeriodEnd.localeCompare(b.PeriodEnd))[0];
  const effectiveDate = data.EffectiveDate
    ? requireDate(data.EffectiveDate, 'Tanggal efektif')
    : (lastInvoice ? addDays(lastInvoice.PeriodEnd, 1) : addDays(today(), 1));
  if (effectiveDate <= occupancy.CheckInDate) throw new AppError('Tanggal efektif perpanjangan tidak valid.');
  const price = requireAmount(data.NewMonthlyPrice, 'Harga sewa baru');
  const previous = JSON.stringify(occupancy);
  occupancy.AgreementStatus = 'Renewed';
  occupancy.ActualCheckOut = addDays(effectiveDate, -1);
  occupancy.Notes = `${occupancy.Notes} | Diperpanjang mulai ${effectiveDate}`;
  const newOccupancy = {
    ...occupancy,
    OccupancyID: makeId(db, 'occupancy', 'OCC'),
    CheckInDate: effectiveDate,
    ActualCheckOut: '',
    AgreedMonthlyPrice: price,
    AgreementStatus: 'Active',
    PreviousOccupancyID: occupancy.OccupancyID,
    CreatedBy: user.StaffID || '',
    CreatedAt: nowISO(),
    Notes: cleanText(data.Notes || `Perpanjangan dari ${occupancy.OccupancyID}`, 500),
  };
  db.occupancies.push(newOccupancy);
  db.deposits.filter((d) => d.OccupancyID === occupancy.OccupancyID && d.DepositStatus === 'Held').forEach((d) => { d.OccupancyID = newOccupancy.OccupancyID; });
  audit(db, { user: user.StaffID, action: 'RENEW_AGREEMENT', module: 'Occupancy', recordId: newOccupancy.OccupancyID, previous, next: JSON.stringify(newOccupancy) });
  return newOccupancy;
}

function checkOutTenant(db, data, user) {
  requireFields(data, ['OccupancyID']);
  const occupancy = findById(db.occupancies, 'OccupancyID', data.OccupancyID);
  if (occupancy.AgreementStatus !== 'Active') throw new AppError('Perjanjian ini tidak aktif.');
  const checkOutDate = requireDate(data.CheckOutDate || today(), 'Tanggal check-out');
  if (checkOutDate < occupancy.CheckInDate) throw new AppError('Tanggal check-out tidak boleh sebelum check-in.');
  const tenant = findById(db.tenants, 'TenantID', occupancy.TenantID);
  const room = findById(db.rooms, 'RoomID', occupancy.RoomID);
  recalculateAllInvoices(db, checkOutDate);
  const outstandingInvoices = db.invoices.filter(
    (invoice) => invoice.TenantID === occupancy.TenantID && invoice.InvoiceStatus !== 'Cancelled' && Number(invoice.OutstandingBalance) > 0
  );
  const outstanding = outstandingInvoices.reduce((sum, invoice) => sum + Number(invoice.OutstandingBalance), 0);

  const deposit = db.deposits.find((d) => d.OccupancyID === occupancy.OccupancyID && d.DepositStatus === 'Held');
  let depositResult = null;
  if (deposit) {
    const deduction = requireAmount(data.DepositDeduction || 0, 'Potongan deposit', { allowZero: true });
    if (deduction > Number(deposit.OutstandingDepositLiability)) {
      throw new AppError('Potongan deposit melebihi saldo deposit yang tersedia.');
    }
    const returnAmount = Number(deposit.OutstandingDepositLiability) - deduction;
    deposit.AmountDeducted = Number(deposit.AmountDeducted || 0) + deduction;
    deposit.AmountReturned = Number(deposit.AmountReturned || 0) + returnAmount;
    deposit.OutstandingDepositLiability = 0;
    deposit.DepositStatus = deduction > 0 ? 'Partially Returned' : 'Returned';
    deposit.Notes = `${deposit.Notes} | Check-out ${checkOutDate}. Potongan: ${cleanText(data.DeductionReason, 200)}`;
    if (returnAmount > 0) {
      const method = data.ReturnMethod || 'Cash';
      const tx = createTransaction(db, {
        date: checkOutDate, type: 'Deposit Returned', direction: 'OUT', category: 'Deposit',
        referenceType: 'Deposit', referenceId: deposit.DepositRecordID,
        tenantId: occupancy.TenantID, roomId: occupancy.RoomID,
        description: `Pengembalian deposit ${tenant.FullName}`, amount: returnAmount,
        method, status: 'Confirmed', staffId: user.StaffID,
        key: `DEP:RET:${deposit.DepositRecordID}:${checkOutDate}`,
      });
      deposit.ReturnTransactionID = tx.TransactionID;
    }
    depositResult = { deposit, deduction, returnAmount };
  }

  occupancy.ActualCheckOut = checkOutDate;
  occupancy.AgreementStatus = 'Ended';
  occupancy.Notes = cleanText(`${occupancy.Notes} | Check-out ${checkOutDate}`, 500);
  const otherActive = db.occupancies.some((o) => o.TenantID === tenant.TenantID && o.OccupancyID !== occupancy.OccupancyID && o.AgreementStatus === 'Active');
  if (!otherActive) {
    tenant.TenantStatus = 'Checked Out';
    tenant.UpdatedAt = nowISO();
  }

  const remainingOccupants = activeOccupanciesForRoom(db, room.RoomID, addDays(checkOutDate, 1));
  let cleaningActivity = null;
  if (remainingOccupants.length === 0 && room.OperationalStatus !== 'Inactive') {
    room.OperationalStatus = 'Maintenance';
    cleaningActivity = {
      ActivityID: makeId(db, 'activity', 'ACT'),
      ActivityDate: checkOutDate,
      StaffID: '',
      Category: 'Cleaning',
      RoomID: room.RoomID,
      TenantID: '',
      Description: `Pembersihan dan inspeksi kamar ${room.RoomNumber} setelah check-out`,
      Priority: 'High',
      DueDate: addDays(checkOutDate, 1),
      Status: 'Pending',
      StartedAt: '',
      CompletedAt: '',
      VerifiedBy: '',
      Notes: `Dibuat otomatis saat check-out ${occupancy.OccupancyID}`,
    };
    db.activities.push(cleaningActivity);
  }

  audit(db, {
    user: user.StaffID, action: 'CHECK_OUT', module: 'Occupancy', recordId: occupancy.OccupancyID,
    next: JSON.stringify({ checkOutDate, outstanding, deposit: depositResult ? { deduction: depositResult.deduction, returned: depositResult.returnAmount } : null }),
  });
  return {
    occupancy,
    settlement: {
      checkOutDate,
      outstandingInvoices,
      outstandingTotal: outstanding,
      deposit: depositResult,
      roomStatus: room.OperationalStatus,
      cleaningActivity,
    },
  };
}

module.exports = {
  RESERVATION_STATUSES,
  AGREEMENT_STATUSES,
  listReservations,
  createReservation,
  updateReservation,
  expireReservations,
  listOccupancies,
  checkInTenant,
  transferTenant,
  renewAgreement,
  checkOutTenant,
};
