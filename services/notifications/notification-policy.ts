export function buildAnnouncementNotifications(users: readonly { id: string }[], announcement: { id: string; title: string; content: string }) {
  return users.map(({ id: userId }) => ({ userId, announcementId: announcement.id, title: announcement.title, message: announcement.content.slice(0, 500), type: "INFO" as const }));
}

export function notificationOwnerWhere(userId: string, notificationId: string) { return { id: notificationId, userId }; }
export function notificationReadUpdate(readAt: Date) { return { isRead: true, readAt }; }
