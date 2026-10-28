# Audit Konsistensi UI/UX Lintas Role — SPMB SMK Citra Negara

Tanggal: 2026-10-28  
Branch kerja: `integration/demo-shared-data`  
Batas aman: tidak mengubah `master`, tidak mempromosikan deployment ke production, tidak mereset data demo, akun, autentikasi, atau skema database.

## Tujuan

Menjaga Admin, Calon Siswa, dan Kepala Sekolah terasa sebagai satu aplikasi yang sama tanpa menyamakan fungsi yang memang berbeda. Audit ini adalah penyempurnaan sistem yang sudah ada, bukan redesign atau pembangunan ulang.

## Temuan dari pemeriksaan kode

### 1. Fondasi layout bersama
Ketiga dashboard sudah menggunakan komponen sidebar bersama `app/components/app-sidebar.tsx` dan token layout bersama di `app/globals.css`. Ada aturan umum untuk lebar sidebar, canvas, border, radius, bayangan, item navigasi, ikon, dan fokus keyboard.

Namun `app/globals.css` memiliki banyak lapisan CSS lama dan override yang bertumpuk. Karena itu, satu aturan awal tidak selalu menjadi aturan akhir yang dipakai browser. Pemeriksaan harus mempertimbangkan cascade dan breakpoint, bukan hanya aturan pertama yang ditemukan.

### 2. Perbedaan yang ditemukan dan tindakan batch ini
- Logo brand di sidebar Calon Siswa sebelumnya diberi ukuran khusus 28px, sedangkan Admin/Kepala Sekolah menggunakan token ukuran brand. Disamakan kembali dengan `--sidebar-brand-size`.
- Judul dashboard memakai skala yang sedikit berbeda: judul Admin/Kepala Sekolah menggunakan skala responsif, sedangkan judul Calon Siswa pernah ditetapkan 21px. Sekarang ketiganya memakai `clamp(21px, 1.7vw, 24px)`, line-height 1.3, dan letter spacing yang sama.
- Deskripsi di bawah judul dashboard diseragamkan ke ukuran 14px dan line-height 1.5; isi teks tetap spesifik untuk role masing-masing.
- Di mobile, kartu akses Admin dan Kepala Sekolah dipertahankan tampil. Kartu bantuan Calon Siswa sebelumnya tersembunyi. Sekarang kartu bantuan siswa juga tersedia di bawah navigasi mobile agar jalur bantuan tidak hilang.
- Perubahan di atas hanya presentasi; tidak mengubah route, label menu, status pendaftaran, business rules, hak akses, API, atau data.

### 3. Navigasi dan sidebar
Menu role harus berbeda sesuai kewenangan, tetapi pola visualnya konsisten:
- ukuran brand/logo, padding, tinggi item, radius, jarak ikon-teks, ukuran ikon, alignment badge, active state, hover, dan focus-visible;
- sidebar desktop tetap pada kolom kiri, sementara breakpoint kecil menggunakan susunan navigasi mobile yang dapat dibaca;
- badge angka/status tidak boleh mendorong label keluar atau membuat item meluber;
- kartu akses Admin (mode data tersimpan/demo) dan Kepala Sekolah (read-only) harus jelas berbeda secara makna, bukan sekadar berbeda warna;
- kartu bantuan Calon Siswa harus mudah ditemukan tanpa menggantikan menu utama;
- logout tetap menggunakan komponen autentikasi yang ada.

### 4. Header dan identitas
Standar dasar yang dituju:
- judul dashboard konsisten pada 21–24px responsif;
- deskripsi 14px dengan line-height 1.5;
- header dan metadata tidak boleh saling bertumpuk saat layar mengecil;
- nama/identitas akun, tahun ajaran, status, dan indikator demo harus terbaca dan tidak terpotong;
- header setiap role boleh memiliki informasi berbeda karena konteksnya berbeda, tetapi baseline tipografi dan jarak harus konsisten.

### 5. Kartu, panel, dan ringkasan
Token bersama yang sudah ada harus dipakai konsisten untuk:
- warna canvas vs permukaan kartu;
- border, radius, shadow, dan padding panel;
- jarak antar-kartu dan grid metrik;
- hierarki heading panel, teks penjelas, nilai metrik, serta label status.
Isi kartu Admin, Kepala Sekolah, dan Calon Siswa memang berbeda. Jangan memaksakan struktur metrik yang sama bila fungsi informasinya berbeda.

### 6. Tabel, formulir, filter, dan pagination
Setiap halaman fitur harus diperiksa satu per satu, tidak cukup hanya dashboard utama:
- tinggi input/select/textarea dan tombol; jarak label-input; pesan validasi; disabled/loading state;
- toolbar filter dan pencarian, wrapping tombol, konsistensi ukuran kontrol;
- tabel tidak boleh membuat seluruh halaman melebar; tabel lebar harus memakai pembungkus horizontal yang benar;
- alignment heading kolom, isi, angka, badge status, aksi per baris, empty state, dan pagination;
- pada layar kecil, aksi penting harus tetap bisa ditemukan tanpa tumpang tindih.

### 7. Status, notifikasi, dan mode demo
- Label status dan maknanya harus dipertahankan; hanya geometri/warna visual yang boleh distandarkan tanpa mengubah status bisnis.
- Mode demo harus terlihat jelas dan tidak menyamar sebagai data nyata.
- Empty/error/loading states harus membedakan “belum ada data”, “sedang memuat”, dan “gagal memuat”.
- Tidak boleh menambahkan klaim bahwa data tersimpan atau autentikasi berhasil hanya karena halaman memberi HTTP 200.

