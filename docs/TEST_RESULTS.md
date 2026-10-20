# Hasil Pengujian

Tanggal verifikasi: 19 Oktober 2026.

## 1. Uji acceptance end-to-end

Perintah:

```bash
npm test
```

Hasil: lulus.

Cakupan:

- health check dan login;
- 21 kamar awal dan pembuatan penghuni;
- penolakan reservasi yang bentrok;
- check-in dan pembuatan tagihan;
- idempotensi pembuatan tagihan;
- pembayaran sebagian dan alokasi;
- idempotensi pembayaran serta permintaan bersamaan;
- order layanan dengan penagihan dan pembayaran langsung;
- pengeluaran dari pending, approved, sampai paid;
- pengembalian deposit;
- transfer kamar;
- check-out dengan penyelesaian saldo;
- rekonsiliasi keuangan;
- laporan;
- jejak audit;
- penolakan akses peran;
- validasi berkas backup.

Uji menggunakan basis data sementara melalui `DB_PATH` dan port acak sehingga data pengembangan tidak berubah.

## 2. Verifikasi prorata opsional

Skenario: aktifkan `ProrateMidMonth`, check-in 19 Oktober 2026, sewa Rp1.800.000, 31 hari pada Oktober.

- Periode tagihan: 2026-10-19 sampai 2026-10-31.
- Perhitungan: 13/31 x Rp1.800.000.
- Nilai sewa yang dihasilkan: Rp754.839.
- Hasil: sesuai.

## 3. Verifikasi denda keterlambatan opsional

Skenario: invoice belum dibayar, jatuh tempo dilewati, `LateFeeEnabled=true`, `LateFeePercent=5`.

- Status invoice berubah menjadi `Overdue`.
- Denda Rp75.000 dari sewa Rp1.500.000 ditambahkan ke biaya lain-lain.
- `LateFeeApplied` bernilai `TRUE`.
- Proses harian kedua tidak menambah denda lagi.
- Hasil: sesuai.

## 4. Uji antarmuka

Pengujian DOM dengan jsdom dilakukan pada sesi pengembangan:

- Seluruh halaman utama berhasil dibuka untuk peran Owner, Manager, Receptionist, Cashier, dan Operational Staff.
- Tidak ada error konsol pada navigasi halaman.
- 16 interaksi formulir utama lulus, termasuk pembuatan pengeluaran, order layanan dan kuitansi, tugas staf, tab laporan, pengembalian deposit, dan penyimpanan pengaturan.

Uji jsdom bersifat pelengkap. Uji acceptance pada `tests/acceptance.test.js` adalah sumber verifikasi yang dapat dijalankan ulang dari repositori.

## 5. Verifikasi backend Google Apps Script

Bundel `src/code.gs` diuji dengan simulasi runtime Apps Script dan Google Sheets.

Cakupan:

- `setup()` membuat spreadsheet, tab, data demo, dan akun;
- login owner dan bootstrap 21 kamar;
- pembuatan penghuni dan check-in;
- pembuatan tagihan dan pembayaran sebagian;
- idempotensi pembayaran;
- rekonsiliasi dan dashboard;
- pemuatan ulang data dari tab spreadsheet;
- HTML SPA tersisip dengan transport `google.script.run`;
- `setupProduction()` membuat database kosong dengan satu owner;
- password owner dihapus dari Script Properties;
- setup produksi kedua ditolak untuk mencegah penimpaan data.

Hasil: lulus.

## 6. Pemeriksaan statis

- `node --check` pada modul yang diubah: lulus.
- Seluruh aset statis dan endpoint utama merespons sukses pada pemeriksaan sesi pengembangan.

## 7. Verifikasi kinerja dan branding

Harness runtime Apps Script dan harness frontend dijalankan pada sesi pengembangan:

- `GET /api/public-config` dapat diakses tanpa login dan hanya mengembalikan nama properti.
- Nama properti pada layar login mengikuti `PropertyName` dan berubah setelah pengaturan disimpan.
- Login mengembalikan `bootstrap` dengan data pengguna.
- Prefetch `/dashboard-page` melayani permintaan pertama tanpa pembacaan spreadsheet.
- Cache GET GAS dan frontend tidak menyajikan data lama setelah operasi tulis.
- Cache GET frontend bertahan setelah muat ulang halaman melalui `sessionStorage`, dibatasi per token sesi, dan tidak dipakai setelah POST atau login/logout.
- Permintaan GET identik yang bersamaan dideduplikasi dan objek cache terisolasi dari mutasi pemanggil.

Hasil: lulus.

## 8. Catatan

Pengujian belum mencakup:

- pengujian beban dan konkurensi multi-proses;
- pengujian peramban fisik (Chrome, Safari, Firefox);
- pemulihan bencana dari salinan off-site;
- audit keamanan eksternal.
