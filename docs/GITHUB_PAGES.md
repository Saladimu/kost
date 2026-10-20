# Hosting GitHub Pages + Apps Script

Arsitektur ini menjalankan antarmuka statis di GitHub Pages dan backend Google Apps Script melalui bridge HTTP + `postMessage`. GitHub Pages tidak dapat menjalankan server Node.js dan tidak dapat memanggil Apps Script lintas origin secara langsung.

## Ringkasan alur

1. Browser membuka SPA dari `https://<pengguna>.github.io/<repo>/`.
2. SPA mengirim setiap permintaan API sebagai form POST ke URL deployment Apps Script melalui iframe tersembunyi.
3. Apps Script memproses permintaan, lalu mengembalikan halaman HTML kecil yang mengirim hasil ke halaman induk dengan `postMessage`.
4. SPA mencocokkan ID permintaan dan memproses hasilnya. Token sesi hanya disimpan di `sessionStorage` browser.
5. Token dikirim di body POST, bukan di URL, sehingga tidak muncul pada riwayat atau log URL.

Pendekatan ini dipakai karena halaman HTML Apps Script berjalan di dalam sandbox bertingkat; pesan langsung ke iframe Web App tidak selalu mencapai kode aplikasi.

## 1. Siapkan backend Apps Script

1. Jalankan `npm run build:gas`.
2. Buat proyek Apps Script, lalu tempel isi `src/code.gs` dan `src/appsscript.json`.
3. Atur Script Properties:
   - `OWNER_EMAIL` - email owner.
   - `OWNER_PASSWORD` - password awal minimal 8 karakter.
   - `OWNER_NAME` - nama owner.
4. Jalankan `setupProduction()` satu kali untuk database produksi, atau `setup()` untuk data demo.
5. Deploy sebagai Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Salin URL deployment yang berakhiran `/exec`.

## 2. Hubungkan frontend

Edit `public/js/config.js`:

```javascript
window.KOS_CONFIG = {
  gasBridgeUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec'
};
```

Jangan memakai URL `/dev`; gunakan URL `/exec` dari deployment.

## 3. Aktifkan GitHub Pages

1. Push perubahan ke branch `main`.
2. Buka `Settings > Pages`.
3. Pilih `Source: GitHub Actions`.
4. Workflow `.github/workflows/pages.yml` akan menerbitkan folder `public/`.

URL aplikasi berbentuk `https://<pengguna>.github.io/<repo>/`.

## Kinerja

- Setiap panggilan bridge adalah satu request HTTP ke Apps Script. Boot dan login kini hanya memerlukan satu request karena `/bootstrap` dan respons login sudah membawa data pengguna. Bootstrap juga menyiapkan cache data dashboard sehingga halaman pertama tidak memicu tiga request tambahan.
- Browser menyimpan hasil GET selama 60 detik di memori dan `sessionStorage`, serta menggabungkan permintaan identik yang berjalan bersamaan. Cache dibatasi per token sesi dan dibersihkan setiap kali ada POST atau login/logout.
- Backend meng-cache respons GET selama 30 detik per pengguna dan parameter; setiap penulisan otomatis membatalkan cache lama.
- Latensi pertama tetap bergantung pada Apps Script dan Google Sheets. Gunakan backend Node.js untuk volume data yang jauh lebih besar.

## Pemeriksaan masalah

- **"Backend Apps Script belum diatur"**: `gasBridgeUrl` masih kosong di `js/config.js`.
- **"Backend Apps Script tidak merespons"**: periksa URL `/exec`, akses deployment `Anyone`, dan izin Apps Script. Buka URL `/exec` langsung; halaman utama aplikasi harus tampil atau meminta setup.
- **Perubahan kode backend tidak aktif**: buat deployment baru atau kelola versi deployment, lalu perbarui `gasBridgeUrl` bila URL berubah.
- **Login berhasil tetapi sesi hilang saat tab ditutup**: token memang disimpan di `sessionStorage`, bukan cookie permanen.

## Keamanan

- Permintaan dikirim melalui POST ke deployment `Anyone`; operasi data tetap memerlukan token sesi yang valid.
- SPA hanya menerima balasan `postMessage` dari origin Google dan dengan ID permintaan acak yang cocok.
- Apps Script mengirim balasan hanya ke origin SPA yang meminta, sehingga hasil tidak dapat dibaca oleh halaman lain yang menyematkan aplikasi.
- Token sesi hanya disimpan di `sessionStorage` dan dikirim di body POST, bukan di URL.
- Gunakan password produksi yang kuat dan ganti akun demo sebelum dipakai.
- URL `/exec` bersifat publik, tetapi operasi data tetap memerlukan token sesi yang valid.
- Kuota Apps Script dan Google Sheets berlaku. Untuk volume besar, pertimbangkan backend khusus.
