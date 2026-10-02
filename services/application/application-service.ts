import "server-only";
import { ApplicationStatus, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { resolveOwnedStudentId } from "../student/student-ownership";
import { getCurrentStudentId, saveStudentDetailsInTransaction, StudentRecordMissingError } from "../student/student-service";
import { getOrCreateDraftApplication } from "./draft-policy";
import { ApplicationInputValidationError, parseApplicationDraftUpdate, StudyProgramUnavailableError } from "./application-validation";
import { assertApplicationTransition, InvalidApplicationTransitionError } from "./state-transition";
import { generateRegistrationNumber, type RegistrationNumberGenerator } from "./registration-number";

export { StudentRecordMissingError, StudyProgramUnavailableError, InvalidApplicationTransitionError };
export class DraftApplicationUnavailableError extends Error {
  constructor() {
    super("The current application is no longer a draft");
    this.name = "DraftApplicationUnavailableError";
  }
}

export class DraftRegistrationNumberConflictError extends Error {
  constructor() {
    super("A draft application has an existing registration number");
    this.name = "DraftRegistrationNumberConflictError";
  }
}

export class ApplicationSubmissionUnavailableError extends Error {
  constructor() {
    super("No submit-ready application was found");
    this.name = "ApplicationSubmissionUnavailableError";
  }
}

export class RegistrationNumberGenerationError extends Error {
  constructor() {
    super("Unable to generate a unique registration number");
    this.name = "RegistrationNumberGenerationError";
  }
}

async function withSerializableRetry<T>(work: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2034" ||
        attempt === 2
      ) {
        throw error;
      }
    }
  }
  throw new Error("Unable to complete serializable transaction");
}

function draftSelect() {
  return {
    id: true,
    status: true,
    registrationNumber: true,
    submittedAt: true,
    semester1Average: true,
    semester2Average: true,
    semester3Average: true,
    semester4Average: true,
    programChoices: {
      select: {
        priority: true,
        studyProgram: { select: { code: true, name: true } },
      },
      orderBy: { priority: "asc" as const },
    },
  } as const;
}

async function getOrCreateDraftInTransaction(tx: Prisma.TransactionClient, studentId: string) {
  const existingDraft = await tx.application.findFirst({
    where: { studentId, status: ApplicationStatus.DRAFT },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: draftSelect(),
  });
  if (existingDraft) {
    if (existingDraft.registrationNumber !== null) throw new DraftRegistrationNumberConflictError();
    return existingDraft;
  }

  const submittedApplication = await tx.application.findFirst({
    where: { studentId, status: ApplicationStatus.SUBMITTED },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
    select: draftSelect(),
  });
  if (submittedApplication) {
    if (submittedApplication.registrationNumber === null || submittedApplication.submittedAt === null) {
      throw new DraftRegistrationNumberConflictError();
    }
    return submittedApplication;
  }

  return getOrCreateDraftApplication(studentId, {
    findDraft: (ownerId) => tx.application.findFirst({
      where: { studentId: ownerId, status: ApplicationStatus.DRAFT },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: draftSelect(),
    }),
    createDraft: (ownerId) => tx.application.create({
      data: {
        studentId: ownerId,
        status: ApplicationStatus.DRAFT,
        registrationNumber: null,
      },
      select: draftSelect(),
    }),
  });
}

