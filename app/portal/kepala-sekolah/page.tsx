import PrincipalDashboard from "./principal-dashboard";
import { getPrincipalDashboardSummary } from "../../../services/admin/dashboard-service";

export default async function PrincipalDashboardPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  let summary: Awaited<ReturnType<typeof getPrincipalDashboardSummary>> | null = null;
  if (!demo) {
    try { summary = await getPrincipalDashboardSummary(); }
    catch { summary = null; }
  }
  return <PrincipalDashboard demo={demo} summary={summary} />;
}
