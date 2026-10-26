/**
 * Synthetic, display-only SPMB analytics for authenticated Preview demo pages.
 * These figures are not official school records and are never written to the database.
 */
export const demoPpdbMetrics = {
  totalApplicants: 1240,
  completeDocuments: 982,
  verifiedApplicants: 640,
  admittedApplicants: 493,
  waitingList: 82,
  notQualified: 45,
  incompleteDocuments: 258,
  pendingSelection: 20,
  totalDecisions: 620,
  passRate: "79,5%",
} as const;

export const demoPpdbPrograms = [
  { code: "PPLG", name: "Pengembangan Perangkat Lunak dan Gim", count: 376, tone: "green", quotaColor: "forest", capacity: 160, admitted: 140 },
  { code: "TJKT", name: "Teknik Jaringan Komputer dan Telekomunikasi", count: 276, tone: "teal", quotaColor: "teal", capacity: 120, admitted: 110 },
  { code: "DKV", name: "Desain Komunikasi Visual", count: 260, tone: "mint", quotaColor: "blue", capacity: 120, admitted: 105 },
  { code: "MPLB", name: "Manajemen Perkantoran dan Layanan Bisnis", count: 176, tone: "blue", quotaColor: "amber", capacity: 84, admitted: 68 },
  { code: "BDR", name: "Bisnis Digital dan Ritel", count: 92, tone: "amber", quotaColor: "violet", capacity: 72, admitted: 45 },
  { code: "PHT", name: "Perhotelan", count: 60, tone: "violet", quotaColor: "pink", capacity: 40, admitted: 25 },
] as const;

export const demoPpdbWaves = {
  "Semua Gelombang": { applicants: 1240, complete: 982, verified: 640, admitted: 493, incomplete: 258, quota: 85 },
  "Gelombang 1": { applicants: 600, complete: 480, verified: 320, admitted: 240, incomplete: 120, quota: 74 },
  "Gelombang 2": { applicants: 400, complete: 320, verified: 200, admitted: 160, incomplete: 80, quota: 63 },
  "Gelombang 3": { applicants: 240, complete: 182, verified: 120, admitted: 93, incomplete: 58, quota: 52 },
} as const;

/** New applications and cumulative applicant count across the same seven-week demo period. */
export const demoPpdbWeekly = [
  { label: "Minggu 1", newApplicants: 85, cumulativeApplicants: 85 },
  { label: "Minggu 2", newApplicants: 115, cumulativeApplicants: 200 },
  { label: "Minggu 3", newApplicants: 145, cumulativeApplicants: 345 },
  { label: "Minggu 4", newApplicants: 180, cumulativeApplicants: 525 },
  { label: "Minggu 5", newApplicants: 220, cumulativeApplicants: 745 },
  { label: "Minggu 6", newApplicants: 245, cumulativeApplicants: 990 },
  { label: "Minggu 7", newApplicants: 250, cumulativeApplicants: 1240 },
] as const;

/** Top school origins among the 640 applicants who passed document verification. */
export const demoPpdbSchoolOrigins = [
  { name: "SMP Negeri 1 Depok", students: 142, percent: "22,2%" },
  { name: "SMP Negeri 2 Depok", students: 98, percent: "15,3%" },
  { name: "SMP Negeri 4 Depok", students: 84, percent: "13,1%" },
  { name: "MTs Negeri Depok", students: 62, percent: "9,7%" },
  { name: "SMP Citra Bangsa", students: 48, percent: "7,5%" },
] as const;

export const demoPpdbOtherSchoolApplicants = 206;
export const demoPpdbOtherSchoolShare = "32,2%";

/** Synthetic origin distribution over all 1,240 demo applicants. Counts sum to the demo total. */
export const demoPpdbRegions = [
  { name: "Kota Depok", applicants: 843, share: "68%" },
  { name: "Kabupaten Bogor", applicants: 248, share: "20%" },
  { name: "Jakarta Selatan", applicants: 74, share: "6%" },
  { name: "Tangerang Selatan", applicants: 50, share: "4%" },
  { name: "Bekasi", applicants: 25, share: "2%" },
] as const;

export const demoPpdbSelectionSummary = {
  passed: demoPpdbMetrics.admittedApplicants,
  waitlisted: demoPpdbMetrics.waitingList,
  failed: demoPpdbMetrics.notQualified,
  pending: demoPpdbMetrics.pendingSelection,
  totalDecisions: demoPpdbMetrics.totalDecisions,
  passRate: demoPpdbMetrics.passRate,
} as const;

export function formatPpdbNumber(value: number) {
  return value.toLocaleString("id-ID");
}
