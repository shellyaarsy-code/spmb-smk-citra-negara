import "server-only";
import { AuditAction, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { spmbPolicy } from "../../config/spmb-policy";
import { requireRole } from "../auth/authorization";
import { isSelectionReleaseEnabled, parseSelectionDecision, parseSelectionPolicyDraft, SelectionPolicyInputError } from "./selection-policy";

const policyKey = "SPMB_SELECTION_POLICY_DRAFT";
const ADMIN_CANDIDATE_PAGE_SIZE = 25;
function pageNumber(value: unknown) {
  const parsed = typeof value === "string" && /^\\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 1_000_000) : 1;
}

export async function getAdminSelectionOverview(rawPage?: unknown) {
  await requireRole(RoleName.ADMIN);
  const page = pageNumber(rawPage);
  const candidateWhere = { application: { status: { not: "DRAFT" as const } } };
  const [policySetting, releaseSetting, finalCount, rows, choices, candidateTotal] = await Promise.all([
    prisma.schoolSetting.findUnique({ where: { key: policyKey }, select: { value: true, updatedAt: true } }),
    prisma.schoolSetting.findUnique({ where: { key: spmbPolicy.selectionResultsPublishedSettingKey }, select: { value: true } }),
    prisma.selection.count({ where: { status: { not: "PENDING" } } }),
    prisma.selection.findMany({ where: { status: { not: "PENDING" } }, orderBy: [{ studyProgramId: "asc" }, { selectionRank: "asc" }], select: { id: true, status: true, selectionRank: true, notes: true, studyProgram: { select: { code: true, name: true } }, application: { select: { registrationNumber: true, student: { select: { profile: { select: { fullName: true } } } } } } } }),
    prisma.applicationProgramChoice.findMany({ where: candidateWhere, orderBy: [{ application: { submittedAt: "desc" } }, { application: { createdAt: "desc" } }, { applicationId: "asc" }, { priority: "asc" }], skip: (page - 1) * ADMIN_CANDIDATE_PAGE_SIZE, take: ADMIN_CANDIDATE_PAGE_SIZE, select: { applicationId: true, priority: true, studyProgram: { select: { id: true, code: true, name: true } }, application: { select: { registrationNumber: true, status: true, student: { select: { profile: { select: { fullName: true } } } }, selections: { select: { id: true, studyProgramId: true, status: true, notes: true, selectionRank: true } } } } } }),
    prisma.applicationProgramChoice.count({ where: candidateWhere }),
  ]);
  let policy = null;
  if (policySetting) { try { policy = parseSelectionPolicyDraft(JSON.parse(policySetting.value)); } catch { policy = null; } }
  const candidates = choices.map((choice) => {
    const application = choice.application;
    const decision = application.selections.find((item) => item.studyProgramId === choice.studyProgram.id);
    return { applicationId: choice.applicationId, registrationNumber: application.registrationNumber, applicationStatus: application.status, student: application.student, priority: choice.priority, studyProgram: choice.studyProgram, selection: decision ? { id: decision.id, status: decision.status, notes: decision.notes, selectionRank: decision.selectionRank } : null };
  });
  const selectionIds = candidates.flatMap((candidate) => candidate.selection ? [candidate.selection.id] : []);
  const audits = selectionIds.length ? await prisma.auditLog.findMany({ where: { entityType: "SELECTION_DECISION", entityId: { in: selectionIds } }, orderBy: { createdAt: "desc" }, select: { entityId: true, action: true, createdAt: true } }) : [];
  const latestAudit = new Map<string, (typeof audits)[number]>();
  for (const entry of audits) if (entry.entityId && !latestAudit.has(entry.entityId)) latestAudit.set(entry.entityId, entry);
  const candidatesWithAudit = candidates.map((candidate) => ({ ...candidate, lastAudit: candidate.selection ? latestAudit.get(candidate.selection.id) ?? null : null }));
  const releaseAllowed = spmbPolicy.officialRulesApproved;
  return { rulesApproved: spmbPolicy.officialRulesApproved, demoMode: spmbPolicy.demoMode, published: isSelectionReleaseEnabled(releaseAllowed, releaseSetting?.value), policy, policyUpdatedAt: policySetting?.updatedAt ?? null, finalDecisionCount: finalCount, candidates: candidatesWithAudit, candidatePagination: { page, pageSize: ADMIN_CANDIDATE_PAGE_SIZE, total: candidateTotal, totalPages: Math.ceil(candidateTotal / ADMIN_CANDIDATE_PAGE_SIZE) }, results: releaseAllowed ? rows : [] };
}

