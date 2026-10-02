import assert from "node:assert/strict";
import test from "node:test";
import { ApplicationStatus } from "@prisma/client";
import { assertApplicationTransition, InvalidApplicationTransitionError } from "../../services/application/state-transition";
import { generateRegistrationNumber } from "../../services/application/registration-number";
import { getOrCreateDraftApplication } from "../../services/application/draft-policy";
import {
  ApplicationInputValidationError,
  parseApplicationDraftUpdate,
  parseProgramChoices,
  parseSemesterAverages,
} from "../../services/application/application-validation";

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
