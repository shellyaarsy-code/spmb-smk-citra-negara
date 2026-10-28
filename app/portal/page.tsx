import { SiteFooter, SiteHeader } from "../components/site-chrome";

const portals = [
  {
    id: "calon-siswa",
    title: "Portal Calon Siswa",
    description: "Gunakan portal ini untuk mendaftar, melengkapi data, mengunggah berkas, dan memantau proses penerimaan.",
    badge: "KHUSUS SISWA",
    primary: "Masuk Portal Calon Siswa",
    secondary: "Registrasi Calon Siswa Baru",
    href: "/portal/login/siswa",
  },
  {
    id: "admin-sekolah",
    title: "Portal Admin Sekolah",
    description: "Akses terbatas bagi staf untuk mengelola pendaftaran, memeriksa kelengkapan data, dan memperbarui informasi seleksi.",
    primary: "Masuk Portal Admin",
    href: "/portal/login/admin",
  },
  {
    id: "kepala-sekolah",
    title: "Portal Kepala Sekolah",
    description: "Pantau ringkasan pendaftaran, laporan seleksi, dan perkembangan penerimaan siswa baru.",
    primary: "Masuk Portal Kepala Sekolah",
    href: "/portal/login/kepala-sekolah",
  },
];

function PortalIcon({ portalId }: { portalId: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (portalId === "calon-siswa") {
    return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
  }
  if (portalId === "admin-sekolah") {
    return <svg {...common}><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>;
  }
  return <svg {...common}><path d="M4 20V5M4 20h17" /><path d="m7 15 4-4 3 2 6-7" /></svg>;
}

export default function PortalPage() {
  return (
    <main className="portal-page">
      <SiteHeader />
      <section className="portal-welcome">
        <span className="kicker">SMK CITRA NEGARA · TAHUN AJARAN 2026/2027</span>
        <h1>Selamat Datang di Portal SPMB 2026</h1>
        <p>Silakan pilih portal sesuai peran Anda untuk mengakses informasi dan layanan penerimaan siswa baru.</p>
        <div className="portal-grid">{portals.map((portal) => <article className={`portal-card ${portal.id === "calon-siswa" ? "portal-card-featured" : ""}`} id={portal.id} key={portal.id}>
          <div className="portal-card-top"><span className="portal-icon"><PortalIcon portalId={portal.id} /></span>{portal.badge && <span className="portal-badge">{portal.badge}</span>}</div>
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
