# Manual Peran: Manager

Berlaku untuk akun dengan peran `Manager`.

## 1. Tujuan peran

Manager mengawal operasional harian dan kualitas data tanpa memiliki kendali penuh atas akun dan konfigurasi properti. Tanggung jawab utama:

- memastikan kamar, penghuni, reservasi, dan perjanjian tercatat benar;
- mengawasi tagihan, piutang, pembayaran, dan pengeluaran;
- menyetujui serta membayar pengeluaran operasional;
- mengelola daftar harga dan tipe kamar;
- menugaskan pekerjaan operasional kepada staf;
- memeriksa laporan, rekonsiliasi, dan jejak audit;
- menjalankan proses tagihan dan backup.

Manager tidak dapat membuat akun pengguna, mengubah pengaturan properti, atau mencatat pembayaran masuk.

## 2. Login

1. Buka alamat aplikasi.
2. Masuk dengan email dan kata sandi Manager.
3. Ganti kata sandi bawaan jika belum dilakukan.
4. Logout setelah memakai perangkat bersama.

Jika membutuhkan akun baru, reset kata sandi, atau perubahan peran, hubungi Owner.

## 3. Menu yang tersedia

- Dashboard
- Kamar dan Tipe Kamar
- Penghuni, Reservasi, Perjanjian & Check-in
- Tugas
- Tagihan, Pembayaran, Layanan, Pengeluaran, Transaksi, Deposit
- Laporan
- Staf (hanya lihat)
- Master Data
- Pengaturan (hanya lihat) dan Jejak Audit
- Sistem (jalankan tagihan dan backup)

Menu **Akun Pengguna** tidak tersedia untuk Manager.

## 4. Rutinitas harian

Pagi:

1. Buka Dashboard dan periksa hunian, check-in/check-out mendatang, piutang, dan tugas.
2. Periksa kamar yang berstatus perbaikan.
3. Periksa tagihan jatuh tempo dan tindak lanjut receptionist.

Siang:

1. Periksa pengeluaran `Pending`, lalu setujui atau minta perbaikan.
2. Periksa pembayaran yang di-void dan alasan void.
3. Periksa order layanan yang menambah tagihan.
4. Tinjau tugas yang belum dimulai atau melewati batas waktu.

Sore:

1. Buka **Laporan > Harian**.
2. Buka **Laporan > Rekonsiliasi**.
3. Pastikan tidak ada selisih atau temuan kritis.
4. Tinjau aktivitas audit untuk transaksi besar atau pembatalan.
5. Pastikan backup harian berjalan.

## 5. Prosedur kamar dan tipe kamar

### 5.1 Menambah atau mengubah kamar

1. Buka **Kamar**.
2. Klik **Tambah kamar** atau **Ubah**.
3. Isi nomor kamar, gedung, lantai, tipe, kapasitas, harga bulanan, fasilitas, dan status operasional.
4. Simpan.
5. Periksa status kamar setelah disimpan.

Status `Terisi` dan `Reservasi` dihitung dari hunian dan reservasi aktif. Jangan mengubah status operasional untuk memalsukan keterisian.

### 5.2 Menandai kamar dalam perbaikan

1. Buka **Kamar**.
2. Klik **Perbaikan** pada kamar.
3. Konfirmasi.
4. Kamar tidak dapat dipilih untuk check-in sampai diaktifkan kembali.
5. Setelah selesai, klik **Aktifkan**.

Tugas kebersihan yang dibuat otomatis setelah check-out dapat mengembalikan kamar menjadi tersedia ketika ditandai selesai oleh petugas.

### 5.3 Mengelola tipe kamar

1. Buka **Tipe Kamar**.
2. Tambah atau ubah tipe.
3. Isi kapasitas, harga default, deskripsi, fasilitas, dan status.
4. Simpan.

Perubahan tipe tidak mengubah perjanjian atau invoice lama.

