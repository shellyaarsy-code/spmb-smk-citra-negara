import PrincipalDashboard from "./principal-dashboard";

export default async function PrincipalDashboardPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <PrincipalDashboard demo={mode === "demo"} />;
}
