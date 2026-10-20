# Panduan Operasional

## 1. Menjalankan aplikasi

```bash
npm start
```

Buka `http://localhost:3000`. Untuk port lain:

```bash
PORT=3005 npm start
```

Basis data awal dibuat otomatis pada `data/db.json`. Data contoh mencakup 21 kamar, 4 tipe kamar, 6 penghuni, deposit, reservasi, layanan, staf, dan transaksi demo.

Akun demo:

| Peran | Email | Password |
| --- | --- | --- |
| Owner | owner@kos.id | owner123 |
| Manager | manager@kos.id | manager123 |
| Receptionist | resepsionis@kos.id | reception123 |
| Cashier | kasir@kos.id | cashier123 |
| Operational Staff | staf@kos.id | staff123 |

Ganti kata sandi akun demo sebelum dipakai pada data nyata.

### 1.1 Mode Supabase Postgres

Mode ini dipakai untuk produksi. Domain service tetap sama; `src/pg/` memuat snapshot ke memori, menjalankan logika bisnis, lalu menyimpan perubahan baris dalam satu transaksi.

1. Pastikan skema dan data sudah diimpor. Ikuti `docs/supabase/STEP_BY_STEP.md` sampai verifikasi berhasil.
2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Simpan connection string Postgres (bukan anon key) pada variabel lingkungan. Gunakan koneksi langsung atau session pooler port 5432:

   ```bash
   export SUPABASE_DB_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres"
   ```

4. Periksa koneksi dan data:

   ```bash
   npm run check:supabase
   ```

5. Jalankan server:

   ```bash
   npm start
   ```

6. Pastikan `GET /api/health` melaporkan `"database": "postgres"`, lalu login dan buka Dashboard.

Catatan:

- Database kosong akan ditolak. Set `PG_SEED_DEMO=true` hanya untuk database demo baru.
- Semua penulisan harus melalui aplikasi. Perubahan langsung di SQL Editor tidak terdeteksi sampai server restart.
- Setelah impor ulang, server yang berjalan akan memuat snapshot baru pada request berikutnya.
- Jangan mematikan `PG_ADVISORY_LOCK` di produksi; kunci ini mencegah dua instance menulis bersamaan.
- Gunakan `PGSSLMODE=disable` hanya untuk Postgres lokal.
- Jika host langsung hanya memiliki IPv6 dan koneksi gagal dengan `ENETUNREACH`, gunakan session pooler (port 5432) dari **Connect** di dashboard Supabase.

### 1.2 Produksi di Render

Status per 20 Oktober 2026: produksi aktif di `https://kelolakos.onrender.com` dengan Supabase Postgres. `render.yaml` menyiapkan satu layanan web Node di region Singapura.

1. Buat **Blueprint** di Render dari repositori ini.
2. Isi `SUPABASE_DB_URL` dengan connection string session pooler. Variabel lain sudah diatur di blueprint.
3. Setelah deploy, buka `/api/health`; hasilnya harus `"database":"postgres"`.
4. Login sebagai Owner dan ganti seluruh password akun demo sebelum URL dibagikan.
5. Plan gratis berhenti saat tidak aktif dan menjeda scheduler. Gunakan plan Starter untuk produksi selalu aktif.
6. Filesystem Render sementara. Unduh `data/backups/` atau andalkan backup/PITR Supabase.

Verifikasi produksi:

```bash
curl -sS https://kelolakos.onrender.com/api/health
```

Hasil yang diharapkan: `{"ok":true,"data":{"status":"ok","database":"postgres",...}}`. Login Owner dan `GET /api/rooms` pada URL tersebut juga sudah diverifikasi dan mengembalikan 21 kamar.

Alamat `https://kelolakos.pages.dev` bukan produksi Supabase. Host `*.pages.dev` memakai bridge Apps Script dan Google Sheets, sehingga akun serta datanya terpisah. Gunakan hanya URL Render untuk data Supabase.

Jika deploy pertama gagal dengan `getaddrinfo ENOTFOUND base`, nilai `SUPABASE_DB_URL` belum berupa URI lengkap. Perbaiki di tab **Environment**, simpan, lalu jalankan **Manual Deploy**.

