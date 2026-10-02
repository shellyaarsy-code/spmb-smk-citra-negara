import { GuardianType, Prisma } from "@prisma/client";

const profileFieldMap = {
  fullName: "fullName",
  nisn: "nisn",
  nik: "nik",
  gender: "gender",
  birthPlace: "birthPlace",
  birthDate: "birthDate",
  religion: "religion",
  familyStatus: "familyStatus",
  citizenship: "citizenship",
  familyCardNumber: "familyCardNumber",
  streetAddress: "address",
  province: "province",
  city: "city",
  district: "district",
  village: "village",
  postalCode: "postalCode",
  schoolName: "schoolOrigin",
  schoolNpsn: "schoolNpsn",
  schoolType: "schoolType",
  schoolStatus: "schoolStatus",
  graduationYear: "graduationYear",
  parentWhatsapp: "parentWhatsapp",
} as const;

type StudentProfileData = Omit<Prisma.StudentProfileUncheckedCreateInput, "id" | "studentId" | "createdAt" | "updatedAt">;
type GuardianData = Omit<Prisma.ParentGuardianUncheckedCreateInput, "id" | "studentId" | "createdAt" | "updatedAt">;

export class StudentInputValidationError extends Error {
  constructor() {
    super("Student data is invalid");
    this.name = "StudentInputValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new StudentInputValidationError();
  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

function optionalDate(value: unknown) {
  const normalized = optionalText(value);
  if (!normalized) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw new StudentInputValidationError();
  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== normalized) {
    throw new StudentInputValidationError();
  }
  return date;
}

function validateExistingUiPattern(field: string, value: string | null) {
  if (!value) return;
  const patterns: Record<string, RegExp> = {
    nik: /^\d{16}$/,
    nisn: /^\d{10}$/,
    familyCardNumber: /^\d{16}$/,
    postalCode: /^\d{5}$/,
    schoolNpsn: /^\d{8}$/,
    graduationYear: /^\d{4}$/,
    parentWhatsapp: /^0\d{9,13}$/,
  };
  const pattern = patterns[field];
  if (pattern && !pattern.test(value)) throw new StudentInputValidationError();
}

export function parseStudentProfileInput(input: unknown): StudentProfileData {
  if (!isRecord(input)) throw new StudentInputValidationError();

  const result: Record<string, string | Date | null> = {};
  for (const [uiField, databaseField] of Object.entries(profileFieldMap)) {
    if (!(uiField in input)) continue;
    const value = uiField === "birthDate" ? optionalDate(input[uiField]) : optionalText(input[uiField]);
    if (typeof value === "string" || value === null) validateExistingUiPattern(uiField, value);
    result[databaseField] = value;
  }

  return result as StudentProfileData;
}

export function parseGuardianInput(input: unknown): GuardianData {
  if (!isRecord(input) || !Object.values(GuardianType).includes(input.guardianType as GuardianType)) {
    throw new StudentInputValidationError();
  }

  const result: Record<string, string | GuardianType | null> = {
    guardianType: input.guardianType as GuardianType,
  };
  const fields = ["guardianName", "relationship", "occupation", "incomeBracket", "nik", "phoneNumber", "email", "address"] as const;

  for (const field of fields) {
    if (!(field in input)) continue;
    const value = optionalText(input[field]);
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new StudentInputValidationError();
    }
    result[field] = value;
  }

  return result as GuardianData;
}

export function parseStudentDetailsInput(input: unknown) {
  if (!isRecord(input)) throw new StudentInputValidationError();
  const profile = parseStudentProfileInput(input.profile ?? {});
  const guardiansInput = input.guardians ?? [];
  if (!Array.isArray(guardiansInput)) throw new StudentInputValidationError();

  const guardians = guardiansInput.map(parseGuardianInput);
  if (new Set(guardians.map((guardian) => guardian.guardianType)).size !== guardians.length) {
    throw new StudentInputValidationError();
  }

  return { profile, guardians };
}
