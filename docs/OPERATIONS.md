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

Backup harian dijalankan scheduler ke `data/backups/`. Berkas backup adalah salinan JSON basis data. Pada mode Postgres, endpoint backup menulis ekspor JSON logis ke `data/backups/supabase-*.json`. Untuk pemulihan bencana, tetap andalkan backup/PITR Supabase; ekspor JSON bukan pengganti `pg_dump`.

Praktik yang disarankan:

- Salin `data/backups/` ke penyimpanan lain setiap hari.
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
- `Tabel Supabase belum lengkap`: skema `0001_initial.sql` belum dijalankan.
- `Database Supabase kosong`: impor data atau set `PG_SEED_DEMO=true`.
- `password authentication failed`: periksa password dan URL-encode karakter khusus.
- Koneksi menggantung: gunakan session pooler port 5432, bukan transaction pooler 6543.

### Data terlihat tidak konsisten setelah restore

- Hentikan server sebelum mengganti basis data.
- Pastikan berkas JSON valid dan berasal dari versi aplikasi yang sama.
- Jalankan rekonsiliasi dan periksa audit setelah pemulihan.

## 9. Batasan dan rekomendasi produksi

Implementasi ini menggunakan Node.js dan berkas JSON transaksional karena lingkungan tidak menyediakan Google Apps Script dan Google Sheets.

- Satu proses server mengasumsikan satu penulis basis data. Lock internal mencegah penulisan bersamaan, tetapi bukan pengganti basis data relasional.
- Skala nyata 21-100 kamar sebaiknya memakai PostgreSQL atau MySQL, backup otomatis, serta pemantauan.
- Sesi disimpan di memori proses. Restart server akan mengeluarkan semua pengguna.
- Scheduler berjalan di dalam proses. Untuk produksi, gunakan cron eksternal atau job runner yang idempoten.
- Berkas backup berada pada disk yang sama. Salin ke lokasi terpisah.
- Gunakan HTTPS melalui reverse proxy tepercaya, batasi akses jaringan, dan ganti seluruh akun demo.
- Uji restore, rekonsiliasi, dan alur check-out pada lingkungan staging sebelum go-live.