export async function getCurrentDraftApplication() {
  const studentId = await getCurrentStudentId();
  return withSerializableRetry(() =>
    prisma.$transaction(
      (tx) => getOrCreateDraftInTransaction(tx, studentId),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );
}

export async function createCurrentDraftApplication() {
  return getCurrentDraftApplication();
}

export async function getCurrentApplicationProgramChoices() {
  const application = await getCurrentDraftApplication();
  return application.programChoices;
}

export async function updateCurrentApplicationAcademicData(input: unknown) {
  return updateCurrentDraftApplication(input);
}

export async function setCurrentApplicationProgramChoices(input: unknown) {
  return updateCurrentDraftApplication(input);
}

export async function updateCurrentDraftApplication(input: unknown) {
  const user = await requireRole(RoleName.SISWA);
  const studentId = await resolveOwnedStudentId(user.id, async (userId) =>
    prisma.student.findUnique({ where: { userId }, select: { id: true } }),
  );
  const update = parseApplicationDraftUpdate(input);

  return withSerializableRetry(() =>
    prisma.$transaction(async (tx) => {
      const application = await getOrCreateDraftInTransaction(tx, studentId);
      if (application.status !== ApplicationStatus.DRAFT) throw new DraftApplicationUnavailableError();

      if (update.studentData) {
        await saveStudentDetailsInTransaction(tx, studentId, update.studentData);
      }

      if (update.semesterAverages && Object.keys(update.semesterAverages).length) {
        const result = await tx.application.updateMany({
          where: {
            id: application.id,
            studentId,
            status: ApplicationStatus.DRAFT,
          },
          data: update.semesterAverages,
        });
        if (result.count !== 1) throw new DraftApplicationUnavailableError();
      }

      if (update.programChoices !== undefined) {
        const codes = update.programChoices.map((choice) => choice.code);
        const programs = codes.length
          ? await tx.studyProgram.findMany({
              where: { code: { in: codes }, isActive: true },
              select: { id: true, code: true },
            })
          : [];
        if (programs.length !== codes.length) throw new StudyProgramUnavailableError();

        const programIdByCode = new Map(programs.map((program) => [program.code, program.id]));
        await tx.applicationProgramChoice.deleteMany({ where: { applicationId: application.id } });
        if (update.programChoices.length) {
          await tx.applicationProgramChoice.createMany({
            data: update.programChoices.map((choice) => ({
              applicationId: application.id,
              studyProgramId: programIdByCode.get(choice.code)!,
              priority: choice.priority,
            })),
          });
        }
      }

      const updated = await tx.application.findFirst({
        where: { id: application.id, studentId, status: ApplicationStatus.DRAFT },
        select: draftSelect(),
      });
      if (!updated) throw new DraftApplicationUnavailableError();
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
  );
}

export async function getAvailableStudyPrograms() {
  await requireRole(RoleName.SISWA);
  return prisma.studyProgram.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { code: true, name: true },
  });
}

const submittedSelect = {
  status: true,
  registrationNumber: true,
  submittedAt: true,
  semester1Average: true,
  semester2Average: true,
  semester3Average: true,
  semester4Average: true,
  programChoices: {
    select: { priority: true, studyProgram: { select: { code: true, name: true } } },
    orderBy: { priority: "asc" as const },
  },
} as const;

function isRegistrationNumberCollision(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function validateDraftForSubmission(
  application: {
    semester1Average: Prisma.Decimal | null;
    semester2Average: Prisma.Decimal | null;
    semester3Average: Prisma.Decimal | null;
    semester4Average: Prisma.Decimal | null;
  },
  programs: { isActive: boolean }[],
) {
  for (const average of [application.semester1Average, application.semester2Average, application.semester3Average, application.semester4Average]) {
    if (average !== null && (!average.isFinite() || average.lessThan(0) || average.greaterThan(100))) {
      throw new ApplicationInputValidationError();
    }
  }
  if (programs.some((program) => !program.isActive)) throw new StudyProgramUnavailableError();
}

export async function submitCurrentApplication(generator: RegistrationNumberGenerator = generateRegistrationNumber) {
  const user = await requireRole(RoleName.SISWA);
  const studentId = await resolveOwnedStudentId(user.id, async (userId) =>
    prisma.student.findUnique({ where: { userId }, select: { id: true } }),
  );

  for (let numberAttempt = 0; numberAttempt < 5; numberAttempt += 1) {
    try {
      return await withSerializableRetry(() =>
        prisma.$transaction(async (tx) => {
          const draft = await tx.application.findFirst({
            where: { studentId, status: ApplicationStatus.DRAFT },
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            select: {
              id: true,
              status: true,
              registrationNumber: true,
              semester1Average: true,
              semester2Average: true,
              semester3Average: true,
              semester4Average: true,
            },
          });

          if (!draft) {
            const submitted = await tx.application.findFirst({
              where: { studentId, status: ApplicationStatus.SUBMITTED },
              orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
              select: submittedSelect,
            });
            if (submitted) {
              if (submitted.registrationNumber === null || submitted.submittedAt === null) {
                throw new DraftRegistrationNumberConflictError();
              }
              return submitted;
            }
            throw new ApplicationSubmissionUnavailableError();
          }

          assertApplicationTransition(draft.status, ApplicationStatus.SUBMITTED);
          if (draft.registrationNumber !== null) throw new DraftRegistrationNumberConflictError();

          const programChoices = await tx.applicationProgramChoice.findMany({
            where: { applicationId: draft.id },
            select: { studyProgram: { select: { isActive: true } } },
          });
          validateDraftForSubmission(draft, programChoices.map((choice) => choice.studyProgram));

          const registrationNumber = generator();
          if (!registrationNumber || !registrationNumber.trim() || registrationNumber.length > 255) {
            throw new RegistrationNumberGenerationError();
          }

          const submittedAt = new Date();
          const update = await tx.application.updateMany({
            where: {
              id: draft.id,
              studentId,
              status: ApplicationStatus.DRAFT,
              registrationNumber: null,
            },
            data: {
              status: ApplicationStatus.SUBMITTED,
              registrationNumber,
              submittedAt,
            },
          });

          if (update.count !== 1) throw new DraftApplicationUnavailableError();

          await tx.applicationStatusHistory.create({
            data: {
              applicationId: draft.id,
              status: ApplicationStatus.SUBMITTED,
              changedByUserId: user.id,
            },
          });

          const submitted = await tx.application.findFirst({
            where: { id: draft.id, studentId, status: ApplicationStatus.SUBMITTED },
            select: submittedSelect,
          });
          if (!submitted || submitted.registrationNumber === null) throw new ApplicationSubmissionUnavailableError();
          return submitted;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
      );
    } catch (error) {
      if (isRegistrationNumberCollision(error) && numberAttempt < 4) continue;
      if (isRegistrationNumberCollision(error)) throw new RegistrationNumberGenerationError();
      throw error;
    }
  }

  throw new RegistrationNumberGenerationError();
}
