'use strict';

const { nowISO, today, makeId, AppError, requireFields, requireAmount, requireEnum, cleanText } = require('../util');
const { audit, findById } = require('./common');

const ROOM_STATUSES = ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Inactive'];

function activeOccupanciesForRoom(db, roomId, date = today()) {
  return db.occupancies.filter((occupancy) => {
    if (occupancy.RoomID !== roomId) return false;
    if (occupancy.AgreementStatus !== 'Active') return false;
    if (occupancy.CheckInDate > date) return false;
    if (occupancy.ActualCheckOut && occupancy.ActualCheckOut <= date) return false;
    return true;
  });
}

function roomAvailability(db, room) {
  if (room.OperationalStatus === 'Inactive') return 'Inactive';
  if (room.OperationalStatus === 'Maintenance') return 'Maintenance';
  const occupants = activeOccupanciesForRoom(db, room.RoomID);
  if (occupants.length >= Number(room.Capacity || 1)) return 'Occupied';
  const hasReservation = db.reservations.some(
    (reservation) => reservation.RoomID === room.RoomID
      && ['Pending', 'Confirmed'].includes(reservation.ReservationStatus)
      && (!reservation.PlannedCheckOut || reservation.PlannedCheckOut >= today())
  );
  if (hasReservation) return 'Reserved';
  if (occupants.length > 0) return 'Occupied';
  return 'Available';
}

function listRoomTypes(db) {
  return db.roomTypes.map((type) => ({
    ...type,
    RoomCount: db.rooms.filter((room) => room.RoomTypeID === type.RoomTypeID).length,
  }));
}

