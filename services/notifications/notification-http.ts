import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { NotificationNotFoundError } from "./notification-service";

export function notificationErrorResponse(error: unknown) {
  const status = error instanceof AuthenticationRequiredError ? 401 : error instanceof AuthorizationDeniedError ? 403 : error instanceof NotificationNotFoundError ? 404 : 503;
  const message = status === 401 ? "Autentikasi diperlukan." : status === 403 ? "Akses ditolak." : status === 404 ? "Notifikasi tidak ditemukan." : "Notifikasi belum dapat diproses.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
