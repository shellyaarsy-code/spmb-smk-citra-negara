# Audit UI Lintas Role — SPMB SMK Citra Negara

Tanggal checkpoint: 2026-10-28  
Branch kerja: `integration/demo-shared-data`  
Batas perubahan: tidak mengubah `master`, tidak mengubah data demo, autentikasi, atau skema database.

## Cakupan

Role yang diperiksa:
- Admin
- Kepala Sekolah (read-only)
- Calon Siswa

File fondasi yang ditinjau:
- `app/components/app-sidebar.tsx`
- `app/components/auth-logout-link.tsx`
- `app/components/role-protected-layout.tsx`
- `app/portal/admin/admin-sidebar.tsx`
- `app/portal/kepala-sekolah/principal-sidebar.tsx`
- `app/portal/siswa/student-sidebar.tsx`
- `app/portal/admin/layout.tsx`
- `app/portal/kepala-sekolah/layout.tsx`
- `app/portal/siswa/layout.tsx`
- `app/globals.css`

## Perbaikan yang diterapkan

- Menyatukan geometri badge status (tinggi minimum, padding, radius, line-height, dan alignment) tanpa mengganti label atau logika status.
- Menyatukan ukuran, alignment, fokus keyboard, dan bentuk badge angka pada menu sidebar.
- Menjaga kartu perpindahan mode Admin dan Kepala Sekolah tetap terlihat di breakpoint ponsel; sebelumnya aturan CSS umum menyembunyikan area bantuan/akses pada layar kecil.
- Menyamakan ukuran avatar/identitas Admin dan Kepala Sekolah serta menjaga identitas Admin tetap tampil pada layar sangat kecil.
- Menyelaraskan ukuran tombol pagination Admin dan Kepala Sekolah serta menambah fokus keyboard yang terlihat.
- Kartu mode Admin dan Kepala Sekolah tetap menggunakan tautan role masing-masing; klik kartu berpindah antara mode data tersimpan dan `?mode=demo`.

## Penjagaan akses yang ditemukan

- Layout Admin menggunakan `RoleProtectedLayout` dengan role `ADMIN`.
- Layout Kepala Sekolah menggunakan `RoleProtectedLayout` dengan role `KEPALA_SEKOLAH`.
- Layout Calon Siswa menggunakan `RoleProtectedLayout` dengan role `SISWA`.
- Komponen keluar mengirim POST ke `/api/auth/logout` dan hanya mengarahkan ke halaman login bila respons berhasil.
- Mode demo bukan mekanisme otorisasi. Pemeriksaan komponen ini tidak menggantikan audit lengkap semua endpoint API.

## Smoke test deployment

Preview terakhir yang diuji:
`https://spmb-smk-citra-negara-raaq5i0im-l-74c0.vercel.app`

Rute yang diperiksa melalui fetch:
- `/portal/admin`
- `/portal/admin?mode=demo`
- `/portal/admin/pendaftaran?mode=demo`
- `/portal/kepala-sekolah`
- `/portal/kepala-sekolah?mode=demo`
- `/portal/kepala-sekolah/pendaftar`
- `/portal/siswa`
- `/portal/siswa/notifikasi`
- `/portal/login/admin`
- `/portal/login/kepala-sekolah`
- `/portal/login/siswa`

Fetch berhasil mengembalikan HTTP 200 pada rute tersebut. Ini hanya smoke test respons HTTP; bukan bukti screenshot visual, interaksi browser, atau pengujian otorisasi end-to-end.

## Belum boleh dianggap selesai

- Belum ada verifikasi visual screenshot pada desktop/tablet/ponsel.
- Belum dilakukan interaksi end-to-end dengan akun tiap role untuk menguji seluruh alur utama.
- Belum diaudit setiap endpoint API dan setiap variasi loading/error/empty state pada semua halaman.
- Header identitas Calon Siswa dan notifikasi pada halaman-halaman individual masih perlu ditinjau satu per satu; tidak boleh dianggap identik hanya karena sidebar memakai komponen bersama.

## Aturan lanjutan

1. Pertahankan fondasi UI/UX dan fitur yang ada; hindari redesign atau penghapusan menu.
2. Semua perubahan berikutnya tetap di `integration/demo-shared-data`.
3. Jangan merge, deploy production, atau mengubah `master` tanpa persetujuan eksplisit.
4. Setelah setiap batch, tunggu deployment READY, jalankan build/smoke tests, lalu catat temuan yang masih terbuka.
