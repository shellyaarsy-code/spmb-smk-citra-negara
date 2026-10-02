import PrincipalReport from "../principal-report";

export default async function PrincipalReportPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <PrincipalReport demo={mode === "demo"} />;
}