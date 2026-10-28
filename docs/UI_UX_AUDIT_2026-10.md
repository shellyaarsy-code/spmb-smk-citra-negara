# Audit UI/UX SPMB SMK Citra Negara 2026/2027

Tanggal: 26 Oktober 2026. Acuan visual: foundation yang tertulis di brief. Screenshot/file Figma tidak tersedia pada sesi ini, sehingga perbandingan visual langsung belum dilakukan.

## Ringkasan discovery

- Framework: Next.js 16 App Router, React 19, TypeScript, Tailwind v4 import dan CSS global.
- Struktur: route publik di app/, portal role di app/portal/{admin,siswa,kepala-sekolah}, shared UI di app/components. Dashboard saat ini disusun per halaman, bukan satu AppShell.
- Data/state: API routes, service/repository/domain, Prisma 6/PostgreSQL; demo UI memakai query mode=demo; seed DB demo terpisah tersedia.
- Role auth/enum: SISWA, ADMIN, KEPALA_SEKOLAH. Tidak ada role verifikator terpisah; verifikasi dilakukan Admin.
- Icon: inline SVG kustom. Logo tunggal public/logo-cn.png; tersedia app/favicon.ico dan app/icon.png. Tidak ditemukan aset manifest/apple-touch/OG khusus.
- Working tree sudah memiliki perubahan sebelum audit pada README, package, Prisma setup, .env.example, seed/API dan file untracked. Perubahan ini dibiarkan utuh.

## Matriks role

| Role | Route/halaman | Menu | Fitur utama |
|---|---|---|---|
| Calon siswa (SISWA) | /portal/siswa; /formulir (biodata, orang tua, jurusan, unggah, review); /pembayaran-formulir; /verifikasi-berkas; /status-pendaftaran; /ujian-tka; /hasil-tka; /pengumuman-kelulusan; /surat-kelulusan; /notifikasi; /profil | Dashboard, Formulir, Unggah Berkas, Pembayaran, Ujian & Seleksi, Pengumuman, Notifikasi, Profil | Registrasi/login, formulir, dokumen, pembayaran, TKA, status/hasil, notifikasi |
| Admin/panitia (ADMIN) | /portal/admin; /pendaftaran + detail; /verifikasi-berkas + detail; /pembayaran; /bank-soal-tka; /manajemen-tes; /kelayakan-tka; /manajemen-seleksi; /pengumuman; /laporan | Dashboard, Pendaftaran, Verifikasi, Pembayaran, Bank Soal, Tes, Kelayakan, Seleksi, Pengumuman, Laporan | Review aplikasi/dokumen/pembayaran, tes, kelayakan, seleksi, publikasi, analitik |
| Kepala Sekolah (KEPALA_SEKOLAH) | /portal/kepala-sekolah; /pendaftar; /hasil-tes; /hasil-seleksi; /statistik; /laporan | Dashboard monitoring, Pendaftar, Hasil Tes, Hasil Seleksi, Statistik, Laporan | Monitoring read-only dan laporan |

## Temuan audit

