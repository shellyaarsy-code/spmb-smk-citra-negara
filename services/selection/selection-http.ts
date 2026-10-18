import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { SelectionPolicyInputError } from "./selection-policy";

export async function readSelectionBody(request: Request) {
  try { return await request.json(); } catch { throw new SelectionPolicyInputError(); }
}

export function selectionErrorResponse(error: unknown) {
  const status = error instanceof AuthenticationRequiredError ? 401 : error instanceof AuthorizationDeniedError ? 403 : error instanceof SelectionPolicyInputError ? 400 : 503;
  const message = status === 401 ? "Autentikasi diperlukan." : status === 403 ? "Akses ditolak." : status === 400 ? "Konfigurasi belum valid atau hasil belum memenuhi syarat publikasi." : "Data seleksi belum dapat diproses.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
