import PrincipalStatistics from "../principal-statistics";

export default async function PrincipalStatisticsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <PrincipalStatistics demo={mode === "demo"} />;
}
