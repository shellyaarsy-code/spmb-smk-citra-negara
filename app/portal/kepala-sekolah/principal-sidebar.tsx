import AppSidebar, { type AppSidebarItem } from "../../components/app-sidebar";

type PrincipalSection = "dashboard" | "registrants" | "testResults" | "results" | "statistics" | "reports";
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

export default function PrincipalSidebar({ active, demo }: { active: PrincipalSection; demo: boolean }) {
  const suffix = demo ? "?mode=demo" : "";
  const links: AppSidebarItem[] = [
    { label: "Monitoring Dashboard", href: "/portal/kepala-sekolah" + suffix, icon: <PrincipalIcon name="grid" />, active: active === "dashboard" },
    { label: "Data Pendaftar (Siswa)", href: "/portal/kepala-sekolah/pendaftar" + suffix, icon: <PrincipalIcon name="users" />, active: active === "registrants" },
    { label: "Hasil Tes Akademik", href: "/portal/kepala-sekolah/hasil-tes" + suffix, icon: <PrincipalIcon name="cap" />, active: active === "testResults" },
    { label: "Hasil Seleksi", href: "/portal/kepala-sekolah/hasil-seleksi" + suffix, icon: <PrincipalIcon name="cap" />, active: active === "results" },
    { label: "Statistik PPDB", href: "/portal/kepala-sekolah/statistik" + suffix, icon: <PrincipalIcon name="chart" />, active: active === "statistics" },
    { label: "Laporan Eksekutif", href: "/portal/kepala-sekolah/laporan" + suffix, icon: <PrincipalIcon name="file" />, active: active === "reports" },
  ];
  const beforeNav = <><div className="principal-dashboard-profile"><i>K</i><span><strong>Kepala Sekolah</strong><small>KEPALA SEKOLAH</small></span></div></>;
  const support = <><div className="principal-dashboard-school-year"><strong>Tahun Pelajaran</strong><span>2026/2027</span><small>Monitoring penerimaan siswa</small></div><div className="principal-dashboard-access"><strong><PrincipalIcon name="shield" /> HAK AKSES: READ-ONLY</strong><p>Data monitoring tidak dapat diubah.</p><a className="principal-dashboard-demo-toggle" href={demo ? "/portal/kepala-sekolah" : "/portal/kepala-sekolah?mode=demo"}>{demo ? "Kembali ke Data Tersimpan" : "Buka Dashboard Simulasi"}</a></div></>;
  return <AppSidebar sidebarClassName="principal-dashboard-sidebar" brandClassName="principal-dashboard-brand" brandMarkClassName="principal-dashboard-brand-mark" brandHref={"/portal/kepala-sekolah" + suffix} brandLabel="SMK CITRA NEGARA" brandSubtitle="PORTAL PPDB" brandAriaLabel="SMK Citra Negara, dashboard Kepala Sekolah" navClassName="principal-dashboard-nav" linkClassName="" navAriaLabel="Menu Kepala Sekolah" items={links} beforeNav={beforeNav} support={support} logoutHref="/portal/login/kepala-sekolah" logoutLabel="Keluar Sistem" logoutIcon={<PrincipalIcon name="logout" />} logoutClassName="principal-dashboard-logout" logoWidth={34} />;
}