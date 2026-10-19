# Aturan Bisnis

Dokumen ini menjelaskan aturan yang ditegakkan server. Klien hanya menampilkan data; keputusan saldo, status, dan validasi akhir selalu dihitung di server.

## 1. Prinsip umum

- Mata uang Rupiah (IDR) dengan pembulatan ke rupiah penuh.
- Tanggal bisnis menggunakan format `YYYY-MM-DD` dan zona waktu Asia/Jakarta.
- Penghapusan data transaksi tidak dilakukan. Pembatalan memakai status `Cancelled` atau `Voided` dan transaksi pembalik.
- Semua perubahan penting dicatat pada jejak audit: pengguna, aksi, modul, ID rekaman, nilai sebelumnya/baru, alasan, dan waktu.
- ID memakai prefiks domain, misalnya `RM-`, `T-`, `OCC-`, `INV-`, `PAY-`, `TXN-`, `DEP-`, `ORD-`, dan `EXP-`.
- Nomor invoice dan kuitansi berurutan per bulan: `INV/YYYYMM/####` dan `KWT/YYYYMM/####`.

## 2. Kamar, penghuni, dan hunian

- Satu kamar tidak boleh memiliki dua hunian aktif yang tumpang tindih pada tanggal yang sama. Aturan yang sama berlaku untuk reservasi.
- Kapasitas kamar menentukan jumlah penghuni aktif yang diperbolehkan. Kamar dengan penghuni aktif berstatus `Occupied`.
- Reservasi berstatus `Pending` atau `Confirmed` dapat dikonversi menjadi check-in. Reservasi yang dikonversi berubah menjadi `Converted`.
- Check-in membuat perjanjian aktif, mencatat harga sewa yang disepakati, dan opsional membuat deposit.
- Harga sewa disimpan pada perjanjian. Perubahan harga kamar tidak mengubah perjanjian yang sudah berjalan.
- Transfer kamar menutup perjanjian lama sebagai `Transferred` dan membuat perjanjian baru. Deposit yang masih ditahan dipindahkan ke perjanjian baru.
- Perpanjangan menutup perjanjian lama sebagai `Renewed` dan membuat perjanjian baru dengan harga baru. Tanggal efektif tidak boleh sebelum atau sama dengan tanggal check-in lama.
- Check-out menutup perjanjian sebagai `Ended`, memproses deposit, dan mengubah kamar menjadi `Maintenance` bila tidak ada penghuni lain.
- Penghuni menjadi `Checked Out` hanya jika tidak memiliki perjanjian aktif lain.

## 3. Tagihan sewa

- Tagihan dibuat per periode bulanan untuk setiap perjanjian aktif dan bersifat idempoten berdasarkan `OccupancyID + PeriodStart`.
- Menjalankan pembuatan tagihan berulang kali tidak membuat duplikat.
- Periode normal mengikuti tanggal check-in. Contoh: check-in 10 Januari menghasilkan periode 10 Januari sampai 9 Februari.
- `BillingAdvanceDays` memungkinkan tagihan periode berikutnya dibuat lebih awal.
- Jatuh tempo dihitung dari awal periode ditambah `DefaultDueDays`.
- Status invoice: `Issued`, `Partially Paid`, `Paid`, `Overdue`, dan `Cancelled`.
- Invoice menjadi `Overdue` bila belum lunas dan tanggal acuan melewati jatuh tempo.
- Invoice yang sudah memiliki pembayaran tidak dapat dibatalkan. Koreksi dilakukan melalui void pembayaran atau penyesuaian invoice.
- Penyesuaian dapat mengubah biaya lain-lain, diskon, dan catatan. Diskon tidak boleh melebihi total komponen tagihan.
- Total tagihan = sewa + biaya layanan + biaya lain-lain - diskon.

### Prorata opsional

Aktifkan `ProrateMidMonth` pada Pengaturan.

- Periode pertama yang dimulai bukan pada tanggal 1 dihitung sampai akhir bulan berjalan, dengan nilai sewa proporsional terhadap jumlah hari dalam bulan tersebut.
- Periode terakhir yang berakhir karena rencana atau realisasi check-out di tengah bulan dihitung proporsional.
- Contoh: check-in 19 Oktober dengan sewa Rp1.800.000 dan 31 hari pada Oktober menghasilkan 13/31 x Rp1.800.000 = Rp754.839.
- Bila prorata nonaktif (bawaan), periode pertama dan terakhir memakai sewa bulan penuh sesuai kebijakan kos.

### Denda keterlambatan opsional

Aktifkan `LateFeeEnabled` dan isi `LateFeePercent`.

- Denda dihitung satu kali dari total tagihan saat invoice pertama kali berstatus `Overdue`.
- Nilai denda dibulatkan ke rupiah penuh dan dicatat pada `OtherCharges`.
- Penanda `LateFeeApplied` mencegah denda berulang pada proses harian berikutnya.
- Denda tidak dihitung ulang bila pembayaran sebagian terjadi setelah denda diterapkan.

