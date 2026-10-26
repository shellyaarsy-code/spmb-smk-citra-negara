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


Script opsional npm run demo:create-staff hanya membuat dua akun staf dan memakai pengaman target demo yang sama. Script ini memerlukan DATABASE_URL, SPMB_DEMO_SEED_TARGET, SPMB_DEMO_MODE=true, SPMB_DEMO_STAFF_CONFIRM=CREATE_ONLY_THE_TWO_DEMO_STAFF_ACCOUNTS, dan SPMB_DEMO_PASSWORD yang sama dengan seed. Script tidak mencetak password. Untuk demo lintas role lengkap, seed penuh tetap menjadi pilihan utama.

## Syarat agar alur dapat dicoba

- Database demo sudah memiliki schema terbaru. Fixture tidak menjalankan migrasi dan tidak menghapus data lama.
- Vercel harus mengarah ke branch preview yang benar dan memiliki `DATABASE_URL` yang menunjuk ke database demo. Jangan arahkan seed ini ke database berisi pendaftar sungguhan.
- Set `SPMB_DEMO_MODE=true` hanya pada deployment demo untuk menampilkan banner simulasi. Login dan pembatasan role tetap aktif; flag ini tidak menyetujui aturan resmi atau membuka publikasi hasil database.
- Unggah bukti bayar dan dokumen memakai Vercel Blob privat yang tersambung ke proyek hanya pada environment Preview. SDK memakai OIDC Vercel; tidak perlu menambahkan token read-write permanen. Jenis file default PDF/JPEG/PNG dengan batas 4 MiB.
- Keputusan hasil hanya gambaran. Publikasi dari database tetap memerlukan `SPMB_OFFICIAL_RULES_APPROVED=true`; untuk mencoba antarmuka seleksi gunakan pratinjau simulasi pada portal admin.

Seed belum dijalankan dan database Preview belum terbukti terpisah dari Production. Jangan membuat akun/unggah dokumen atau menjalankan seed sampai `DATABASE_URL` dan `DIRECT_URL` Preview menunjuk ke branch/demo database yang terisolasi; jangan menganggap variabel yang hanya bertanda Preview otomatis memakai database terpisah. Fixture belum tersedia untuk login sampai schema dan data demo disiapkan.
