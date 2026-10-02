import assert from "node:assert/strict";
import test from "node:test";
import { GuardianType } from "@prisma/client";
import { resolveOwnedStudentId, StudentRecordMissingError } from "../../services/student/student-ownership";
import { parseGuardianInput, parseStudentDetailsInput, parseStudentProfileInput, StudentInputValidationError } from "../../services/student/student-validation";

test("resolves only the student linked to the authenticated session user", async () => {
  const studentByUser = new Map([
    ["user-a", { id: "student-a" }],
    ["user-b", { id: "student-b" }],
  ]);
  const lookedUpUsers: string[] = [];

  const studentId = await resolveOwnedStudentId("user-a", async (userId) => {
    lookedUpUsers.push(userId);
    return studentByUser.get(userId) ?? null;
  });

  assert.equal(studentId, "student-a");
  assert.deepEqual(lookedUpUsers, ["user-a"]);
});

test("missing Student relation fails without implicit creation", async () => {
  await assert.rejects(
    resolveOwnedStudentId("user-without-student", async () => null),
    StudentRecordMissingError,
  );
});

test("profile parser ignores client ownership identifiers and normalizes blank optional fields", () => {
  const profile = parseStudentProfileInput({
    studentId: "another-student",
    userId: "another-user",
    fullName: "  Siti Aminah  ",
    city: "   ",
    schoolName: " SMA Asal ",
    birthDate: "2008-02-29",
  });

  assert.deepEqual(profile, {
    fullName: "Siti Aminah",
    city: null,
    schoolOrigin: "SMA Asal",
    birthDate: new Date("2008-02-29T00:00:00.000Z"),
  });
  assert.equal("studentId" in profile, false);
  assert.equal("userId" in profile, false);
});

test("invalid existing UI patterns are rejected server-side", () => {
  assert.throws(() => parseStudentProfileInput({ nisn: "123" }), StudentInputValidationError);
  assert.throws(() => parseStudentProfileInput({ schoolNpsn: "12" }), StudentInputValidationError);
});

test("guardian records require an approved type and normalize optional values", () => {
  const father = parseGuardianInput({ guardianType: GuardianType.FATHER, guardianName: "  Budi  ", occupation: "   " });
  assert.deepEqual(father, {
    guardianType: GuardianType.FATHER,
    guardianName: "Budi",
    occupation: null,
  });
  assert.throws(() => parseGuardianInput({ guardianType: "UNKNOWN" }), StudentInputValidationError);
});

test("combined save rejects duplicate guardian types before a transaction", () => {
  assert.throws(
    () => parseStudentDetailsInput({
      profile: { fullName: "A" },
      guardians: [
        { guardianType: GuardianType.FATHER, guardianName: "Budi" },
        { guardianType: GuardianType.FATHER, guardianName: "Another" },
      ],
    }),
    StudentInputValidationError,
  );
});
