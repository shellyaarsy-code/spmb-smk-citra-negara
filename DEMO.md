# Demo SPMB di Vercel

`/demo` mengarahkan guru ke portal siswa, admin, dan kepala sekolah yang sudah memakai autentikasi serta data backend aplikasi. Demo tidak memakai data browser terpisah.

## Fixture yang disiapkan

Jalankan `npm run prisma:seed:demo` hanya terhadap database demo yang berisi data fiktif. Seed menolak berjalan kecuali nama database PostgreSQL memuat penanda `demo`, `test`, `sandbox`, atau `disposable`; `SPMB_DEMO_SEED_TARGET` cocok persis dengan `hostname/database-name`; `SPMB_DEMO_SEED_CONFIRM` disetel ke `SEED_ONLY_A_DISPOSABLE_DEMO_DATABASE`; dan `SPMB_DEMO_PASSWORD` diisi kata sandi demo khusus minimal 12 karakter. `SPMB_DEMO_SEED_TARGET` bukan kredensial dan jangan isi sampai branch demo terisolasi telah dipastikan. Akun atau fixture demo dengan kode yang sama membuat seed berhenti sebelum menulis. Seed hanya membuat baris baru; tidak meng-update data yang ada, tidak membuat atau mengubah role/program, dan tidak menyentuh pengaturan sekolah. Penanda nama saja tidak cukup: pastikan target benar-benar database demo terpisah sebelum memberi konfirmasi. Seed menyiapkan:

- akun admin: `admin.demo@spmb.test`
- akun kepala sekolah: `kepala-sekolah.demo@spmb.test`
- empat akun siswa: `siswa1.demo@spmb.test` sampai `siswa4.demo@spmb.test`
- periode dan gelombang demo aktif untuk tahun ajaran 2026/2027 pada program yang sudah ada
- pendaftar contoh pada tahap verifikasi berkas, pembayaran, dan kelayakan TKA; tiga soal TKA; pengumuman dan notifikasi contoh

Semua akun memakai `SPMB_DEMO_PASSWORD`. Kata sandi di-hash dengan bcrypt, dibagikan terpisah oleh pengelola, dan variabelnya tidak boleh memakai kata sandi sekolah. Jangan tampilkan kata sandi di halaman publik atau log. Seluruh nominal dan kuota di seed adalah angka simulasi. Tujuan pembayaran secara eksplisit menyatakan jangan transfer.

## Syarat agar alur dapat dicoba

- Database demo sudah memiliki schema terbaru. Fixture tidak menjalankan migrasi dan tidak menghapus data lama.
- Vercel harus mengarah ke branch preview yang benar dan memiliki `DATABASE_URL` yang menunjuk ke database demo. Jangan arahkan seed ini ke database berisi pendaftar sungguhan.
- Set `SPMB_DEMO_MODE=true` hanya pada deployment demo untuk menampilkan banner simulasi. Login dan pembatasan role tetap aktif; flag ini tidak menyetujui aturan resmi atau membuka publikasi hasil database.
- Unggah bukti bayar dan dokumen memakai Vercel Blob privat yang tersambung ke proyek hanya pada environment Preview. SDK memakai OIDC Vercel; tidak perlu menambahkan token read-write permanen. Jenis file default PDF/JPEG/PNG dengan batas 4 MiB.
- Keputusan hasil hanya gambaran. Publikasi dari database tetap memerlukan `SPMB_OFFICIAL_RULES_APPROVED=true`; untuk mencoba antarmuka seleksi gunakan pratinjau simulasi pada portal admin.

## Status lingkungan demo yang sudah disiapkan

- Preview cabang `integration/demo-shared-data` memakai Neon branch terisolasi `spmb-demo-test`, database `spmb_demo_test`. `DATABASE_URL` dan `DIRECT_URL` dibuat khusus untuk cabang Preview tersebut; database Neon `production` tidak digunakan oleh konfigurasi Preview ini.
- Database pengujian sudah memiliki empat migrasi Prisma yang tercatat selesai, enam akun sintetis (Admin, Kepala Sekolah, dan empat siswa), empat pendaftaran, enam program keahlian, tiga jenis dokumen, tiga soal TKA, dua pembayaran simulasi, satu hasil seleksi, dan satu pengumuman.
- Fixture tersebut sudah tersedia. **Jangan jalankan `npm run prisma:seed:demo` atau `npm run demo:create-staff` lagi pada database ini**: pemeriksaan seed memang dirancang untuk berhenti jika akun/fixture yang sama sudah ada.
- Akun demo di Preview terpisah dari akun demo yang ditemukan di branch Neon `production`. Perubahan dan akun baru yang dibuat selama uji coba Preview berada di `spmb_demo_test`; perubahan itu tidak otomatis menjadi data Production.
- Data pendaftar baru berbagi database demo yang sama dengan akun/pendaftaran sintetis, sehingga Admin dan Kepala Sekolah dapat memeriksa dampaknya sesuai hak akses setelah siswa menyelesaikan dan mengirim formulir. Pembuatan akun saja belum sama dengan pengiriman pendaftaran.
- Keempat migrasi dan data fixture sudah diperiksa baca-saja. Build Preview berhasil, ESLint/typecheck berhasil setelah Prisma Client digenerate, dan 71 unit test lulus. Uji browser end-to-end untuk login/registrasi dan visibilitas lintas role masih perlu dilakukan; build berhasil bukan bukti bahwa seluruh alur sudah lulus.
- Gunakan hanya data fiktif untuk demonstrasi. Dokumen dan pembayaran tetap berupa simulasi; jangan unggah identitas asli atau melakukan transfer. Keputusan seleksi dan aturan resmi tetap harus mengikuti persetujuan sekolah.

`prisma/create-demo-staff.ts` sekarang menuntut `SPMB_DEMO_MODE=true`, konfirmasi disposable database, dan kecocokan persis `SPMB_DEMO_SEED_TARGET` terhadap hostname/database di `DATABASE_URL`. Script memakai `SPMB_DEMO_PASSWORD` dari environment, tidak menampilkan kata sandi, dan menolak jika akun staf demo sudah ada.
