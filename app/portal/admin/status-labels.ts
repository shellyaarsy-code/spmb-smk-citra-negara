export const applicationStatusOrder = [
  "DRAFT",
  "SUBMITTED",
  "WAITING_DOCUMENT_VERIFICATION",
  "DOCUMENT_REVISION_REQUIRED",
  "DOCUMENT_VERIFIED",
  "WAITING_PAYMENT",
  "PAYMENT_VERIFIED",
  "ELIGIBLE_FOR_TKA",
  "TKA_STARTED",
  "TKA_COMPLETED",
  "WAITING_SELECTION",
  "PASSED",
  "WAITLISTED",
  "FAILED",
  "REJECTED",
  "CANCELLED",
  "WITHDRAWN",
] as const;

const applicationStatusLabels: Record<string, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Dikirim",
  WAITING_DOCUMENT_VERIFICATION: "Menunggu Verifikasi Dokumen",
  DOCUMENT_REVISION_REQUIRED: "Perlu Revisi Dokumen",
  DOCUMENT_VERIFIED: "Dokumen Terverifikasi",
  WAITING_PAYMENT: "Menunggu Pembayaran",
  PAYMENT_VERIFIED: "Pembayaran Terverifikasi",
  ELIGIBLE_FOR_TKA: "Berhak Ikut TKA",
  TKA_STARTED: "TKA Berlangsung",
  TKA_COMPLETED: "TKA Selesai",
  WAITING_SELECTION: "Menunggu Seleksi",
  PASSED: "Lulus",
  WAITLISTED: "Daftar Tunggu",
  FAILED: "Tidak Lulus",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
  WITHDRAWN: "Mengundurkan Diri",
};

export function getApplicationStatusLabel(status: string): string {
  return applicationStatusLabels[status] ?? status;
}

export function getApplicationStatusTone(status: string): "success" | "danger" | "warning" | "info" {
  if (["PASSED", "DOCUMENT_VERIFIED", "PAYMENT_VERIFIED"].includes(status)) return "success";
  if (["FAILED", "REJECTED"].includes(status)) return "danger";
  if (["WAITING_DOCUMENT_VERIFICATION", "DOCUMENT_REVISION_REQUIRED", "WAITING_PAYMENT", "WAITING_SELECTION", "WAITLISTED"].includes(status)) return "warning";
  return "info";
}
