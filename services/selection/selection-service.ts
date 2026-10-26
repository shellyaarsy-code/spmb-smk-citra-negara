import "server-only";
import { ApplicationStatus, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { spmbPolicy } from "../../config/spmb-policy";
import { requireRole } from "../auth/authorization";
import { getCurrentStudentId } from "../student/student-service";
import { isSelectionReleaseEnabled } from "./selection-policy";

export { isSelectionReleaseEnabled } from "./selection-policy";

async function selectionReleaseEnabled() {
  const releaseAllowed = spmbPolicy.officialRulesApproved;
  if (!releaseAllowed) return false;
  return isSelectionReleaseEnabled(releaseAllowed, (await prisma.schoolSetting.findUnique({ where: { key: spmbPolicy.selectionResultsPublishedSettingKey }, select: { value: true } }))?.value);
}

export async function getCurrentPublishedSelectionResult() {
  await requireRole(RoleName.SISWA);
  if (!await selectionReleaseEnabled()) return { published: false, demoMode: spmbPolicy.demoMode, results: [] };
  const studentId = await getCurrentStudentId();
  const application = await prisma.application.findFirst({ where: { studentId, status: { not: ApplicationStatus.DRAFT } }, orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }], select: { id: true, registrationNumber: true } });
  if (!application) return { published: true, demoMode: spmbPolicy.demoMode, registrationNumber: null, results: [] };
  const results = await prisma.selection.findMany({ where: { applicationId: application.id, status: { not: "PENDING" } }, orderBy: { selectionRank: "asc" }, select: { selectionRank: true, status: true, studyProgram: { select: { code: true, name: true } } } });
  return { published: true, demoMode: spmbPolicy.demoMode, registrationNumber: application.registrationNumber, results };
}
