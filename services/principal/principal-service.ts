import "server-only";
import { RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { spmbPolicy } from "../../config/spmb-policy";
import { requireRole } from "../auth/authorization";
import { parseAdminApplicantFilters, buildAdminApplicantWhere, buildAdminApplicantPage } from "../admin/admin-applicant-policy";
import { isSelectionReleaseEnabled } from "../selection/selection-policy";

export async function listPrincipalApplicants(params: URLSearchParams) {
  await requireRole(RoleName.KEPALA_SEKOLAH);
  const filters = parseAdminApplicantFilters(params);
  const where = buildAdminApplicantWhere(filters);
  const [total, rows, programs] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: {
        registrationNumber: true, status: true, submittedAt: true, createdAt: true,
        student: { select: { profile: { select: { fullName: true, schoolOrigin: true } } } },
        programChoices: { orderBy: { priority: "asc" }, select: { priority: true, studyProgram: { select: { code: true, name: true } } } },
      },
    }),
    prisma.studyProgram.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { code: true, name: true } }),
  ]);
  return buildAdminApplicantPage({
    applicants: rows.map((row) => ({ registrationNumber: row.registrationNumber, status: row.status, submittedAt: row.submittedAt ?? row.createdAt, name: row.student.profile?.fullName ?? null, school: row.student.profile?.schoolOrigin ?? null, programs: row.programChoices.map((choice) => ({ priority: choice.priority, code: choice.studyProgram.code, name: choice.studyProgram.name })) })),
    total, page: filters.page, pageSize: filters.pageSize, programs,
  });
}

export async function getPrincipalSelectionOverview() {
  await requireRole(RoleName.KEPALA_SEKOLAH);
  const releaseAllowed = spmbPolicy.officialRulesApproved;
  if (!releaseAllowed) return { published: false, demoMode: spmbPolicy.demoMode, results: [], counts: { passed: 0, waitlisted: 0, failed: 0 }, programs: [] };
  const release = await prisma.schoolSetting.findUnique({ where: { key: spmbPolicy.selectionResultsPublishedSettingKey }, select: { value: true } });
  if (!isSelectionReleaseEnabled(releaseAllowed, release?.value)) return { published: false, demoMode: spmbPolicy.demoMode, results: [], counts: { passed: 0, waitlisted: 0, failed: 0 }, programs: [] };
  const [groups, results, programs] = await Promise.all([
    prisma.selection.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.selection.findMany({ where: { status: { not: "PENDING" } }, orderBy: [{ studyProgramId: "asc" }, { selectionRank: "asc" }], take: 500, select: { status: true, selectionRank: true, application: { select: { registrationNumber: true, student: { select: { profile: { select: { fullName: true } } } } } }, studyProgram: { select: { code: true, name: true } } } }),
    prisma.studyProgram.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { code: true, name: true, capacity: true, selections: { where: { status: "PASSED" }, select: { id: true } } } }),
  ]);
  const byStatus = new Map(groups.map((group) => [group.status, group._count._all]));
  return {
    published: true,
    demoMode: spmbPolicy.demoMode,
    counts: { passed: byStatus.get("PASSED") ?? 0, waitlisted: byStatus.get("WAITLISTED") ?? 0, failed: byStatus.get("FAILED") ?? 0 },
    programs: programs.map((program) => ({ code: program.code, name: program.name, capacity: program.capacity, passed: program.selections.length })),
    results: results.map((result) => ({ registrationNumber: result.application.registrationNumber, name: result.application.student.profile?.fullName ?? null, program: result.studyProgram.code, programName: result.studyProgram.name, rank: result.selectionRank, status: result.status })),
  };
}

export async function getPrincipalTkaOverview() {
  await requireRole(RoleName.KEPALA_SEKOLAH);
  const [attemptGroups, published, scores] = await Promise.all([
    prisma.tkaAttempt.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.tkaResult.count({ where: { publishedAt: { not: null }, attempt: { status: "COMPLETED" } } }),
    prisma.tkaResult.findMany({ where: { publishedAt: { not: null }, attempt: { status: "COMPLETED" } }, orderBy: [{ totalScore: "desc" }, { publishedAt: "desc" }], take: 200, select: { id: true, totalScore: true, publishedAt: true, application: { select: { registrationNumber: true, student: { select: { profile: { select: { fullName: true } } } } }, }, attempt: { select: { schedule: { select: { tkaTest: { select: { name: true } } } } } } } }),
  ]);
  const counts = new Map(attemptGroups.map((group) => [group.status, group._count._all]));
  const values = scores.flatMap((row) => row.totalScore === null ? [] : [row.totalScore]);
  return {
    publishedCount: published,
    completedAttempts: counts.get("COMPLETED") ?? 0,
    activeAttempts: counts.get("ACTIVE") ?? 0,
    averageScore: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : null,
    highestScore: scores[0]?.totalScore ?? null,
    results: scores.map((row) => ({ id: row.id, score: row.totalScore, publishedAt: row.publishedAt, registrationNumber: row.application.registrationNumber, name: row.application.student.profile?.fullName ?? null, testName: row.attempt.schedule.tkaTest.name })),
  };
}
