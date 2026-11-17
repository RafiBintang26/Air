# Daily Hydration Tracker

Starter website HTML/CSS/JavaScript + Supabase.

## 1. Konfigurasi Supabase
1. Buat project di https://supabase.com/dashboard
2. Buka SQL Editor, jalankan seluruh isi `supabase-setup.sql`.
3. Buka Project Settings / API (atau Connect), salin Project URL dan Publishable Key.
4. Isi nilai `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` di `js/supabase.js`.

## 2. Jalankan website
Jangan membuka `index.html` langsung dengan `file://`. Jalankan dengan local web server, misalnya:
- VS Code: install extension Live Server, lalu klik kanan `index.html` > Open with Live Server.
- Atau gunakan `npx serve .` dari terminal di folder project.

## 3. Uji
1. Daftar dengan email sendiri.
2. Jika Supabase meminta verifikasi email, buka email dan verifikasi.
3. Login.
4. Ubah target harian dan catat konsumsi air.
5. Logout lalu login lagi untuk memastikan data tetap tersimpan.

## 4. Deploy ke Vercel
Upload folder project ke GitHub, lalu import repository tersebut di https://vercel.com.
Tidak ada secret key yang perlu ditambahkan ke frontend. Project URL dan Publishable Key memang digunakan di browser; keamanan data bergantung pada RLS.

## Catatan
- Versi ini adalah fondasi user: register, login, target harian, dan catatan konsumsi.
- Dashboard admin belum dibuat.
- Pembatasan satu akun per perangkat belum diterapkan. Browser tidak menyediakan identitas perangkat fisik yang tidak dapat diubah. Untuk pembatasan yang lebih kuat perlu proses device enrollment di backend, validasi server-side, dan pemulihan akun.
- Target hidrasi harus disesuaikan dengan kebutuhan masing-masing pengguna; angka contoh bukan rekomendasi medis.
