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
