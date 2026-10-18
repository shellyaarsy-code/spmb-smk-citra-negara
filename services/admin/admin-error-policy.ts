export function adminApplicantErrorDetails(errorName: string) {
  if (errorName === "AuthenticationRequiredError") return { status: 401, message: "Autentikasi diperlukan." };
  if (errorName === "AuthorizationDeniedError") return { status: 403, message: "Akses ditolak." };
  if (errorName === "AdminApplicantInputError") return { status: 400, message: "Filter daftar tidak valid." };
  if (errorName === "AdminApplicantNotFoundError") return { status: 404, message: "Pendaftar tidak ditemukan." };
  return { status: 503, message: "Data pendaftar belum dapat dimuat." };
}
