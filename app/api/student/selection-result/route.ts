import { getCurrentPublishedSelectionResult } from "../../../../services/selection/selection-service";
import { AuthenticationRequiredError } from "../../../../services/auth/sessions";
import { AuthorizationDeniedError } from "../../../../services/auth/authorization";

export async function GET() {
  try { return Response.json(await getCurrentPublishedSelectionResult(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    const status = error instanceof AuthenticationRequiredError ? 401 : error instanceof AuthorizationDeniedError ? 403 : 503;
    return Response.json({ error: status === 401 ? "Autentikasi diperlukan." : status === 403 ? "Akses ditolak." : "Hasil seleksi belum dapat dimuat." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
