# Sistem Operasional Kos

Aplikasi operasional rumah kos untuk 21-100 kamar: kamar, penghuni, reservasi, perjanjian sewa, tagihan bulanan, pembayaran bertahap, layanan tambahan, pengeluaran, deposit, tugas staf, dan laporan keuangan yang dapat direkonsiliasi.

Aplikasi berjalan penuh secara lokal dengan Node.js. Antarmuka menggunakan Bahasa Indonesia, mata uang Rupiah, dan zona waktu Asia/Jakarta. Basis data dapat berupa JSON lokal atau Supabase Postgres. Backend Google Apps Script dengan Google Sheets tetap tersedia pada `src/code.gs` untuk deployment lama.

## Menjalankan aplikasi

```bash
npm start
```

Buka `http://localhost:3000`.

Untuk pengembangan dengan port lain:

```bash
PORT=3005 npm start
```

Basis data dibuat otomatis pada `data/db.json` saat pertama kali dijalankan, lengkap dengan data contoh 21 kamar, 4 tipe kamar, 6 penghuni, deposit, reservasi, layanan, staf, dan transaksi demo.

Untuk memakai Supabase, lihat bagian [Supabase sebagai database](#supabase-sebagai-database).

### Akun demo

| Peran | Email | Password |
| --- | --- | --- |
| Owner | owner@kos.id | owner123 |
| Manager | manager@kos.id | manager123 |
| Receptionist | resepsionis@kos.id | reception123 |
| Cashier | kasir@kos.id | cashier123 |
| Operational Staff | staf@kos.id | staff123 |

## Fitur utama

- Dashboard dengan filter hari ini, bulan ini, bulan lalu, dan periode kustom.
- Manajemen kamar dan tipe kamar dengan status kamar terhitung dari hunian dan reservasi.
- Pendaftaran penghuni, reservasi, check-in, transfer kamar, perpanjangan, dan check-out.
- Tagihan bulanan otomatis dan idempoten, termasuk prorata opsional, jatuh tempo, dan status overdue.
- Pembayaran sebagian, alokasi ke beberapa invoice, kredit kelebihan bayar, kuitansi, dan void dengan jurnal pembalik.
- Order layanan dengan harga tersimpan saat transaksi, penagihan langsung atau lewat invoice.
- Pengeluaran operasional dengan alur pending, approved, paid, dan pembatalan.
- Ledger transaksi kas masuk dan keluar serta kewajiban deposit.
- Indikator status koneksi backend di sidebar: hijau terhubung, kuning memeriksa, merah tidak terhubung.
- Tugas kebersihan, perawatan, inspeksi, dan keamanan untuk staf operasional.
- Laporan keuangan, harian, hunian, kartu penghuni, rekonsiliasi, dan jejak audit.
- Ekspor CSV dan dokumen cetak untuk invoice, kuitansi, dan laporan.
- Kontrol akses berbasis peran yang ditegakkan di server.
- Backend Google Apps Script siap tempel dengan Google Sheets sebagai opsi legacy.

## Struktur proyek

```text
server.js              HTTP server, static files, bootstrap, scheduler
src/
  api.js               Routing REST, validasi sesi, guard permission
  auth.js              Login, sesi, dan matriks izin per peran
  db.js                Basis data JSON, cache, lock penulisan
  seed.js              Skema awal dan data contoh
  bootstrap.js         Inisialisasi dan seeding operasional
  jobs.js              Tagihan harian, overdue, backup
  code.gs              Backend Google Apps Script siap tempel (hasil build)
  gas/                 Adapter Apps Script: Sheets, auth, password, jobs
  services/            Logika bisnis per domain
public/
  index.html           Shell SPA
  css/styles.css       Tema responsif
  js/                  Klien API, komponen UI, router, halaman
scripts/
  build-gas.js         Membangun ulang src/code.gs
tests/
  acceptance.test.js   Uji alur operasional end-to-end
docs/                  Arsitektur, aturan bisnis, operasi, hasil uji
```

## Pengujian

```bash
npm test
```

Uji membuat basis data sementara, menjalankan server pada port acak, lalu memverifikasi:

- login dan izin peran;
- check-in dan konflik hunian;
- tagihan bulanan tanpa duplikasi;
- pembayaran sebagian, idempotensi, dan pengiriman bersamaan;
- order layanan, pengeluaran, transfer kamar;
- check-out dengan potongan dan pengembalian deposit;
- rekonsiliasi, laporan, audit, dan backup;
- penolakan akses Operational Staff ke data keuangan.

Aplikasi juga telah diuji pada peramban DOM (jsdom) untuk seluruh halaman dan interaksi formulir utama pada tiap peran.

Untuk menguji lapisan Postgres tanpa server Postgres eksternal:

```bash
npm run test:pg
```

Uji ini memakai PGlite (devDependency) untuk memverifikasi pemetaan tabel, penulisan transaksional, counter, audit, login, dan persistensi setelah restart server.

## Dokumentasi

- `docs/ARCHITECTURE.md` - arsitektur, model data, API, keamanan, dan otomatisasi.
- `docs/BUSINESS_RULES.md` - aturan tagihan, pembayaran, deposit, transfer, dan laporan.
- `docs/OPERATIONS.md` - panduan pengguna, backup, pemulihan, dan troubleshooting.
- `docs/GOOGLE_SHEETS.md` - persiapan, setup, deployment, dan keamanan Google Sheets.
- `docs/GITHUB_PAGES.md` - hosting frontend di GitHub Pages dengan bridge Apps Script.
- `docs/TEST_RESULTS.md` - cakupan dan hasil pengujian.
- `docs/manuals/README.md` - indeks manual per peran, matriks akses, dan aturan data bersama.
- `docs/manuals/owner.md`, `manager.md`, `receptionist.md`, `cashier.md`, `operational-staff.md` - panduan operasional masing-masing peran.
- `docs/supabase/README.md` - arsitektur, keputusan, dan status deployment Supabase Postgres.
- `docs/supabase/MIGRATION.md` - runbook migrasi data, rekonsiliasi, cutover, dan rollback.
- `docs/supabase/STEP_BY_STEP.md` - panduan langkah demi langkah untuk pengguna baru Supabase.
- `docs/supabase/0001_initial.sql` - skema Postgres yang dipakai di produksi.
- `src/pg/` - driver, skema aplikasi, dan penyimpanan Postgres (snapshot, diff, advisory lock).
- `scripts/import-supabase.js` - pembuat SQL impor dari `data/db.json`.
- `scripts/check-supabase.js` - pemeriksaan koneksi, jumlah baris, dan saldo invoice pada Supabase.
- `AGENTS.md` - konfigurasi, deployment, caching, dan catatan penting untuk agen AI.

## Google Sheets untuk produksi

Bangun backend Apps Script:

```bash
npm run build:gas
```

Tempel `src/code.gs` dan `src/appsscript.json` ke proyek Apps Script. Jalankan `setupProduction()` untuk database produksi tanpa data demo, atau `setup()` untuk mencoba data demo. Panduan lengkap ada di `docs/GOOGLE_SHEETS.md`.

## GitHub Pages + Apps Script

Frontend dapat dihosting sebagai situs statis di GitHub Pages. `public/js/config.js` sudah berisi URL deployment Apps Script produksi. Hanya `*.pages.dev` dan `*.github.io` yang memakai Apps Script; host Node seperti Render memakai API same-origin:

```javascript
window.KOS_CONFIG = {
  gasBridgeUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec'
};
```

Ganti URL tersebut jika deployment Apps Script berubah. Jangan menghapus pemeriksaan hostname tanpa menyiapkan staging terpisah. Aktifkan `Settings > Pages > Source: GitHub Actions`, lalu push ke `main`. Panduan lengkap ada di `docs/GITHUB_PAGES.md`.

## Supabase sebagai database

Node API dapat memakai Supabase Postgres sebagai sumber kebenaran. Domain service tetap sinkron; lapisan `src/pg/` memuat snapshot kecil ke memori, menjalankan logika bisnis yang sama, lalu menyimpan perubahan baris secara transaksional di bawah advisory lock. Backend Apps Script tidak terpengaruh.

Prasyarat: skema dan data sudah diimpor (lihat `docs/supabase/STEP_BY_STEP.md`), dan `node_modules` sudah terpasang (`npm install`).

```bash
export SUPABASE_DB_URL="postgresql://postgres.<ref>:<password>@<host>:5432/postgres"
npm run check:supabase
npm start
```

Gunakan connection string Postgres langsung atau session pooler (port 5432), bukan transaction pooler (6543). Jangan memakai anon key. Variabel opsional:

| Variabel | Default | Kegunaan |
| --- | --- | --- |
| `DB_BACKEND` | otomatis | Set `postgres` untuk memaksa mode Postgres meski URL kosong (akan gagal dengan pesan jelas). |
| `PG_SEED_DEMO` | `false` | Isi database kosong dengan data demo. Jangan dipakai pada database produksi. |
| `PG_ADVISORY_LOCK` | `true` | Kunci tulis lintas instance. Jangan dimatikan di produksi. |
| `PGSSLMODE` | `require` | Set `disable` hanya untuk Postgres lokal. |
| `PG_POOL_MAX` | `5` | Jumlah koneksi pool. |
| `LOGIN_MAX_ATTEMPTS` | `5` | Percobaan login gagal per email sebelum kunci sementara. |
| `LOGIN_WINDOW_MS` | `900000` | Jendela percobaan gagal dan durasi kunci login (milidetik). |

Catatan penting:

- Semua penulisan harus melalui API. Perubahan langsung di SQL Editor tidak menaikkan `__data_version`, sehingga instance yang sedang berjalan tidak melihatnya sampai restart.
- Impor ulang menaikkan `__data_version`; instance yang berjalan akan memuat ulang snapshot pada request berikutnya.
- Backup dari menu Sistem atau `npm run export:supabase` menulis ekspor JSON logis ke `data/backups/`. Untuk pemulihan bencana, tetap gunakan backup Supabase/PITR.
- RLS aktif tanpa policy. Hanya role pemilik tabel (connection string `postgres`) yang dapat membaca/menulis.
- Sajikan SPA dari proses Node yang sama (`npm start`) agar cookie sesi tetap same-origin. Frontend di Cloudflare Pages masih memakai bridge Apps Script sampai cutover; lihat catatan deployment di `docs/supabase/README.md`.
- Tempatkan API sedekat mungkin dengan database; setiap request melakukan satu query versi ke Postgres.

## Render untuk produksi

Repositori menyertakan `render.yaml` untuk layanan web Node di region Singapura. Render membangun dengan `npm ci --omit=dev`, menjalankan `npm start`, dan memeriksa `/api/health`.

1. Buat **Blueprint** baru di Render dari repositori GitHub ini.
2. Saat Render meminta `SUPABASE_DB_URL`, isi connection string **session pooler** (port 5432) yang dipakai `.env` lokal. Jangan memakai anon key atau transaction pooler 6543.
3. Pastikan variabel lain sesuai `render.yaml`: `DB_BACKEND=postgres`, `PGSSLMODE=require`, `PG_ADVISORY_LOCK=true`, `COOKIE_SECURE=true`.
4. Tunggu deploy, lalu buka `https://<service>.onrender.com/api/health`. Nilainya harus `"database":"postgres"`.
5. Login sebagai Owner, segera ganti seluruh password akun demo melalui menu Pengguna, lalu bagikan URL produksi.

Status produksi (20 Oktober 2026):

- URL produksi: `https://kelolakos.onrender.com`. Layanan berjalan dengan `"database":"postgres"` dan membaca 21 kamar dari Supabase.
- Deploy pertama sempat gagal dengan `getaddrinfo ENOTFOUND base` karena `SUPABASE_DB_URL` belum berupa URI lengkap. Setelah nilai diperbaiki di **Environment**, deploy berikutnya berhasil.
- `https://kelolakos.pages.dev` bukan alamat produksi Supabase. Host `*.pages.dev` tetap memakai bridge Apps Script dan Google Sheets, sehingga login serta datanya terpisah dari Render.
- Login Owner dan `GET /api/rooms` sudah diverifikasi pada URL Render. Detail pengujian ada di `docs/TEST_RESULTS.md` bagian 10.

Catatan operasional:

- Plan gratis tidur setelah tidak aktif dan menjeda scheduler harian. Gunakan plan Starter untuk layanan selalu aktif.
- Filesystem Render bersifat sementara. Salin `data/backups/` keluar dari host, atau aktifkan backup/PITR Supabase.
- Satu instance Node cukup. Jika memakai lebih dari satu instance, sesi in-memory akan tersebar; gunakan sticky session atau pindahkan sesi ke penyimpanan bersama.

Panduan lengkap: `docs/supabase/README.md`, `docs/supabase/MIGRATION.md`, dan `docs/supabase/STEP_BY_STEP.md`.

## Catatan implementasi

Spesifikasi awal menargetkan Google Apps Script dan Google Sheets. Lingkungan eksekusi ini tidak menyediakan Apps Script maupun Google Sheets, sehingga seluruh logika server diimplementasikan dengan Node.js. Mode default memakai JSON transaksional; mode produksi dapat memakai Supabase Postgres melalui `src/pg/`. Model data, alur bisnis, aturan keuangan, peran, dan antarmuka tetap mengikuti spesifikasi. Satu sumber kebenaran data tetap dijaga di server; klien tidak pernah menghitung saldo final.

Lihat `docs/OPERATIONS.md` bagian "Batasan dan rekomendasi" untuk catatan produksi.
