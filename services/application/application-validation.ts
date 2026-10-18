import { Prisma } from "@prisma/client";

export class ApplicationInputValidationError extends Error {
  constructor() {
    super("Application draft data is invalid");
    this.name = "ApplicationInputValidationError";
  }
}

export class StudyProgramUnavailableError extends Error {
  constructor() {
    super("A selected study program is unavailable");
    this.name = "StudyProgramUnavailableError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAverage(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" && typeof value !== "number") throw new ApplicationInputValidationError();

  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new ApplicationInputValidationError();
  const number = Number(text);
  if (!Number.isFinite(number) || number < 0 || number > 100) throw new ApplicationInputValidationError();

  return new Prisma.Decimal(text);
}

export function parseSemesterAverages(input: unknown) {
  if (input === undefined) return undefined;
  if (!isRecord(input)) throw new ApplicationInputValidationError();

  const result: Record<string, Prisma.Decimal | null> = {};
  for (let semester = 1; semester <= 4; semester += 1) {
    const field = `semester${semester}Average`;
    if (field in input) result[field] = parseAverage(input[field]);
  }
  return result;
}

export type ParsedProgramChoice = { code: string; priority: number };

export function parseProgramChoices(input: unknown): ParsedProgramChoice[] | undefined {
  if (input === undefined) return undefined;
  if (!Array.isArray(input)) throw new ApplicationInputValidationError();

  const choices = input.map((entry) => {
    if (!isRecord(entry) || typeof entry.code !== "string" || !entry.code.trim()) {
      throw new ApplicationInputValidationError();
    }
    if (!Number.isInteger(entry.priority) || (entry.priority as number) < 1) {
      throw new ApplicationInputValidationError();
    }
    return { code: entry.code.trim(), priority: entry.priority as number };
  });

  if (
    new Set(choices.map((choice) => choice.code)).size !== choices.length ||
    new Set(choices.map((choice) => choice.priority)).size !== choices.length
  ) {
    throw new ApplicationInputValidationError();
  }

  return choices;
}

export function parseApplicationDraftUpdate(input: unknown) {
  if (!isRecord(input)) throw new ApplicationInputValidationError();
  const semesterAverages = parseSemesterAverages(input.semesterAverages);
  const programChoices = parseProgramChoices(input.programChoices);
  const hasStudentData = "profile" in input || "guardians" in input;

  return {
    semesterAverages,
    programChoices,
    studentData: hasStudentData ? { profile: input.profile, guardians: input.guardians } : undefined,
  };
}

export function isCompletedSubmission(submission: { registrationNumber: string | null; submittedAt: Date | null } | null) {
  return submission !== null && submission.registrationNumber !== null && submission.submittedAt !== null;
}

export class ApplicationSubmissionRequirementsError extends Error {
  constructor() {
    super("Application submission requirements are incomplete");
    this.name = "ApplicationSubmissionRequirementsError";
  }
}

type SubmissionProfile = Record<string, unknown> | null;
type SubmissionGuardian = {
  guardianType: string;
  guardianName: string | null;
  occupation: string | null;
  incomeBracket: string | null;
};
type SubmissionProgramChoice = {
  priority: number;
  studyProgramId: string;
  isActive: boolean;
};

const requiredProfileFields = [
  "nik", "nisn", "fullName", "gender", "birthPlace", "birthDate", "religion", "familyCardNumber",
  "familyStatus", "citizenship", "address", "province", "city", "district", "village", "postalCode",
  "parentWhatsapp", "schoolNpsn", "schoolOrigin", "schoolType", "schoolStatus", "graduationYear",
] as const;

function isPresent(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

export function validateApplicationSubmission(input: {
  profile: SubmissionProfile;
  guardians: SubmissionGuardian[];
  semesterAverages: (Prisma.Decimal | null)[];
  programChoices: SubmissionProgramChoice[];
}) {
  if (!input.profile || requiredProfileFields.some((field) => !isPresent(input.profile?.[field]))) {
    throw new ApplicationSubmissionRequirementsError();
  }

  const guardianByType = new Map(input.guardians.map((guardian) => [guardian.guardianType, guardian]));
  for (const type of ["FATHER", "MOTHER"] as const) {
    const guardian = guardianByType.get(type);
    if (!guardian || !isPresent(guardian.guardianName) || !isPresent(guardian.occupation) || !isPresent(guardian.incomeBracket)) {
      throw new ApplicationSubmissionRequirementsError();
    }
  }

  if (input.semesterAverages.length !== 4 || input.semesterAverages.some((average) =>
    average === null || !average.isFinite() || average.lessThan(0) || average.greaterThan(100),
  )) {
    throw new ApplicationSubmissionRequirementsError();
  }

  const primary = input.programChoices.find((choice) => choice.priority === 1);
  const backup = input.programChoices.find((choice) => choice.priority === 2);
  if (!primary || !backup || primary.studyProgramId === backup.studyProgramId) {
    throw new ApplicationSubmissionRequirementsError();
  }
  if (input.programChoices.some((choice) => !choice.isActive)) throw new StudyProgramUnavailableError();
}

export function parseSubmissionConsent(input: unknown) {
  if (!isRecord(input) || input.accepted !== true) throw new ApplicationSubmissionRequirementsError();
}
