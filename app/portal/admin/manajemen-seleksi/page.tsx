import AdminSidebar from "../admin-sidebar";
import SelectionManagement from "../selection-management";
import LiveSelectionManagement from "../live-selection-management";

export default async function AdminSelectionPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return demo ? <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="selectionManagement" demo /><section className="admin-dashboard-main admin-selection-main" aria-label="Pratinjau seleksi"><SelectionManagement /></section></div></main> : <LiveSelectionManagement />;
}
