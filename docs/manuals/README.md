# Manual Per Peran

Dokumen ini adalah kumpulan panduan operasional untuk setiap peran di Sistem Operasional Kos. Setiap manual berdiri sendiri dan dapat diberikan kepada staf sesuai tanggung jawabnya.

## Daftar manual

| Peran | Dokumen | Fokus utama |
| --- | --- | --- |
| Owner | `docs/manuals/owner.md` | Kendali penuh, konfigurasi, akun, audit, dan kesehatan keuangan |
| Manager | `docs/manuals/manager.md` | Operasional harian, persetujuan pengeluaran, kualitas data, dan kontrol |
| Receptionist | `docs/manuals/receptionist.md` | Penghuni, reservasi, check-in/out, layanan, dan tugas depan |
| Cashier | `docs/manuals/cashier.md` | Pembayaran, kuitansi, layanan, dan pemeriksaan kas |
| Operational Staff | `docs/manuals/operational-staff.md` | Kamar, tugas kebersihan/perawatan, dan status pekerjaan |

## Sebelum mulai

1. Gunakan alamat aplikasi yang diberikan Owner. Di lingkungan produksi, alamatnya adalah deployment Cloudflare Pages atau Web App Apps Script.
2. Login memakai email dan kata sandi akun pribadi. Jangan memakai akun rekan kerja.
3. Ganti kata sandi bawaan sebelum operasional nyata.
4. Menu di sidebar hanya muncul sesuai izin peran. Jika sebuah menu tidak terlihat, peran tersebut memang tidak memiliki akses.
5. Semua nominal dalam Rupiah. Tanggal operasional mengikuti zona waktu `Asia/Jakarta`.

## Status koneksi di sidebar

Titik di samping label penyimpanan menunjukkan status koneksi aplikasi:

| Warna | Arti |
| --- | --- |
| Hijau | Terhubung ke backend dan pemeriksaan kesehatan berhasil |
| Kuning | Sedang memeriksa koneksi, backend belum dikonfigurasi, atau respons tidak normal |
| Merah | Tidak dapat menjangkau backend atau sedang offline |

Arahkan kursor ke titik untuk melihat keterangan dan nama backend: `Google Sheets`, `Postgres-db`, atau `JSON local`. Pemeriksaan berjalan saat login, setiap dua menit, saat tab kembali aktif, dan saat status jaringan berubah. Titik hijau berarti pemeriksaan kesehatan berhasil, bukan jaminan bahwa setiap operasi tulis akan berhasil.

## Matriks akses aktual

Keterangan: `R` baca, `T` tulis/ubah, `-` tidak ada akses. `T` pada tugas berarti hanya tugas milik sendiri.

| Modul | Owner | Manager | Receptionist | Cashier | Operational Staff |
| --- | --- | --- | --- | --- | --- |
| Dashboard | R | R | R | R | R |
| Kamar | R/T | R/T | R | - | R |
| Tipe Kamar | R/T | R/T | R | - | - |
| Penghuni | R/T | R/T | R/T | R | - |
| Reservasi | R/T | R/T | R/T | - | - |
| Perjanjian & Check-in | R/T | R/T | R/T | - | - |
| Tagihan | R/T | R/T | R | R | - |
| Pembayaran | R/T | R + void | R | R/T | - |
| Layanan | R/T | R/T | R/T | R/T | - |
| Pengeluaran | R/T | R/T | - | - | - |
| Transaksi | R | R | - | R | - |
| Deposit | R/T | R/T | R | R | - |
| Staf | R/T | R | - | - | - |
| Akun Pengguna | R/T | - | - | - | - |
| Tugas | R/T | R/T | R/T | - | R/T |
| Laporan | R | R | R | R | - |
| Master Data / Daftar Harga | R/T | R/T | R | R | - |
| Jejak Audit | R | R | - | - | - |
| Pengaturan | R/T | R | R | R | - |
| Sistem (tagihan, backup) | Jalankan | Jalankan | - | - | - |

Catatan tata kelola:

- Hanya Owner yang dapat mengubah pengaturan properti dan kebijakan tagihan. Manager, Receptionist, dan Cashier hanya dapat membaca.
- Manager dapat mengubah daftar harga melalui Master Data, tetapi tidak dapat menambah atau mengubah akun pengguna.
- Receptionist dan Cashier saat ini memiliki akses baca halaman Laporan. Dashboard Receptionist tetap menyembunyikan kartu keuangan. Jika kebijakan properti melarang Receptionist melihat laporan keuangan, batasi modul `reports` pada matriks RBAC.
- Operational Staff hanya melihat tugas yang ditugaskan kepada dirinya.

## Aturan data yang berlaku untuk semua peran

- Jangan menghapus data transaksi. Gunakan pembatalan, void, atau penyesuaian agar jejak audit tetap utuh.
- Jangan mengubah status penghuni menjadi `Active` secara manual. Status aktif terbentuk dari proses check-in.
- Jangan mengubah saldo invoice secara langsung. Saldo dihitung ulang server dari alokasi pembayaran yang valid.
- Jangan membagikan kata sandi atau sesi login. Setiap tindakan tercatat atas nama akun yang dipakai.
- Periksa kembali nama penghuni, kamar, periode, dan nominal sebelum menyimpan transaksi.
- Gunakan tombol cetak atau ekspor dari aplikasi untuk dokumen resmi. Jangan membuat dokumen manual di luar sistem.

## Jika terjadi masalah

1. Catat waktu, halaman, nama penghuni/kamar, dan pesan error.
2. Muat ulang halaman sekali. Jangan mengulang transaksi berkali-kali sebelum memastikan hasilnya.
3. Untuk masalah akses, hubungi Owner.
4. Untuk masalah data keuangan, hubungi Manager atau Owner. Jangan melakukan koreksi manual.
5. Untuk masalah teknis deployment, hubungi pengelola sistem.