## 2. Alur kerja harian

1. Buka Dashboard untuk melihat hunian, tagihan jatuh tempo, pembayaran, dan tugas.
2. Receptionist memproses reservasi dan check-in, termasuk deposit bila ada.
3. Kasir mencatat pembayaran dan memilih invoice yang dibayar, atau membiarkan sistem mengalokasikan otomatis.
4. Receptionist mencatat layanan tambahan dan memilih penagihan lewat invoice atau pembayaran langsung.
5. Staf operasional memperbarui tugas dan status kamar.
6. Manager memeriksa pengeluaran, menyetujui, lalu menandai dibayar.
7. Kasir atau Owner menutup hari dengan memeriksa laporan dan rekonsiliasi.
8. Saat penghuni keluar, Receptionist memproses check-out, potongan deposit, dan pengembalian deposit.

## 3. Mulai dari data kosong

Hapus atau pindahkan `data/db.json` saat aplikasi berhenti, lalu jalankan ulang. Sistem akan membuat ulang data contoh. Untuk operasional nyata, kosongkan data demo melalui alur pembatalan yang tersedia, atau siapkan basis data baru sebelum go-live.

## 4. Backup

Backup manual:

```bash
curl -X POST http://localhost:3000/api/system/backup \
  -H "Cookie: <cookie-sesi>"
```

Backup manual pada mode Postgres:

```bash
set -a
. ./.env
set +a
npm run export:supabase
```

Perintah ini menulis ekspor JSON logis ke `data/backups/supabase-*.json`. Endpoint `POST /api/system/backup` melakukan hal yang sama. Scheduler Node hanya menjalankan tagihan dan penagihan; scheduler tidak membuat backup harian.

Praktik yang disarankan:

- Aktifkan backup otomatis atau PITR pada project Supabase. Plan gratis tidak menyediakan backup.
- Salin `data/backups/` ke penyimpanan lain segera setelah dibuat. Filesystem Render bersifat sementara.
- Simpan minimal 30 backup harian dan 12 backup bulanan.
- Uji pemulihan secara berkala pada lingkungan terpisah.
- Jangan mengedit `data/db.json` saat server berjalan.

## 5. Pemulihan

1. Hentikan server.
2. Simpan berkas `data/db.json` yang bermasalah sebagai arsip.
3. Salin backup terpilih menjadi `data/db.json`.
4. Jalankan server dan periksa Dashboard, laporan rekonsiliasi, serta jejak audit.
5. Catat transaksi yang mungkin hilang setelah waktu backup dan masukkan kembali melalui aplikasi, bukan dengan mengedit JSON.

## 6. Pengaturan penting

| Kunci | Fungsi | Bawaan |
| --- | --- | --- |
| `BillingAdvanceDays` | Berapa hari lebih awal tagihan dibuat | 0 |
| `DefaultDueDays` | Jatuh tempo setelah awal periode | 5 |
| `ProrateMidMonth` | Aktifkan prorata periode pertama/terakhir | false |
| `LateFeeEnabled` | Aktifkan denda keterlambatan | false |
| `LateFeePercent` | Persentase denda | 0 |
| `InvoicePrefix` | Prefiks nomor invoice | INV |
| `ReceiptPrefix` | Prefiks nomor kuitansi | KWT |

Ubah melalui menu Pengaturan sebagai Owner. Perubahan berlaku untuk proses berikutnya dan tidak mengubah dokumen lama.

## 7. Peran pengguna

- Owner: akses penuh, termasuk staf, pengaturan, dan laporan.
- Manager: operasional penuh, termasuk pengeluaran dan laporan, tanpa pengaturan pengguna.
- Receptionist: kamar, penghuni, reservasi, hunian, layanan, dan aktivitas; tanpa pembayaran, pengeluaran, dan laporan keuangan.
- Cashier: pembayaran, layanan, deposit, laporan keuangan, dan aktivitas; tanpa hunian dan pengeluaran.
- Operational Staff: dashboard, kamar, layanan (lihat), dan aktivitas.

## 8. Troubleshooting

### Server tidak mau mulai

