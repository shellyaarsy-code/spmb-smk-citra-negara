import Link from "next/link";
import AdminSidebar from "../../admin-sidebar";
import ApplicantDetail from "../../applicant-detail";
import { findDemoApplicant } from "../../admin-applicant-data";

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
          {applicant ? <ApplicantDetail applicant={applicant} demo={demo} /> : (
            <div className="admin-detail-not-found">
              <span className="admin-detail-not-found-icon"><span aria-hidden="true">i</span></span>
              <h1>{demo ? "Data pendaftar tidak ditemukan" : "Detail belum tersedia"}</h1>
              <p>{demo ? "Nomor pendaftaran ini tidak tersedia dalam daftar simulasi." : "Detail calon siswa akan tampil saat data pendaftaran tersedia."}</p>
              <Link className="button button-mini" href={demo ? "/portal/admin/pendaftaran?mode=demo" : "/portal/admin/pendaftaran"}>Kembali ke Daftar Calon Siswa</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
