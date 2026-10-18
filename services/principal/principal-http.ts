import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { AdminApplicantInputError } from "../admin/admin-applicant-policy";

export function principalApplicantErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) return Response.json({ error: "Silakan masuk untuk melanjutkan." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (error instanceof AuthorizationDeniedError) return Response.json({ error: "Akses tidak diizinkan." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  if (error instanceof AdminApplicantInputError) return Response.json({ error: "Filter pendaftar tidak valid." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  return Response.json({ error: "Data pendaftar belum dapat dimuat." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
