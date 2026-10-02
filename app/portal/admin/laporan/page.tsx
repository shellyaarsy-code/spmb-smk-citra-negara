import Link from "next/link";
import AdminSidebar from "../admin-sidebar";
import AdmissionsAnalytics from "../admissions-analytics";

export default async function AdminAdmissionsAnalyticsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="analytics" demo={demo} /><section className="admin-dashboard-main admin-analytics-main" aria-label="Laporan dan analitik admisi">{demo ? <AdmissionsAnalytics /> : <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Laporan belum tersedia</h1><p>Statistik admisi dan transaksi akan tampil saat data aplikasi terhubung.</p><Link className="button button-mini" href="/portal/admin/laporan?mode=demo">Buka pratinjau simulasi</Link></div>}</section></div></main>;
}
