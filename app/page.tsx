import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components/site-chrome";

const programs = [
  { name: "Pengembangan Perangkat Lunak dan Gim", desc: "Mempelajari pemrograman, aplikasi, dan pengembangan gim digital.", icon: "▣" },
  { name: "Teknik Jaringan Komputer dan Telekomunikasi", desc: "Mengenal jaringan komputer, perangkat, dan teknologi telekomunikasi.", icon: "⌘" },
  { name: "Desain Komunikasi Visual", desc: "Mengembangkan ide kreatif menjadi karya komunikasi visual.", icon: "◈" },
  { name: "Manajemen Perkantoran dan Layanan Bisnis", desc: "Membangun keterampilan administrasi, layanan, dan pengelolaan bisnis.", icon: "▤" },
  { name: "Bisnis Digital dan Ritel", desc: "Mengenal bisnis, perdagangan, dan layanan di era digital.", icon: "↗" },
  { name: "Perhotelan", desc: "Mempelajari pelayanan dan operasional di bidang perhotelan.", icon: "♧" },
];

const admissionSteps = [
  ["01", "Registrasi Akun", "Buat akun calon siswa untuk memulai pendaftaran."],
  ["02", "Isi Formulir", "Lengkapi biodata, data keluarga, akademik, dan pilihan jurusan."],
  ["03", "Unggah Berkas", "Kirim dokumen persyaratan dan periksa ringkasan pendaftaran."],
  ["04", "Verifikasi", "Panitia meninjau data serta berkas pendaftaran."],
  ["05", "Pembayaran", "Ikuti rincian pembayaran resmi yang telah dikonfirmasi sekolah."],
  ["06", "Ujian TKA", "Ikuti tes seleksi setelah akses dan jadwal dibuka sekolah."],
  ["07", "Hasil Seleksi", "Pantau pengumuman resmi dan petunjuk berikutnya di portal."],
];

