import "server-only";
import { AnnouncementStatus, AuditAction, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { AnnouncementConflictError, AnnouncementNotFoundError, parseAnnouncementInput, parseAnnouncementStatus } from "./announcement-policy";
import { buildAnnouncementNotifications } from "../notifications/notification-policy";

export { AnnouncementConflictError, AnnouncementInputError, AnnouncementNotFoundError } from "./announcement-policy";

export async function listAdminAnnouncements() {
  await requireRole(RoleName.ADMIN);
  return prisma.announcement.findMany({ orderBy: [{ updatedAt: "desc" }, { id: "asc" }], select: { id: true, title: true, content: true, status: true, publishedAt: true, createdAt: true, updatedAt: true } });
}

export async function createAdminAnnouncement(raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parseAnnouncementInput(raw);
  return prisma.$transaction(async (tx) => {
    const created = await tx.announcement.create({ data: input, select: { id: true, title: true, content: true, status: true, publishedAt: true, createdAt: true, updatedAt: true } });
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "ANNOUNCEMENT", entityId: created.id, action: AuditAction.CREATE, details: { status: created.status } } });
    return created;
  });
}

export async function updateAdminAnnouncement(id: string, raw: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const input = parseAnnouncementInput(raw);
  return prisma.$transaction(async (tx) => {
    const changed = await tx.announcement.updateMany({ where: { id, status: AnnouncementStatus.DRAFT }, data: input });
    if (!changed.count) {
      const exists = await tx.announcement.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new AnnouncementNotFoundError();
      throw new AnnouncementConflictError();
    }
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "ANNOUNCEMENT", entityId: id, action: AuditAction.UPDATE, details: { fields: ["title", "content"] } } });
    return tx.announcement.findUniqueOrThrow({ where: { id }, select: { id: true, title: true, content: true, status: true, publishedAt: true, createdAt: true, updatedAt: true } });
  });
}

export async function changeAdminAnnouncementStatus(id: string, rawStatus: unknown) {
  const actor = await requireRole(RoleName.ADMIN);
  const status = parseAnnouncementStatus(rawStatus);
  return prisma.$transaction(async (tx) => {
    const allowedFrom = status === AnnouncementStatus.PUBLISHED ? [AnnouncementStatus.DRAFT] : [AnnouncementStatus.DRAFT, AnnouncementStatus.PUBLISHED];
    const changed = await tx.announcement.updateMany({ where: { id, status: { in: allowedFrom } }, data: { status, publishedAt: status === AnnouncementStatus.PUBLISHED ? new Date() : undefined } });
    if (!changed.count) {
      const exists = await tx.announcement.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new AnnouncementNotFoundError();
      throw new AnnouncementConflictError();
    }
    if (status === AnnouncementStatus.PUBLISHED) {
      const announcement = await tx.announcement.findUniqueOrThrow({ where: { id }, select: { title: true, content: true } });
      const students = await tx.user.findMany({ where: { isActive: true, role: { name: RoleName.SISWA } }, select: { id: true } });
      if (students.length) {
        await tx.notification.createMany({ data: buildAnnouncementNotifications(students, { id, title: announcement.title, content: announcement.content }) });
      }
    }
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "ANNOUNCEMENT", entityId: id, action: status === AnnouncementStatus.PUBLISHED ? AuditAction.PUBLISH : AuditAction.UPDATE, details: { status } } });
    return tx.announcement.findUniqueOrThrow({ where: { id }, select: { id: true, title: true, content: true, status: true, publishedAt: true, createdAt: true, updatedAt: true } });
  });
}

export async function deleteAdminDraftAnnouncement(id: string) {
  const actor = await requireRole(RoleName.ADMIN);
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.announcement.deleteMany({ where: { id, status: AnnouncementStatus.DRAFT } });
    if (!deleted.count) {
      const exists = await tx.announcement.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new AnnouncementNotFoundError();
      throw new AnnouncementConflictError();
    }
    await tx.auditLog.create({ data: { actorUserId: actor.id, entityType: "ANNOUNCEMENT", entityId: id, action: AuditAction.DELETE } });
    return { deleted: true };
  });
}

export async function listPublishedAnnouncements() {
  await requireRole(RoleName.SISWA);
  return prisma.announcement.findMany({ where: { status: AnnouncementStatus.PUBLISHED }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], select: { id: true, title: true, content: true, publishedAt: true } });
}
