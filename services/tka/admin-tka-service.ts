import "server-only";
import { AuditAction, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { readPositiveInteger, spmbPolicy } from "../../config/spmb-policy";
import { canGrantTkaEligibility, canPublishTkaScore, MAX_TKA_DURATION_MINUTES, parseTkaDuration, parseTkaQuestionInput, parseTkaScheduleInput, parseTkaTestInput, TkaConflictError, TkaInputError, TkaUnavailableError } from "./tka-policy";

const ADMIN_LIST_PAGE_SIZE = 25;
function pageNumber(value: unknown) {
  const parsed = typeof value === "string" && /^\\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 1_000_000) : 1;
}

export async function getAdminTkaEligibility(rawPage?: unknown) {
  await requireRole(RoleName.ADMIN);
  const page = pageNumber(rawPage);
  const where = { status: { not: "DRAFT" as const } };
  const [setting, applications, total] = await Promise.all([
    prisma.schoolSetting.findUnique({ where: { key: spmbPolicy.tkaDurationMinutesSettingKey }, select: { value: true, updatedAt: true } }),
    prisma.application.findMany({ where, orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }], skip: (page - 1) * ADMIN_LIST_PAGE_SIZE, take: ADMIN_LIST_PAGE_SIZE, select: { id: true, registrationNumber: true, status: true, student: { select: { profile: { select: { fullName: true } } } }, statusHistory: { orderBy: { createdAt: "desc" }, take: 5, select: { status: true, notes: true, createdAt: true } }, tkaAttempts: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, status: true, startedAt: true, submittedAt: true, schedule: { select: { scheduledAt: true, status: true, tkaTest: { select: { name: true } } } } } }, tkaResults: { orderBy: { createdAt: "desc" }, take: 1, select: { totalScore: true, publishedAt: true } } } }),
    prisma.application.count({ where }),
  ]);
  const durationMinutes = Number(setting?.value);
  return { durationMinutes: Number.isSafeInteger(durationMinutes) && durationMinutes > 0 && durationMinutes <= MAX_TKA_DURATION_MINUTES ? durationMinutes : null, durationUpdatedAt: setting?.updatedAt ?? null, applications, pagination: { page, pageSize: ADMIN_LIST_PAGE_SIZE, total, totalPages: Math.ceil(total / ADMIN_LIST_PAGE_SIZE) } };
}

export async function saveAdminTkaDuration(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const durationMinutes = parseTkaDuration(raw);
  return prisma.$transaction(async (tx) => {
    const saved = await tx.schoolSetting.upsert({ where: { key: spmbPolicy.tkaDurationMinutesSettingKey }, create: { key: spmbPolicy.tkaDurationMinutesSettingKey, value: String(durationMinutes), description: "Durasi TKA dalam menit; ditetapkan admin." }, update: { value: String(durationMinutes), description: "Durasi TKA dalam menit; ditetapkan admin." }, select: { updatedAt: true } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_CONFIGURATION", entityId: spmbPolicy.tkaDurationMinutesSettingKey, action: AuditAction.UPDATE, details: { durationMinutes } } });
    return { durationMinutes, updatedAt: saved.updatedAt };
  });
}

export async function grantAdminTkaEligibility(applicationId: string, raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const body = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!reason || reason.length > 1000) throw new TkaInputError();
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!application || !canGrantTkaEligibility(application.status)) throw new TkaConflictError();
    const changed = await tx.application.updateMany({ where: { id: application.id, status: application.status }, data: { status: "ELIGIBLE_FOR_TKA" } });
    if (changed.count !== 1) throw new TkaConflictError();
    await tx.applicationStatusHistory.create({ data: { applicationId, status: "ELIGIBLE_FOR_TKA", changedByUserId: actor.id, notes: reason } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_ELIGIBILITY", entityId: applicationId, action: AuditAction.UPDATE, details: { from: application.status, to: "ELIGIBLE_FOR_TKA", reason } } });
    return { applicationId, status: "ELIGIBLE_FOR_TKA" };
  });
}