### 8. Aksesibilitas dan responsive
- focus-visible harus jelas pada link, tombol, filter, dan pagination;
- teks dan ikon harus tetap memiliki label yang bermakna;
- target interaksi tidak boleh terlalu rapat;
- periksa setidaknya desktop lebar, tablet, mobile 760px, dan mobile kecil 420px;
- pastikan tidak ada overflow horizontal pada halaman secara keseluruhan; tabel yang memang lebar boleh memiliki scroll internal.

## Matriks standar lintas role

| Area | Standar bersama | Pengecualian yang dibolehkan |
|---|---|---|
| Brand/sidebar | ukuran logo dari token, alignment, padding, radius, fokus | nama portal/subtitle sesuai role |
| Navigasi | tinggi item, ikon, jarak, active/hover/focus, badge | jumlah dan label menu mengikuti kewenangan |
| Header | skala judul, deskripsi, jarak, wrapping | identitas dan metadata khusus role |
| Canvas/panel | token warna, border, radius, shadow, padding | komposisi grid mengikuti kebutuhan konten |
| Formulir | tinggi kontrol, label, error, focus | field dan aturan validasi sesuai proses |
| Tabel/list | toolbar, status, aksi, pagination, empty state | kolom sesuai jenis data |
| Status | bentuk badge dan hirarki warna | label dan semantik status tidak boleh diganti sembarangan |
| Responsive | tidak terpotong, tidak overlap, kontrol tetap tersedia | navigasi dapat berubah menjadi layout mobile |
| Demo/loading/error | penanda dan pesan jelas | isi pesan sesuai role/fitur |
| Keamanan | proteksi role dan logout yang ada tetap dipertahankan | akses Admin/Kepala Sekolah/Siswa memang berbeda |

## Audit per role yang masih harus dituntaskan

### Admin
- Dashboard: ringkasan metrik, grid, header akun, penanda demo, footer.
- Pendaftaran: filter/pencarian, tabel, detail pendaftar, pagination, empty/error.
- Verifikasi berkas: status dokumen, aksi verifikasi/revisi, tampilan detail.
- Bank Soal TKA dan Manajemen Tes: form, tabel, state edit/tambah, dialog/konfirmasi.
- Kelayakan TKA dan Manajemen Seleksi: bobot, validasi, status, peringatan.
- Pengumuman: form editor, pratinjau, riwayat, ukuran panel.
- Laporan & Analitik: filter, grafik, tabel, ekspor.
- Pembayaran: tabel/status/aksi, konsistensi badge dan angka.

### Kepala Sekolah
- Dashboard monitoring: metrik, kuota/minat program, notifikasi, grafik.
- Data Pendaftar: tabel read-only, filter, detail dan pagination.
- Hasil Tes Akademik dan Hasil Seleksi: konsistensi status, nilai, label hasil.
- Statistik PPDB: kartu/grafik dan filter.
- Laporan Eksekutif: layout laporan, cetak/ekspor, state kosong.
- Semua halaman tetap read-only; jangan menambahkan kontrol edit.

### Calon Siswa
- Dashboard: progres tahapan, status aplikasi, ringkasan dokumen, pengumuman, aktivitas.
- Formulir dan review: label, required marker, validasi, penyimpanan draft.
- Unggah Berkas: status upload, tipe/ukuran berkas, error dan sukses.
- Pembayaran: instruksi, status, nominal dan bukti.
- Ujian TKA / hasil: jadwal, status, instruksi dan hasil yang tersedia.
- Pengumuman dan Notifikasi: unread/read, empty state, alignment waktu.
- Profil Siswa: data identitas, mode edit/simpan, validasi dan feedback.
- Pastikan tahapan pendaftaran tidak menampilkan progres yang menyesatkan.

## Pemeriksaan teknis dan batas bukti

- Deployment terakhir yang diketahui berhasil: commit `52a4b29f24a50703c1129edb8e5a763f5ff181b9`, preview `https://spmb-smk-citra-negara-10ndnvy0o-l-74c0.vercel.app`.
- Batch konsistensi baru: `86bf36ce353a61f355bffc0a7aa7369453f5ec3c` (standarisasi ukuran logo, heading, deskripsi, dan kartu bantuan di mobile).
- Perubahan baru harus menunggu deployment `READY` sebelum dites.
- HTTP fetch bukan pengganti screenshot visual atau pengujian interaksi.
- Belum boleh disebut audit selesai sampai halaman fitur tiap role ditinjau dan tes visual/responsif serta alur end-to-end benar-benar dijalankan.
- Proteksi layout yang diketahui: Admin `ADMIN`, Kepala Sekolah `KEPALA_SEKOLAH`, Calon Siswa `SISWA`. Ini bukan pengganti audit setiap endpoint API.
- Tidak mengubah `master`, data demo, kredensial, auth, atau database dalam batch visual ini.

## Urutan kerja berikutnya

1. Tunggu deployment batch konsistensi menjadi `READY`; lakukan smoke test route dan cek perubahan CSS yang baru.
2. Audit seluruh route fitur dari daftar di atas melalui kode dan struktur markup, mulai dari shell/header/sidebar, lalu tabel/form, status, empty/error/loading.
3. Perbaiki inkonsistensi dalam batch kecil per pola komponen, bukan menambah override acak.
4. Setelah setiap batch: cek diff, build/deployment, HTTP smoke tests, dan bila alat visual tersedia lakukan screenshot pada desktop/tablet/mobile.
5. Buat daftar selesai/terbuka berdasarkan bukti, bukan asumsi.
