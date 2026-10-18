import PrincipalResults from "../principal-results";
import { getPrincipalSelectionOverview } from "../../../../services/principal/principal-service";

export default async function PrincipalResultsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const demo = mode === "demo";
  let overview: Awaited<ReturnType<typeof getPrincipalSelectionOverview>> | null = null;
  if (!demo) { try { overview = await getPrincipalSelectionOverview(); } catch { overview = null; } }
  return <PrincipalResults demo={demo} overview={overview} />;
}
