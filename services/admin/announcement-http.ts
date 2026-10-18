import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { AnnouncementConflictError, AnnouncementInputError, AnnouncementNotFoundError } from "./announcement-policy";

export async function readAnnouncementBody(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { throw new AnnouncementInputError(); }
}

export function announcementErrorResponse(error: unknown) {
  const status = error instanceof AuthenticationRequiredError ? 401
    : error instanceof AuthorizationDeniedError ? 403
      : error instanceof AnnouncementInputError ? 400
        : error instanceof AnnouncementNotFoundError ? 404
          : error instanceof AnnouncementConflictError ? 409 : 503;
  const message = status === 401 ? "Autentikasi diperlukan."
    : status === 403 ? "Akses ditolak."
      : status === 400 ? "Data pengumuman tidak valid."
        : status === 404 ? "Pengumuman tidak ditemukan."
          : status === 409 ? "Status pengumuman tidak mengizinkan tindakan ini."
            : "Pengumuman belum dapat diproses.";
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
