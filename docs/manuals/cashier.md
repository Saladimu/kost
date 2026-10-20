# Manual Peran: Cashier

Berlaku untuk akun dengan peran `Cashier`.

## 1. Tujuan peran

Cashier bertanggung jawab atas penerimaan uang dan ketepatan kuitansi. Fokus utama:

- mencatat pembayaran invoice, cicilan, dan pembayaran gabungan;
- memastikan alokasi pembayaran sesuai tagihan;
- menangani kredit lebih bayar;
- memproses layanan tambahan dengan pembayaran langsung;
- mencetak dan menyerahkan kuitansi;
- memeriksa kesesuaian kas dengan laporan harian;
- menjaga kerahasiaan data keuangan penghuni.

Cashier tidak dapat membatalkan pembayaran, mengubah invoice, mengembalikan deposit, atau mengelola pengeluaran.

## 2. Login

1. Buka alamat aplikasi.
2. Masuk dengan email dan kata sandi Cashier.
3. Ganti kata sandi bawaan jika belum dilakukan.
4. Logout setelah memakai perangkat bersama.

Jangan meminjamkan sesi atau memakai akun staf lain. Semua kuitansi mencantumkan nama petugas yang login.

## 3. Menu yang tersedia

- Dashboard
- Penghuni (lihat)
- Tagihan (lihat)
- Pembayaran & Kuitansi
- Layanan
- Deposit (lihat)
- Transaksi (lihat)
- Laporan
- Master Data (lihat)
- Pengaturan (lihat)

Menu **Pengeluaran**, **Kamar**, **Reservasi**, **Perjanjian**, **Staf**, **Akun Pengguna**, dan tindakan sistem tidak tersedia.

## 4. Rutinitas harian

Awal shift:

1. Login dan buka **Pembayaran & Kuitansi**.
2. Periksa kredit belum teralokasi dari shift sebelumnya.
3. Siapkan modal kas kecil sesuai kebijakan properti.
4. Catat waktu mulai shift.

Selama shift:

1. Catat setiap penerimaan saat uang diterima, bukan di akhir hari.
2. Cetak atau kirim kuitansi untuk setiap pembayaran.
3. Periksa nama penghuni, nomor invoice, dan nominal sebelum menyimpan.
4. Untuk pembayaran sebagian, pastikan sisa tagihan benar.
5. Untuk layanan langsung, catat order dan pembayarannya dalam satu alur.

Akhir shift:

1. Buka **Laporan > Harian**.
2. Cocokkan total penerimaan tunai, transfer, dan QRIS dengan uang fisik serta mutasi.
3. Periksa daftar kuitansi yang Anda terbitkan.
4. Laporkan selisih kepada Manager sebelum meninggalkan shift.
5. Logout.

## 5. Prosedur mencatat pembayaran

1. Buka **Pembayaran & Kuitansi**.
2. Klik **Catat pembayaran**.
3. Pilih penghuni. Daftar menampilkan penghuni aktif atau yang masih memiliki saldo.
4. Pilih invoice tujuan, atau biarkan **Alokasi otomatis ke tagihan tertua**.
5. Masukkan jumlah yang benar-benar diterima.
6. Periksa tanggal pembayaran.
7. Pilih metode: `Cash`, `Bank Transfer`, `QRIS`, atau `Other`.
8. Isi nomor referensi untuk transfer atau QRIS.
9. Tambahkan catatan untuk cicilan atau pembayaran gabungan.
10. Klik **Konfirmasi pembayaran**.
11. Kuitansi otomatis terbuka. Periksa lalu cetak atau simpan.

Jangan menekan konfirmasi berulang kali. Sistem memakai kunci idempotensi untuk mencegah pembayaran ganda, tetapi kebiasaan ini tetap harus dihindari.

### 5.1 Pembayaran sebagian

1. Masukkan nominal cicilan, bukan total tagihan.
2. Sistem mengalokasikan ke invoice yang dipilih atau tagihan tertua.
3. Periksa sisa saldo pada kuitansi.
4. Sampaikan sisa tagihan kepada penghuni.

### 5.2 Pembayaran beberapa invoice

1. Pilih penghuni tanpa invoice tertentu, sehingga sistem mengalokasikan otomatis.
2. Masukkan total uang yang diterima.
3. Periksa rincian alokasi pada kuitansi.
4. Jika uang melebihi total tagihan, kelebihan menjadi kredit penghuni.

### 5.3 Lebih bayar

Kelebihan pembayaran tidak hilang. Nilainya tercatat sebagai **kredit belum teralokasi** dan dapat dipakai untuk tagihan berikutnya melalui alokasi otomatis. Jelaskan hal ini kepada penghuni dan tunjukkan pada kuitansi.

## 6. Prosedur kuitansi

1. Buka **Pembayaran & Kuitansi**.
2. Cari nomor kuitansi atau nama penghuni.
3. Klik **Kuitansi**.
4. Periksa nomor, tanggal, nama penghuni, rincian alokasi, total, metode, dan petugas.
5. Cetak atau simpan sebagai bukti.

Kuitansi berstatus `Voided` tidak boleh diberikan sebagai bukti pembayaran yang sah. Jika penghuni meminta salinan, berikan salinan kuitansi asli beserta penjelasan statusnya.

