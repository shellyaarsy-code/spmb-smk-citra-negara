import Link from "next/link";
import AdminSidebar from "../admin-sidebar";
import SelectionManagement from "../selection-management";

export default async function AdminSelectionPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="selectionManagement" demo={demo} /><section className="admin-dashboard-main admin-selection-main" aria-label="Manajemen seleksi siswa">{demo ? <SelectionManagement /> : <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Data seleksi belum tersedia</h1><p>Parameter seleksi dan peringkat calon siswa akan tampil saat modul seleksi terhubung ke data aplikasi.</p><Link className="button button-mini" href="/portal/admin/manajemen-seleksi?mode=demo">Buka pratinjau simulasi</Link></div>}</section></div></main>;
}
