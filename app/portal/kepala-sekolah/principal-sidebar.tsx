import Link from "next/link";
import AuthLogoutLink from "../../components/auth-logout-link";

type PrincipalIconName = "grid" | "users" | "cap" | "chart" | "file" | "shield" | "logout";

function PrincipalIcon({ name }: { name: PrincipalIconName }) {
  const paths = {
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.8M17 15a5 5 0 0 1 4 5" /></>,
    cap: <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c3.5 3 8.5 3 12 0v-5M22 9v6" /></>,
    chart: <><path d="M4 20V5M4 20h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    file: <><path d="M6 3.5h8l4 4V20H6z" /><path d="M14 3.5v5h5M9 13h6M9 16h6" /></>,
    shield: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function PrincipalSidebar({ active, demo }: { active: "dashboard" | "registrants" | "testResults" | "results" | "statistics" | "reports"; demo: boolean }) {
  const dashboardHref = demo ? "/portal/kepala-sekolah?mode=demo" : "/portal/kepala-sekolah";
  const registrantsHref = demo ? "/portal/kepala-sekolah/pendaftar?mode=demo" : "/portal/kepala-sekolah/pendaftar";
  const resultsHref = demo ? "/portal/kepala-sekolah/hasil-seleksi?mode=demo" : "/portal/kepala-sekolah/hasil-seleksi";
  const testResultsHref = demo ? "/portal/kepala-sekolah/hasil-tes?mode=demo" : "/portal/kepala-sekolah/hasil-tes";
  const statisticsHref = demo ? "/portal/kepala-sekolah/statistik?mode=demo" : "/portal/kepala-sekolah/statistik";
  const reportsHref = demo ? "/portal/kepala-sekolah/laporan?mode=demo" : "/portal/kepala-sekolah/laporan";
  return <aside className="principal-dashboard-sidebar">
    <Link className="principal-dashboard-brand" href={dashboardHref}><b>CN</b><span>SMK CITRA NEGARA<small>PORTAL PPDB</small></span></Link>
    <div className="principal-dashboard-profile"><i>M</i><span><strong>Drs. H. Mulyadi, M.Pd.</strong><small>KEPALA SEKOLAH</small></span></div>
    <nav className="principal-dashboard-nav" aria-label="Menu Kepala Sekolah">
      <Link className={active === "dashboard" ? "active" : ""} href={dashboardHref} aria-current={active === "dashboard" ? "page" : undefined}><PrincipalIcon name="grid" />Monitoring Dashboard</Link>
      <Link className={active === "registrants" ? "active" : ""} href={registrantsHref} aria-current={active === "registrants" ? "page" : undefined}><PrincipalIcon name="users" />Data Pendaftar (Siswa)</Link>
      <Link className={active === "testResults" ? "active" : ""} href={testResultsHref} aria-current={active === "testResults" ? "page" : undefined}><PrincipalIcon name="cap" />Hasil Tes Akademik</Link>
      <Link className={active === "results" ? "active" : ""} href={resultsHref} aria-current={active === "results" ? "page" : undefined}><PrincipalIcon name="cap" />Hasil Seleksi</Link>
      <Link className={active === "statistics" ? "active" : ""} href={statisticsHref} aria-current={active === "statistics" ? "page" : undefined}><PrincipalIcon name="chart" />Statistik PPDB</Link>
      <Link className={active === "reports" ? "active" : ""} href={reportsHref} aria-current={active === "reports" ? "page" : undefined}><PrincipalIcon name="file" />Laporan Eksekutif</Link>
    </nav>
    <div className="principal-dashboard-school-year"><strong>Tahun Pelajaran</strong><span>2026/2027</span><small>Monitoring penerimaan siswa</small></div>
    <div className="principal-dashboard-access"><strong><PrincipalIcon name="shield" /> HAK AKSES: READ-ONLY</strong><p>Data monitoring tidak dapat diubah.</p></div>
    <AuthLogoutLink className="principal-dashboard-logout" href="/portal/login/kepala-sekolah"><PrincipalIcon name="logout" />Keluar Sistem</AuthLogoutLink>
  </aside>;
}
