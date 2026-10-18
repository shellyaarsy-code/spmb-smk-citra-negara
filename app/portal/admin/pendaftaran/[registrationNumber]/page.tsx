import Link from "next/link";
import AdminSidebar from "../../admin-sidebar";
import ApplicantDetail from "../../applicant-detail";
import { findDemoApplicant } from "../../admin-applicant-data";
import LiveApplicantDetail from "../../live-applicant-detail";

export default async function AdminApplicantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ registrationNumber: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ registrationNumber }, { mode }] = await Promise.all([params, searchParams]);
  const demo = mode === "demo";
  const applicant = demo ? findDemoApplicant(registrationNumber) : undefined;

  return (
    <main className="admin-dashboard-outer">
      <div className="admin-dashboard-app">
        <AdminSidebar active="registrations" demo={demo} />
        <section className="admin-dashboard-main admin-applicant-detail-page" aria-label="Detail calon siswa">
          {applicant ? <ApplicantDetail applicant={applicant} demo={demo} /> : demo ? (
            <div className="admin-detail-not-found">
              <span className="admin-detail-not-found-icon"><span aria-hidden="true">i</span></span>
              <h1>Data pendaftar tidak ditemukan</h1>
              <p>Nomor pendaftaran ini tidak tersedia dalam daftar simulasi.</p>
              <Link className="button button-mini" href="/portal/admin/pendaftaran?mode=demo">Kembali ke Daftar Calon Siswa</Link>
            </div>
          ) : <LiveApplicantDetail registrationNumber={registrationNumber} />}
        </section>
      </div>
    </main>
  );
}
