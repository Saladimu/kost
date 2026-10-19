# Sistem Operasional Kos

Aplikasi operasional rumah kos untuk 21-100 kamar: kamar, penghuni, reservasi, perjanjian sewa, tagihan bulanan, pembayaran bertahap, layanan tambahan, pengeluaran, deposit, tugas staf, dan laporan keuangan yang dapat direkonsiliasi.

Aplikasi berjalan penuh secara lokal dengan Node.js tanpa dependensi eksternal. Antarmuka menggunakan Bahasa Indonesia, mata uang Rupiah, dan zona waktu Asia/Jakarta.

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
- Tugas kebersihan, perawatan, inspeksi, dan keamanan untuk staf operasional.
- Laporan keuangan, harian, hunian, kartu penghuni, rekonsiliasi, dan jejak audit.
- Ekspor CSV dan dokumen cetak untuk invoice, kuitansi, dan laporan.
- Kontrol akses berbasis peran yang ditegakkan di server.

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
  services/            Logika bisnis per domain
public/
  index.html           Shell SPA
  css/styles.css       Tema responsif
  js/                  Klien API, komponen UI, router, halaman
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

## Dokumentasi

- `docs/ARCHITECTURE.md` - arsitektur, model data, API, keamanan, dan otomatisasi.
- `docs/BUSINESS_RULES.md` - aturan tagihan, pembayaran, deposit, transfer, dan laporan.
- `docs/OPERATIONS.md` - panduan pengguna, backup, pemulihan, dan troubleshooting.
- `docs/TEST_RESULTS.md` - cakupan dan hasil pengujian.

## Catatan implementasi

Spesifikasi awal menargetkan Google Apps Script dan Google Sheets. Lingkungan eksekusi ini tidak menyediakan Apps Script maupun Google Sheets, sehingga seluruh logika server diimplementasikan dengan Node.js dan basis data JSON transaksional. Model data, alur bisnis, aturan keuangan, peran, dan antarmuka tetap mengikuti spesifikasi. Satu sumber kebenaran data tetap dijaga di server; klien tidak pernah menghitung saldo final.

Lihat `docs/OPERATIONS.md` bagian "Batasan dan rekomendasi" untuk catatan produksi.