const faqItems = [
  ["Apakah pendaftaran dapat dilakukan secara online?", "Pendaftaran siswa baru dimulai melalui portal SPMB. Ikuti petunjuk pada portal dan lengkapi setiap data serta dokumen yang diminta."],
  ["Bagaimana jika saya belum menerima kelulusan rapor semester 5?", "Pantau pengumuman resmi pada portal SPMB atau hubungi pihak sekolah untuk mendapatkan arahan sesuai jadwal penerimaan."],
  ["Apakah diperbolehkan pindah pilihan program keahlian?", "Perubahan pilihan mengikuti ketentuan dan jadwal yang ditetapkan oleh panitia penerimaan siswa baru."],
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="beranda">
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow"><i /> PENERIMAAN SISWA BARU 2026/2027</span>
          <h1>Tentukan program keahlianmu.<br /><em>Mulai langkahmu di sini.</em></h1>
          <p>Selamat datang di Sistem Penerimaan Murid Baru (SPMB) SMK Citra Negara. Pilih keahlian profesional dan jadilah generasi terampil yang siap menghadapi masa depan.</p>
          <div className="hero-actions">
            <Link className="button button-light" href="/portal/login/siswa?mode=register">Daftar Calon Siswa <span>↗</span></Link>
            <a className="button button-ghost" href="#alur">Panduan SPMB 2026</a>
          </div>
        </div>
      </section>

      <section className="school-intro content-width" aria-labelledby="school-title">
        <div className="school-photo" role="img" aria-label="Plang dan identitas SMK Citra Negara di antara tanaman hijau" />
        <div className="school-copy"><span className="kicker">TENTANG CITRA NEGARA</span><h2 id="school-title">Melahirkan Tenaga Profesional Siap Kerja</h2><p>SMK Citra Negara berkomitmen menyiapkan pendidikan berkualitas dan membekali siswa dengan keterampilan yang dibutuhkan dunia kerja. Kenali program keahlian, lingkungan belajar, dan kesempatan untuk mengembangkan potensimu.</p><div className="stats"><div><b>100%</b><span>Komitmen Pendidikan</span></div><div><b>3.500+</b><span>Lulusan Terampil</span></div></div></div>
      </section>

      <section className="program-section" id="program">
        <div className="content-width">
          <div className="center-heading"><span className="kicker">TEMUKAN MINAT DAN BAKATMU</span><h2>Pilihan Program Keahlian</h2><p>Pilih program studi yang sesuai dengan bakat dan impian karier profesional di masa depan.</p></div>
          <div className="program-grid">{programs.map((program, index) => <article className="program-card" key={program.name}><div className="program-card-top"><span className="program-icon">{program.icon}</span><span className="program-number">0{index + 1}</span></div><h3>{program.name}</h3><p>{program.desc}</p><Link href="/portal/login/siswa?mode=register">Daftar sekarang <span>↗</span></Link></article>)}</div>
        </div>
      </section>

      <section className="steps-section" id="alur">
        <div className="content-width steps-layout">
          <div className="steps-intro"><span className="kicker">ALUR PENDAFTARAN</span><h2>7 Tahap Pendaftaran Siswa Baru</h2><p>Ikuti alur dari registrasi akun hingga pengumuman hasil seleksi. Isi formulir dan unggah berkas melalui portal siswa.</p><Link className="button" href="/portal/login/siswa?mode=register">Mulai Pendaftaran <span>↗</span></Link></div>
          <div className="steps-list">{admissionSteps.map(([number, title, description]) => <article className="step-item" key={number}><span className="step-icon">{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
        </div>
      </section>

      <section className="schedule-section" id="jadwal">
        <div className="content-width"><div className="section-title"><div><span className="kicker">JADWAL PENDAFTARAN</span><h2>Jadwal Gelombang Pendaftaran</h2></div><p>Pilih gelombang pendaftaran dan pantau informasi terbaru dari panitia SPMB.</p></div>
          <div className="schedule-grid"><article className="schedule-card active"><div className="schedule-card-heading"><h3>Gelombang 1 <small>(Early Bird)</small></h3><span className="schedule-check">✓</span></div><p className="schedule-date">01 Jan – 28 Feb 2026</p><p>Periode pendaftaran gelombang pertama.</p></article><article className="schedule-card"><div className="schedule-card-heading"><h3>Gelombang 2 <small>(Utama)</small></h3></div><p className="schedule-date">01 Mar – 31 Mei 2026</p><p>Periode pendaftaran gelombang utama.</p></article><article className="schedule-card"><div className="schedule-card-heading"><h3>Gelombang 3 <small>(Terakhir)</small></h3></div><p className="schedule-date">01 Jun – 15 Jul 2026</p><p>Periode akhir pendaftaran siswa baru.</p></article></div>
        </div>
      </section>

      <section className="faq-section" id="faq"><div className="content-width faq-layout"><div className="faq-heading"><span className="kicker">BANTUAN DAN INFORMASI</span><h2>Sering Ditanyakan (FAQ)</h2><p>Temukan jawaban seputar proses dan persyaratan penerimaan siswa baru.</p></div><div className="faq-list">{faqItems.map(([question, answer], index) => <details className="faq-item" key={question}><summary><span className="faq-index">0{index + 1}</span><span>{question}</span><b>+</b></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="closing-cta"><div className="cta-box"><span className="kicker">SPMB SMK CITRA NEGARA · 2026/2027</span><h2>Sudah Siap Memulai Pendaftaran Anda?</h2><p>Akses portal untuk mendaftar, melihat informasi penerimaan, dan memantau proses seleksi.</p><div><Link className="button button-light" href="/portal">Masuk Portal SPMB <span>↗</span></Link><a className="button button-ghost" href="#alur">Cara Mendaftar</a></div></div></section>

      <SiteFooter />
    </main>
  );
}