## 4. Pembayaran

- Pembayaran menerima metode `Cash`, `Bank Transfer`, `QRIS`, atau `Other`.
- `IdempotencyKey` wajib. Permintaan dengan kunci yang sama mengembalikan pembayaran yang sudah ada tanpa membuat transaksi baru.
- Pembayaran dapat dialokasikan eksplisit ke satu/beberapa invoice atau otomatis.
- Alokasi otomatis memakai urutan jatuh tempo paling awal, lalu periode paling awal.
- Alokasi tidak boleh melebihi saldo invoice atau total pembayaran.
- Kelebihan pembayaran disimpan sebagai kredit penghuni yang tersedia.
- Setiap pembayaran membuat transaksi kas masuk dan kuitansi.
- Void pembayaran membatalkan alokasi dan membuat transaksi kas keluar pembalik. Data asli tetap tersimpan.
- Saldo akhir selalu dihitung ulang dari alokasi berstatus `Valid`.

## 5. Layanan tambahan

- Harga layanan disalin ke order saat transaksi sehingga perubahan harga master tidak mengubah order lama.
- Order dapat ditagihkan melalui invoice atau dibayar langsung.
- Pembayaran langsung membuat kuitansi dan transaksi kas masuk.
- Order yang dibatalkan tidak boleh menambah tagihan baru. Koreksi mengikuti aturan pembatalan dan audit.

## 6. Pengeluaran

- Status pengeluaran: `Pending`, `Approved`, `Paid`, dan `Cancelled`.
- Pengeluaran `Pending` dapat diubah atau dihapus dari alur aktif melalui pembatalan.
- Pengeluaran hanya boleh menjadi `Paid` setelah disetujui.
- Pengeluaran `Paid` membuat transaksi kas keluar.
- Pembatalan pengeluaran `Paid` membuat transaksi pembalik dan mempertahankan jejak audit.
- Total pengeluaran = kuantitas x biaya satuan.

## 7. Deposit

- Deposit dicatat sebagai kewajiban (`OutstandingDepositLiability`) dan transaksi kas masuk.
- Deposit berstatus `Held` sampai dikembalikan atau dipotong.
- Pengembalian tidak boleh melebihi kewajiban deposit yang tersisa.
- Pemotongan deposit wajib memiliki alasan dan mengurangi kewajiban.
- Status akhir: `Returned` bila tidak ada potongan, atau `Partially Returned` bila ada potongan.
- Pengembalian penuh membuat transaksi kas keluar.

## 8. Laporan dan rekonsiliasi

- Laporan pendapatan memakai transaksi kas masuk yang valid dan tidak dibatalkan.
- Laporan pengeluaran memakai transaksi kas keluar yang valid.
- Saldo kas = total kas masuk - total kas keluar.
- Rekonsiliasi memeriksa kesesuaian saldo invoice, alokasi pembayaran, kredit, deposit, dan transaksi.
- Laporan hunian memakai perjanjian aktif pada rentang tanggal yang dipilih.
- Kartu penghuni menggabungkan profil, hunian, invoice, pembayaran, layanan, dan deposit.

## 9. Peran dan izin

| Modul | Owner | Manager | Receptionist | Cashier | Operational Staff |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Ya | Ya | Ya | Ya | Ya |
| Kamar dan tipe kamar | Ya | Ya | Ya | Lihat | Lihat |
| Penghuni dan reservasi | Ya | Ya | Ya | Lihat | Tidak |
| Hunian dan check-in/out | Ya | Ya | Ya | Tidak | Tidak |
| Invoice | Ya | Ya | Lihat | Lihat | Tidak |
| Pembayaran | Ya | Ya | Tidak | Ya | Tidak |
| Layanan tambahan | Ya | Ya | Ya | Ya | Lihat |
| Pengeluaran | Ya | Ya | Tidak | Tidak | Tidak |
| Deposit | Ya | Ya | Lihat | Lihat | Tidak |
| Staf dan pengguna | Ya | Ya | Tidak | Tidak | Tidak |
| Laporan keuangan | Ya | Ya | Tidak | Ya | Tidak |
| Aktivitas operasional | Ya | Ya | Ya | Ya | Ya |
| Pengaturan | Ya | Ya | Tidak | Tidak | Tidak |

Bila ragu, server menolak akses dengan kode `FORBIDDEN`.

## 10. Otomatisasi harian

- Scheduler membuat tagihan yang jatuh pada periode berjalan.
- Scheduler memperbarui status overdue dan menerapkan denda bila diaktifkan.
- Scheduler menjalankan backup harian ke `data/backups/`.
- Semua proses otomatis memakai pengguna sistem `SYSTEM` pada audit.
