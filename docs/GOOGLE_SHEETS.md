# Google Sheets sebagai Database Produksi

`src/code.gs` adalah backend Google Apps Script lengkap yang memakai Google Sheets sebagai database. Berkas ini dihasilkan dari sumber Node.js dan antarmuka yang sama, lalu dibundel menjadi satu berkas agar dapat ditempel langsung ke editor Apps Script.

Bangun ulang berkas:

```bash
npm run build:gas
```

## 1. Yang perlu disiapkan

### Akun dan akses

- Akun Google yang akan menjadi pemilik deployment.
- Akses Google Drive dan Google Sheets.
- Spreadsheet baru, atau ID spreadsheet yang sudah ada.
- Email, nama, dan password owner untuk setup produksi.
- Keputusan akses Web App:
  - `Anyone` bila staf tidak memiliki akun Google.
  - `Anyone with Google account` bila seluruh staf memiliki akun Google.

### Proyek Apps Script

- Satu proyek Apps Script mandiri (standalone).
- Zona waktu proyek: `Asia/Jakarta`.
- Manifest `src/appsscript.json` dengan scope:
  - Spreadsheet
  - Drive
  - Triggers
- Deployment Web App:
  - Execute as: `Me` (pemilik deployment).
  - Access: sesuai keputusan di atas.

### Data dan operasional

- Daftar kamar, tipe kamar, tarif, layanan, dan staf.
- Kebijakan deposit, jatuh tempo, prorata, dan denda.
- Password awal untuk setiap pengguna.
- Rencana backup dan retensi.
- Pemilik spreadsheet dan daftar orang yang boleh membuka spreadsheet langsung.

Akses ke aplikasi tidak memerlukan akses langsung ke spreadsheet. Berikan akses spreadsheet hanya kepada pemilik dan administrator teknis.

## 2. Struktur spreadsheet

`setup()` atau `setupProduction()` membuat tab berikut secara otomatis:

| Tab | Isi |
| --- | --- |
| Meta | Versi skema, waktu pembuatan, counter ID, status seed |
| Settings | Pengaturan properti dan kebijakan |
| RoomTypes | Tipe kamar |
| Rooms | Kamar |
| Tenants | Penghuni |
| PriceList | Daftar harga |
| Services | Layanan tambahan |
| Staff | Data staf |
| Users | Akun dan hash password |
| Reservations | Reservasi |
| Occupancies | Perjanjian sewa dan hunian |
| Invoices | Tagihan bulanan dan layanan |
| Payments | Pembayaran |
| Allocations | Alokasi pembayaran ke invoice |
| Credits | Kredit kelebihan bayar |
| ServiceOrders | Order layanan |
| Expenses | Pengeluaran |
| Activities | Tugas operasional |
| Transactions | Ledger kas masuk dan keluar |
| Deposits | Deposit dan kewajiban pengembalian |
| AuditLog | Jejak audit |
| SystemLog | Log kesalahan sistem |

Aturan penting:

- Jangan mengganti nama tab. Nama tab dipakai langsung oleh kode.
- Jangan mengganti nama header kolom.
- Jangan menghapus kolom audit atau kolom ID.
- Jangan mengedit baris saat aplikasi sedang memproses transaksi.
- Jangan mengurutkan ulang baris secara manual.
- Gunakan aplikasi untuk pembatalan, bukan menghapus baris.
- Tanggal ditulis sebagai teks `YYYY-MM-DD`. Jangan mengubah format kolom tanggal.
- Angka ditulis sebagai angka. Jangan menambahkan pemisah ribuan manual.
- Nilai status dan boolean memakai teks `TRUE` atau `FALSE`.
- Baris pertama setiap tab adalah header dan dibekukan.
- ID memakai prefiks, misalnya `RM-`, `T-`, `OCC-`, `INV-`, `PAY-`, dan `TXN-`.
- Nomor invoice dan kuitansi berurutan per bulan.
- `AuditLog` bersifat tambah terus. Arsipkan secara berkala bila sudah sangat besar.

Setiap penyimpanan hanya menulis ulang tab yang berubah. Meta selalu diperbarui.

## 3. Setup demo

Gunakan untuk mencoba aplikasi.

1. Jalankan:

```bash
npm run build:gas
```

2. Buat proyek Apps Script baru.
3. Buka Project Settings, aktifkan tampilan `appsscript.json`, lalu tempel isi `src/appsscript.json`.
4. Ganti isi `Code.gs` dengan isi `src/code.gs`.
5. Simpan, lalu jalankan fungsi `setup()`.
6. Setujui akses Spreadsheet, Drive, dan Triggers.
7. Deploy sebagai Web App.
8. Buka URL deployment dan login dengan akun demo.
9. Segera ganti password akun demo melalui menu Staf.