## 6. Prosedur penghuni dan hunian

### 6.1 Pendaftaran dan reservasi

1. Daftarkan calon penghuni melalui **Penghuni > Daftarkan penghuni**.
2. Buka **Reservasi > Buat reservasi**.
3. Pilih penghuni, kamar, tanggal rencana masuk/keluar, harga, dan deposit.
4. Simpan sebagai `Confirmed` atau `Pending`.
5. Konfirmasi atau batalkan sesuai perkembangan.

Sistem menolak reservasi yang bentrok dengan hunian atau reservasi lain.

### 6.2 Check-in

1. Buka **Perjanjian & Check-in**.
2. Klik **Check-in penghuni**.
3. Pilih penghuni dan kamar yang tersedia.
4. Isi tanggal check-in, harga sewa, deposit, metode deposit, dan rencana check-out.
5. Proses check-in.

Invoice periode pertama dibuat otomatis. Periksa hasilnya di **Tagihan**.

### 6.3 Transfer dan perpanjangan

- **Pindah**: buka perjanjian aktif, klik **Pindah**, pilih kamar tujuan, tanggal, harga baru, dan alasan.
- **Perpanjang**: buka perjanjian aktif, klik **Perpanjang**, isi tanggal efektif dan harga baru.

Keduanya membuat catatan hunian baru dan mempertahankan riwayat lama. Transfer memindahkan deposit yang masih ditahan.

### 6.4 Check-out

1. Buka perjanjian aktif.
2. Klik **Check-out**.
3. Isi tanggal, potongan deposit, alasan potongan, metode pengembalian, dan catatan.
4. Proses check-out.
5. Periksa ringkasan settlement: sisa tagihan, deposit, status kamar, dan tugas kebersihan.
6. Pastikan invoice yang belum lunas ditindaklanjuti.

## 7. Prosedur tagihan

### 7.1 Menjalankan penagihan

1. Buka **Tagihan**.
2. Klik **Jalankan penagihan**.
3. Konfirmasi.
4. Periksa invoice baru dan periode yang dilewati.

Proses aman dijalankan berulang dan tidak membuat duplikat.

### 7.2 Koreksi invoice

1. Buka **Tagihan > Detail**.
2. Gunakan **Penyesuaian** untuk biaya lain-lain, diskon, dan catatan.
3. Gunakan **Batalkan** untuk invoice yang salah, dengan alasan.

Invoice yang sudah memiliki pembayaran valid tidak dapat dibatalkan. Koordinasikan void pembayaran dengan Cashier atau Owner.

## 8. Prosedur pembayaran

Manager dapat melihat pembayaran dan melakukan void, tetapi tidak dapat mencatat pembayaran baru.

### 8.1 Void pembayaran

1. Buka **Pembayaran**.
2. Cari kuitansi yang salah.
3. Klik **Void**.
4. Isi alasan yang spesifik.
5. Konfirmasi.

Void membatalkan alokasi dan membuat jurnal pembalik. Minta Cashier mencatat ulang pembayaran yang benar.

### 8.2 Pemeriksaan pembayaran

1. Periksa kuitansi, metode, referensi, dan petugas penerima.
2. Periksa kredit belum teralokasi.
3. Bandingkan dengan laporan harian dan rekonsiliasi.

## 9. Prosedur pengeluaran

1. Buka **Pengeluaran**.
2. Klik **Catat pengeluaran** untuk membuat catatan baru, atau pilih data `Pending`.
3. Untuk data `Pending`, klik **Setujui**.
4. Setelah disetujui dan bukti lengkap, klik **Bayar**.
5. Untuk pembatalan, klik **Batal** dan isi alasan.

Pengeluaran yang sudah dibayar akan menghasilkan jurnal pembalik saat dibatalkan. Jangan membayar tanpa bukti atau persetujuan sesuai kebijakan properti.

## 10. Prosedur layanan tambahan