export async function listAdminTkaTests() {
  await requireRole(RoleName.ADMIN);
  return prisma.tkaTest.findMany({ orderBy: [{ updatedAt: "desc" }], select: { id: true, code: true, name: true, description: true, status: true, startsAt: true, endsAt: true, isActive: true, questions: { select: { id: true, questionText: true, difficulty: true, points: true, isActive: true, options: { select: { id: true, optionText: true, isCorrect: true } } } }, schedules: { select: { id: true, scheduledAt: true, status: true, location: true, capacity: true, _count: { select: { attempts: true } } } } } });
}

export async function createAdminTkaTest(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parseTkaTestInput(raw);
  return prisma.$transaction(async (tx) => {
    const created = await tx.tkaTest.create({ data: input, select: { id: true, code: true, name: true, description: true, status: true, startsAt: true, endsAt: true } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_TEST", entityId: created.id, action: AuditAction.CREATE, details: { status: created.status } } });
    return created;
  });
}

export async function addAdminTkaQuestion(testId: string, raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parseTkaQuestionInput(raw);
  return prisma.$transaction(async (tx) => {
    const test = await tx.tkaTest.updateMany({ where: { id: testId, status: "DRAFT" }, data: { updatedAt: new Date() } });
    if (test.count !== 1) throw new TkaConflictError();
    const question = await tx.tkaQuestion.create({ data: { tkaTestId: testId, questionText: input.questionText, difficulty: input.difficulty, points: input.points, options: { create: input.options } }, select: { id: true, questionText: true, difficulty: true, points: true, options: { select: { id: true, optionText: true, isCorrect: true } } } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_QUESTION", entityId: question.id, action: AuditAction.CREATE, details: { testId } } });
    return question;
  });
}

export async function updateAdminTkaQuestion(testId: string, questionId: string, raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parseTkaQuestionInput(raw);
  return prisma.$transaction(async (tx) => {
    const test = await tx.tkaTest.updateMany({ where: { id: testId, status: "DRAFT" }, data: { updatedAt: new Date() } });
    const question = await tx.tkaQuestion.findFirst({ where: { id: questionId, tkaTestId: testId, isActive: true }, select: { id: true } });
    if (test.count !== 1 || !question) throw new TkaConflictError();
    await tx.tkaQuestionOption.deleteMany({ where: { questionId } });
    const updated = await tx.tkaQuestion.update({ where: { id: questionId }, data: {
      questionText: input.questionText,
      difficulty: input.difficulty,
      points: input.points,
      options: { create: input.options },
    }, select: { id: true, questionText: true, difficulty: true, points: true, options: { select: { id: true, optionText: true, isCorrect: true } } } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_QUESTION", entityId: questionId, action: AuditAction.UPDATE, details: { testId } } });
    return updated;
  });
}

export async function deactivateAdminTkaQuestion(testId: string, questionId: string) {
  const actor = await requireRole(RoleName.ADMIN);
  return prisma.$transaction(async (tx) => {
    const test = await tx.tkaTest.updateMany({ where: { id: testId, status: "DRAFT" }, data: { updatedAt: new Date() } });
    if (test.count !== 1) throw new TkaConflictError();
    const changed = await tx.tkaQuestion.updateMany({ where: { id: questionId, tkaTestId: testId, isActive: true }, data: { isActive: false } });
    if (changed.count !== 1) throw new TkaConflictError();
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_QUESTION", entityId: questionId, action: AuditAction.UPDATE, details: { testId, isActive: false } } });
    return { id: questionId, isActive: false };
  });
}

export async function changeAdminTkaTestStatus(testId: string, rawStatus: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  if (rawStatus !== "PUBLISHED" && rawStatus !== "ARCHIVED") throw new TkaInputError();
  return prisma.$transaction(async (tx) => {
    const allowedStatuses = rawStatus === "PUBLISHED" ? ["DRAFT"] : ["DRAFT", "PUBLISHED"];
    const locked = await tx.tkaTest.updateMany({ where: { id: testId, status: { in: allowedStatuses } }, data: { updatedAt: new Date() } });
    if (locked.count !== 1) {
      const exists = await tx.tkaTest.findUnique({ where: { id: testId }, select: { id: true } });
      if (!exists) throw new TkaUnavailableError();
      throw new TkaConflictError();
    }
    const test = await tx.tkaTest.findUnique({ where: { id: testId }, select: { id: true, status: true, questions: { where: { isActive: true }, select: { points: true, options: { select: { isCorrect: true } } } } } });
    if (!test) throw new TkaUnavailableError();
    if (rawStatus === "PUBLISHED") {
      if (test.status !== "DRAFT" || test.questions.length === 0 || test.questions.some((q) => q.points === null || q.points < 0 || q.options.length < 2 || q.options.filter((option) => option.isCorrect).length !== 1)) throw new TkaConflictError();
      const setting = await tx.schoolSetting.findUnique({ where: { key: spmbPolicy.tkaDurationMinutesSettingKey }, select: { value: true } });
      if (!readPositiveInteger(setting?.value)) throw new TkaUnavailableError();
    } else if (test.status !== "DRAFT" && test.status !== "PUBLISHED") throw new TkaConflictError();
    const updated = await tx.tkaTest.updateMany({ where: { id: testId, status: test.status }, data: { status: rawStatus } });
    if (updated.count !== 1) throw new TkaConflictError();
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_TEST", entityId: testId, action: rawStatus === "PUBLISHED" ? AuditAction.PUBLISH : AuditAction.UPDATE, details: { status: rawStatus } } });
    return { id: testId, status: rawStatus };
  });
}

export async function listAdminTkaSchedules() {
  await requireRole(RoleName.ADMIN);
  return prisma.tkaSchedule.findMany({ orderBy: { scheduledAt: "asc" }, select: { id: true, scheduledAt: true, status: true, location: true, capacity: true, tkaTest: { select: { code: true, name: true, status: true } }, studyProgram: { select: { code: true, name: true } }, _count: { select: { attempts: true } } } });
}

export async function createAdminTkaSchedule(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parseTkaScheduleInput(raw);
  return prisma.$transaction(async (tx) => {
    const test = await tx.tkaTest.findFirst({ where: { id: input.tkaTestId, status: "PUBLISHED", isActive: true }, select: { id: true } });
    if (!test) throw new TkaUnavailableError();
    if (input.studyProgramId && !await tx.studyProgram.findFirst({ where: { id: input.studyProgramId, isActive: true }, select: { id: true } })) throw new TkaInputError();
    const schedule = await tx.tkaSchedule.create({ data: { ...input, status: "SCHEDULED" }, select: { id: true, scheduledAt: true, status: true, location: true, capacity: true } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_SCHEDULE", entityId: schedule.id, action: AuditAction.CREATE, details: { testId: input.tkaTestId } } });
    return schedule;
  });
}

export async function listAdminTkaResults() {
  await requireRole(RoleName.ADMIN);
  return prisma.tkaResult.findMany({ orderBy: [{ publishedAt: "asc" }, { createdAt: "desc" }], select: { id: true, totalScore: true, publishedAt: true, attempt: { select: { status: true, submittedAt: true, schedule: { select: { tkaTest: { select: { name: true } } } } }, }, application: { select: { registrationNumber: true, student: { select: { profile: { select: { fullName: true } } } } } } } });
}

export async function publishAdminTkaResult(resultId: string) {
  const actor = await requireRole(RoleName.ADMIN);
  return prisma.$transaction(async (tx) => {
    const result = await tx.tkaResult.findUnique({ where: { id: resultId }, select: { id: true, publishedAt: true, totalScore: true, attempt: { select: { status: true } } } });
    if (!result || !canPublishTkaScore(result.attempt.status, result.totalScore)) throw new TkaUnavailableError();
    if (result.publishedAt) return { id: result.id, publishedAt: result.publishedAt };
    const publishedAt = new Date();
    const changed = await tx.tkaResult.updateMany({ where: { id: resultId, publishedAt: null, totalScore: { not: null } }, data: { publishedAt } });
    if (changed.count !== 1) throw new TkaConflictError();
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "TKA_RESULT", entityId: resultId, action: AuditAction.PUBLISH, details: { scorePublished: true } } });
    return { id: resultId, publishedAt };
  });
}