`setup()` membuat spreadsheet baru, seluruh tab, data contoh 21 kamar, akun demo, transaksi contoh, dan trigger harian.

## 4. Setup produksi tanpa data demo

Gunakan spreadsheet baru. Jangan menjalankan setup demo lebih dahulu.

1. Buat proyek Apps Script dan tempel `src/code.gs` serta manifest.
2. Buka Project Settings lalu Script Properties.
3. Tambahkan:

| Properti | Contoh | Wajib |
| --- | --- | --- |
| `OWNER_EMAIL` | owner@domainanda.id | Ya |
| `OWNER_PASSWORD` | password minimal 8 karakter | Ya |
| `OWNER_NAME` | Nama Owner | Tidak |
| `SPREADSHEET_ID` | ID spreadsheet yang sudah ada | Tidak |

4. Bila memakai spreadsheet yang sudah ada, isi `SPREADSHEET_ID` dengan ID dari URL spreadsheet. Bila kosong, `setupProduction()` membuat spreadsheet baru.
5. Jalankan `setupProduction()`.
6. Setujui akses.
7. `OWNER_PASSWORD` dihapus otomatis dari Script Properties setelah akun dibuat.
8. Deploy sebagai Web App dan login sebagai owner.
9. Tambahkan tipe kamar, kamar, layanan, staf, dan pengguna lain melalui aplikasi.

`setupProduction()` tidak membuat kamar, penghuni, atau transaksi demo. Spreadsheet yang sudah memiliki pengguna akan ditolak agar data tidak tertimpa.

## 5. Deployment Web App

1. Klik Deploy, New deployment.
2. Pilih Web app.
3. Execute as: `Me`.
4. Who has access: `Anyone` atau `Anyone with Google account`.
5. Deploy dan salin URL yang berakhiran `/exec`.
6. Buka URL tersebut. Bila muncul halaman setup, jalankan setup terlebih dahulu.

Setiap kali `src/code.gs` berubah:

1. Jalankan `npm run build:gas`.
2. Tempel ulang `src/code.gs` ke editor Apps Script.
3. Deploy, Manage deployments, Edit, lalu buat versi baru.
4. Gunakan URL deployment yang sama.

Token sesi disimpan di cache selama 6 jam. Setelah deploy ulang, pengguna mungkin perlu login kembali.

## 6. Trigger dan backup

`setup()` dan `setupProduction()` memasang trigger harian `dailyJobs` pada pukul 01.00 zona waktu proyek.

Setiap hari trigger:

- membuat tagihan periode berjalan;
- memperbarui status overdue dan denda;
- menjalankan rekonsiliasi;
- menyalin spreadsheet ke Google Drive dengan nama `kos-backup-YYYY-MM-DD...`.

Backup berada di Drive akun pemilik deployment. Pindahkan salinan ke penyimpanan lain secara berkala. Tetapkan retensi, misalnya 30 backup harian dan 12 backup bulanan. Aplikasi tidak menghapus backup otomatis.

## 7. Keamanan

- Ganti seluruh password akun demo sebelum dipakai.
- Gunakan password unik minimal 8 karakter untuk produksi.
- Jangan membagikan spreadsheet kepada staf. Mereka memakai Web App.
- Batasi akses Drive dan Spreadsheet hanya untuk pemilik dan admin.
- Jangan menulis password ke Script Properties setelah setup selesai.
- Jangan menaruh data rahasia pada deskripsi sel atau komentar spreadsheet.
- Gunakan akun Google khusus operasional, bukan akun pribadi.
- Aktifkan verifikasi dua langkah pada akun Google.
- Tinjau `AuditLog` secara berkala.
- Bila akun staf keluar, nonaktifkan pengguna melalui menu Staf.
- Jangan mengirim token sesi melalui tautan atau pesan.
- Deploy ulang setelah setiap perubahan kode.

Password pada versi Apps Script memakai iterasi SHA-256 dengan salt. Password hash dari versi Node.js memakai scrypt dan tidak dapat diverifikasi oleh Apps Script. Bila memindahkan data dari versi Node.js, reset password setiap pengguna.

## 8. Impor data dari versi Node/JSON

Alur ini memindahkan data demo dari `data/db.json` ke spreadsheet Apps Script. Impor mengganti seluruh isi tab, bukan menggabungkan data.

