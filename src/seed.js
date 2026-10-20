'use strict';

const {
  nowISO,
  today,
  addMonthsClamped,
  monthStart,
  monthEnd,
  makeId,
} = require('./util');
const { hashPassword } = require('./password');

function buildSeed(db) {
  const now = nowISO();
  const day = today();
  const lastMonth = addMonthsClamped(day, -1);
  const twoMonths = addMonthsClamped(day, -2);

  db.meta.schemaVersion = 1;
  db.meta.createdAt = now;
  db.meta.updatedAt = now;
  db.meta.demoPaymentsSeeded = false;
  db.meta.counters = {
    room: 21,
    roomType: 4,
    tenant: 6,
    staff: 5,
    user: 5,
    service: 5,
    price: 8,
    occupancy: 3,
    deposit: 3,
    reservation: 1,
    invoice: 0,
    payment: 0,
    allocation: 0,
    serviceOrder: 0,
    expense: 2,
    activity: 3,
    transaction: 3,
  };

  db.settings = [
    ['PropertyName', 'Kos', 'Nama properti yang tampil pada invoice dan kuitansi'],
    ['PropertyAddress', 'Jl. Melati Raya No. 18, Jakarta Selatan', 'Alamat properti'],
    ['PropertyPhone', '021-7654321', 'Nomor telepon properti'],
    ['Currency', 'IDR', 'Mata uang transaksi'],
    ['Timezone', 'Asia/Jakarta', 'Zona waktu operasional'],
    ['InvoicePrefix', 'INV', 'Prefix nomor invoice'],
    ['ReceiptPrefix', 'KWT', 'Prefix nomor kuitansi'],
    ['DefaultDueDays', '5', 'Jatuh tempo invoice dalam hari sejak awal periode'],
    ['BillingAdvanceDays', '0', 'Invoice dibuat berapa hari sebelum periode dimulai'],
    ['ReminderIntervalDays', '7', 'Jeda minimum pengingat tagihan yang sama'],
    ['ProrateMidMonth', 'false', 'Kebijakan prorata untuk check-in/check-out di tengah bulan'],
    ['LateFeeEnabled', 'false', 'Denda keterlambatan hanya aktif jika owner mengaktifkan'],
    ['LateFeePercent', '0', 'Persentase denda keterlambatan (jika diaktifkan)'],
    ['DepositPolicy', 'Deposit dikembalikan setelah inspeksi kamar dan pelunasan tagihan.'],
    ['BillingPolicy', 'Sewa dibebankan penuh per periode bulanan sejak tanggal check-in. Tanggal 29-31 mengikuti hari terakhir bulan.'],
    ['PaymentPolicy', 'Kelebihan pembayaran dicatat sebagai kredit penghuni dan dapat dialokasikan ke invoice berikutnya.'],
    ['CompanyFooter', 'Terima kasih telah mempercayakan hunian Anda kepada kami.'],
  ].map(([key, value, description]) => ({
    SettingKey: key,
    SettingValue: value,
    Description: description,
    UpdatedAt: now,
    UpdatedBy: 'SYSTEM',
  }));

  db.roomTypes = [
    {
      RoomTypeID: 'RT-0001', TypeName: 'Standard', Description: 'Kamar standar dengan kamar mandi dalam',
      DefaultCapacity: 1, DefaultMonthlyPrice: 1500000,
      Facilities: 'Kasur, lemari, meja, AC, kamar mandi dalam, WiFi',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
    {
      RoomTypeID: 'RT-0002', TypeName: 'Deluxe', Description: 'Kamar lebih luas dengan balkon',
      DefaultCapacity: 1, DefaultMonthlyPrice: 2000000,
      Facilities: 'Kasur queen, lemari, meja kerja, AC, kamar mandi dalam, balkon, WiFi',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
    {
      RoomTypeID: 'RT-0003', TypeName: 'Premium', Description: 'Kamar premium untuk dua penghuni',
      DefaultCapacity: 2, DefaultMonthlyPrice: 2500000,
      Facilities: '2 kasur, lemari, meja, AC, kamar mandi dalam, balkon, WiFi, parkir',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
    {
      RoomTypeID: 'RT-0004', TypeName: 'VIP', Description: 'Kamar VIP dengan area kerja dan dapur kecil',
      DefaultCapacity: 2, DefaultMonthlyPrice: 3200000,
      Facilities: 'Kasur king, sofa, dapur kecil, AC, kamar mandi dalam, TV, WiFi',
      IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now,
    },
  ];

  const roomPlan = [
    ...Array.from({ length: 7 }, (_, i) => ({ no: `A-10${i + 1}`, building: 'A', floor: '1', type: 'RT-0001', cap: 1, price: 1500000 })),
    ...Array.from({ length: 7 }, (_, i) => ({ no: `A-20${i + 1}`, building: 'A', floor: '2', type: 'RT-0002', cap: 1, price: 2000000 })),
    ...Array.from({ length: 7 }, (_, i) => ({ no: `B-10${i + 1}`, building: 'B', floor: '1', type: 'RT-0003', cap: 2, price: 2500000 })),
  ];

  db.rooms = roomPlan.map((room, index) => ({
    RoomID: `RM-${String(index + 1).padStart(4, '0')}`,
    RoomNumber: room.no,
    Building: room.building,
    Floor: room.floor,
    RoomTypeID: room.type,
    Capacity: room.cap,
    Facilities: db.roomTypes.find((t) => t.RoomTypeID === room.type).Facilities,
    StandardMonthlyPrice: room.price,
    OperationalStatus: index === 20 ? 'Maintenance' : 'Available',
    Notes: index === 20 ? 'Perbaikan keran kamar mandi' : '',
    CreatedAt: now,
    UpdatedAt: now,
  }));

  db.tenants = [
    {
      TenantID: 'T-0001', FullName: 'Budi Santoso', IdentityType: 'KTP', IdentityNumber: '3171010101900001',
      Phone: '0812-1111-2222', Email: 'budi.santoso@example.com', Address: 'Jl. Kenanga No. 4, Depok',
      EmergencyContact: 'Sri Santoso', EmergencyPhone: '0812-1111-3333', Occupation: 'Karyawan Swasta',
      RegistrationDate: addMonthsClamped(day, -1), TenantStatus: 'Active',
      Notes: 'Penghuni kamar A-101', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0002', FullName: 'Siti Aminah', IdentityType: 'KTP', IdentityNumber: '3171010202910002',
      Phone: '0813-2222-3333', Email: 'siti.aminah@example.com', Address: 'Jl. Anggrek No. 9, Jakarta',
      EmergencyContact: 'Hasan Amin', EmergencyPhone: '0813-2222-4444', Occupation: 'Dosen',
      RegistrationDate: twoMonths, TenantStatus: 'Active',
      Notes: 'Penghuni kamar A-201', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0003', FullName: 'Andi Wijaya', IdentityType: 'KTP', IdentityNumber: '3171010303920003',
      Phone: '0814-3333-4444', Email: 'andi.wijaya@example.com', Address: 'Jl. Dahlia No. 21, Bekasi',
      EmergencyContact: 'Rina Wijaya', EmergencyPhone: '0814-3333-5555', Occupation: 'Wirausaha',
      RegistrationDate: lastMonth, TenantStatus: 'Active',
      Notes: 'Penghuni kamar B-101, tagihan menunggak', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0004', FullName: 'Maya Putri', IdentityType: 'KTP', IdentityNumber: '3171010404930004',
      Phone: '0815-4444-5555', Email: 'maya.putri@example.com', Address: 'Jl. Cempaka No. 2, Tangerang',
      EmergencyContact: 'Dian Putri', EmergencyPhone: '0815-4444-6666', Occupation: 'Desainer',
      RegistrationDate: day, TenantStatus: 'Prospective',
      Notes: 'Calon penghuni, reservasi kamar A-102', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0005', FullName: 'Rizky Ramadhan', IdentityType: 'KTP', IdentityNumber: '3171010505940005',
      Phone: '0816-5555-6666', Email: 'rizky.ramadhan@example.com', Address: 'Jl. Flamboyan No. 7, Bogor',
      EmergencyContact: 'Ayu Ramadhan', EmergencyPhone: '0816-5555-7777', Occupation: 'Pegawai Bank',
      RegistrationDate: addMonthsClamped(day, -3), TenantStatus: 'Checked Out',
      Notes: 'Sudah check-out, riwayat tersimpan', CreatedAt: now, UpdatedAt: now,
    },
    {
      TenantID: 'T-0006', FullName: 'Nadia Safira', IdentityType: 'KTP', IdentityNumber: '3171010606950006',
      Phone: '0817-6666-7777', Email: 'nadia.safira@example.com', Address: 'Jl. Bougenville No. 11, Jakarta',
      EmergencyContact: 'Fajar Safira', EmergencyPhone: '0817-6666-8888', Occupation: 'Perawat',
      RegistrationDate: day, TenantStatus: 'Prospective',
      Notes: '', CreatedAt: now, UpdatedAt: now,
    },
  ];

  db.services = [
    { ServiceID: 'SV-0001', ServiceCode: 'LDY', ServiceName: 'Laundry', Category: 'Laundry', Unit: 'kg', StandardPrice: 15000, CostPrice: 10000, IsAvailable: 'TRUE', Description: 'Cuci dan lipat pakaian', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0002', ServiceCode: 'CLN', ServiceName: 'Cleaning Kamar', Category: 'Cleaning', Unit: 'kali', StandardPrice: 50000, CostPrice: 30000, IsAvailable: 'TRUE', Description: 'Pembersihan kamar oleh staf', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0003', ServiceCode: 'PRK', ServiceName: 'Parkir Motor', Category: 'Parking', Unit: 'bulan', StandardPrice: 100000, CostPrice: 0, IsAvailable: 'TRUE', Description: 'Biaya parkir motor bulanan', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0004', ServiceCode: 'WIFI', ServiceName: 'Internet Premium', Category: 'Utilities', Unit: 'bulan', StandardPrice: 75000, CostPrice: 40000, IsAvailable: 'TRUE', Description: 'Upgrade bandwidth internet', CreatedAt: now, UpdatedAt: now },
    { ServiceID: 'SV-0005', ServiceCode: 'XBD', ServiceName: 'Extra Bed', Category: 'Other Services', Unit: 'unit', StandardPrice: 150000, CostPrice: 90000, IsAvailable: 'TRUE', Description: 'Penambahan kasur lipat', CreatedAt: now, UpdatedAt: now },
  ];

  db.priceList = db.services.map((service, index) => ({
    PriceID: `PRC-${String(index + 1).padStart(4, '0')}`,
    ItemCode: service.ServiceCode,
    ItemName: service.ServiceName,
    ItemCategory: service.Category,
    RoomTypeID: '',
    BillingUnit: service.Unit,
    StandardPrice: service.StandardPrice,
    EffectiveFrom: twoMonths,
    EffectiveTo: '',
    IsActive: 'TRUE',
    Notes: 'Harga layanan standar',
  }));
  db.priceList.push({
    PriceID: 'PRC-0006', ItemCode: 'RENT-STD', ItemName: 'Sewa Standard', ItemCategory: 'Room Rental',
    RoomTypeID: 'RT-0001', BillingUnit: 'bulan', StandardPrice: 1500000, EffectiveFrom: twoMonths,
    EffectiveTo: '', IsActive: 'TRUE', Notes: '',
  });
  db.priceList.push({
    PriceID: 'PRC-0007', ItemCode: 'RENT-DLX', ItemName: 'Sewa Deluxe', ItemCategory: 'Room Rental',
    RoomTypeID: 'RT-0002', BillingUnit: 'bulan', StandardPrice: 2000000, EffectiveFrom: twoMonths,
    EffectiveTo: '', IsActive: 'TRUE', Notes: '',
  });
  db.priceList.push({
    PriceID: 'PRC-0008', ItemCode: 'RENT-PRM', ItemName: 'Sewa Premium', ItemCategory: 'Room Rental',
    RoomTypeID: 'RT-0003', BillingUnit: 'bulan', StandardPrice: 2500000, EffectiveFrom: twoMonths,
    EffectiveTo: '', IsActive: 'TRUE', Notes: '',
  });

  db.staff = [
    { StaffID: 'ST-0001', FullName: 'Dewi Lestari', Position: 'Pemilik', Phone: '0811-0000-0001', Email: 'owner@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Owner', Notes: '' },
    { StaffID: 'ST-0002', FullName: 'Rudi Hartono', Position: 'Manajer Operasional', Phone: '0811-0000-0002', Email: 'manager@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Manager', Notes: '' },
    { StaffID: 'ST-0003', FullName: 'Sari Wulandari', Position: 'Resepsionis', Phone: '0811-0000-0003', Email: 'resepsionis@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Receptionist', Notes: '' },
    { StaffID: 'ST-0004', FullName: 'Agus Pratama', Position: 'Kasir', Phone: '0811-0000-0004', Email: 'kasir@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Cashier', Notes: '' },
    { StaffID: 'ST-0005', FullName: 'Joko Susilo', Position: 'Staf Operasional', Phone: '0811-0000-0005', Email: 'staf@kos.id', StartDate: twoMonths, EndDate: '', EmploymentStatus: 'Active', AppRole: 'Operational Staff', Notes: '' },
  ];

  db.users = [
    { UserID: 'USR-0001', StaffID: 'ST-0001', Email: 'owner@kos.id', PasswordHash: hashPassword('owner123'), Role: 'Owner', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0002', StaffID: 'ST-0002', Email: 'manager@kos.id', PasswordHash: hashPassword('manager123'), Role: 'Manager', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0003', StaffID: 'ST-0003', Email: 'resepsionis@kos.id', PasswordHash: hashPassword('reception123'), Role: 'Receptionist', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0004', StaffID: 'ST-0004', Email: 'kasir@kos.id', PasswordHash: hashPassword('cashier123'), Role: 'Cashier', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
    { UserID: 'USR-0005', StaffID: 'ST-0005', Email: 'staf@kos.id', PasswordHash: hashPassword('staff123'), Role: 'Operational Staff', IsActive: 'TRUE', CreatedAt: now, UpdatedAt: now },
  ];

  db.occupancies = [
    {
      OccupancyID: 'OCC-0001', TenantID: 'T-0001', RoomID: 'RM-0001', CheckInDate: lastMonth,
      PlannedCheckOut: '', ActualCheckOut: '', RentalPlan: 'Monthly', AgreedMonthlyPrice: 1500000,
      BillingDay: Number(lastMonth.slice(8, 10)), DueDay: 5, DepositAmount: 500000,
      AgreementStatus: 'Active', PreviousOccupancyID: '', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: 'Check-in awal, deposit diterima',
    },
    {
      OccupancyID: 'OCC-0002', TenantID: 'T-0002', RoomID: 'RM-0008', CheckInDate: twoMonths,
      PlannedCheckOut: '', ActualCheckOut: '', RentalPlan: 'Monthly', AgreedMonthlyPrice: 2000000,
      BillingDay: Number(twoMonths.slice(8, 10)), DueDay: 5, DepositAmount: 500000,
      AgreementStatus: 'Active', PreviousOccupancyID: '', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: '',
    },
    {
      OccupancyID: 'OCC-0003', TenantID: 'T-0003', RoomID: 'RM-0015', CheckInDate: lastMonth,
      PlannedCheckOut: '', ActualCheckOut: '', RentalPlan: 'Monthly', AgreedMonthlyPrice: 2500000,
      BillingDay: Number(lastMonth.slice(8, 10)), DueDay: 5, DepositAmount: 750000,
      AgreementStatus: 'Active', PreviousOccupancyID: '', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: 'Penghuni belum melunasi periode pertama',
    },
  ];

  db.rooms.forEach((room) => {
    if (['RM-0001', 'RM-0008', 'RM-0015'].includes(room.RoomID)) room.OperationalStatus = 'Occupied';
  });

  db.deposits = [
    { DepositRecordID: 'DEP-0001', TenantID: 'T-0001', OccupancyID: 'OCC-0001', DepositType: 'Security Deposit', DepositAmount: 500000, AmountReturned: 0, AmountDeducted: 0, OutstandingDepositLiability: 500000, ReceiptTransactionID: 'TXN-0001', ReturnTransactionID: '', DepositStatus: 'Held', CreatedAt: now, Notes: 'Deposit check-in' },
    { DepositRecordID: 'DEP-0002', TenantID: 'T-0002', OccupancyID: 'OCC-0002', DepositType: 'Security Deposit', DepositAmount: 500000, AmountReturned: 0, AmountDeducted: 0, OutstandingDepositLiability: 500000, ReceiptTransactionID: 'TXN-0002', ReturnTransactionID: '', DepositStatus: 'Held', CreatedAt: now, Notes: 'Deposit check-in' },
    { DepositRecordID: 'DEP-0003', TenantID: 'T-0003', OccupancyID: 'OCC-0003', DepositType: 'Security Deposit', DepositAmount: 750000, AmountReturned: 0, AmountDeducted: 0, OutstandingDepositLiability: 750000, ReceiptTransactionID: 'TXN-0003', ReturnTransactionID: '', DepositStatus: 'Held', CreatedAt: now, Notes: 'Deposit check-in' },
  ];

  db.transactions = [
    { TransactionID: 'TXN-0001', TransactionDate: lastMonth, TransactionType: 'Deposit Received', Direction: 'IN', Category: 'Deposit', ReferenceType: 'Deposit', ReferenceID: 'DEP-0001', TenantID: 'T-0001', RoomID: 'RM-0001', Description: 'Deposit keamanan Budi Santoso', Amount: 500000, PaymentMethod: 'Cash', PaymentStatus: 'Confirmed', StaffID: 'ST-0004', RelatedTransactionID: '', IdempotencyKey: 'DEP-RCPT-DEP-0001', CreatedAt: now, Notes: '' },
    { TransactionID: 'TXN-0002', TransactionDate: twoMonths, TransactionType: 'Deposit Received', Direction: 'IN', Category: 'Deposit', ReferenceType: 'Deposit', ReferenceID: 'DEP-0002', TenantID: 'T-0002', RoomID: 'RM-0008', Description: 'Deposit keamanan Siti Aminah', Amount: 500000, PaymentMethod: 'Bank Transfer', PaymentStatus: 'Confirmed', StaffID: 'ST-0004', RelatedTransactionID: '', IdempotencyKey: 'DEP-RCPT-DEP-0002', CreatedAt: now, Notes: '' },
    { TransactionID: 'TXN-0003', TransactionDate: lastMonth, TransactionType: 'Deposit Received', Direction: 'IN', Category: 'Deposit', ReferenceType: 'Deposit', ReferenceID: 'DEP-0003', TenantID: 'T-0003', RoomID: 'RM-0015', Description: 'Deposit keamanan Andi Wijaya', Amount: 750000, PaymentMethod: 'Cash', PaymentStatus: 'Confirmed', StaffID: 'ST-0004', RelatedTransactionID: '', IdempotencyKey: 'DEP-RCPT-DEP-0003', CreatedAt: now, Notes: '' },
  ];

  db.reservations = [
    {
      ReservationID: 'RSV-0001', TenantID: 'T-0004', RoomID: 'RM-0002', ReservationDate: day,
      PlannedCheckIn: addMonthsClamped(day, 1).slice(0, 8) + '25', PlannedCheckOut: '', AgreedMonthlyPrice: 1500000,
      DepositAmount: 300000, ReservationStatus: 'Confirmed', CreatedBy: 'ST-0003', CreatedAt: now,
      Notes: 'Reservasi kamar A-102, menunggu check-in',
    },
  ];

  db.serviceOrders = [];
  db.invoices = [];
  db.payments = [];
  db.allocations = [];
  db.credits = [];
  db.expenses = [];
  db.activities = [
    { ActivityID: 'ACT-0001', ActivityDate: day, StaffID: 'ST-0005', Category: 'Cleaning', RoomID: 'RM-0021', TenantID: '', Description: 'Perbaikan keran dan pembersihan kamar B-107', Priority: 'High', DueDate: day, Status: 'In Progress', StartedAt: now, CompletedAt: '', VerifiedBy: '', Notes: 'Kamar dalam status maintenance' },
    { ActivityID: 'ACT-0002', ActivityDate: day, StaffID: 'ST-0005', Category: 'Maintenance', RoomID: 'RM-0015', TenantID: 'T-0003', Description: 'Cek lampu kamar B-101', Priority: 'Normal', DueDate: addMonthsClamped(day, 0), Status: 'Pending', StartedAt: '', CompletedAt: '', VerifiedBy: '', Notes: '' },
    { ActivityID: 'ACT-0003', ActivityDate: addMonthsClamped(day, -1), StaffID: 'ST-0005', Category: 'Cleaning', RoomID: 'RM-0008', TenantID: 'T-0002', Description: 'Pembersihan rutin area kamar A-201', Priority: 'Low', DueDate: addMonthsClamped(day, -1), Status: 'Completed', StartedAt: now, CompletedAt: now, VerifiedBy: 'ST-0002', Notes: '' },
  ];

  db.auditLog = [];
  db.systemLog = [];

  return db;
}

module.exports = { buildSeed };
