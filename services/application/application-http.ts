import "server-only";
import { AuthenticationRequiredError } from "../auth/sessions";
import { AuthorizationDeniedError } from "../auth/authorization";
import { StudentInputValidationError } from "../student/student-validation";
import { StudentDataConflictError, StudentRecordMissingError } from "../student/student-service";
import { ApplicationInputValidationError, ApplicationSubmissionRequirementsError, StudyProgramUnavailableError } from "./application-validation";
import {
  ApplicationSubmissionUnavailableError,
  DraftApplicationUnavailableError,
  DraftRegistrationNumberConflictError,
  RegistrationNumberGenerationError,
} from "./application-service";
import { InvalidApplicationTransitionError } from "./state-transition";

const noStore = { "Cache-Control": "no-store" };

export function applicationErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) {
    return Response.json({ error: "Autentikasi diperlukan." }, { status: 401, headers: noStore });
  }
  if (error instanceof AuthorizationDeniedError) {
    return Response.json({ error: "Akses ditolak." }, { status: 403, headers: noStore });
  }
  if (error instanceof StudentInputValidationError || error instanceof ApplicationInputValidationError) {
    return Response.json({ error: "Periksa kembali data yang dimasukkan." }, { status: 400, headers: noStore });
  }
  if (error instanceof ApplicationSubmissionRequirementsError) {
    return Response.json({ error: "Lengkapi semua kolom wajib dan setujui pernyataan sebelum mengirim formulir." }, { status: 400, headers: noStore });
  }
  if (error instanceof StudyProgramUnavailableError) {
    return Response.json({ error: "Salah satu program yang dipilih tidak tersedia." }, { status: 400, headers: noStore });
  }
  if (error instanceof StudentRecordMissingError) {
    return Response.json({ error: "Data siswa belum tersedia." }, { status: 409, headers: noStore });
  }
  if (error instanceof StudentDataConflictError) {
    return Response.json({ error: "Data bertentangan dengan catatan yang sudah ada." }, { status: 409, headers: noStore });
  }
  if (error instanceof DraftApplicationUnavailableError) {
    return Response.json({ error: "Draft aplikasi tidak lagi dapat diubah." }, { status: 409, headers: noStore });
  }
  if (error instanceof DraftRegistrationNumberConflictError) {
    return Response.json({ error: "Draft lama memerlukan pemeriksaan sebelum dapat digunakan." }, { status: 409, headers: noStore });
  }
  if (error instanceof ApplicationSubmissionUnavailableError || error instanceof InvalidApplicationTransitionError) {
    return Response.json({ error: "Aplikasi tidak dapat dikirim dari status saat ini." }, { status: 409, headers: noStore });
  }
  if (error instanceof RegistrationNumberGenerationError) {
    return Response.json({ error: "Nomor pendaftaran belum dapat diterbitkan. Coba kembali." }, { status: 503, headers: noStore });
  }
  return Response.json({ error: "Draft aplikasi belum dapat diproses." }, { status: 503, headers: noStore });
}
