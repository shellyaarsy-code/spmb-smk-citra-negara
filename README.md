# SPMB SMK Citra Negara

Portal PPDB SMK Citra Negara tahun pelajaran 2026/2027 menggunakan Next.js App Router, React, TypeScript, dan CSS global.

## Menjalankan aplikasi

Pasang dependensi dan jalankan server:

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Jalankan `npm run lint` dan `npm run build` untuk validasi.

## Demo admin dengan database terpisah

Demo memakai login admin biasa (`/portal/login/admin`) dan query dashboard yang sama dengan data operasional. Seed khusus demo hanya menerima URL PostgreSQL jarak jauh melalui `SPMB_DEMO_DATABASE_URL`; script menolak host lokal dan tidak pernah memakai `DATABASE_URL`. Ia membuat atau memperbarui akun admin yang email dan passwordnya diberikan lewat environment, beserta delapan akun pendaftar sintetis bernama jelas `DEMO-SPMB-2026-*`. Seed ini tidak menghapus data.

1. Siapkan database PostgreSQL online yang kosong dan terpisah untuk demo. Jangan arahkan variabel ini ke database lokal atau produksi.
2. Set `SPMB_DEMO_DATABASE_URL`, `SPMB_DEMO_ADMIN_EMAIL`, dan `SPMB_DEMO_ADMIN_PASSWORD` di environment lokal sementara atau pengaturan secret CI. Buat password unik minimal 16 karakter (maksimal 72 byte); jangan simpan nilainya di source code atau commit file `.env`.
3. Terapkan schema, lalu data fondasi dan demo:

   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   npm run prisma:seed:demo
   ```

   `migrate deploy` dan seed fondasi membaca `DATABASE_URL`. Untuk mencegah menyentuh database lokal, jalankan keduanya hanya setelah mengatur `DATABASE_URL` ke URL database demo yang sama dengan `SPMB_DEMO_DATABASE_URL`. Seed demo sendiri menggunakan `SPMB_DEMO_DATABASE_URL` secara eksplisit.
4. Jalankan aplikasi dengan `DATABASE_URL` menuju database demo. Buka `/portal/login/admin`, masuk dengan email dan password yang disetel di langkah 2, lalu dashboard menampilkan hitungan dari delapan pendaftar sintetis. Hapus secret demo dari environment setelah sesi demo berakhir; akun juga dapat dinonaktifkan dari database demo.

Untuk Vercel, aplikasi **tidak bisa menjalankan autentikasi dan query dashboard tanpa PostgreSQL online**: Prisma schema memakai PostgreSQL, login membaca tabel user/role dan menyimpan sesi, dan dashboard menghitung aplikasi/program dari database. Minimum konfigurasi adalah database PostgreSQL terkelola yang bisa diakses Vercel, `DATABASE_URL` (URL koneksi runtime, gunakan pooling bila provider menyarankan), schema migrations yang sudah diterapkan, lalu build/deploy. Tidak perlu menyimpan password admin sebagai Vercel variable setelah seed; hanya set `SPMB_DEMO_*` sementara jika melakukan reseed. Supabase Storage hanya diperlukan untuk fitur upload dokumen, bukan untuk login atau ringkasan dashboard.

## Portal

- `/portal/admin` untuk administrasi PPDB.
- `/portal/kepala-sekolah` untuk monitoring read-only.
- `/portal/siswa` untuk formulir dan status calon siswa.
- `?mode=demo` menampilkan simulasi visual setelah pengguna berhasil login; parameter ini tidak memberikan akses admin. Untuk dashboard yang berasal dari data seed, masuk melalui halaman admin biasa tanpa parameter tersebut.

Gunakan data sintetis dan database terpisah untuk demo. Autentikasi dan otorisasi admin memerlukan database PostgreSQL.

Typography uses Plus Jakarta Sans through `next/font`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
SPMB demo deployment update.
