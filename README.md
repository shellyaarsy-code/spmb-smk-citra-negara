# SPMB SMK Citra Negara

Portal PPDB SMK Citra Negara tahun pelajaran 2026/2027 menggunakan Next.js App Router, React, TypeScript, dan CSS global.

## Menjalankan aplikasi

Pasang dependensi dan jalankan server:

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Jalankan `npm run lint` dan `npm run build` untuk validasi.

## Portal

- `/portal/admin` untuk administrasi PPDB.
- `/portal/kepala-sekolah` untuk monitoring read-only.
- `/portal/siswa` untuk formulir dan status calon siswa.
- Tambahkan `?mode=demo` untuk melihat data simulasi.

Data, autentikasi, pembayaran, dan keputusan saat ini merupakan simulasi frontend. Backend, validasi server, dan otorisasi berbasis peran harus tersedia sebelum aplikasi digunakan untuk data pribadi atau keputusan resmi.

Typography uses Plus Jakarta Sans through `next/font`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
