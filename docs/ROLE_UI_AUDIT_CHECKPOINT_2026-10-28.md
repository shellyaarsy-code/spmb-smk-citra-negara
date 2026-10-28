# Checkpoint Audit UI/UX SPMB — 28 Oktober 2026

Branch kerja: `integration/demo-shared-data`

## Deployment
- Commit yang diperiksa: `7384569b71ade28bd8a698a6b8c013478932f98c` — `Align student brand navigation with dashboard home`.
- Preview: https://spmb-smk-citra-negara-3kv3lhyxi-l-74c0.vercel.app
- Status Vercel saat pemeriksaan: `READY`.
- Branch `master` dan production tidak disentuh.

## Perubahan lintas role yang sudah ada di branch
- Warna portal diselaraskan ke hijau tenang dan permukaan netral.
- Link brand Admin kembali ke dashboard Admin, dengan mempertahankan query mode demo.
- Link brand Calon Siswa kembali ke dashboard siswa.
- Skala logo sidebar, judul dashboard, dan deskripsi dashboard diselaraskan.
- Kartu akses Admin/Kepala Sekolah dan bantuan Calon Siswa dipertahankan terlihat pada layar kecil.
- Geometri badge status dan kontrol pagination diselaraskan tanpa mengubah label/status bisnis.
- Link contoh tampilan di footer dashboard Admin dihapus; footer portal tetap ada.

## Pemeriksaan yang dilakukan pada checkpoint ini
- Membaca ulang dashboard Admin, dashboard Kepala Sekolah, dan sidebar Calon Siswa pada branch kerja.
- Meninjau CSS yang mengatur judul, sidebar, kartu akses, tampilan mobile, tabel pendaftar, dan pagination.
- Memeriksa URL preview terbaru. Permintaan langsung ke `/portal/admin?mode=demo` tanpa sesi autentikasi menampilkan halaman login Admin (response mengarah ke route login). Ini konsisten dengan proteksi sesi, tetapi tidak membuktikan dashboard sudah diuji setelah login.
- Tidak mengirim form, tidak mengubah data, tidak menguji transaksi tulis, dan tidak mencoba melewati autentikasi.

## Temuan / batas bukti
- CSS global memiliki banyak lapisan lama dan override; perlu audit cascade terarah sebelum menyederhanakan atau menghapus aturan.
- Markup tabel daftar pendaftar memiliki wrapper scroll horizontal dan status loading/error/empty; tetap perlu pemeriksaan visual di browser untuk memastikan perilaku pada ukuran desktop, tablet, 760px, dan 420px.
- Fetch HTML dan status `READY` tidak membuktikan visual pixel-level, interaksi, atau alur autentikasi berjalan benar.
- Audit halaman fitur per route, screenshot visual, dan pengujian end-to-end lintas role masih terbuka.

## Batas kerja tetap
- Jangan mengedit/merge/promosikan ke `master` atau production.
- Jangan mereset akun, autentikasi, database, atau data demo.
- Kepala Sekolah harus tetap read-only; perbaikan UI tidak boleh menambah hak edit.
- Pertahankan alur, konten, dan fitur yang ada; perbaikan adalah penyempurnaan, bukan redesign.


## Temuan tambahan — halaman Data Pendaftar Kepala Sekolah
- Pada halaman live, kolom pencarian sebelumnya tidak menampilkan ikon pencarian, sedangkan halaman demo menggunakan ikon yang sama di dalam kontrol.
- Perbaikan kecil diterapkan pada `app/portal/kepala-sekolah/live-principal-registrants.tsx`: ikon pencarian disamakan dengan versi demo. Label aksesibel dan perilaku input tetap dipertahankan.
- Commit: `fcba47d4ef5a2c8171de5f809818ae9867636560` — `Align principal live search field with demo UI`.
- Status build/deployment untuk commit ini harus dicek terpisah; perubahan belum dinyatakan tervalidasi secara visual.


## Temuan tambahan — pagination Data Pendaftar Kepala Sekolah
- Markup pagination live sebelumnya berbeda dari demo: elemen `nav` menjadi container utama, sehingga aturan responsive yang menargetkan `.principal-list-pagination nav` dan `.principal-list-pagination p` tidak cocok pada versi live. Versi live juga tidak menyediakan tombol nomor halaman seperti versi demo.
- Markup live sekarang menggunakan pembungkus, ringkasan jumlah/rentang data, dan navigasi bernomor yang mengikuti pola demo. Tombol tetap menggunakan pagination API dan tidak memberi hak edit.
- Commit: `689237527fe6e2b55d128df3d4a322fb6b2a5335` — `Align principal live pagination with demo layout`.
- Ikon pencarian live yang disamakan pada commit sebelumnya tetap dipertahankan.
- Perlu cek build/deployment dan visual responsif setelah commit terbaru siap.


## Temuan tambahan — nomor halaman aktif di pagination live
- Pemeriksaan lanjutan menemukan bahwa pagination live hanya menampilkan lima nomor pertama melalui `slice(0, 5)`. Jika jumlah halaman lebih dari lima dan pengguna menuju halaman selanjutnya, nomor halaman aktif tidak lagi terlihat di deretan tombol.
- Pagination sekarang menghitung jendela hingga lima nomor yang bergeser mengikuti halaman aktif, tetap dibatasi dari halaman pertama hingga terakhir.
- Commit: `d385994d9b4dfc36bc613a1eedafeecbc17f7771` — `Keep current page visible in principal pagination`.
- Ini perbaikan navigasi tampilan; sumber data, ukuran halaman API, dan hak read-only Kepala Sekolah tidak diubah.
- Build dan pengujian visual responsif untuk commit ini masih perlu diverifikasi.

## Temuan tambahan — warna status pada tabel Admin live
- Tabel pendaftar Admin versi live sebelumnya menggunakan satu kelas warna `verification` untuk semua status aplikasi. Akibatnya, status yang secara makna berbeda (misalnya lulus, tidak lulus, menunggu, atau informasi umum) tampil dengan warna yang sama.
- Komponen live sekarang memakai helper `getApplicationStatusTone` yang sudah digunakan dalam sistem label status, dan CSS menyediakan kelas semantik success/danger/warning/info untuk badge tersebut.
- Label status, filter, data, endpoint, pagination, dan izin tidak diubah.
- Commit kode: `6d25b646b80790394fdaf8916e81a8864aa89be7` — `Use semantic status colors in live admin registrations`.
- Commit CSS: `ff58bf4df6969344476ee334b8cfb66dba54bf58` — `Add semantic tones for live application status badges`.
- Perlu menunggu build preview dan pemeriksaan visual terautentikasi. Perubahan kode saja belum membuktikan tampilan sudah tervalidasi.

