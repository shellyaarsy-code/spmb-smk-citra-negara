import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { StudentInputValidationError } from "./student-validation";
import { StudentDataConflictError, StudentRecordMissingError } from "./student-service";

const noStore = { "Cache-Control": "no-store" };

export function studentErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) {
    return Response.json({ error: "Autentikasi diperlukan." }, { status: 401, headers: noStore });
  }
  if (error instanceof AuthorizationDeniedError) {
    return Response.json({ error: "Akses ditolak." }, { status: 403, headers: noStore });
  }
  if (error instanceof StudentInputValidationError) {
    return Response.json({ error: "Periksa kembali data yang dimasukkan." }, { status: 400, headers: noStore });
  }
  if (error instanceof StudentRecordMissingError) {
    return Response.json({ error: "Data siswa belum tersedia." }, { status: 409, headers: noStore });
  }
  if (error instanceof StudentDataConflictError) {
    return Response.json({ error: "Data bertentangan dengan catatan yang sudah ada." }, { status: 409, headers: noStore });
  }
  return Response.json({ error: "Data siswa belum dapat diproses." }, { status: 503, headers: noStore });
}
