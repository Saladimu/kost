# Manual Peran: Owner

Berlaku untuk akun dengan peran `Owner`.

## 1. Tujuan peran

Owner memiliki kendali penuh atas sistem dan bertanggung jawab pada:

- kebenaran data operasional dan keuangan;
- konfigurasi identitas properti, kebijakan tagihan, dan penomoran dokumen;
- pembuatan akun serta penetapan peran staf;
- persetujuan dan pengawasan pengeluaran;
- pemeriksaan audit, rekonsiliasi, dan backup;
- keputusan koreksi transaksi yang tidak dapat diselesaikan staf.

Owner adalah satu-satunya peran yang dapat mengubah pengaturan properti dan mengelola akun pengguna.

## 2. Login dan keamanan akun

1. Buka alamat aplikasi yang diberikan pengelola sistem.
2. Masukkan email dan kata sandi Owner.
3. Klik tombol masuk.
4. Ganti kata sandi bawaan pada kesempatan pertama melalui menu **Akun Pengguna**.
5. Selalu logout setelah memakai perangkat bersama.

Sesi login dapat berakhir lebih cepat jika server atau cache Apps Script dibersihkan. Jika login gagal berulang kali, jangan mencoba banyak kata sandi. Hubungi pengelola sistem untuk reset darurat.

## 3. Menu yang tersedia

Owner dapat membuka seluruh menu:

- Dashboard
- Kamar dan Tipe Kamar
- Penghuni, Reservasi, Perjanjian & Check-in
- Tugas
- Tagihan, Pembayaran, Layanan, Pengeluaran, Transaksi, Deposit
- Laporan
- Staf dan Akun Pengguna
- Master Data dan Pengaturan

## 4. Checklist awal sebelum operasional

1. Buka **Pengaturan > Umum & Kebijakan**.
2. Periksa nama properti, alamat, telepon, dan footer dokumen.
3. Periksa prefix invoice dan kuitansi.
4. Tentukan `DefaultDueDays`, `BillingAdvanceDays`, dan kebijakan prorata.
5. Aktifkan denda keterlambatan hanya jika kebijakan properti sudah jelas.
6. Periksa **Master Data > Daftar Harga** untuk harga sewa dan layanan.
7. Buat staf dan akun login dengan peran yang sesuai.
8. Ganti seluruh kata sandi akun demo.
9. Jalankan satu kali **Pengaturan > Sistem > Jalankan tagihan** untuk memastikan konfigurasi tagihan benar.
10. Lakukan backup pertama dan simpan salinannya di luar server.

## 5. Rutinitas harian

Pagi:

1. Periksa Dashboard: tingkat hunian, penghuni aktif, piutang, dan invoice jatuh tempo.
2. Periksa tugas operasional yang belum selesai.
3. Periksa pembayaran dan pengeluaran yang menunggu tindakan.

Siang:

1. Tinjau pengeluaran berstatus `Pending` yang diajukan Manager.
2. Periksa tagihan yang baru terbit atau berubah menjadi `Overdue`.
3. Tinjau penyesuaian invoice dan void pembayaran yang dilakukan staf.

Sore atau penutupan:

1. Buka **Laporan > Harian** untuk tanggal berjalan.
2. Bandingkan penerimaan dan pengeluaran dengan bukti transaksi.
3. Buka **Laporan > Rekonsiliasi** dan pastikan tidak ada temuan.
4. Pastikan backup harian berjalan atau buat backup manual.
5. Catat kejadian penting yang perlu ditindaklanjuti besok.

## 6. Prosedur staf dan akun

### 6.1 Menambah staf

1. Buka **Staf**.
2. Klik **Tambah staf**.
3. Isi nama lengkap, posisi, telepon, email, peran aplikasi, status kepegawaian, dan tanggal mulai.
4. Simpan.
5. Data staf belum otomatis dapat login. Lanjutkan ke pembuatan akun.

### 6.2 Membuat akun login

