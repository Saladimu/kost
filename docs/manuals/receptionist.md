# Manual Peran: Receptionist

Berlaku untuk akun dengan peran `Receptionist`.

## 1. Tujuan peran

Receptionist adalah titik layanan depan properti. Tanggung jawab utama:

- mendaftarkan calon penghuni dan memperbarui data kontak;
- membuat, mengonfirmasi, dan membatalkan reservasi;
- memproses check-in, transfer, perpanjangan, dan check-out;
- mencatat order layanan tambahan;
- membuat dan memperbarui tugas operasional untuk diri sendiri;
- melihat tagihan dan memberikan informasi saldo kepada penghuni;
- menjaga keramahan layanan dan ketepatan data.

Receptionist tidak mencatat pembayaran invoice, tidak mengubah pengaturan, dan tidak mengelola akun staf.

## 2. Login

1. Buka alamat aplikasi.
2. Masuk dengan email dan kata sandi Receptionist.
3. Ganti kata sandi bawaan jika belum dilakukan.
4. Logout setelah memakai perangkat bersama.

Jika akun terkunci atau perlu reset, hubungi Owner.

## 3. Menu yang tersedia

- Dashboard
- Kamar (lihat)
- Tipe Kamar (lihat)
- Penghuni
- Reservasi
- Perjanjian & Check-in
- Tugas
- Tagihan (lihat)
- Layanan
- Deposit (lihat)
- Laporan
- Master Data (lihat)
- Pengaturan (lihat)

Menu **Pembayaran**, **Pengeluaran**, **Transaksi**, **Staf**, **Akun Pengguna**, dan tindakan sistem tidak tersedia.

## 4. Rutinitas harian

Pagi:

1. Buka Dashboard dan periksa hunian, check-in/check-out mendatang, serta tugas.
2. Periksa reservasi `Pending` dan `Confirmed`.
3. Periksa kamar tersedia untuk hari ini.

Siang:

1. Proses check-in sesuai jadwal.
2. Catat order layanan dari penghuni.
3. Periksa tagihan jatuh tempo dan sampaikan pengingat sesuai SOP.
4. Perbarui tugas yang sedang dikerjakan.

Sore:

1. Periksa check-out hari ini dan sisa tagihan.
2. Pastikan kamar yang dikosongkan masuk proses perbaikan/pembersihan.
3. Periksa reservasi besok.
4. Laporkan kendala kamar kepada Manager.

## 5. Prosedur pendaftaran penghuni

1. Buka **Penghuni**.
2. Klik **Daftarkan penghuni**.
3. Isi nama lengkap dan nomor telepon. Nomor telepon wajib.
4. Isi email, pekerjaan, jenis dan nomor identitas, alamat asal, serta kontak darurat.
5. Biarkan status awal sebagai **Calon penghuni**. Jangan memilih `Aktif` secara manual.
6. Simpan.

Status `Aktif` terbentuk otomatis dari proses check-in. Data identitas hanya digunakan untuk operasional dan tidak boleh dibagikan.

### 5.1 Memperbarui data penghuni

1. Cari penghuni pada tabel.
2. Klik **Ubah**.
3. Perbarui data yang berubah.
4. Simpan.

Jangan mengubah status penghuni menjadi `Sudah check-out` atau `Nonaktif` tanpa proses check-out yang benar.

## 6. Prosedur reservasi

### 6.1 Membuat reservasi

1. Buka **Reservasi**.
2. Klik **Buat reservasi**.
3. Pilih calon penghuni.
4. Pilih kamar yang tersedia atau berstatus reservasi.
5. Isi rencana check-in, rencana check-out, harga sewa, deposit, status, dan catatan.
6. Simpan.

Sistem menolak reservasi yang bentrok dengan hunian atau reservasi lain pada periode yang sama.

### 6.2 Mengonfirmasi atau membatalkan

- Klik **Konfirmasi** untuk mengubah reservasi `Pending` menjadi `Confirmed`.
- Klik **Batal** dan konfirmasi untuk membatalkan reservasi.

Reservasi yang dibatalkan tidak menghapus riwayat. Kamar kembali tersedia untuk periode tersebut.

### 6.3 Mengubah reservasi menjadi hunian

1. Buka reservasi berstatus `Pending` atau `Confirmed`.
2. Klik **Check-in**.
3. Periksa tanggal, harga, dan deposit.
4. Proses check-in.

Reservasi berubah menjadi `Converted` dan perjanjian aktif terbentuk.

## 7. Prosedur check-in

1. Buka **Perjanjian & Check-in**.
2. Klik **Check-in penghuni**.
3. Pilih penghuni.
4. Pilih kamar yang tersedia dan kapasitasnya mencukupi.
5. Isi tanggal check-in, harga sewa yang disepakati, deposit, metode deposit, dan rencana check-out.
6. Proses check-in.
7. Periksa notifikasi jumlah invoice yang dibuat.
8. Buka **Tagihan** untuk memastikan invoice periode pertama benar.

Harga sewa disimpan pada perjanjian. Perubahan harga kamar setelahnya tidak mengubah perjanjian berjalan.

Jangan memproses check-in jika identitas atau kontak penghuni belum lengkap sesuai kebijakan properti.

## 8. Prosedur transfer kamar

1. Buka perjanjian aktif pada **Perjanjian & Check-in**.
2. Klik **Pindah**.
3. Pilih kamar tujuan.
4. Isi tanggal pindah, harga sewa baru, dan alasan.
5. Proses transfer.

