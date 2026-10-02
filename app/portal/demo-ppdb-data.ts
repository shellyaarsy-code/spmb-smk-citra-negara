export const demoPpdbMetrics = {
  totalApplicants: 1240,
  completeDocuments: 982,
  verifiedApplicants: 640,
  admittedApplicants: 493,
  waitingList: 82,
  notQualified: 45,
  incompleteDocuments: 258,
  passRate: "89,5%",
} as const;

export const demoPpdbPrograms = [
  { code: "PPLG", name: "Pengembangan Perangkat Lunak dan Gim", count: 376, tone: "green" },
  { code: "TJKT", name: "Teknik Jaringan Komputer dan Telekomunikasi", count: 276, tone: "teal" },
  { code: "DKV", name: "Desain Komunikasi Visual", count: 260, tone: "mint" },
  { code: "MPLB", name: "Manajemen Perkantoran dan Layanan Bisnis", count: 176, tone: "blue" },
  { code: "BDR", name: "Bisnis Digital dan Ritel", count: 92, tone: "amber" },
  { code: "PHT", name: "Perhotelan", count: 60, tone: "violet" },
] as const;

export const demoPpdbWaves = {
  "Semua Gelombang": { applicants: 1240, complete: 982, verified: 640, admitted: 493, incomplete: 258, quota: 85 },
  "Gelombang 1": { applicants: 600, complete: 480, verified: 320, admitted: 240, incomplete: 120, quota: 74 },
  "Gelombang 2": { applicants: 400, complete: 320, verified: 200, admitted: 160, incomplete: 80, quota: 63 },
  "Gelombang 3": { applicants: 240, complete: 182, verified: 120, admitted: 93, incomplete: 58, quota: 52 },
} as const;

export function formatPpdbNumber(value: number) {
  return value.toLocaleString("id-ID");
}