| Kategori/lokasi | Masalah | Severity | Perbaikan / status |
|---|---|---|---|
| Warna, app/globals.css | Ribuan aturan CSS halaman memakai warna literal; token lama hanya mencakup sebagian semantic color. | Tinggi | Semantic tokens ditambah dan dipakai pada navigasi bersama. Migrasi literal dan uji kontras per halaman belum selesai. |
| Sidebar, tiga file *-sidebar.tsx dan globals.css | Tiga implementasi berbeda warna, ukuran, active state dan breakpoint; admin hijau solid, siswa/kepsek terang. | Tinggi | Markup sidebar kini memakai satu komponen React AppSidebar; role wrappers memasok menu dan kartu informasi. Visualnya dinormalisasi: sidebar terang, active tint plus indikator, lebar desktop 248px, ikon 20px, target 44px, nav horizontal di mobile. |
| Topbar/header, seluruh portal | Breadcrumb, search, profil/notifikasi dan header disusun terpisah per halaman. | Tinggi | Belum dimigrasi; perlu AppShell/PageHeader bersama dan review halaman. |
| Card/KPI, dashboard role | Radius, shadow, padding, angka/label berbeda; tidak ada satu primitive Card/KPI bersama. | Sedang | Token radius/shadow/typography ditambah; migrasi komponen belum dikerjakan. |
| Spacing/responsive, globals.css | Banyak ukuran lokal, batas konten dan breakpoint berbeda. | Tinggi | Lebar sidebar disamakan; grid dan spacing seluruh halaman serta uji 360–1440 belum selesai. |
| Tipografi, globals.css dan app/layout.tsx | Font token lama Inter/Segoe UI, brief meminta Plus Jakarta Sans; asset font tidak ada, banyak ukuran ad-hoc. | Tinggi | Font token dialihkan ke Plus Jakarta Sans dengan fallback sans-serif. Font belum benar-benar dimuat; butuh asset/font source. |
| Status/primitive, portal role | Label dan warna status berbeda, belum ada satu StatusChip dengan delapan label. Prisma memiliki status proses yang lebih banyak dari delapan contoh. | Tinggi | Belum digabung; perlu pemetaan status bisnis ke label UI sebelum mengganti copy/status. |
| Logo/icon, public dan app | Satu logo PNG, icon/favicons terpisah, tidak tampak varian OG/manifest/apple. SVG dikustom di banyak file. | Sedang | Belum direbuild agar tidak mengubah emblem resmi tanpa vector/sumber resmi. Transparansi/alpha dan favicon belum diverifikasi. |
| Aksesibilitas | Focus global lama 3px; dialog, label/error relation dan keyboard perlu per-route review. | Sedang | Focus 1.5px bertoken untuk elemen bersama ditambahkan. Audit WCAG/keyboard penuh belum dilakukan. |
| Fitur antar role/API | API mendukung aplikasi, dokumen, verifikasi, pembayaran, TKA, seleksi dan notifikasi; mode demo UI terpisah dari DB. | Sedang | Route tersedia, tapi E2E sinkronisasi belum diuji. Beberapa item admin disabled masih tampak. |
| Data/empty/loading | Seed demo DB ada, demo UI ada; belum satu EmptyState dan mode kosong/loading lintas halaman. | Tinggi | Seed/data tidak diubah. README menyebut akun admin dan 8 pendaftar seed; paket akun tiap role, reset, data 30–60 dan toggle loading/empty belum tersedia sebagai satu panduan. |

## Perubahan sesi ini

- app/globals.css: semantic token dan style sidebar bersama. app/components/app-sidebar.tsx: markup bersama; app/portal/admin/admin-sidebar.tsx, app/portal/siswa/student-sidebar.tsx, app/portal/kepala-sekolah/principal-sidebar.tsx: role-specific menu wrappers.
- docs/UI_UX_AUDIT_2026-10.md: laporan discovery, temuan, token, alur dan batas pekerjaan.
- Tidak ada komponen React lama digabung/dihapus. Auth, routing, schema, dan data bisnis tidak diubah.

## Token semantic baru

| Kelompok | Token/nilai |
|---|---|
| Brand | primary #0C5335; hover/highlight #1E8A5F; tint #E8F5EE |
| Surface/text | base #F8FAF7; surface #FFFFFF; text #26312C; muted #66746B; border #D8E4DE |
| Status fg + bg | warning #8B5E00 + #FEF3C7; success #166534 + #DCFCE7; danger #A33333 + #FEE2E2; info #315B91 + #E8F0FB |
| Type | Plus Jakarta Sans (asset belum tersedia); overline 12px; subheading 16px; page title 28px; KPI 32px |
| Spacing/radius | space-7 28px; space-10 40px; card 16px; chip 9999px |
| Shadow | sm 0 2px 8px rgb(18 62 39 / 6%); md 0 8px 28px rgb(18 62 39 / 7%) |
| Motion/layer | 180ms cubic-bezier(0.2, 0, 0, 1); sidebar/overlay/dialog z-index 20/40/50 |

Token lama masih dipertahankan karena banyak selector aktif memakainya; belum aman dihapus sampai migrasi halaman selesai.

## Glosarium rekomendasi

