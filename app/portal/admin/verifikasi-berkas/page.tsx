import Link from "next/link";
import AdminSidebar from "../admin-sidebar";

export default async function AdminVerificationIndexPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="verification" demo={demo} /><section className="admin-dashboard-main admin-verification-main"><header className="admin-dashboard-header"><div className="admin-dashboard-heading"><h1>Verifikasi Berkas</h1><p>Tinjau kelengkapan dokumen calon siswa.</p></div></header><div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Belum ada pendaftar yang dipilih</h1><p>Pilih calon siswa dari daftar pendaftaran untuk melihat dan memeriksa dokumen mereka.</p><Link className="button button-mini" href={demo ? "/portal/admin/pendaftaran?mode=demo" : "/portal/admin/pendaftaran"}>Buka Daftar Pendaftar</Link></div></section></div></main>;
}