1. Buka **Akun Pengguna**.
2. Klik **Tambah akun**.
3. Pilih staf yang belum memiliki akun.
4. Isi email login dan kata sandi minimal 6 karakter.
5. Pilih peran: Manager, Receptionist, Cashier, atau Operational Staff.
6. Simpan dan serahkan kata sandi melalui saluran aman.

Satu staf hanya boleh memiliki satu akun. Gunakan email unik.

### 6.3 Mengubah peran atau menonaktifkan akun

1. Buka **Akun Pengguna**.
2. Klik **Ubah** pada akun yang dimaksud.
3. Ubah peran atau status `Nonaktif`.
4. Untuk reset kata sandi, isi kolom password baru. Kosongkan jika tidak ingin mengubah.
5. Simpan.

Nonaktifkan akun segera saat staf berhenti. Jangan menghapus riwayat staf karena audit dan tugas lama tetap merujuk pada staf tersebut.

## 7. Prosedur pengaturan properti

1. Buka **Pengaturan > Umum & Kebijakan**.
2. Ubah data yang diperlukan:
   - nama properti, alamat, telepon, footer dokumen;
   - prefix invoice dan kuitansi;
   - jatuh tempo, pembuatan invoice lebih awal, dan jeda pengingat;
   - prorata, denda keterlambatan, serta kebijakan sewa, pembayaran, dan deposit.
3. Klik **Simpan pengaturan**.
4. Periksa header dan dokumen cetak setelah menyimpan.

Perubahan pengaturan hanya memengaruhi transaksi dan dokumen baru. Dokumen lama tidak dihitung ulang.

## 8. Prosedur tagihan

### 8.1 Menjalankan penagihan bulanan

1. Buka **Tagihan**.
2. Klik **Jalankan penagihan**.
3. Konfirmasi tanggal proses.
4. Periksa jumlah invoice baru dan jumlah periode yang dilewati.
5. Buka beberapa invoice untuk memastikan periode, sewa, dan jatuh tempo benar.

Proses ini idempoten. Menjalankannya ulang tidak membuat invoice ganda untuk periode yang sama.

### 8.2 Menyesuaikan invoice

1. Buka **Tagihan > Detail** pada invoice.
2. Klik **Penyesuaian**.
3. Isi biaya lain-lain, diskon, alasan, dan catatan.
4. Simpan.
5. Pastikan total tidak turun di bawah jumlah yang sudah dibayar.

### 8.3 Membatalkan invoice

1. Buka **Tagihan > Detail**.
2. Klik **Batalkan**.
3. Isi alasan pembatalan.
4. Konfirmasi.

Invoice yang sudah memiliki pembayaran valid tidak dapat dibatalkan. Void pembayaran terlebih dahulu bila pembayaran memang salah.

## 9. Prosedur pembayaran dan koreksi

### 9.1 Mencatat pembayaran

1. Buka **Pembayaran**.
2. Klik **Catat pembayaran**.
3. Pilih penghuni.
4. Pilih invoice tujuan atau biarkan sistem mengalokasikan ke tagihan tertua.
5. Isi jumlah diterima, tanggal, metode, referensi, dan catatan.
6. Konfirmasi.
7. Serahkan atau cetak kuitansi.

Pembayaran sebagian diperbolehkan. Kelebihan bayar menjadi kredit penghuni.

### 9.2 Void pembayaran

1. Buka **Pembayaran**.
2. Cari kuitansi yang salah.
3. Klik **Void**.
4. Isi alasan yang jelas.
5. Konfirmasi.

Sistem membatalkan alokasi dan membuat jurnal kas keluar pembalik. Data asli tidak dihapus. Saldo invoice dihitung ulang server.

## 10. Prosedur pengeluaran

