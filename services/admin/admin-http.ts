import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { AdminApplicantInputError, AdminApplicantNotFoundError } from "./application-service";
import { adminApplicantErrorDetails } from "./admin-error-policy";

const headers = { "Cache-Control": "no-store" };
export function adminApplicantErrorResponse(error: unknown) {
  const details = error instanceof AuthenticationRequiredError || error instanceof AuthorizationDeniedError || error instanceof AdminApplicantInputError || error instanceof AdminApplicantNotFoundError
    ? adminApplicantErrorDetails(error.name)
    : adminApplicantErrorDetails(error instanceof Error ? error.name : "");
  return Response.json({ error: details.message }, { status: details.status, headers });
}

export function adminSummaryErrorResponse(error: unknown) {
  const details = error instanceof AuthenticationRequiredError || error instanceof AuthorizationDeniedError
    ? adminApplicantErrorDetails(error.name)
    : { status: 503, message: "Ringkasan admin belum dapat dimuat." };
  return Response.json({ error: details.message }, { status: details.status, headers });
}
