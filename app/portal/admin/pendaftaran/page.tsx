import AdminSidebar from "../admin-sidebar";
import RegistrationsTable from "../registrations-table";
import LiveRegistrationsTable from "../live-registrations-table";

export default async function AdminRegistrationsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";

  return (
    <main className="admin-dashboard-outer">
      <div className="admin-dashboard-app">
        <AdminSidebar active="registrations" demo={demo} />
        <section className="admin-dashboard-main admin-registrations-main" aria-label="Daftar pendaftaran siswa">
          {demo ? <RegistrationsTable demo /> : <LiveRegistrationsTable />}
        </section>
      </div>
    </main>
  );
}