## 7. Pembayaran yang salah

Cashier tidak memiliki izin void. Jika terjadi kesalahan:

1. Jangan membuat pembayaran baru untuk menutupi kesalahan.
2. Catat nomor kuitansi, nominal, penghuni, dan kesalahannya.
3. Hubungi Manager atau Owner.
4. Manager melakukan void dengan alasan.
5. Setelah void dikonfirmasi, catat pembayaran yang benar.

Jangan meminta staf lain memakai akun Anda untuk melakukan void.

## 8. Prosedur layanan tambahan

1. Buka **Layanan**.
2. Klik **Buat order layanan**.
3. Pilih penghuni aktif.
4. Pilih layanan, jumlah, tanggal, dan harga satuan.
5. Pilih metode penagihan:
   - **Bayar langsung** jika uang diterima sekarang;
   - **Tambahkan ke invoice** jika akan ditagih bersama sewa.
6. Untuk pembayaran langsung, pilih metode pembayaran dan isi referensi.
7. Simpan.
8. Periksa kuitansi atau invoice yang terbentuk.

Harga disalin saat order. Perubahan master harga tidak mengubah order lama. Cashier dapat menambah atau mengubah master layanan, tetapi koordinasikan perubahan harga dengan Manager.

## 9. Prosedur melihat tagihan dan deposit

- **Tagihan**: cari invoice, periksa total, pembayaran, dan sisa. Cashier tidak dapat menyesuaikan atau membatalkan invoice.
- **Deposit**: lihat deposit ditahan, potongan, dan pengembalian. Cashier tidak dapat mengembalikan deposit.
- **Penghuni**: lihat kontak dan saldo aktif untuk membantu pencarian.
- **Transaksi**: telusuri jurnal penerimaan dan pembalik.

Jika penghuni meminta koreksi tagihan, arahkan ke Manager atau Owner.

## 10. Pemeriksaan kas dan rekonsiliasi

### 10.1 Akhir shift

1. Buka **Laporan > Harian**.
2. Catat total per metode pembayaran.
3. Hitung uang fisik.
4. Bandingkan dengan mutasi bank atau penyedia QRIS.
5. Simpan bukti setoran.
6. Laporkan selisih, termasuk kemungkinan kredit belum teralokasi, kepada Manager.

### 10.2 Kredit belum teralokasi

1. Buka **Pembayaran & Kuitansi** dan periksa kartu kredit.
2. Telusuri kuitansi dengan kelebihan bayar.
3. Pastikan kredit akan terpakai pada tagihan berikutnya atau dikembalikan sesuai kebijakan.
4. Jangan mengubah nominal untuk "menghabiskan" kredit.

### 10.3 Temuan rekonsiliasi

1. Buka **Laporan > Rekonsiliasi**.
2. Catat temuan: invoice, pembayaran, atau deposit terkait.
3. Jangan melakukan koreksi manual di luar aplikasi.
4. Eskalasi ke Manager jika penyebab tidak jelas.

## 11. Laporan

Cashier memiliki akses baca ke seluruh laporan. Yang paling relevan:

- **Harian** untuk penerimaan dan pengeluaran;
- **Keuangan** untuk ringkasan periode;
- **Rekonsiliasi** untuk pemeriksaan;
- **Kartu Penghuni** untuk riwayat tagihan dan pembayaran.

Gunakan tombol cetak untuk dokumen resmi. Jangan membagikan laporan keuangan kepada pihak yang tidak berwenang.

## 12. Batasan peran

- Tidak dapat melakukan void pembayaran.
- Tidak dapat menyesuaikan atau membatalkan invoice.
- Tidak dapat mengembalikan deposit.
- Tidak dapat mencatat atau membayar pengeluaran.
- Tidak dapat mengubah data kamar, penghuni, reservasi, atau perjanjian.
- Tidak dapat mengelola akun atau data staf.
- Tidak dapat mengubah pengaturan properti.

## 13. Troubleshooting

### Tombol catat pembayaran tidak muncul

- Pastikan akun memakai peran Cashier atau Owner.
- Muat ulang halaman.
- Hubungi Owner jika izin berubah.

### Invoice tidak muncul di pilihan

- Pastikan invoice belum lunas dan bukan `Cancelled`.
- Pilih penghuni yang benar.
- Gunakan alokasi otomatis jika invoice tidak dipilih.

### Pembayaran ganda

- Jangan mencatat ulang.
- Periksa daftar pembayaran dan kuitansi.
- Hubungi Manager untuk void salah satu pembayaran.

### Kuitansi tidak tercetak

- Periksa pengaturan cetak browser.
- Buka kembali detail kuitansi.
- Gunakan simpan PDF sebagai alternatif.

### Saldo tidak sesuai

- Muat ulang halaman.
- Periksa rincian alokasi pada kuitansi.
- Bandingkan dengan **Kartu Penghuni**.
- Eskalasi jika tetap berbeda.

## 14. Eskalasi

Hubungi Manager atau Owner untuk:

- void pembayaran;
- koreksi invoice;
- pengembalian deposit;
- selisih kas yang tidak dapat dijelaskan;
- dugaan pembayaran ganda atau akses tidak sah.
