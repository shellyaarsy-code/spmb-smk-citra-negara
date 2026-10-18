import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { TkaConflictError, TkaInputError, TkaUnavailableError } from "./tka-policy";

export async function readTkaBody(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { throw new TkaInputError(); }
}

export function tkaErrorResponse(error: unknown) {
  const status = error instanceof AuthenticationRequiredError ? 401
    : error instanceof AuthorizationDeniedError ? 403
      : error instanceof TkaInputError ? 400
        : error instanceof TkaUnavailableError ? 404
          : error instanceof TkaConflictError ? 409 : 503;
  const message = status === 401 ? "Autentikasi diperlukan."
    : status === 403 ? "Akses ditolak."
      : status === 400 ? "Data jawaban tidak valid."
        : status === 404 ? "Sesi TKA tidak tersedia."
          : status === 409 ? "Sesi TKA tidak dapat diproses pada status saat ini."
            : "Sesi TKA belum dapat diproses.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
