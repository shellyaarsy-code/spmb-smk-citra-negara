import PrincipalRegistrants from "../principal-registrants";
import LivePrincipalRegistrants from "../live-principal-registrants";

export default async function PrincipalRegistrantsPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return mode === "demo" ? <PrincipalRegistrants demo /> : <LivePrincipalRegistrants />;
}
