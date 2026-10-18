import assert from "node:assert/strict";
import test from "node:test";
import { ApplicationStatus, RoleName, VerificationStatus } from "@prisma/client";
import { canAccessRolePortal } from "../../services/auth/authorization-policy";
import { adminApplicantErrorDetails } from "../../services/admin/admin-error-policy";
import { buildAdminApplicantPage, buildAdminApplicantWhere, AdminApplicantInputError, parseAdminApplicantFilters } from "../../services/admin/admin-applicant-policy";

test("admin applicant endpoints map unauthenticated and unauthorized access without internal details", () => {
  assert.deepEqual(adminApplicantErrorDetails("AuthenticationRequiredError"), { status: 401, message: "Autentikasi diperlukan." });
  assert.deepEqual(adminApplicantErrorDetails("AuthorizationDeniedError"), { status: 403, message: "Akses ditolak." });
  assert.deepEqual(adminApplicantErrorDetails("PrismaClientKnownRequestError"), { status: 503, message: "Data pendaftar belum dapat dimuat." });
  assert.equal(canAccessRolePortal(RoleName.SISWA, [RoleName.ADMIN]), false);
  assert.equal(canAccessRolePortal(RoleName.KEPALA_SEKOLAH, [RoleName.ADMIN]), false);
  assert.equal(canAccessRolePortal(RoleName.ADMIN, [RoleName.ADMIN]), true);
});

test("admin applicant filters validate pagination and query only registered applications", () => {
  const filters = parseAdminApplicantFilters(new URLSearchParams("page=2&pageSize=20&search=Rina&status=SUBMITTED&program=PPLG&documentStatus=PENDING"));
  assert.deepEqual(filters, { page: 2, pageSize: 20, search: "Rina", status: ApplicationStatus.SUBMITTED, program: "PPLG", documentStatus: VerificationStatus.PENDING });
  const where = buildAdminApplicantWhere(filters);
  assert.deepEqual(where.registrationNumber, { not: null });
  assert.equal(where.status, ApplicationStatus.SUBMITTED);
  assert.deepEqual(where.programChoices, { some: { studyProgram: { code: "PPLG" } } });
  assert.deepEqual(where.documents, { some: { status: VerificationStatus.PENDING } });
  assert.ok(Array.isArray(where.OR));
  assert.throws(() => parseAdminApplicantFilters(new URLSearchParams("page=0")), AdminApplicantInputError);
  assert.throws(() => parseAdminApplicantFilters(new URLSearchParams("pageSize=100")), AdminApplicantInputError);
  assert.throws(() => parseAdminApplicantFilters(new URLSearchParams("status=FAKE_STATUS")), AdminApplicantInputError);
  assert.throws(() => parseAdminApplicantFilters(new URLSearchParams("documentStatus=FAKE_STATUS")), AdminApplicantInputError);
});

test("unfiltered applicant list excludes drafts that are not submitted registrations", () => {
  assert.deepEqual(buildAdminApplicantWhere({ search: "" }).status, { not: ApplicationStatus.DRAFT });
});

test("admin applicant filters handle empty results with a stable empty page", () => {
  assert.deepEqual(buildAdminApplicantPage({ applicants: [], total: 0, page: 1, pageSize: 10, programs: [] }), {
    applicants: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }, filters: { programs: [] },
  });
});
