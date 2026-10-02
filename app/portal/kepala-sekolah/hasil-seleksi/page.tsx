import PrincipalResults from "../principal-results";

export default async function PrincipalResultsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <PrincipalResults demo={mode === "demo"} />;
}
