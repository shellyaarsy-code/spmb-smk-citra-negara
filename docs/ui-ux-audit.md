# Audit UI/UX SPMB SMK Citra Negara

Tanggal audit: 26 Oktober 2026  
Repository: `shellyaarsy-code/spmb-smk-citra-negara`  
Branch: `integration/demo-shared-data`  
Baseline Preview: `dde7acef46ac75a6add246033f65ef9cbbe1b7bf`  
Preview yang diperiksa: `https://spmb-smk-citra-negara-iiwxe1hft-l-74c0.vercel.app`

## Ringkasan

Audit dimulai dari working tree bersih pada baseline yang sama dengan Preview READY. Layout peran dan navigasi sudah berbagi komponen `AppSidebar`; dasar token visual juga sudah tersedia di `app/globals.css`. Perbedaan yang masih terlihat terutama berasal dari halaman yang ditulis per-role dan aturan CSS lokal yang terus bertambah.

Perubahan audit lanjutan ini memperbaiki fokus keyboard dan penghormatan terhadap reduced motion secara global, serta mengoreksi metrik contoh hasil TKA yang sebelumnya mencampur jumlah hasil tersimpan dengan skor contoh. Tidak ada perubahan pada autentikasi, otorisasi, kebijakan SPMB, data database, atau konfigurasi deployment.

## Cakupan route

Route halaman yang ditemukan melalui inventaris filesystem:

| Area | Route |
|---|---|
| Publik | `/`, `/demo`, `/portal` |
| Autentikasi | `/portal/login/[role]` |
| Calon Siswa | `/portal/siswa`, `/formulir`, `/formulir/orang-tua`, `/formulir/jurusan`, `/formulir/unggah-berkas`, `/formulir/review`, `/pembayaran-formulir`, `/verifikasi-berkas`, `/status-pendaftaran`, `/ujian-tka`, `/hasil-tka`, `/pengumuman-kelulusan`, `/surat-kelulusan`, `/notifikasi`, `/profil` di bawah `/portal/siswa` |
| Admin | `/portal/admin`, `/pendaftaran`, `/pendaftaran/[registrationNumber]`, `/verifikasi-berkas`, `/verifikasi-berkas/[registrationNumber]`, `/pembayaran`, `/bank-soal-tka`, `/manajemen-tes`, `/kelayakan-tka`, `/manajemen-seleksi`, `/pengumuman`, `/laporan` di bawah `/portal/admin` |
| Kepala Sekolah | `/portal/kepala-sekolah`, `/pendaftar`, `/hasil-tes`, `/hasil-seleksi`, `/statistik`, `/laporan` di bawah `/portal/kepala-sekolah` |

Semua route halaman di atas masuk inventaris kode. Pemeriksaan visual langsung pada Preview dilakukan untuk dashboard Kepala Sekolah, data pendaftar, hasil tes, hasil seleksi, statistik, dan laporan eksekutif pada mode demo. Tampilan yang terlihat berada di viewport browser sempit sekitar 480 × 720 CSS px. Admin, siswa, publik, login, tablet 1024 px, desktop 1280/1440 px, dan ponsel 360/390 px belum diperiksa langsung pada sesi ini; tidak diklaim lolos.

## Temuan dan tindakan

| Prioritas | Temuan / akar masalah | Dampak | Tindakan / status |
|---|---|---|---|
| P0 | Tidak ditemukan isu akses pada audit UI terbatas. Setiap layout per-role tetap membungkus children dengan `RoleProtectedLayout` dan role yang sesuai. | Akses harus tetap ditentukan server-side. | Tidak diubah. Audit ini tidak melakukan uji penetrasi atau pengujian silang role. |
| P1 | Dashboard diimplementasikan per-role dan banyak aturan gaya lama masih tertanam dalam stylesheet global yang panjang. | Konsistensi penuh membutuhkan migrasi bertahap; perubahan menyeluruh tanpa visual test semua route berisiko regresi. | Sidebar React sudah memakai `AppSidebar`. Token dan pola portal yang ada dipertahankan; migrasi halaman massal ditunda sampai dapat diperiksa per-role pada semua viewport. |
| P1 | Kartu kedua pada hasil tes demo berlabel “Nilai Terpublikasi” tetapi nilainya `78.00`, sementara jalur tersimpan menampilkan jumlah hasil. Data demo dan data persisten memiliki arti metrik yang berbeda. | Pengguna dapat membaca skor sebagai jumlah peserta atau sebaliknya. | Pada demo label kini “Sampel Nilai Ditampilkan”, nilai dihitung dari empat baris sampel yang benar-benar dirender, dan keterangan menyebut baris contoh. Jalur data tersimpan tidak berubah. |
| P1 | Preview menampilkan tabel yang lebih lebar dari viewport ponsel. | Kolom terakhir perlu digulir untuk dilihat. | Wrapper tabel dan scrollbar horizontal terlihat serta berfungsi pada halaman hasil tes dan pendaftar. Ini dipertahankan sebagai overflow terkontrol; pemeriksaan sentuh pada perangkat fisik belum dilakukan. |
| P2 | Fokus global sebelumnya memakai outline 1.5 px dan tidak ada aturan eksplisit `prefers-reduced-motion`. | Indikator fokus dapat sulit terlihat, dan pengguna yang meminta pengurangan animasi tetap melihat transisi/scroll halus. | Fokus keyboard menjadi garis solid 2 px dengan offset 3 px; animasi dan smooth scrolling dikurangi saat preferensi sistem aktif. |
| P2 | Semua role memakai skala tipografi, kartu, tabel, dan empty state yang belum seluruhnya dimigrasikan ke primitive bersama. | Ada variasi lokal yang belum bisa dijamin konsisten dari satu token. | Dicatat sebagai pekerjaan lanjutan; tidak menambah abstraksi yang belum diuji pada seluruh consumer. |
| P2 | Pada halaman publik terdapat nomor kontak bantuan yang tertulis di markup; keberlakuan kontak tidak dapat dipastikan dari kode saja. | Nomor yang sudah tidak aktif dapat menyesatkan. | Tidak diubah tanpa sumber kontak sekolah yang terverifikasi. |

