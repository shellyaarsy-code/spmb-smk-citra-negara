import Link from "next/link";
import AuthLogoutLink from "../../components/auth-logout-link";
import BrandLogo from "../../components/brand-logo";

export type AdminSection = "dashboard" | "registrations" | "verification" | "payments" | "bankQuestions" | "testManagement" | "tkaEligibility" | "selectionManagement" | "announcements" | "analytics";

type AdminSidebarProps = { active: AdminSection; demo: boolean };

export function AdminIcon({ name }: { name: "home" | "people" | "check" | "chart" | "settings" | "logout" | "search" | "arrow" | "filter" | "file" | "book" | "test" | "announce" | "analytics" | "bell" | "view" | "edit" }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 15a5 5 0 0 1 3.5 4.8" /></>,
    check: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
    chart: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 15v-3M12 15V8M16 15v-5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.1.9-1.1 1.9-1.3-.5a7.8 7.8 0 0 1-1.6.9l-.2 1.4h-2.2L14 18.3a7.8 7.8 0 0 1-1.9 0l-.2 1.4H9.7l-.2-1.4a7.8 7.8 0 0 1-1.6-.9l-1.3.5-1.1-1.9 1.1-.9A7 7 0 0 1 6.5 13l-1.2-.6v-2.2l1.3-.3a7.8 7.8 0 0 1 .8-1.7l-.5-1.3 1.9-1.1.9 1.1a7 7 0 0 1 1.8-.2l.6-1.2h2.2l.3 1.3a7.8 7.8 0 0 1 1.7.8l1.3-.5 1.1 1.9-1.1.9a7 7 0 0 1 .2 1.8l1.2.6v2.2l-1.3.3a7.8 7.8 0 0 1-.4 1.2Z" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /></>,
    file: <><path d="M6 3.5h8l4 4V20H6z" /><path d="M14 3.5v5h5M9 13h6M9 16h6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 16.5A2.5 2.5 0 0 1 6.5 14H20M8 7h8M8 10h8" /></>,
    test: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M8 9h8M8 13h5M8 17h7" /></>,
    announce: <><path d="M4 13V9a2 2 0 0 1 2-2h3l8-3v14l-8-3H6a2 2 0 0 1-2-2Z" /><path d="m8 15 1.5 5h3L11 15M20 8v6" /></>,
    analytics: <><path d="M4 20V5M4 20h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    view: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    edit: <><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z" /><path d="m13.5 7 3.5 3.5" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function AdminSidebar({ active, demo }: AdminSidebarProps) {
  const dashboardHref = demo ? "/portal/admin?mode=demo" : "/portal/admin";
  const registrationHref = demo ? "/portal/admin/pendaftaran?mode=demo" : "/portal/admin/pendaftaran";
  const verificationHref = demo ? "/portal/admin/verifikasi-berkas/CN260012?mode=demo" : "/portal/admin/verifikasi-berkas";
  const paymentHref = demo ? "/portal/admin/pembayaran?mode=demo" : "/portal/admin/pembayaran";
  const bankHref = demo ? "/portal/admin/bank-soal-tka?mode=demo" : "/portal/admin/bank-soal-tka";
  const testHref = demo ? "/portal/admin/manajemen-tes?mode=demo" : "/portal/admin/manajemen-tes";
  const tkaEligibilityHref = demo ? "/portal/admin/kelayakan-tka?mode=demo" : "/portal/admin/kelayakan-tka";
  const selectionHref = demo ? "/portal/admin/manajemen-seleksi?mode=demo" : "/portal/admin/manajemen-seleksi";
  const announcementsHref = demo ? "/portal/admin/pengumuman?mode=demo" : "/portal/admin/pengumuman";
  const analyticsHref = demo ? "/portal/admin/laporan?mode=demo" : "/portal/admin/laporan";

  return (
    <aside className="admin-dashboard-sidebar">
      <Link className="admin-dashboard-brand" href="/portal/login/admin" aria-label="SPMB SMK Citra Negara, kembali ke login admin">
        <BrandLogo className="admin-dashboard-brand-mark" />
        <span>SPMB CITRA NEGARA<small>PORTAL ADMIN</small></span>
      </Link>

      <nav className="admin-dashboard-nav" aria-label="Menu admin">
                <Link className={`admin-dashboard-nav-link ${active === "dashboard" ? "active" : ""}`} href={dashboardHref} aria-current={active === "dashboard" ? "page" : undefined}><AdminIcon name="home" /><span>Dashboard</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "registrations" ? "active" : ""}`} href={registrationHref} aria-current={active === "registrations" ? "page" : undefined}><AdminIcon name="people" /><span>Pendaftaran</span>{demo && <b>342</b>}</Link>
        <Link className={`admin-dashboard-nav-link ${active === "verification" ? "active" : ""}`} href={verificationHref} aria-current={active === "verification" ? "page" : undefined}><AdminIcon name="check" /><span>Verifikasi Berkas</span>{demo && <b>24</b>}</Link>
        <Link className={`admin-dashboard-nav-link ${active === "bankQuestions" ? "active" : ""}`} href={bankHref} aria-current={active === "bankQuestions" ? "page" : undefined}><AdminIcon name="book" /><span>Bank Soal TKA</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "testManagement" ? "active" : ""}`} href={testHref} aria-current={active === "testManagement" ? "page" : undefined}><AdminIcon name="test" /><span>Manajemen Tes</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "tkaEligibility" ? "active" : ""}`} href={tkaEligibilityHref} aria-current={active === "tkaEligibility" ? "page" : undefined}><AdminIcon name="check" /><span>Kelayakan TKA</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "selectionManagement" ? "active" : ""}`} href={selectionHref} aria-current={active === "selectionManagement" ? "page" : undefined}><AdminIcon name="chart" /><span>Manajemen Seleksi</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "announcements" ? "active" : ""}`} href={announcementsHref} aria-current={active === "announcements" ? "page" : undefined}><AdminIcon name="bell" /><span>Pengumuman</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "analytics" ? "active" : ""}`} href={analyticsHref} aria-current={active === "analytics" ? "page" : undefined}><AdminIcon name="analytics" /><span>Laporan &amp; Analitik</span></Link>
        <Link className={`admin-dashboard-nav-link ${active === "payments" ? "active" : ""}`} href={paymentHref} aria-current={active === "payments" ? "page" : undefined}><AdminIcon name="settings" /><span>Pembayaran</span></Link>
      </nav>

      <section className="admin-bank-support" aria-label="Bantuan sistem"><strong>Butuh Bantuan Sistem?</strong><p>Hubungi tim developer PPDB Negara jika mengalami kendala server.</p><span>☎ &nbsp;Ext. 102 (IT Support)</span></section>

      <AuthLogoutLink className="admin-dashboard-logout" href="/portal/login/admin"><AdminIcon name="logout" /><span>Kembali ke Login</span></AuthLogoutLink>
    </aside>
  );
}
