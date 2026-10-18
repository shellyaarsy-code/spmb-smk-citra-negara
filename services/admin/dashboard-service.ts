import "server-only";
import { ApplicationStatus, PaymentStatus, RoleName, VerificationStatus } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";

const submittedApplications = {
  registrationNumber: { not: null },
  status: { not: ApplicationStatus.DRAFT },
};

async function getDashboardSummary(role: Extract<RoleName, "ADMIN" | "KEPALA_SEKOLAH">) {
  await requireRole(role);
  const [total, statusGroups, pendingDocuments, verifiedDocuments, programs, pendingPayments, publishedTests, selectionDecisions] = await Promise.all([
    prisma.application.count({ where: submittedApplications }),
    prisma.application.groupBy({ by: ["status"], where: submittedApplications, _count: { _all: true } }),
    prisma.document.count({ where: { status: VerificationStatus.PENDING, application: submittedApplications } }),
    prisma.document.count({ where: { status: VerificationStatus.VERIFIED, application: submittedApplications } }),
    prisma.studyProgram.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, code: true, name: true, capacity: true } }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    prisma.tkaTest.count({ where: { status: "PUBLISHED", isActive: true } }),
    prisma.selection.count({ where: { status: { not: "PENDING" } } }),
  ]);
  const interestCounts = await Promise.all(programs.map(async (program) => ({
    id: program.id,
    code: program.code,
    name: program.name,
    capacity: program.capacity,
    count: await prisma.applicationProgramChoice.count({ where: { studyProgramId: program.id, application: submittedApplications } }),
  })));
  const statusCounts = Object.fromEntries(statusGroups.map((group) => [group.status, group._count._all])) as Partial<Record<ApplicationStatus, number>>;
  return {
    total,
    pendingDocuments,
    verifiedDocuments,
    pendingPayments,
    publishedTests,
    selectionDecisions,
    passed: statusCounts[ApplicationStatus.PASSED] ?? 0,
    statuses: Object.values(ApplicationStatus).filter((status) => status !== ApplicationStatus.DRAFT).map((status) => ({ status, count: statusCounts[status] ?? 0 })),
    programs: interestCounts,
  };
}

export function getAdminDashboardSummary() { return getDashboardSummary(RoleName.ADMIN); }
export function getPrincipalDashboardSummary() { return getDashboardSummary(RoleName.KEPALA_SEKOLAH); }
