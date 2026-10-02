import PrincipalTestResults from "../principal-test-results";

export default async function PrincipalTestResultsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <PrincipalTestResults demo={mode === "demo"} />;
}
