# Hasil Pengujian

Tanggal verifikasi: 20 Oktober 2026.

## 1. Uji acceptance end-to-end

Perintah:

```bash
npm test
```

Hasil: lulus.

Cakupan:

- health check dan login;
- penolakan Host header tidak valid tanpa menghentikan server;
- pembatasan percobaan login berulang dan pencabutan sesi setelah password berubah;
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
- `/api/health` mengembalikan `database` dan `storage`; acceptance memeriksa `JSON local`, uji HTTP Postgres memeriksa `Postgres-db`.
- `bootstrap.storage` mengembalikan `JSON local` pada backend JSON, `Postgres-db` pada Postgres, dan `Google Sheets` pada Apps Script; sidebar menampilkan nilai tersebut.
- Prefetch `/dashboard-page` melayani permintaan pertama tanpa pembacaan spreadsheet.
- Cache GET GAS dan frontend tidak menyajikan data lama setelah operasi tulis.
- Cache GET frontend bertahan setelah muat ulang halaman melalui `sessionStorage`, dibatasi per token sesi, dan tidak dipakai setelah POST atau login/logout.
- `public/js/config.js` memilih API Node pada `localhost`, `*.monkeycode-ai.live`, dan host non-statis seperti Render, serta Apps Script hanya pada `*.pages.dev` dan `*.github.io`. Login Owner dengan data demo lokal berhasil.
- Permintaan GET identik yang bersamaan dideduplikasi dan objek cache terisolasi dari mutasi pemanggil.

Hasil: lulus.

## 8. Verifikasi impor Supabase

Skema `docs/supabase/0001_initial.sql` dan hasil `scripts/import-supabase.js`
dijalankan pada PostgreSQL lokal berbasis PGlite:

- skema, trigger, view saldo invoice, dan RLS berhasil dibuat;
- 132 baris data dan 20 counter masuk ke 21 tabel tanpa error;
- `INV-0001` menghasilkan total `1530000`, terbayar `900000`, dan sisa `630000`;
- menjalankan file SQL yang sama dua kali tidak menggandakan data;
- validasi menolak total invoice yang tidak konsisten, hash non-scrypt, dan
  occupancy aktif ganda.

Hasil: lulus.

## 9. Verifikasi adaptor Postgres

`npm run test:pg` menjalankan dua uji terhadap PGlite melalui protokol wire
Postgres asli:

- `tests/pg-store.test.js`: memuat snapshot 21 tabel, login scrypt, view saldo,
  kecocokan `AmountPaid`/`OutstandingBalance` hasil hitung ulang, penulisan
  kamar baru, audit, perubahan setting, pembayaran sebagian, counter,
  transaksi tanpa perubahan yang tidak menaikkan versi, dan pembacaan ulang
  dari database;
- `tests/pg-http.test.js`: menjalankan `server.js` dengan `pg` Pool, login
  Owner, membaca 21 kamar, membuat penghuni, mematikan server, menyalakan
  ulang, lalu memastikan penghuni dan versi data bertahan.

Hasil: lulus (`22 kamar, 17 setting, 7 invoice`; tenant baru bertahan setelah
restart).

## 10. Verifikasi produksi Render dan Supabase

Tanggal: 20 Oktober 2026. URL: `https://kelolakos.onrender.com`.

- Deploy Render berhasil; log menampilkan `Database siap (postgres)` dan
  `Your service is live`.
- `GET /api/health` mengembalikan HTTP 200 dengan
  `{"ok":true,"data":{"status":"ok","database":"postgres",...}}`.
- `GET /api/public-config` mengembalikan nama properti tanpa autentikasi.
- Login Owner berhasil dan `GET /api/rooms` mengembalikan 21 kamar dari
  Supabase.
- Deploy pertama gagal dengan
  `Gagal menyiapkan database: Error: Skema Supabase tidak dapat dibaca:
  getaddrinfo ENOTFOUND base`. Penyebabnya nilai `SUPABASE_DB_URL` belum berupa
  URI lengkap. Setelah URI session pooler diperbaiki di Environment Render,
  deploy berhasil.
- `https://kelolakos.pages.dev` tidak diuji sebagai klien Supabase karena host
  tersebut tetap memakai bridge Apps Script/Google Sheets.

Hasil: lulus. Verifikasi login memakai akun demo; ganti seluruh password demo
sebelum URL dibagikan.

## 11. Catatan

Pengujian belum mencakup:

- pengujian beban dan konkurensi multi-proses;
- pengujian peramban fisik (Chrome, Safari, Firefox);
- pemulihan bencana dari salinan off-site;
- audit keamanan eksternal.
