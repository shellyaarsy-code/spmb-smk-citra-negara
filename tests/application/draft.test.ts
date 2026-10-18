import assert from "node:assert/strict";
import test from "node:test";
import { ApplicationStatus, Prisma, RoleName } from "@prisma/client";
import { canAccessRolePortal } from "../../services/auth/authorization-policy";
import { assertApplicationTransition, InvalidApplicationTransitionError } from "../../services/application/state-transition";
import { generateRegistrationNumber } from "../../services/application/registration-number";
import { getOrCreateDraftApplication } from "../../services/application/draft-policy";
import {
  ApplicationInputValidationError,
  ApplicationSubmissionRequirementsError,
  isCompletedSubmission,
  parseSubmissionConsent,
  parseApplicationDraftUpdate,
  parseProgramChoices,
  parseSemesterAverages,
  StudyProgramUnavailableError,
  validateApplicationSubmission,
} from "../../services/application/application-validation";

function completeSubmissionInput() {
  return {
    profile: {
      nik: "1234567890123456", nisn: "1234567890", fullName: "Calon Siswa", gender: "male",
      birthPlace: "Depok", birthDate: new Date("2008-01-01T00:00:00.000Z"), religion: "islam",
      familyCardNumber: "1234567890123456", familyStatus: "anak-kandung", citizenship: "wni",
      address: "Jalan Contoh", province: "Jawa Barat", city: "Depok", district: "Beji", village: "Beji",
      postalCode: "16421", parentWhatsapp: "081234567890", schoolNpsn: "12345678", schoolOrigin: "SMP Contoh",
      schoolType: "smp", schoolStatus: "swasta", graduationYear: "2026",
    },
    guardians: [
      { guardianType: "FATHER", guardianName: "Ayah", occupation: "wiraswasta", incomeBracket: "1-to-2-5" },
      { guardianType: "MOTHER", guardianName: "Ibu", occupation: "lainnya", incomeBracket: "none" },
    ],
    semesterAverages: ["80", "81", "82", "83"].map((value) => new Prisma.Decimal(value)),
    programChoices: [
      { priority: 1, studyProgramId: "program-primary", isActive: true },
      { priority: 2, studyProgramId: "program-backup", isActive: true },
    ],
  };
}

test("draft get-or-create returns the existing draft without creating another", async () => {
  let stored: { id: string; status: string; registrationNumber: string | null } | null = null;
  let createCount = 0;
  const repository = {
    async findDraft(studentId: string) {
      assert.equal(studentId, "owned-student");
      return stored;
    },
    async createDraft(studentId: string) {
      assert.equal(studentId, "owned-student");
      createCount += 1;
      stored = { id: "internal-id", status: ApplicationStatus.DRAFT, registrationNumber: null };
      return stored;
    },
  };

  const first = await getOrCreateDraftApplication("owned-student", repository);
  const second = await getOrCreateDraftApplication("owned-student", repository);

  assert.equal(createCount, 1);
  assert.equal(first.status, ApplicationStatus.DRAFT);
  assert.equal(first.registrationNumber, null);
  assert.equal(second.id, first.id);
});

test("new draft repository records stay DRAFT with no public registration number", async () => {
  const draft = await getOrCreateDraftApplication("student", {
    async findDraft() { return null; },
    async createDraft() {
      return { id: "internal-id", status: ApplicationStatus.DRAFT, registrationNumber: null };
    },
  });
  assert.equal(draft.status, ApplicationStatus.DRAFT);
  assert.equal(draft.registrationNumber, null);
});

test("semester averages preserve two-place decimal precision and nullable values", () => {
  const values = parseSemesterAverages({ semester1Average: "87.50", semester2Average: null });
  assert.equal(values?.semester1Average?.toString(), "87.5");
  assert.equal(values?.semester2Average, null);
  assert.equal(values?.semester3Average, undefined);
});

test("semester averages reject values outside the UI range or precision", () => {
  assert.throws(() => parseSemesterAverages({ semester1Average: "100.01" }), ApplicationInputValidationError);
  assert.throws(() => parseSemesterAverages({ semester1Average: "1.234" }), ApplicationInputValidationError);
  assert.throws(() => parseSemesterAverages({ semester1Average: "-1" }), ApplicationInputValidationError);
  assert.throws(() => parseSemesterAverages({ semester1Average: "not-a-number" }), ApplicationInputValidationError);
});

test("program choices preserve order and reject duplicate programs or priorities", () => {
  assert.deepEqual(parseProgramChoices([
    { code: "PPLG", priority: 1 },
    { code: "TJKT", priority: 2 },
  ]), [
    { code: "PPLG", priority: 1 },
    { code: "TJKT", priority: 2 },
  ]);
  assert.throws(() => parseProgramChoices([
    { code: "PPLG", priority: 1 },
    { code: "PPLG", priority: 2 },
  ]), ApplicationInputValidationError);
  assert.throws(() => parseProgramChoices([
    { code: "PPLG", priority: 1 },
    { code: "TJKT", priority: 1 },
  ]), ApplicationInputValidationError);
});

