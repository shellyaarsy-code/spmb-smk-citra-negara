import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { PaymentInputError, PaymentUnavailableError } from "./payment-policy";
import { DocumentInputError } from "../documents/document-validation";

export function paymentErrorResponse(error: unknown) {
  const status = error instanceof AuthenticationRequiredError ? 401 : error instanceof AuthorizationDeniedError ? 403 : error instanceof DocumentInputError || error instanceof PaymentInputError ? 400 : error instanceof PaymentUnavailableError ? 409 : 503;
  const message = status === 401 ? "Autentikasi diperlukan." : status === 403 ? "Akses ditolak." : status === 400 ? "File atau konfigurasi pembayaran tidak valid." : status === 409 ? "Pembayaran belum siap diproses atau sudah berubah status." : "Pembayaran belum dapat diproses.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
