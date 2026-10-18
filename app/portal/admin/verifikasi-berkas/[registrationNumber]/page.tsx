import Link from "next/link";
import AdminSidebar from "../../admin-sidebar";
import ApplicantVerification from "../../applicant-verification";
import { findDemoApplicant } from "../../admin-applicant-data";
import LiveDocumentReview from "../../live-document-review";

export default async function ApplicantVerificationPage({ params, searchParams }: { params: Promise<{ registrationNumber: string }>; searchParams: Promise<{ mode?: string }> }) {
  const [{ registrationNumber }, { mode }] = await Promise.all([params, searchParams]);
  const demo = mode === "demo";
  const applicant = demo ? findDemoApplicant(registrationNumber) : undefined;

  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app">
    <AdminSidebar active="verification" demo={demo} />
    <section className="admin-dashboard-main admin-verification-main" aria-label="Verifikasi berkas calon siswa">
      {applicant ? <ApplicantVerification applicant={applicant} /> : demo ? <div className="admin-detail-not-found"><span className="admin-detail-not-found-icon">i</span><h1>Data pendaftar tidak ditemukan</h1><p>Nomor pendaftaran ini tidak tersedia dalam daftar simulasi.</p><Link className="button button-mini" href="/portal/admin/pendaftaran?mode=demo">Kembali ke Daftar Calon Siswa</Link></div> : <LiveDocumentReview registrationNumber={registrationNumber} />}
    </section>
  </div></main>;
}