1. Buka **Pengeluaran**.
2. Klik **Catat pengeluaran**.
3. Isi tanggal, kategori, deskripsi, vendor, jumlah, biaya satuan, metode, dan status.
4. Pilih `Pending` jika masih menunggu persetujuan, atau `Langsung dibayar` jika sudah dibayar.
5. Simpan.
6. Untuk pengeluaran `Pending`, klik **Setujui** lalu **Bayar**.
7. Untuk koreksi, klik **Batal** dan isi alasan. Pengeluaran yang sudah dibayar akan menghasilkan jurnal pembalik.

Jangan menandai pengeluaran sebagai dibayar tanpa bukti transaksi.

## 11. Prosedur deposit

1. Buka **Deposit**.
2. Pilih deposit berstatus `Held` atau `Partially Returned`.
3. Klik **Kembalikan**.
4. Isi jumlah dikembalikan, potongan, tanggal, metode, dan alasan potongan.
5. Proses pengembalian.

Pengembalian tidak boleh melebihi kewajiban deposit yang tersisa. Potongan wajib memiliki alasan.

## 12. Laporan, audit, dan backup

### 12.1 Pemeriksaan laporan

1. Buka **Laporan > Keuangan** untuk periode yang dipilih.
2. Periksa pendapatan per tipe kamar, pengeluaran per kategori, piutang, dan kewajiban deposit.
3. Buka **Laporan > Rekonsiliasi**.
4. Jika ada temuan, catat modul dan record yang disebut, lalu periksa transaksi terkait. Jangan mengubah data langsung.

### 12.2 Audit

1. Buka **Pengaturan > Jejak Audit**.
2. Cari aksi, modul, record, atau pengguna tertentu.
3. Gunakan audit untuk menelusuri perubahan pengaturan, pembatalan, void, dan penyesuaian.
4. Buka tab **Sistem** untuk melihat log sistem.

### 12.3 Backup

1. Buka **Pengaturan > Sistem**.
2. Klik **Backup sekarang**.
3. Catat lokasi berkas yang ditampilkan.
4. Salin backup ke penyimpanan terpisah.
5. Uji pemulihan secara berkala pada lingkungan terpisah.

## 13. Batasan dan kontrol internal

- Jangan mengedit database secara langsung.
- Jangan memakai akun bersama.
- Jangan memberi peran Owner kepada staf yang tidak membutuhkan akses penuh.
- Jangan menghapus dokumen keuangan. Gunakan pembatalan dan jurnal pembalik.
- Tinjau daftar akun aktif setiap bulan.
- Tinjau jejak audit untuk transaksi bernilai besar atau pembatalan.
- Simpan bukti transfer, nota, dan dokumen pendukung di luar aplikasi sesuai kebijakan properti.

## 14. Troubleshooting

### Tidak dapat login

- Pastikan email dan kata sandi benar.
- Pastikan akun berstatus aktif.
- Minta Owner lain atau pengelola sistem melakukan reset jika akun Owner terkunci.

### Menu tidak muncul

- Muat ulang halaman.
- Pastikan akun memakai peran yang benar.
- Jika peran baru diubah, logout lalu login kembali.

### Saldo atau laporan tidak sesuai

- Buka **Laporan > Rekonsiliasi**.
- Periksa pembayaran `Voided`, penyesuaian invoice, dan deposit.
- Jangan mengubah saldo manual. Gunakan void, penyesuaian, atau pembayaran.

### Backup gagal

- Pastikan pengguna memiliki akses sistem.
- Di lingkungan Apps Script, periksa izin Drive.
- Di lingkungan Node.js, pastikan folder `data/backups` dapat ditulis.
- Laporkan pesan error kepada pengelola sistem.

## 15. Serah terima dan eskalasi

Serahkan kepada Manager atau pengelola sistem jika:

- terjadi selisih pembukuan yang tidak dapat dijelaskan;
- ada indikasi akses tidak sah;
- backup atau pemulihan gagal;
- data produksi perlu dikoreksi di luar alur aplikasi.

Catat waktu, pengguna, halaman, dan pesan error sebelum melakukan eskalasi.
