import Link from "next/link";
import AdminSidebar from "../admin-sidebar";
import TestManagement from "../test-management";

export default async function TestManagementPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="testManagement" demo={demo} /><section className="admin-dashboard-main admin-test-management-main" aria-label="Manajemen jadwal dan sesi tes">{demo ? <TestManagement /> : <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Jadwal tes belum tersedia</h1><p>Informasi jadwal akan tampil saat manajemen tes terhubung ke data aplikasi.</p><Link className="button button-mini" href="/portal/admin/manajemen-tes?mode=demo">Buka pratinjau simulasi</Link></div>}</section></div></main>;
}
