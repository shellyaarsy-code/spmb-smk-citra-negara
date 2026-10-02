import "server-only";
import { GuardianType, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { resolveOwnedStudentId, StudentRecordMissingError } from "./student-ownership";
import { parseGuardianInput, parseStudentDetailsInput, parseStudentProfileInput } from "./student-validation";

export { StudentRecordMissingError };

export class StudentDataConflictError extends Error {
  constructor() {
    super("Student data conflicts with an existing record");
    this.name = "StudentDataConflictError";
  }
}

const profileSelect = {
  fullName: true,
  nisn: true,
  nik: true,
  gender: true,
  birthPlace: true,
  birthDate: true,
  phoneNumber: true,
  address: true,
  province: true,
  city: true,
  district: true,
  village: true,
  postalCode: true,
  religion: true,
  familyStatus: true,
  citizenship: true,
  familyCardNumber: true,
  schoolOrigin: true,
  schoolNpsn: true,
  schoolType: true,
  schoolStatus: true,
  graduationYear: true,
  parentWhatsapp: true,
} as const;

const guardianSelect = {
  guardianType: true,
  guardianName: true,
  relationship: true,
  occupation: true,
  incomeBracket: true,
  nik: true,
  phoneNumber: true,
  email: true,
  address: true,
} as const;

export async function getCurrentStudentId() {
  const user = await requireRole(RoleName.SISWA);
  return resolveOwnedStudentId(user.id, async (userId) =>
    prisma.student.findUnique({ where: { userId }, select: { id: true } }),
  );
}

async function getStudentDataForId(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      profile: { select: profileSelect },
      parentGuardians: {
        select: guardianSelect,
        orderBy: { guardianType: "asc" },
      },
    },
  });

  if (!student) throw new StudentRecordMissingError();
  return { profile: student.profile, guardians: student.parentGuardians };
}

async function upsertProfile(tx: Prisma.TransactionClient, studentId: string, data: Prisma.StudentProfileUncheckedCreateInput) {
  await tx.studentProfile.upsert({
    where: { studentId },
    create: data,
    update: data,
  });
}

async function upsertGuardian(tx: Prisma.TransactionClient, studentId: string, data: Prisma.ParentGuardianUncheckedCreateInput) {
  await tx.parentGuardian.upsert({
    where: {
      studentId_guardianType: {
        studentId,
        guardianType: data.guardianType,
      },
    },
    create: data,
    update: data,
  });
}

export async function saveStudentDetailsInTransaction(tx: Prisma.TransactionClient, studentId: string, input: unknown) {
  const { profile, guardians } = parseStudentDetailsInput(input);
  if (Object.keys(profile).length) {
    await upsertProfile(tx, studentId, { studentId, ...profile } as Prisma.StudentProfileUncheckedCreateInput);
  }
  for (const guardian of guardians) {
    await upsertGuardian(tx, studentId, { studentId, ...guardian } as Prisma.ParentGuardianUncheckedCreateInput);
  }
}

export async function getCurrentStudentProfile() {
  const studentId = await getCurrentStudentId();
  const data = await getStudentDataForId(studentId);
  return data.profile;
}

export async function getCurrentStudentGuardians() {
  const studentId = await getCurrentStudentId();
  const data = await getStudentDataForId(studentId);
  return data.guardians;
}

export async function getCurrentStudentData() {
  const studentId = await getCurrentStudentId();
  return getStudentDataForId(studentId);
}

export async function updateCurrentStudentProfile(input: unknown) {
  const studentId = await getCurrentStudentId();
  const profile = parseStudentProfileInput(input);
  if (Object.keys(profile).length === 0) return getStudentDataForId(studentId);

  const createData = { studentId, ...profile } as Prisma.StudentProfileUncheckedCreateInput;
  try {
    await prisma.studentProfile.upsert({
      where: { studentId },
      create: createData,
      update: profile,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new StudentDataConflictError();
    }
    throw error;
  }

  return getStudentDataForId(studentId);
}

export async function saveCurrentStudentData(input: unknown) {
  const studentId = await getCurrentStudentId();

  try {
    return await prisma.$transaction(async (tx) => {
      await saveStudentDetailsInTransaction(tx, studentId, input);

      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: {
          profile: { select: profileSelect },
          parentGuardians: { select: guardianSelect, orderBy: { guardianType: "asc" } },
        },
      });
      if (!student) throw new StudentRecordMissingError();
      return { profile: student.profile, guardians: student.parentGuardians };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new StudentDataConflictError();
    }
    throw error;
  }
}

export async function upsertCurrentStudentGuardian(input: unknown) {
  const studentId = await getCurrentStudentId();
  const guardian = parseGuardianInput(input);

  try {
    await prisma.parentGuardian.upsert({
      where: {
        studentId_guardianType: {
          studentId,
          guardianType: guardian.guardianType,
        },
      },
      create: { studentId, ...guardian },
      update: guardian,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new StudentDataConflictError();
    }
    throw error;
  }

  return getCurrentStudentGuardians();
}

export async function deleteCurrentStudentGuardian(guardianTypeInput: unknown) {
  const guardian = parseGuardianInput({ guardianType: guardianTypeInput });
  const studentId = await getCurrentStudentId();
  await prisma.parentGuardian.deleteMany({
    where: { studentId, guardianType: guardian.guardianType as GuardianType },
  });
  return getCurrentStudentGuardians();
}