SPMB = nama sistem; Calon siswa = pengguna role SISWA; Pendaftar = aplikasi calon siswa yang sudah dibuat; Dokumen = unggahan persyaratan (hindari berganti dengan “berkas”); Verifikasi dokumen = aktivitas admin; Program keahlian = pilihan jurusan; Seleksi = keputusan penerimaan; TKA = Tes Kemampuan Akademik. Glosarium belum diterapkan global karena beberapa istilah terkait state bisnis.

## Matriks alur lintas role

| Aksi | Dampak yang diharapkan | Status |
|---|---|---|
| Siswa menyimpan/mengirim formulir dan dokumen | Tampil di antrean admin | API dan halaman ada; E2E belum diverifikasi |
| Admin meminta revisi/memverifikasi dokumen | Status dan alasan tampak bagi siswa | UI/API ada; label status belum seragam |
| Admin memverifikasi pembayaran | Ringkasan siswa berubah | Endpoint/halaman ada; belum diuji |
| Admin mengatur TKA/kelayakan | Siswa melihat akses/jadwal | Route ada; alur lintas role belum diuji |
| Admin menerbitkan seleksi/pengumuman | Siswa melihat hasil, kepala sekolah memonitor | Halaman/API ada; publikasi-notifikasi belum E2E |
| Kepala sekolah membaca laporan | Data tetap read-only | Guard/route tersedia; semua route belum ditelusuri |

## Panduan demo yang terverifikasi dari kode

- Beberapa route UI menerima ?mode=demo setelah login; parameter itu bukan akses role.
- Seed database: npm run prisma:seed:demo membaca DATABASE_URL, SPMB_DEMO_SEED_TARGET, SPMB_DEMO_SEED_CONFIRM, dan SPMB_DEMO_PASSWORD. Seed berhenti jika fixture yang sama sudah ada; pastikan target database terisolasi terlebih dahulu.
- README kini mengarahkan ke DEMO.md. Seed utama menyediakan dua akun staf dan empat akun siswa sintetis; belum ada panduan reset terpisah, kredensial publik, atau toggle empty/loading global.
- Jangan menjalankan seed pada database operasional. Panduan DEMO.md mensyaratkan target database disposable yang terpisah dan belum terverifikasi.

## Selesai dan tersisa

Selesai: discovery role/struktur, audit prioritas, semantic token awal, penyamaan visual dan markup React sidebar. Belum selesai: AppShell dan topbar React bersama; primitives Card/KPI/StatusChip/EmptyState/form; migrasi halaman per role; pemetaan status domain; asset font resmi; data/demo lintas role dan mode empty/loading; cek semua viewport, WCAG, screenshot Figma, console dan E2E.

Figma tidak tersedia sebagai lampiran dan sesi ini belum menelusuri semua halaman lewat browser.

## Hasil verifikasi

- 
pm run lint: lulus.
- 
pm run typecheck: lulus.
- Sembilan suite unit test yang dapat dijalankan tanpa layanan eksternal: 66 lulus, 0 gagal.
- Build default Turbopack: gagal karena panic internal saat menulis endpoint CSS; build tidak memberi diagnosis sintaks stylesheet.
- Build ulang dengan Webpack: gagal saat membuat folder route di .next/server/app/api/student/notifications/[notificationId] (Windows EPERM). Karena output build existing tidak dapat ditulis, build belum terverifikasi.
- Test integrasi database/storage tidak dijalankan; memerlukan environment layanan/database dan berisiko menyentuh sistem eksternal.
- git diff --check: lulus; hanya ada peringatan konversi line ending.
 
#### Catatan pemeriksaan setelah refactor sidebar

Type-check dan lint sebelumnya lulus sebelum komponen sidebar digabung. Pemeriksaan ulang untuk perubahan komponen tidak selesai: shell/tooling tidak mengembalikan hasil, dan prosesnya dihentikan setelah tidak terlihat lagi sebagai proses aktif. Jadi type-check/lint pasca-refactor masih perlu dijalankan. Unit test yang disebut sebelumnya selesai sebelum refactor sidebar; refactor ini hanya mengubah presentasi navigasi, tetapi belum diuji ulang.