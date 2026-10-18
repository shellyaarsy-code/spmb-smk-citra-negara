import "server-only";
import { ApplicationStatus, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { AdminApplicantNotFoundError, buildAdminApplicantPage, buildAdminApplicantWhere, parseAdminApplicantFilters } from "./admin-applicant-policy";

export { AdminApplicantInputError, AdminApplicantNotFoundError } from "./admin-applicant-policy";

export async function listAdminApplicants(params: URLSearchParams) {
  await requireRole(RoleName.ADMIN);
  const filters = parseAdminApplicantFilters(params);
  const where = buildAdminApplicantWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;
  const [total, applicants, programs] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
      skip,
      take: filters.pageSize,
      select: {
        registrationNumber: true, status: true, submittedAt: true, createdAt: true,
        student: { select: { profile: { select: { fullName: true, nisn: true } } } },
        programChoices: { orderBy: { priority: "asc" }, select: { priority: true, studyProgram: { select: { code: true, name: true } } } },
      },
    }),
    prisma.studyProgram.findMany({ orderBy: { name: "asc" }, select: { code: true, name: true } }),
  ]);
  return buildAdminApplicantPage({
    applicants: applicants.map((application) => ({
      registrationNumber: application.registrationNumber,
      status: application.status,
      submittedAt: application.submittedAt ?? application.createdAt,
      name: application.student.profile?.fullName ?? null,
      nisn: application.student.profile?.nisn ?? null,
      programs: application.programChoices.map((choice) => ({ priority: choice.priority, code: choice.studyProgram.code, name: choice.studyProgram.name })),
    })),
    total, page: filters.page, pageSize: filters.pageSize, programs,
  });
}

export async function getAdminApplicant(registrationNumber: string) {
  await requireRole(RoleName.ADMIN);
  const application = await prisma.application.findFirst({
    where: { registrationNumber, status: { not: ApplicationStatus.DRAFT } },
    select: {
      registrationNumber: true, status: true, submittedAt: true, createdAt: true,
      admissionPeriod: { select: { name: true } }, admissionWave: { select: { name: true } },
      semester1Average: true, semester2Average: true, semester3Average: true, semester4Average: true,
      student: {
        select: {
          user: { select: { email: true } },
          profile: { select: {
            fullName: true, nisn: true, gender: true, birthPlace: true, birthDate: true, phoneNumber: true, address: true,
            province: true, city: true, district: true, village: true, postalCode: true, religion: true,
            schoolOrigin: true, schoolNpsn: true, schoolType: true, schoolStatus: true, graduationYear: true, parentWhatsapp: true,
          } },
          parentGuardians: { orderBy: { guardianType: "asc" }, select: { guardianType: true, guardianName: true, relationship: true, occupation: true } },
        },
      },
      programChoices: { orderBy: { priority: "asc" }, select: { priority: true, studyProgram: { select: { code: true, name: true } } } },
      _count: { select: { documents: true } },
    },
  });
  if (!application) throw new AdminApplicantNotFoundError();
  const profile = application.student.profile;
  return {
    registrationNumber: application.registrationNumber,
    status: application.status,
    submittedAt: application.submittedAt ?? application.createdAt,
    admissionPeriod: application.admissionPeriod?.name ?? null,
    admissionWave: application.admissionWave?.name ?? null,
    student: {
      email: application.student.user.email,
      name: profile?.fullName ?? null, nisn: profile?.nisn ?? null, gender: profile?.gender ?? null,
      birthPlace: profile?.birthPlace ?? null, birthDate: profile?.birthDate ?? null, phoneNumber: profile?.phoneNumber ?? null,
      address: profile?.address ?? null, province: profile?.province ?? null, city: profile?.city ?? null,
      district: profile?.district ?? null, village: profile?.village ?? null, postalCode: profile?.postalCode ?? null,
      religion: profile?.religion ?? null, schoolOrigin: profile?.schoolOrigin ?? null, schoolNpsn: profile?.schoolNpsn ?? null,
      schoolType: profile?.schoolType ?? null, schoolStatus: profile?.schoolStatus ?? null, graduationYear: profile?.graduationYear ?? null,
      parentWhatsapp: profile?.parentWhatsapp ?? null,
    },
    guardians: application.student.parentGuardians,
    programs: application.programChoices.map((choice) => ({ priority: choice.priority, code: choice.studyProgram.code, name: choice.studyProgram.name })),
    semesterAverages: [application.semester1Average, application.semester2Average, application.semester3Average, application.semester4Average].map((value) => value?.toString() ?? null),
    documentCount: application._count.documents,
  };
}
