import LiveTkaManagement from "../live-tka-management";

export default async function TestManagementPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  if (mode === "demo") {
    const { default: AdminSidebar } = await import("../admin-sidebar");
    const { default: TestManagement } = await import("../test-management");
    return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="testManagement" demo /><section className="admin-dashboard-main admin-test-management-main" aria-label="Pratinjau manajemen tes"><TestManagement /></section></div></main>;
  }
  return <LiveTkaManagement section="schedules" />;
}
