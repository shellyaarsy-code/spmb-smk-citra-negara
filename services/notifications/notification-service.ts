import "server-only";
import { AuditAction, RoleName } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { requireRole } from "../auth/authorization";
import { notificationOwnerWhere, notificationReadUpdate } from "./notification-policy";

export class NotificationNotFoundError extends Error { constructor() { super("Notification not found"); this.name = "NotificationNotFoundError"; } }

export async function listCurrentStudentNotifications() {
  const user = await requireRole(RoleName.SISWA);
  return prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, title: true, message: true, type: true, isRead: true, readAt: true, createdAt: true, announcement: { select: { status: true } } } });
}

export async function markCurrentStudentNotificationRead(notificationId: string) {
  const user = await requireRole(RoleName.SISWA);
  return prisma.$transaction(async (tx) => {
    const changed = await tx.notification.updateMany({ where: { ...notificationOwnerWhere(user.id, notificationId), isRead: false }, data: notificationReadUpdate(new Date()) });
    if (changed.count === 1) {
      await tx.auditLog.create({ data: { actorUserId: user.id, entityType: "NOTIFICATION", entityId: notificationId, action: AuditAction.READ } });
      return { id: notificationId, isRead: true };
    }
    const existing = await tx.notification.findFirst({ where: notificationOwnerWhere(user.id, notificationId), select: { id: true, isRead: true } });
    if (!existing) throw new NotificationNotFoundError();
    return existing;
  });
}