- Periksa apakah port dipakai proses lain. Jalankan dengan `PORT=3005 npm start`.
- Pastikan folder `data/` dapat ditulis.
- Periksa log terminal untuk pesan validasi basis data.

### Login gagal

- Pastikan email dan kata sandi benar.
- Periksa apakah akun berstatus aktif pada menu Staf.
- Hapus cookie sesi lama lalu login kembali.

### Tagihan tidak muncul

- Pastikan perjanjian berstatus `Active`.
- Periksa `BillingAdvanceDays` dan tanggal acuan pembuatan tagihan.
- Jalankan pembuatan tagihan dari menu Tagihan atau tunggu scheduler harian.
- Periksa apakah periode tersebut sudah pernah dibuat.

### Saldo tidak sesuai

- Buka laporan rekonsiliasi.
- Periksa pembayaran berstatus `Voided` dan alokasinya.
- Periksa penyesuaian invoice dan diskon.
- Jangan mengubah saldo secara manual; gunakan pembayaran, void, atau penyesuaian.

### Server Postgres gagal mulai

- `SUPABASE_DB_URL belum diisi`: variabel belum diekspor pada shell yang menjalankan server.
- `getaddrinfo ENOTFOUND base`: nilai `SUPABASE_DB_URL` bukan URI lengkap, misalnya hanya berisi nama database. Isi dengan URI `postgresql://...` dari session pooler.
- `Tabel Supabase belum lengkap`: skema `0001_initial.sql` belum dijalankan.
- `Database Supabase kosong`: impor data atau set `PG_SEED_DEMO=true`.
- `password authentication failed`: periksa password dan URL-encode karakter khusus.
- `getaddrinfo ENOTFOUND <host>` atau `ENETUNREACH`: host langsung Supabase mungkin hanya IPv6; gunakan session pooler port 5432.
- Koneksi menggantung: gunakan session pooler port 5432, bukan transaction pooler 6543.

### Data terlihat tidak konsisten setelah restore

- Hentikan server sebelum mengganti basis data.
- Pastikan berkas JSON valid dan berasal dari versi aplikasi yang sama.
- Jalankan rekonsiliasi dan periksa audit setelah pemulihan.

## 9. Batasan dan rekomendasi produksi

Produksi memakai layanan Node di Render dengan Supabase Postgres. Mode JSON dan Apps Script tetap tersedia untuk pengembangan dan fallback.

- Gunakan satu instance web. Advisory lock melindungi penulisan lintas instance, tetapi sesi disimpan di memori proses; beberapa instance memerlukan sticky session atau penyimpanan sesi bersama.
- Restart atau deploy akan mengeluarkan semua pengguna. Ini dapat diterima, tetapi jadwalkan di luar jam operasional.
- Scheduler berjalan di dalam proses Node. Plan gratis Render dapat menjeda scheduler; gunakan plan Starter atau picu job dari luar.
- Aktifkan backup/PITR Supabase. Ekspor JSON dari aplikasi bukan pengganti `pg_dump` atau PITR.
- Ganti semua password demo dan nonaktifkan akun yang tidak dipakai sebelum membagikan URL produksi.
- Login dibatasi per email: setelah `LOGIN_MAX_ATTEMPTS` gagal dalam `LOGIN_WINDOW_MS`, email dikunci sementara. Nilai bawaan adalah 5 percobaan dan 15 menit.
- Sesi terikat pada hash password. Mengubah password atau menonaktifkan akun langsung mencabut sesi lama; restart juga mengeluarkan semua sesi.
- Batas login disimpan di memori proses. Jika memakai lebih dari satu instance, gunakan penyimpanan bersama atau pembatas di reverse proxy.
- Pantau `/api/health`, ukuran database, dan koneksi pool. Naikkan `PG_POOL_MAX` hanya setelah menghitung batas koneksi Supabase.
- Berkas backup berada pada disk yang sama. Salin ke lokasi terpisah.
- Gunakan HTTPS melalui reverse proxy tepercaya, batasi akses jaringan, dan ganti seluruh akun demo.
- Uji restore, rekonsiliasi, dan alur check-out pada lingkungan staging sebelum go-live.
