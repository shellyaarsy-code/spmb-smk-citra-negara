import { SiteFooter, SiteHeader } from "../components/site-chrome";

const portals = [
  {
    id: "calon-siswa",
    icon: "♙",
    title: "Portal Calon Siswa",
    description: "Gunakan portal ini untuk mendaftar, melengkapi data, mengunggah berkas, dan memantau proses penerimaan.",
    badge: "KHUSUS SISWA",
    primary: "Masuk Portal Calon Siswa",
    secondary: "Registrasi Calon Siswa Baru",
    href: "/portal/login/siswa",
  },
  {
    id: "admin-sekolah",
    icon: "▤",
    title: "Portal Admin Sekolah",
    description: "Akses terbatas bagi staf untuk mengelola pendaftaran, memeriksa kelengkapan data, dan memperbarui informasi seleksi.",
    primary: "Masuk Portal Admin",
    href: "/portal/login/admin",
  },
  {
    id: "kepala-sekolah",
    icon: "♧",
    title: "Portal Kepala Sekolah",
    description: "Pantau ringkasan pendaftaran, laporan seleksi, dan perkembangan penerimaan siswa baru.",
    primary: "Masuk Portal Kepala Sekolah",
    href: "/portal/login/kepala-sekolah",
  },
];

export default function PortalPage() {
  return (
    <main className="portal-page">
      <SiteHeader />
      <section className="portal-welcome">
        <span className="kicker">SMK CITRA NEGARA · TAHUN AJARAN 2026/2027</span>
        <h1>Selamat Datang di Portal SPMB 2026</h1>
        <p>Silakan pilih portal sesuai peran Anda untuk mengakses informasi dan layanan penerimaan siswa baru.</p>
        <div className="portal-grid">{portals.map((portal) => <article className={`portal-card ${portal.id === "calon-siswa" ? "portal-card-featured" : ""}`} id={portal.id} key={portal.id}>
          <div className="portal-card-top"><span className="portal-icon">{portal.icon}</span>{portal.badge && <span className="portal-badge">{portal.badge}</span>}</div>
          <h2>{portal.title}</h2><p>{portal.description}</p>
          <a className={`button portal-button ${portal.id === "calon-siswa" ? "" : "button-outline"}`} href={portal.href}>{portal.primary} <span>↗</span></a>
          {portal.secondary && <a className="button button-outline portal-button-secondary" href={portal.href + "?mode=register"}>{portal.secondary}</a>}
        </article>)}</div>
      </section>
      <section className="portal-demo-invite" aria-label="Demo interaktif untuk guru">
        <div><span className="kicker">UNTUK GURU DAN CALON SISWA</span><h2>Ingin mencoba alur SPMB?</h2><p>Jelajahi portal siswa, admin, dan kepala sekolah dengan autentikasi serta data demo bersama.</p></div>
        <a className="button" href="/demo">Buka demo interaktif <span>↗</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
