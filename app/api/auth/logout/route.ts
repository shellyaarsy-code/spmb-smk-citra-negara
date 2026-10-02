import { logoutCurrentSession } from "../../../../services/auth/sessions";

export async function POST() {
  try {
    await logoutCurrentSession();
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Sesi belum dapat ditutup." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