Perjanjian lama ditutup sebagai `Transferred` dan perjanjian baru dibuat. Deposit yang masih ditahan dipindahkan. Periode yang sudah ditagihkan tidak digandakan.

## 9. Prosedur perpanjangan

1. Buka perjanjian aktif.
2. Klik **Perpanjang**.
3. Isi tanggal efektif dan harga sewa baru.
4. Tambahkan catatan jika diperlukan.
5. Proses perpanjangan.

Tanggal efektif tidak boleh sebelum atau sama dengan tanggal check-in lama. Perjanjian lama ditutup sebagai `Renewed`.

## 10. Prosedur check-out

1. Buka perjanjian aktif.
2. Klik **Check-out**.
3. Isi tanggal check-out.
4. Isi potongan deposit dan alasan potongan jika ada.
5. Pilih metode pengembalian deposit.
6. Proses check-out.
7. Periksa ringkasan settlement:
   - sisa tagihan penghuni;
   - deposit awal, potongan, dan jumlah dikembalikan;
   - status kamar;
   - tugas kebersihan otomatis.
8. Arahkan penghuni ke Cashier jika masih ada tagihan.

Tagihan yang belum dibayar tetap menjadi kewajiban penghuni. Kamar yang kosong masuk status perbaikan sampai tugas pembersihan selesai.

## 11. Prosedur order layanan

1. Buka **Layanan**.
2. Klik **Buat order layanan**.
3. Pilih penghuni aktif.
4. Pilih layanan, jumlah, tanggal, dan harga satuan.
5. Pilih metode penagihan:
   - **Tambahkan ke invoice** untuk menagih bersama sewa;
   - **Bayar langsung** hanya jika Anda berwenang menerima pembayaran sesuai SOP.
6. Simpan.
7. Periksa invoice atau kuitansi yang terbentuk.

Harga disalin saat order dan tidak berubah jika master harga diubah kemudian.

Receptionist juga dapat menambah atau mengubah master layanan melalui tab **Master Layanan**. Koordinasikan perubahan harga dengan Manager.

## 12. Prosedur tugas

1. Buka **Tugas**.
2. Klik **Buat tugas**.
3. Isi kategori, prioritas, kamar, tanggal, batas waktu, dan deskripsi.
4. Simpan.

Receptionist membuat tugas untuk dirinya sendiri. Penugasan kepada staf lain dilakukan oleh Manager atau Owner. Perbarui status tugas dengan tombol **Mulai** dan **Selesai**.

## 13. Melihat tagihan dan deposit

- Buka **Tagihan** untuk melihat status, total, pembayaran, dan sisa.
- Klik **Detail** untuk rincian dan cetak invoice.
- Buka **Deposit** untuk melihat deposit ditahan dan sisa kewajiban.

Receptionist tidak dapat menyesuaikan atau membatalkan invoice, mencatat pembayaran, atau mengembalikan deposit. Arahkan tindakan tersebut ke Cashier, Manager, atau Owner.

## 14. Laporan

Receptionist memiliki akses baca ke **Laporan**. Gunakan hanya untuk kebutuhan operasional, misalnya:

- laporan hunian;
- kartu penghuni;
- laporan harian;
- laporan keuangan untuk koordinasi internal.

Jangan menyebarkan data keuangan kepada pihak yang tidak berwenang. Jika properti membatasi akses laporan keuangan untuk Receptionist, minta Owner menyesuaikan RBAC.

Dashboard Receptionist tidak menampilkan kartu keuangan, tetapi halaman Laporan tetap dapat dibuka.

## 15. Batasan peran

- Tidak dapat mencatat pembayaran invoice.
- Tidak dapat melakukan void pembayaran.
- Tidak dapat menyesuaikan atau membatalkan invoice.
- Tidak dapat mengembalikan deposit.
- Tidak dapat menambah atau mengubah kamar dan tipe kamar.
- Tidak dapat mengelola pengeluaran atau transaksi.
- Tidak dapat membuat akun atau mengubah data staf.
- Tidak dapat mengubah pengaturan properti.

## 16. Troubleshooting

### Kamar tidak muncul saat check-in

- Pastikan kamar tidak berstatus perbaikan atau nonaktif.
- Periksa apakah kapasitas sudah penuh.
- Periksa apakah ada hunian atau reservasi yang tumpang tindih.
- Minta Manager mengaktifkan kamar jika diperlukan.

### Reservasi ditolak

- Periksa periode bentrok.
- Pastikan kamar dan penghuni dipilih.
- Periksa harga dan deposit.

### Invoice tidak terbentuk setelah check-in

- Periksa apakah check-in berhasil dan perjanjian aktif.
- Buka **Tagihan** dan muat ulang.
- Laporkan ke Manager jika tetap tidak muncul.

### Penghuni ingin membayar

- Arahkan ke Cashier.
- Untuk layanan langsung, ikuti SOP penerimaan uang properti.
- Jangan mencatat pembayaran melalui akun lain.

## 17. Eskalasi

Hubungi Manager atau Owner untuk:

- kamar bermasalah atau perlu perbaikan;
- tagihan yang perlu dikoreksi;
- pembayaran yang perlu di-void;
- deposit yang perlu dikembalikan;
- akun atau akses yang tidak berfungsi;
- keluhan penghuni yang membutuhkan keputusan kebijakan.
