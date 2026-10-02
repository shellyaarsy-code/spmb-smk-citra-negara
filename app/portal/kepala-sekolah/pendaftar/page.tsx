import PrincipalRegistrants from "../principal-registrants";

export default async function PrincipalRegistrantsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <PrincipalRegistrants demo={mode === "demo"} />;
}
