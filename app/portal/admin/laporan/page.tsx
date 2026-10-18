import AdminSidebar from "../admin-sidebar";
import AdmissionsAnalytics from "../admissions-analytics";
import LiveAdmissionsReport from "../live-admissions-report";

export default async function AdminAdmissionsAnalyticsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  return <main className="admin-dashboard-outer"><div className="admin-dashboard-app"><AdminSidebar active="analytics" demo={demo} /><section className="admin-dashboard-main admin-analytics-main" aria-label="Laporan dan analitik admisi">{demo ? <AdmissionsAnalytics /> : <LiveAdmissionsReport />}</section></div></main>;
}