function saveRoomType(db, data, user) {
  if (data.RoomTypeID) {
    const row = findById(db.roomTypes, 'RoomTypeID', data.RoomTypeID);
    const previous = JSON.stringify(row);
    if (data.TypeName !== undefined) row.TypeName = cleanText(data.TypeName, 80) || row.TypeName;
    if (data.Description !== undefined) row.Description = cleanText(data.Description, 500);
    if (data.DefaultCapacity !== undefined) row.DefaultCapacity = requireAmount(data.DefaultCapacity, 'Kapasitas');
    if (data.DefaultMonthlyPrice !== undefined) row.DefaultMonthlyPrice = requireAmount(data.DefaultMonthlyPrice, 'Harga bulanan');
    if (data.Facilities !== undefined) row.Facilities = cleanText(data.Facilities, 1000);
    if (data.IsActive !== undefined) row.IsActive = String(data.IsActive).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
    row.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_ROOM_TYPE', module: 'RoomTypes', recordId: row.RoomTypeID, previous, next: JSON.stringify(row) });
    return row;
  }
  requireFields(data, ['TypeName', 'DefaultMonthlyPrice']);
  const type = {
    RoomTypeID: makeId(db, 'roomType', 'RT'),
    TypeName: cleanText(data.TypeName, 80),
    Description: cleanText(data.Description, 500),
    DefaultCapacity: requireAmount(data.DefaultCapacity || 1, 'Kapasitas'),
    DefaultMonthlyPrice: requireAmount(data.DefaultMonthlyPrice, 'Harga bulanan'),
    Facilities: cleanText(data.Facilities, 1000),
    IsActive: 'TRUE',
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.roomTypes.push(type);
  audit(db, { user: user.StaffID, action: 'CREATE_ROOM_TYPE', module: 'RoomTypes', recordId: type.RoomTypeID, next: JSON.stringify(type) });
  return type;
}

function decorateRoom(db, room) {
  const type = db.roomTypes.find((t) => t.RoomTypeID === room.RoomTypeID);
  const occupants = activeOccupanciesForRoom(db, room.RoomID);
  return {
    ...room,
    RoomTypeName: type ? type.TypeName : '-',
    AvailabilityStatus: roomAvailability(db, room),
    ActiveOccupants: occupants.length,
    OccupantNames: occupants.map((occupancy) => {
      const tenant = db.tenants.find((t) => t.TenantID === occupancy.TenantID);
      return tenant ? tenant.FullName : occupancy.TenantID;
    }).join(', '),
    OccupancyID: occupants[0] ? occupants[0].OccupancyID : '',
    TenantID: occupants[0] ? occupants[0].TenantID : '',
  };
}

function listRooms(db, filters = {}) {
  let rows = db.rooms.map((room) => decorateRoom(db, room));
  if (filters.status) rows = rows.filter((room) => room.AvailabilityStatus === filters.status);
  if (filters.building) rows = rows.filter((room) => room.Building === filters.building);
  if (filters.roomTypeId) rows = rows.filter((room) => room.RoomTypeID === filters.roomTypeId);
  return rows.sort((a, b) => String(a.RoomNumber).localeCompare(String(b.RoomNumber)));
}

function saveRoom(db, data, user) {
  const operationalStatus = data.OperationalStatus
    ? requireEnum(data.OperationalStatus, ROOM_STATUSES.filter((s) => s !== 'Occupied' && s !== 'Reserved'), 'Status operasional')
    : 'Available';
  if (data.RoomID) {
    const room = findById(db.rooms, 'RoomID', data.RoomID);
    const previous = JSON.stringify(room);
    if (data.RoomNumber && data.RoomNumber !== room.RoomNumber) {
      if (db.rooms.some((r) => r.RoomNumber.toLowerCase() === cleanText(data.RoomNumber, 20).toLowerCase() && r.RoomID !== room.RoomID)) {
        throw new AppError('Nomor kamar sudah digunakan.');
      }
      room.RoomNumber = cleanText(data.RoomNumber, 20);
    }
    if (data.Building !== undefined) room.Building = cleanText(data.Building, 30);
    if (data.Floor !== undefined) room.Floor = cleanText(data.Floor, 10);
    if (data.RoomTypeID !== undefined) {
      const type = findById(db.roomTypes, 'RoomTypeID', data.RoomTypeID);
      room.RoomTypeID = type.RoomTypeID;
    }
    if (data.Capacity !== undefined) room.Capacity = requireAmount(data.Capacity, 'Kapasitas');
    if (data.Facilities !== undefined) room.Facilities = cleanText(data.Facilities, 1000);
    if (data.StandardMonthlyPrice !== undefined) room.StandardMonthlyPrice = requireAmount(data.StandardMonthlyPrice, 'Harga bulanan');
    if (data.OperationalStatus !== undefined) room.OperationalStatus = operationalStatus;
    if (data.Notes !== undefined) room.Notes = cleanText(data.Notes, 500);
    room.UpdatedAt = nowISO();
    audit(db, { user: user.StaffID, action: 'UPDATE_ROOM', module: 'Rooms', recordId: room.RoomID, previous, next: JSON.stringify(room) });
    return decorateRoom(db, room);
  }
  requireFields(data, ['RoomNumber', 'RoomTypeID', 'StandardMonthlyPrice']);
  if (db.rooms.some((r) => r.RoomNumber.toLowerCase() === cleanText(data.RoomNumber, 20).toLowerCase())) {
    throw new AppError('Nomor kamar sudah digunakan.');
  }
  const type = findById(db.roomTypes, 'RoomTypeID', data.RoomTypeID);
  const room = {
    RoomID: makeId(db, 'room', 'RM'),
    RoomNumber: cleanText(data.RoomNumber, 20),
    Building: cleanText(data.Building, 30),
    Floor: cleanText(data.Floor, 10),
    RoomTypeID: type.RoomTypeID,
    Capacity: requireAmount(data.Capacity || type.DefaultCapacity, 'Kapasitas'),
    Facilities: cleanText(data.Facilities || type.Facilities, 1000),
    StandardMonthlyPrice: requireAmount(data.StandardMonthlyPrice, 'Harga bulanan'),
    OperationalStatus: operationalStatus,
    Notes: cleanText(data.Notes, 500),
    CreatedAt: nowISO(),
    UpdatedAt: nowISO(),
  };
  db.rooms.push(room);
  audit(db, { user: user.StaffID, action: 'CREATE_ROOM', module: 'Rooms', recordId: room.RoomID, next: JSON.stringify(room) });
  return decorateRoom(db, room);
}

function assignmentConflict(db, { roomId, startDate, endDate, excludeOccupancyId = '', excludeReservationId = '' }) {
  const room = findById(db.rooms, 'RoomID', roomId);
  if (room.OperationalStatus === 'Inactive') throw new AppError('Kamar tidak aktif dan tidak dapat digunakan.');
  if (room.OperationalStatus === 'Maintenance') throw new AppError('Kamar sedang dalam perbaikan dan tidak dapat digunakan.');
  const end = endDate || '9999-12-31';
  const occupants = db.occupancies.filter((occupancy) => {
    if (occupancy.RoomID !== roomId || occupancy.OccupancyID === excludeOccupancyId) return false;
    if (occupancy.AgreementStatus !== 'Active') return false;
    const occEnd = occupancy.ActualCheckOut || occupancy.PlannedCheckOut || '9999-12-31';
    return occupancy.CheckInDate <= end && occEnd >= startDate;
  });
  const reservations = db.reservations.filter((reservation) => {
    if (reservation.RoomID !== roomId || reservation.ReservationID === excludeReservationId) return false;
    if (!['Pending', 'Confirmed'].includes(reservation.ReservationStatus)) return false;
    const resEnd = reservation.PlannedCheckOut || '9999-12-31';
    return reservation.PlannedCheckIn <= end && resEnd >= startDate;
  });
  const used = occupants.length + reservations.length;
  if (used >= Number(room.Capacity || 1)) {
    throw new AppError(`Kamar ${room.RoomNumber} tidak tersedia untuk periode tersebut (kapasitas ${room.Capacity} terpakai).`);
  }
  return room;
}

module.exports = {
  ROOM_STATUSES,
  activeOccupanciesForRoom,
  roomAvailability,
  listRoomTypes,
  saveRoomType,
  listRooms,
  saveRoom,
  decorateRoom,
  assignmentConflict,
};