## Pemeriksaan demo dan data

`app/portal/demo-ppdb-data.ts` menyatakan datanya sintetis dan hanya untuk tampilan. Pemeriksaan aritmetika kode: 1.240 total pendaftar; 982 dokumen lengkap (79,2%); 640 lolos verifikasi (51,6%); keputusan 493 lulus + 82 daftar tunggu + 45 tidak lulus = 620 keputusan; 20 keputusan masih menunggu; jumlah tujuh minggu = 1.240; distribusi wilayah = 1.240; asal sekolah teratas + lainnya = 640. Total admitted per-program = 493 dan total pilihan program = 1.240.

Partisipasi tes demo pada layar hasil tes = 589 selesai + 24 berjalan + 27 belum mulai = 640 peserta terverifikasi. Empat baris tabel adalah sampel tampilan, bukan daftar lengkap 1.240 orang. Tidak ada data demo atau akun yang diubah.

## Matriks komponen dan konsistensi per-role

| Pola | Calon Siswa | Admin | Kepala Sekolah | Hasil audit |
|---|---|---|---|---|
| Shell dan navigasi | `StudentSidebar` → `AppSidebar` | `AdminSidebar` → `AppSidebar` | `PrincipalSidebar` → `AppSidebar` | Markup bersama; menu dan peran tetap berbeda sesuai kewenangan. |
| Proteksi role | `RoleProtectedLayout(SISWA)` | `RoleProtectedLayout(ADMIN)` | `RoleProtectedLayout(KEPALA_SEKOLAH)` | Tidak diubah. |
| Demo banner | Root layout, bila `SPMB_DEMO_MODE` aktif | Sama | Sama | Pesan global simulasi. Mode `?mode=demo` tidak memberi hak akses. |
| Dashboard / cards | CSS khusus siswa | CSS khusus admin | CSS khusus kepala sekolah | Token dasar bersama; struktur dan spacing lokal belum sepenuhnya seragam. |
| Tabel dan filter | Status/dokumen/hasil sesuai fitur | Pencarian, verifikasi, ekspor sesuai fitur | Pendaftar dan laporan read-only | Perilaku lintas-page belum semua diuji; overflow horizontal terlihat di tabel demo Kepala Sekolah. |
| Status dan empty state | Formulir, dokumen, pembayaran, hasil | Antrean dan proses verifikasi | Monitoring dan publikasi | Label domain berbeda; warna semantic terpusat sebagian. Pemetaan status bisnis tidak diubah. |

## Bukti visual dan risiko regresi

Preview baseline diperiksa melalui tab browser yang sudah terbuka. Halaman Kepala Sekolah pada mode demo memperlihatkan banner simulasi, sidebar bersama, ringkasan, panel analitik, serta tabel. Pada viewport sempit, navigasi tersusun dua kolom, kartu ringkasan menjadi dua kolom, dan tabel memakai gulir horizontal. Screenshot terlihat pada sesi QA; berkas PNG tidak diekspor dari alat browser pada audit ini.

Perubahan CSS bersifat global untuk fokus dan motion, sehingga berpotensi memengaruhi kontrol publik, login, dan seluruh portal. Uji lint, typecheck, test, build, dan pemeriksaan visual pascaperubahan dicatat terpisah setelah dijalankan. Interaksi yang mengirim formulir, ekspor, pembayaran, upload, publikasi, atau ujian tidak dilakukan.

## Area yang tetap di luar perubahan

- Login, sesi, otorisasi route/API, dan role.
- Database, akun, pendaftar, file upload, pembayaran, dan konfigurasi.
- Aturan penerimaan, kelayakan, TKA, hasil seleksi, serta publikasi.
- Kontak bantuan yang belum dapat diverifikasi.
- Isi fitur yang belum bisa diuji langsung sebagai peran Admin atau siswa dalam sesi browser ini.

## Hasil verifikasi

- Unit test: 71 passed.
- Type-check: passed.
- Lint: passed with no warnings after removing one unused import in the audited route component.
- Build: local Turbopack failed while making a Prisma Client junction (Windows access denied); Webpack fallback failed creating `.next/types/.../pendaftar` (Windows EPERM). No build success is claimed.
- Visual: six Kepala Sekolah Preview routes inspected in demo mode at the browser's narrow viewport. Admin, student, public/login, and full viewport regression remain unverified.

Kriteria yang belum diperiksa visual pada role/viewport lain tetap ditandai belum diverifikasi.
