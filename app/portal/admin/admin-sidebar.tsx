import AppSidebar, { type AppSidebarItem } from "../../components/app-sidebar";

export type AdminSection = "dashboard" | "registrations" | "verification" | "payments" | "bankQuestions" | "testManagement" | "tkaEligibility" | "selectionManagement" | "announcements" | "analytics";
type AdminSidebarProps = { active: AdminSection; demo: boolean };

export function AdminIcon({ name }: { name: "home" | "people" | "check" | "chart" | "settings" | "logout" | "search" | "arrow" | "filter" | "file" | "book" | "test" | "announce" | "analytics" | "bell" | "view" | "edit" }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 15a5 5 0 0 1 3.5 4.8" /></>,
    check: <><path d="M12 3 4.5 6v5.5c0 4.5 3.2 7.7 7.5 9.5 4.3-1.8 7.5-5 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>,
    chart: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 15v-3M12 15V8M16 15v-5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19 15 1.2 1-1.2 2-1.4-.5-1.7 1-0.2 1.5h-2.5L13 18.5h-2l-.2 1.5H8.5l-.3-1.5-1.5-1-1.3.5-1.2-2 1.2-1a6 6 0 0 1 0-2l-1.2-1 1.2-2 1.3.5 1.5-1 .3-1.5H11l.2 1.5h2l.2-1.5h2.5l.2 1.5 1.7 1 1.4-.5 1.2 2-1.2 1a6 6 0 0 1 0 2Z" /></>,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></>,
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
  const bankGroup = ["payments", "bankQuestions", "testManagement", "tkaEligibility", "selectionManagement", "announcements", "analytics"].includes(active);
  const href = (path: string) => demo ? path + "?mode=demo" : path;
  const items: AppSidebarItem[] = bankGroup ? [
    { label: "Dashboard Overview", href: href("/portal/admin"), icon: <AdminIcon name="home" />, active: false },
    { label: "Bank Soal TKA", href: href("/portal/admin/bank-soal-tka"), icon: <AdminIcon name="book" />, active: active === "bankQuestions" },
    { label: "Manajemen Tes", href: href("/portal/admin/manajemen-tes"), icon: <AdminIcon name="test" />, active: active === "testManagement" },
    { label: "Kelayakan TKA", href: "/portal/admin/kelayakan-tka", icon: <AdminIcon name="check" />, active: active === "tkaEligibility" },
    { label: "Manajemen Seleksi", href: href("/portal/admin/manajemen-seleksi"), icon: <AdminIcon name="people" />, active: active === "selectionManagement" },
    { label: "Pengumuman", href: href("/portal/admin/pengumuman"), icon: <AdminIcon name="bell" />, active: active === "announcements" },
    { label: "Laporan & Analitik", href: href("/portal/admin/laporan"), icon: <AdminIcon name="analytics" />, active: active === "analytics" },
    { label: "Pembayaran", href: "/portal/admin/pembayaran", icon: <AdminIcon name="check" />, active: active === "payments" },
  ] : [
    { label: "Dashboard", href: href("/portal/admin"), icon: <AdminIcon name="home" />, active: active === "dashboard" },
    { label: "Pendaftaran", href: href("/portal/admin/pendaftaran"), icon: <AdminIcon name="people" />, active: active === "registrations", badge: demo && <b>342</b> },
    { label: "Verifikasi Berkas", href: demo ? "/portal/admin/verifikasi-berkas/CN260012?mode=demo" : "/portal/admin/verifikasi-berkas", icon: <AdminIcon name="check" />, active: active === "verification", badge: demo && <b>24</b> },
    { label: "Seleksi Akademik", href: "#", icon: <AdminIcon name="chart" />, active: false, disabled: true },
    { label: "Pengaturan Sistem", href: "#", icon: <AdminIcon name="settings" />, active: false, disabled: true },
  ];
  const support = bankGroup ? <section className="admin-bank-support" aria-label="Bantuan sistem"><strong>Butuh Bantuan Sistem?</strong><p>Hubungi tim developer PPDB Negara jika mengalami kendala server.</p><span>☎ &nbsp;Ext. 102 (IT Support)</span></section> : <section className="admin-wave-card" aria-label="Status gelombang pendaftaran"><h2>Status Gelombang 1</h2>{demo ? <><div className="admin-wave-summary"><span>Kuota Terisi 74%</span><strong>370/500</strong></div><div className="admin-wave-track"><span style={{ width: "74%" }} /></div><p>Berakhir: 15 Maret 2026</p></> : <p>Data kuota akan tampil setelah pendaftar tersambung.</p>}</section>;
  return <AppSidebar sidebarClassName="admin-dashboard-sidebar" brandClassName="admin-dashboard-brand" brandMarkClassName="admin-dashboard-brand-mark" brandHref="/portal/login/admin" brandLabel="SPMB CITRA NEGARA" brandSubtitle={bankGroup ? "PORTAL ADMIN" : "ADMIN PANEL 2026/2027"} brandAriaLabel="SPMB SMK Citra Negara, kembali ke login admin" navClassName="admin-dashboard-nav" linkClassName="admin-dashboard-nav-link" navAriaLabel="Menu admin" items={items} support={support} logoutHref="/portal/login/admin" logoutLabel="Kembali ke Login" logoutIcon={<AdminIcon name="logout" />} logoutClassName="admin-dashboard-logout" />;
}