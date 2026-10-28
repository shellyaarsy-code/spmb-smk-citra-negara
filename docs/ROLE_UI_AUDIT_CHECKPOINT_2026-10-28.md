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
