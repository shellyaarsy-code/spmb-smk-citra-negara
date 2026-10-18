export function documentErrorDetails(errorName: string) {
  if (errorName === "AuthenticationRequiredError") return { status: 401, message: "Autentikasi diperlukan." };
  if (errorName === "AuthorizationDeniedError") return { status: 403, message: "Akses ditolak." };
  if (errorName === "DocumentInputError") return { status: 400, message: "Periksa tipe dan file dokumen." };
  if (errorName === "DocumentNotFoundError") return { status: 404, message: "Dokumen tidak ditemukan." };
  return { status: 503, message: "Layanan dokumen belum tersedia atau gagal memproses permintaan." };
}
