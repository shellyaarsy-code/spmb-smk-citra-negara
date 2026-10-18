import PrincipalTestResults from "../principal-test-results";
import { getPrincipalTkaOverview } from "../../../../services/principal/principal-service";

export default async function PrincipalTestResultsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  let overview: Awaited<ReturnType<typeof getPrincipalTkaOverview>> | null = null;
  if (!demo) { try { overview = await getPrincipalTkaOverview(); } catch { overview = null; } }
  return <PrincipalTestResults demo={demo} overview={overview} />;
}
