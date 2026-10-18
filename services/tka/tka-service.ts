import "server-only";
import { ApplicationStatus, AuditAction, Prisma, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { getCurrentStudentId } from "../student/student-service";
import { readPositiveInteger, spmbPolicy } from "../../config/spmb-policy";
import { isWithinTkaAnswerWindow, MAX_TKA_DURATION_MINUTES, parseTkaAnswer, resolveTkaSubmissionTime, TkaConflictError, TkaInputError, TkaUnavailableError } from "./tka-policy";

async function currentEligibleApplication(studentId: string) {
  const application = await prisma.application.findFirst({
    where: { studentId, status: { in: [ApplicationStatus.ELIGIBLE_FOR_TKA, ApplicationStatus.TKA_STARTED] } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, status: true },
  });
  if (!application) throw new TkaUnavailableError();
  return application;
}

async function configuredDuration(tx?: Prisma.TransactionClient) {
  const row = await (tx ?? prisma).schoolSetting.findUnique({ where: { key: spmbPolicy.tkaDurationMinutesSettingKey }, select: { value: true } });
  const duration = readPositiveInteger(row?.value);
  if (!duration || duration > MAX_TKA_DURATION_MINUTES) throw new TkaUnavailableError();
  return duration;
}

export async function listCurrentTkaSchedules() {
  await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const application = await currentEligibleApplication(studentId);
  const now = new Date();
  return prisma.tkaSchedule.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now }, tkaTest: { isActive: true, status: "PUBLISHED", OR: [{ startsAt: null }, { startsAt: { lte: now } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] } },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      scheduledAt: true,
      location: true,
      attempts: { where: { applicationId: application.id, status: "ACTIVE" }, take: 1, select: { id: true, startedAt: true, answers: { select: { questionId: true, selectedOptionId: true } } } },
      tkaTest: {
        select: {
          id: true, name: true, description: true,
          questions: {
            where: { isActive: true }, orderBy: { createdAt: "asc" },
            select: { id: true, questionText: true, difficulty: true, options: { select: { id: true, optionText: true } } },
          },
        },
      },
    },
  });
}

