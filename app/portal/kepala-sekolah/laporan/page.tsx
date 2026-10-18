import PrincipalReport from "../principal-report";
import LivePrincipalReport from "../live-principal-report";
import { getPrincipalDashboardSummary } from "../../../../services/admin/dashboard-service";

export default async function PrincipalReportPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  let report: Awaited<ReturnType<typeof getPrincipalDashboardSummary>> | null = null;
  if (!demo) {
    try { report = await getPrincipalDashboardSummary(); }
    catch { report = null; }
  }
  return demo ? <PrincipalReport demo /> : <LivePrincipalReport report={report} />;
}
