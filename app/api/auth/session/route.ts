import { getCurrentUser } from "../../../../services/auth/sessions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ user: null }, { status: 401, headers: { "Cache-Control": "no-store" } });
    return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Sesi belum dapat diperiksa." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