export async function startCurrentTkaAttempt(scheduleId: string) {
  const user = await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const application = await currentEligibleApplication(studentId);
  if (!scheduleId.trim()) throw new TkaInputError();
  const schedule = await prisma.tkaSchedule.findFirst({
    where: {
      id: scheduleId, status: "SCHEDULED", scheduledAt: { lte: new Date() },
      tkaTest: { isActive: true, status: "PUBLISHED", AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }] },
    },
    select: { id: true, capacity: true, tkaTest: { select: { questions: { where: { isActive: true }, select: { points: true, options: { select: { id: true, isCorrect: true } } } } } } },
  });
  if (!schedule || schedule.tkaTest.questions.length === 0 || schedule.tkaTest.questions.some((q) => q.points === null || q.points < 0 || q.options.length < 2 || q.options.filter((option) => option.isCorrect).length !== 1)) throw new TkaUnavailableError();
  return prisma.$transaction(async (tx) => {
    const durationMinutes = await configuredDuration(tx);
    const existing = await tx.tkaAttempt.findUnique({ where: { applicationId_scheduleId: { applicationId: application.id, scheduleId } }, select: { id: true, status: true, startedAt: true, submittedAt: true } });
    if (existing) {
      if (existing.status !== "ACTIVE") throw new TkaConflictError();
      return { ...existing, durationMinutes };
    }
    const currentApplication = await tx.application.findFirst({ where: { id: application.id, studentId, status: { in: [ApplicationStatus.ELIGIBLE_FOR_TKA, ApplicationStatus.TKA_STARTED] } }, select: { id: true } });
    if (!currentApplication) throw new TkaConflictError();
    if (schedule.capacity !== null) {
      const occupied = await tx.tkaAttempt.count({ where: { scheduleId, status: { in: ["ACTIVE", "COMPLETED"] } } });
      if (occupied >= schedule.capacity) throw new TkaUnavailableError();
    }
    const startedAt = new Date();
    const created = await tx.tkaAttempt.create({ data: { applicationId: application.id, studentId, scheduleId, status: "ACTIVE", startedAt } , select: { id: true, status: true, startedAt: true, submittedAt: true } });
    const changed = await tx.application.updateMany({ where: { id: application.id, studentId, status: ApplicationStatus.ELIGIBLE_FOR_TKA }, data: { status: ApplicationStatus.TKA_STARTED } });
    if (changed.count === 1) await tx.applicationStatusHistory.create({ data: { applicationId: application.id, status: ApplicationStatus.TKA_STARTED, changedByUserId: user.id } });
    return { ...created, durationMinutes };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function saveCurrentTkaAnswer(attemptId: string, raw: unknown) {
  await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const answer = parseTkaAnswer(raw);
  return prisma.$transaction(async (tx) => {
    const durationMinutes = await configuredDuration(tx);
    const attempt = await tx.tkaAttempt.findFirst({ where: { id: attemptId, studentId, status: "ACTIVE" }, select: { id: true, startedAt: true, applicationId: true, schedule: { select: { tkaTestId: true } } } });
    if (!attempt || !isWithinTkaAnswerWindow(attempt.startedAt, durationMinutes)) throw new TkaConflictError();
    const question = await tx.tkaQuestion.findFirst({ where: { id: answer.questionId, tkaTestId: attempt.schedule.tkaTestId, isActive: true, options: { some: { id: answer.selectedOptionId } } }, select: { id: true } });
    if (!question) throw new TkaInputError();
    await tx.tkaAnswer.upsert({ where: { attemptId_questionId: { attemptId, questionId: question.id } }, create: { attemptId, questionId: question.id, selectedOptionId: answer.selectedOptionId }, update: { selectedOptionId: answer.selectedOptionId, answerText: null, isCorrect: null } });
    return { saved: true };
  });
}

export async function getCurrentTkaAttemptTiming(attemptId: string) {
  await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const [durationMinutes, attempt] = await Promise.all([
    configuredDuration(),
    prisma.tkaAttempt.findFirst({ where: { id: attemptId, studentId, status: "ACTIVE" }, select: { id: true, startedAt: true } }),
  ]);
  if (!attempt?.startedAt) throw new TkaConflictError();
  return { ...attempt, durationMinutes, serverNow: new Date() };
}

export async function submitCurrentTkaAttempt(attemptId: string) {
  const user = await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  return prisma.$transaction(async (tx) => {
    const durationMinutes = await configuredDuration(tx);
    const attempt = await tx.tkaAttempt.findFirst({ where: { id: attemptId, studentId }, select: { id: true, applicationId: true, status: true, startedAt: true, result: { select: { id: true, totalScore: true } }, schedule: { select: { tkaTestId: true } }, answers: { select: { questionId: true, selectedOptionId: true } } } });
    if (!attempt) throw new TkaUnavailableError();
    if (attempt.result) return { submitted: true, score: attempt.result.totalScore };
    if (attempt.status !== "ACTIVE" || !attempt.startedAt) throw new TkaConflictError();
    const submission = resolveTkaSubmissionTime(attempt.startedAt, durationMinutes);
    const questions = await tx.tkaQuestion.findMany({ where: { tkaTestId: attempt.schedule.tkaTestId, isActive: true }, select: { id: true, points: true, options: { select: { id: true, isCorrect: true } } } });
    if (!questions.length || questions.some((question) => question.points === null || question.points < 0 || question.options.filter((option) => option.isCorrect).length !== 1)) throw new TkaUnavailableError();
    const answerMap = new Map(attempt.answers.filter((answer) => answer.selectedOptionId).map((answer) => [answer.questionId, answer.selectedOptionId!]));
    let score = 0;
    for (const question of questions) if (question.options.some((option) => option.id === answerMap.get(question.id) && option.isCorrect)) score += question.points ?? 0;
    const attemptUpdate = await tx.tkaAttempt.updateMany({ where: { id: attemptId, studentId, status: "ACTIVE" }, data: { status: "COMPLETED", submittedAt: submission.submittedAt, score } });
    if (attemptUpdate.count !== 1) throw new TkaConflictError();
    await tx.tkaResult.create({ data: { attemptId, applicationId: attempt.applicationId, totalScore: score, passed: null } });
    const applicationUpdate = await tx.application.updateMany({ where: { id: attempt.applicationId, studentId, status: ApplicationStatus.TKA_STARTED }, data: { status: ApplicationStatus.TKA_COMPLETED } });
    if (applicationUpdate.count !== 1) throw new TkaConflictError();
    await tx.applicationStatusHistory.create({ data: { applicationId: attempt.applicationId, status: ApplicationStatus.TKA_COMPLETED, changedByUserId: user.id } });
    await tx.auditLog.create({ data: { actorUserId: user.id, entityType: "TKA_ATTEMPT", entityId: attemptId, action: AuditAction.UPDATE, details: { submitted: true, timedOut: submission.timedOut } } });
    return { submitted: true, score, timedOut: submission.timedOut };
  });
}

export async function getCurrentPublishedTkaResults() {
  await requireRole(RoleName.SISWA);
  const studentId = await getCurrentStudentId();
  const application = await prisma.application.findFirst({ where: { studentId, status: { not: ApplicationStatus.DRAFT } }, orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }], select: { id: true, registrationNumber: true } });
  if (!application) return { results: [], published: false };
  const results = await prisma.tkaResult.findMany({ where: { applicationId: application.id, publishedAt: { not: null } }, orderBy: { publishedAt: "desc" }, select: { id: true, totalScore: true, publishedAt: true, attempt: { select: { submittedAt: true, schedule: { select: { tkaTest: { select: { name: true } } } } } } } });
  return { registrationNumber: application.registrationNumber, results, published: results.length > 0 };
}
