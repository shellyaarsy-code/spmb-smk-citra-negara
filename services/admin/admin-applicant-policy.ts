import { ApplicationStatus, Prisma, VerificationStatus } from "@prisma/client";

export class AdminApplicantInputError extends Error {
  constructor() { super("Invalid applicant query"); this.name = "AdminApplicantInputError"; }
}
export class AdminApplicantNotFoundError extends Error {
  constructor() { super("Applicant not found"); this.name = "AdminApplicantNotFoundError"; }
}

export type AdminApplicantFilters = { page: number; pageSize: number; search: string; status?: ApplicationStatus; program?: string; documentStatus?: VerificationStatus };

export function parseAdminApplicantFilters(params: URLSearchParams): AdminApplicantFilters {
  const parsePositiveInteger = (value: string | null, fallback: number) => {
    if (value === null || value === "") return fallback;
    if (!/^\d+$/.test(value)) throw new AdminApplicantInputError();
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) throw new AdminApplicantInputError();
    return parsed;
  };
  const page = parsePositiveInteger(params.get("page"), 1);
  const pageSize = parsePositiveInteger(params.get("pageSize"), 10);
  if (pageSize > 50) throw new AdminApplicantInputError();
  const search = (params.get("search") ?? "").trim();
  if (search.length > 100) throw new AdminApplicantInputError();
  const rawStatus = params.get("status") ?? "";
  const statuses = Object.values(ApplicationStatus) as string[];
  if (rawStatus && !statuses.includes(rawStatus)) throw new AdminApplicantInputError();
  const program = (params.get("program") ?? "").trim();
  if (program.length > 32) throw new AdminApplicantInputError();
  const rawDocumentStatus = params.get("documentStatus") ?? "";
  const documentStatuses = Object.values(VerificationStatus) as string[];
  if (rawDocumentStatus && !documentStatuses.includes(rawDocumentStatus)) throw new AdminApplicantInputError();
  return { page, pageSize, search, status: rawStatus ? rawStatus as ApplicationStatus : undefined, program: program || undefined, documentStatus: rawDocumentStatus ? rawDocumentStatus as VerificationStatus : undefined };
}

export function buildAdminApplicantWhere(filters: Pick<AdminApplicantFilters, "search" | "status" | "program" | "documentStatus">): Prisma.ApplicationWhereInput {
  const containsSearch = { contains: filters.search, mode: "insensitive" as const };
  return {
    registrationNumber: { not: null },
    status: filters.status ? filters.status : { not: ApplicationStatus.DRAFT },
    ...(filters.documentStatus ? { documents: { some: { status: filters.documentStatus } } } : {}),
    ...(filters.program ? { programChoices: { some: { studyProgram: { code: filters.program } } } } : {}),
    ...(filters.search ? { OR: [
      { registrationNumber: containsSearch },
      { student: { is: { profile: { is: { fullName: containsSearch } } } } },
      { student: { is: { profile: { is: { nisn: containsSearch } } } } },
    ] } : {}),
  };
}

export function buildAdminApplicantPage<T>(input: { applicants: T[]; total: number; page: number; pageSize: number; programs: { code: string; name: string }[] }) {
  return {
    applicants: input.applicants,
    pagination: { page: input.page, pageSize: input.pageSize, total: input.total, totalPages: Math.ceil(input.total / input.pageSize) },
    filters: { programs: input.programs },
  };
}
