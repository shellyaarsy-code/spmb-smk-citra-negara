import Link from "next/link";
import AdminSidebar from "../admin-sidebar";
import AnnouncementManager from "../announcement-manager";

export default async function AnnouncementPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="announcements" demo={demo} /><section className="admin-dashboard-main admin-announcement-main" aria-label="Kelola pengumuman">{demo ? <AnnouncementManager /> : <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Pengumuman belum tersedia</h1><p>Konten dan riwayat rilis pengumuman akan tampil setelah modul ini terhubung ke data aplikasi.</p><Link className="button button-mini" href="/portal/admin/pengumuman?mode=demo">Buka pratinjau simulasi</Link></div>}</section></div></main>;
}
