import Link from "next/link";
import AdminSidebar from "../../admin-sidebar";
import ApplicantVerification from "../../applicant-verification";
import { findDemoApplicant } from "../../admin-applicant-data";

export default async function ApplicantVerificationPage({ params, searchParams }: { params: Promise<{ registrationNumber: string }>; searchParams: Promise<{ mode?: string }> }) {
  const [{ registrationNumber }, { mode }] = await Promise.all([params, searchParams]);
  const demo = mode === "demo";
  const applicant = demo ? findDemoApplicant(registrationNumber) : undefined;

  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app">
    <AdminSidebar active="verification" demo={demo} />
    <section className="admin-dashboard-main admin-verification-main" aria-label="Verifikasi berkas calon siswa">
      {applicant ? <ApplicantVerification applicant={applicant} /> : <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>{demo ? "Data pendaftar tidak ditemukan" : "Verifikasi belum tersedia"}</h1><p>{demo ? "Nomor pendaftaran ini tidak tersedia dalam daftar simulasi." : "Pratinjau dokumen akan tersedia saat data pendaftaran terhubung."}</p><Link className="button button-mini" href={demo ? "/portal/admin/pendaftaran?mode=demo" : "/portal/admin/pendaftaran"}>Kembali ke Daftar Calon Siswa</Link></div>}
    </section>
  </div></main>;
}