test("client ownership IDs are ignored by the application update parser", () => {
  const update = parseApplicationDraftUpdate({
    studentId: "other-student",
    applicationId: "other-application",
    userId: "other-user",
    semesterAverages: { semester1Average: "75" },
  });
  assert.equal(update.semesterAverages?.semester1Average?.toString(), "75");
  assert.equal("studentId" in update, false);
  assert.equal("applicationId" in update, false);
  assert.equal("userId" in update, false);
});

test("only DRAFT to SUBMITTED is an allowed application transition", () => {
  assert.doesNotThrow(() => assertApplicationTransition(ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED));
  assert.throws(() => assertApplicationTransition(ApplicationStatus.SUBMITTED, ApplicationStatus.DRAFT), InvalidApplicationTransitionError);
  assert.throws(() => assertApplicationTransition(ApplicationStatus.DRAFT, ApplicationStatus.PAYMENT_VERIFIED), InvalidApplicationTransitionError);
  assert.throws(() => assertApplicationTransition(ApplicationStatus.SUBMITTED, ApplicationStatus.PASSED), InvalidApplicationTransitionError);
});

test("registration number generator returns independent opaque UUIDs", () => {
  const first = generateRegistrationNumber();
  const second = generateRegistrationNumber();
  const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

  assert.match(first, uuidPattern);
  assert.match(second, uuidPattern);
  assert.notEqual(first, second);
});

test("complete application data and consent satisfy the established submission requirements", () => {
  assert.doesNotThrow(() => validateApplicationSubmission(completeSubmissionInput()));
  assert.doesNotThrow(() => parseSubmissionConsent({ accepted: true }));
});

test("submission rejects missing required profile, guardian, and semester data", () => {
  const missingProfile = completeSubmissionInput();
  missingProfile.profile.schoolOrigin = " ";
  assert.throws(() => validateApplicationSubmission(missingProfile), ApplicationSubmissionRequirementsError);

  const missingGuardian = completeSubmissionInput();
  missingGuardian.guardians = missingGuardian.guardians.filter((guardian) => guardian.guardianType !== "MOTHER");
  assert.throws(() => validateApplicationSubmission(missingGuardian), ApplicationSubmissionRequirementsError);

  const complete = completeSubmissionInput();
  const missingSemester = {
    ...complete,
    semesterAverages: [complete.semesterAverages[0], complete.semesterAverages[1], null, complete.semesterAverages[3]],
  };
  assert.throws(() => validateApplicationSubmission(missingSemester), ApplicationSubmissionRequirementsError);
});

test("submission requires two distinct program priorities and active programs", () => {
  const oneChoice = completeSubmissionInput();
  oneChoice.programChoices = oneChoice.programChoices.slice(0, 1);
  assert.throws(() => validateApplicationSubmission(oneChoice), ApplicationSubmissionRequirementsError);

  const duplicateProgram = completeSubmissionInput();
  duplicateProgram.programChoices[1].studyProgramId = duplicateProgram.programChoices[0].studyProgramId;
  assert.throws(() => validateApplicationSubmission(duplicateProgram), ApplicationSubmissionRequirementsError);

  const inactiveProgram = completeSubmissionInput();
  inactiveProgram.programChoices[1].isActive = false;
  assert.throws(() => validateApplicationSubmission(inactiveProgram), StudyProgramUnavailableError);
});

test("submission requires the user's consent but accepts complete form data without document records", () => {
  assert.throws(() => parseSubmissionConsent({ accepted: false }), ApplicationSubmissionRequirementsError);
  assert.throws(() => parseSubmissionConsent({}), ApplicationSubmissionRequirementsError);
});

test("completed submission can be returned on retry without starting a second transition", () => {
  assert.equal(isCompletedSubmission({ registrationNumber: "SPMB-123", submittedAt: new Date() }), true);
  assert.equal(isCompletedSubmission({ registrationNumber: null, submittedAt: new Date() }), false);
  assert.equal(isCompletedSubmission(null), false);
});

test("a non-student role is denied access to the student application portal", () => {
  assert.equal(canAccessRolePortal(RoleName.ADMIN, [RoleName.SISWA]), false);
  assert.equal(canAccessRolePortal(RoleName.KEPALA_SEKOLAH, [RoleName.SISWA]), false);
  assert.equal(canAccessRolePortal(RoleName.SISWA, [RoleName.SISWA]), true);
});