1. Buka **Layanan**.
2. Pada tab **Order Layanan**, klik **Buat order layanan**.
3. Pilih penghuni aktif, layanan, jumlah, tanggal, harga, dan metode penagihan.
4. Pilih **Tambahkan ke invoice** atau **Bayar langsung**.
5. Simpan dan periksa invoice atau kuitansi yang terbentuk.

Harga disalin saat order. Perubahan harga master tidak mengubah order lama. Manager juga dapat mengubah master layanan pada tab **Master Layanan**.

## 11. Prosedur tugas operasional

1. Buka **Tugas**.
2. Klik **Buat tugas**.
3. Pilih petugas, kategori, prioritas, kamar, tanggal, batas waktu, dan deskripsi.
4. Simpan.
5. Pantau status `Pending`, `In Progress`, dan `Completed`.
6. Untuk tugas yang tidak relevan, batalkan dengan alasan.

Manager dapat menugaskan tugas kepada staf aktif. Operational Staff hanya dapat memperbarui tugas miliknya sendiri.

## 12. Prosedur deposit

1. Buka **Deposit**.
2. Pilih deposit berstatus `Held` atau `Partially Returned`.
3. Klik **Kembalikan**.
4. Isi jumlah dikembalikan, potongan, tanggal, metode, dan alasan potongan.
5. Proses.

Pastikan potongan memiliki bukti inspeksi atau alasan tertulis.

## 13. Daftar harga, laporan, dan audit

### 13.1 Daftar harga

1. Buka **Master Data**.
2. Tambah atau ubah item harga.
3. Isi kategori, satuan, harga, masa berlaku, dan status.
4. Simpan.

### 13.2 Laporan

1. Buka **Laporan > Keuangan** untuk periode yang dipilih.
2. Periksa **Harian**, **Hunian**, dan **Kartu Penghuni** sesuai kebutuhan.
3. Buka **Rekonsiliasi** dan tindak lanjuti temuan.
4. Gunakan tombol **Cetak laporan** untuk dokumen resmi.

### 13.3 Audit dan sistem

1. Buka **Pengaturan > Jejak Audit** untuk menelusuri perubahan.
2. Buka **Pengaturan > Sistem** untuk menjalankan tagihan atau backup.
3. Catat lokasi backup dan salin ke penyimpanan terpisah.

## 14. Batasan peran Manager

- Tidak dapat membuat atau mengubah akun pengguna.
- Tidak dapat mengubah pengaturan properti dan kebijakan tagihan.
- Tidak dapat mencatat pembayaran masuk; hanya dapat melakukan void.
- Tidak dapat menambah atau mengubah data staf; hanya dapat melihat daftar staf.
- Tidak dapat menghapus riwayat transaksi.

## 15. Troubleshooting

### Check-in ditolak

- Pastikan kamar berstatus tersedia dan kapasitas belum penuh.
- Periksa apakah ada hunian atau reservasi yang tumpang tindih.
- Pastikan tanggal check-in valid.

### Invoice tidak muncul

- Pastikan perjanjian berstatus aktif.
- Periksa periode dan `BillingAdvanceDays`.
- Jalankan penagihan ulang; proses bersifat idempoten.

### Tidak dapat mencatat pembayaran

- Itu memang batasan Manager. Minta Cashier atau Owner mencatat pembayaran.
- Manager dapat melakukan void bila pembayaran salah.

### Rekonsiliasi menemukan selisih

- Periksa pembayaran void, alokasi, penyesuaian invoice, dan deposit.
- Jangan mengubah data langsung.
- Eskalasi ke Owner jika penyebab tidak ditemukan.

## 16. Eskalasi

Hubungi Owner untuk:

- pembuatan atau reset akun;
- perubahan peran;
- perubahan pengaturan properti;
- koreksi data yang tidak dapat diselesaikan melalui alur aplikasi;
- indikasi akses tidak sah atau kehilangan data.