1. Hentikan server lokal agar tidak ada penulisan selama ekspor.
2. Jalankan `npm run export:gas`.
3. Periksa `data/gas-import-report.json`. Lanjutkan hanya bila `ok: true` dan `errors` kosong. Ekspor memvalidasi ID ganda, referensi, saldo invoice, hunian aktif ganda, dan `meta.counters`.
4. Unggah `data/gas-import.json` ke Google Drive pribadi. Jangan bagikan tautannya.
5. Tempel `src/code.gs` terbaru ke editor Apps Script, lalu simpan. Fungsi `importKosJson` hanya tersedia pada bundel terbaru.
6. Buka spreadsheet tujuan. Bila `SPREADSHEET_ID` belum diatur, jalankan `setup()` sekali agar spreadsheet dibuat; data demo hasil setup akan diganti.
7. Di editor Apps Script, jalankan `importKosJson('<FILE_ID>', 'GANTI_DATA')`. Ganti `<FILE_ID>` dengan ID berkas Drive. Konfirmasi `GANTI_DATA` mencegah eksekusi tidak sengaja.
8. Periksa log eksekusi. Jumlah baris setiap koleksi harus sama dengan laporan ekspor; importer juga memeriksa ulang saldo invoice dan hunian aktif ganda sebelum menulis.
9. Login memakai kredensial di `data/gas-import-credentials.json`. Berkas ini berisi password sementara karena hash Node (scrypt) tidak dapat dipakai Apps Script. Setelah semua akun direset, hapus berkas kredensial dan berkas JSON dari Drive.
10. Deploy ulang Web App dengan versi baru. Cloudflare Pages memakai bridge Apps Script, jadi `public/js/config.js` tidak perlu diubah selama URL deployment tetap.

Catatan:

- Impor bersifat mengganti. Jangan jalankan pada spreadsheet produksi yang sedang dipakai.
- Backup spreadsheet sebelum impor.
- Untuk data besar, impor dapat melewati batas eksekusi 6 menit; bagi per koleksi atau gunakan spreadsheet baru.
- Importer tidak memasang trigger. Trigger harian dari `setup()` tetap berlaku.

## 9. Batas dan pertimbangan produksi

- Google Apps Script memiliki batas waktu eksekusi. Operasi normal untuk 21-100 kamar berada jauh di bawah batas, tetapi impor data besar harus dipecah.
- Setiap request masih membaca tab yang dibutuhkan saat cache kosong. Volume besar dan riwayat audit panjang akan memperlambat operasi pertama.
- Respons GET di-cache selama 30 detik per pengguna dan parameter. Setiap penulisan menaikkan versi cache sehingga data langsung segar setelah simpan. Respons di atas 45.000 karakter tidak di-cache.
- Browser juga menyimpan hasil GET selama 60 detik di memori dan `sessionStorage`, menggabungkan permintaan identik yang berjalan bersamaan, dan mengosongkan cache setiap kali ada POST atau login/logout. Cache dibatasi per token sesi.
- Satu lock global mencegah penulisan bersamaan. Permintaan yang menunggu lebih dari 30 detik akan gagal.
- Sesi disimpan di cache dan dapat hilang lebih awal bila cache dibersihkan.
- Apps Script bukan API REST dengan header CORS. Integrasi eksternal sebaiknya memakai `doPost` dengan token atau memanggil Web App dari Apps Script lain.
- Halaman web dibundel ke dalam `code.gs`, sehingga ukuran berkas lebih besar. Batas ukuran proyek Apps Script jauh di atas ukuran saat ini.
- Google Sheets bukan basis data relasional. Gunakan versi Node.js dengan PostgreSQL/MySQL bila volume transaksi, jumlah pengguna, atau kebutuhan audit tumbuh signifikan.
- Backup harian berada di Drive yang sama. Salin ke lokasi terpisah untuk pemulihan bencana.

## 10. Troubleshooting

### `SPREADSHEET_ID belum diatur`

Jalankan `setup()` atau `setupProduction()`. Bila memakai spreadsheet yang sudah ada, isi Script Property `SPREADSHEET_ID`.

### Halaman menampilkan Setup diperlukan

Spreadsheet belum terhubung. Jalankan setup dari editor Apps Script, lalu deploy ulang.

### Login gagal setelah memindahkan data lama

Hash password Node.js tidak kompatibel. Reset password pengguna melalui menu Staf atau buat pengguna baru.

### Perubahan kode tidak muncul

Buat deployment versi baru. URL `/exec` harus menunjuk versi terbaru.

### Error izin saat setup

Setujui seluruh scope Spreadsheet, Drive, dan Triggers. Periksa juga kebijakan Google Workspace yang membatasi Apps Script.

### Data terlihat tidak konsisten

Hentikan penggunaan sementara, periksa `AuditLog`, dan pulihkan dari backup Drive. Jangan mengedit baris secara manual saat aplikasi berjalan.

### Trigger tidak berjalan

Buka Triggers di editor Apps Script, pastikan `dailyJobs` ada. Jalankan `installTriggers()` secara manual bila trigger terhapus.


Untuk hosting antarmuka di GitHub Pages dengan backend Apps Script, lihat `docs/GITHUB_PAGES.md`.