export async function saveAdminSelectionDecision(applicationId: string, studyProgramId: string, raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const decision = parseSelectionDecision(raw);
  return prisma.$transaction(async (tx) => {
    const publication = await tx.schoolSetting.findUnique({ where: { key: spmbPolicy.selectionResultsPublishedSettingKey }, select: { value: true } });
    if (publication?.value.trim().toLowerCase() === "true") throw new SelectionPolicyInputError();
    const choice = await tx.applicationProgramChoice.findFirst({ where: { applicationId, studyProgramId, application: { status: { not: "DRAFT" } } }, select: { applicationId: true, studyProgramId: true } });
    if (!choice) throw new SelectionPolicyInputError();
    const saved = await tx.selection.upsert({ where: { applicationId_studyProgramId: { applicationId, studyProgramId } }, create: { applicationId, studyProgramId, status: decision.status, notes: decision.notes }, update: { status: decision.status, notes: decision.notes }, select: { id: true, status: true, notes: true } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "SELECTION_DECISION", entityId: saved.id, action: AuditAction.UPDATE, details: { applicationId, studyProgramId, status: decision.status, provisional: !spmbPolicy.officialRulesApproved } } });
    return saved;
  });
}

export async function saveAdminSelectionPolicy(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const policy = parseSelectionPolicyDraft(raw);
  return prisma.$transaction(async (tx) => {
    const saved = await tx.schoolSetting.upsert({ where: { key: policyKey }, create: { key: policyKey, value: JSON.stringify(policy), description: "Draf kebijakan seleksi; provisional sampai disetujui sekolah." }, update: { value: JSON.stringify(policy), description: "Draf kebijakan seleksi; provisional sampai disetujui sekolah." }, select: { updatedAt: true } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "SELECTION_POLICY", entityId: policyKey, action: AuditAction.UPDATE, details: { provisional: true, criteriaCount: policy.criteria.length } } });
    return { policy, provisional: true, updatedAt: saved.updatedAt };
  });
}

export async function setAdminSelectionPublication(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || typeof (raw as Record<string, unknown>).published !== "boolean") throw new SelectionPolicyInputError();
  const published = (raw as { published: boolean }).published;
  if (published && !spmbPolicy.officialRulesApproved) throw new SelectionPolicyInputError();
  return prisma.$transaction(async (tx) => {
    if (published) {
      const [policySetting, finalCount] = await Promise.all([
        tx.schoolSetting.findUnique({ where: { key: policyKey }, select: { value: true } }),
        tx.selection.count({ where: { status: { not: "PENDING" } } }),
      ]);
      if (!policySetting || !finalCount) throw new SelectionPolicyInputError();
      try { parseSelectionPolicyDraft(JSON.parse(policySetting.value)); } catch { throw new SelectionPolicyInputError(); }
    }
    await tx.schoolSetting.upsert({ where: { key: spmbPolicy.selectionResultsPublishedSettingKey }, create: { key: spmbPolicy.selectionResultsPublishedSettingKey, value: String(published), description: spmbPolicy.demoMode ? "Publikasi hasil contoh untuk demo saja." : "Publikasi hasil seleksi; aktif hanya setelah aturan disetujui." }, update: { value: String(published) } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "SELECTION_PUBLICATION", entityId: spmbPolicy.selectionResultsPublishedSettingKey, action: published ? AuditAction.PUBLISH : AuditAction.UPDATE, details: { published } } });
    return { published };
  });
}
