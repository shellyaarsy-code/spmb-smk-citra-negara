import assert from "node:assert/strict";
import test from "node:test";
import { buildAnnouncementNotifications, notificationOwnerWhere, notificationReadUpdate } from "../../services/notifications/notification-policy";

test("announcement notifications target each supplied student and bound message size", () => {
  const rows = buildAnnouncementNotifications([{ id: "u1" }, { id: "u2" }], { id: "a1", title: "Info", content: "x".repeat(700) });
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.userId), ["u1", "u2"]);
  assert.ok(rows.every((row) => row.announcementId === "a1" && row.type === "INFO" && row.message.length === 500));
});

test("notification read mutation is owner-scoped and produces a consistent read timestamp", () => {
  assert.deepEqual(notificationOwnerWhere("student-1", "notice-1"), { id: "notice-1", userId: "student-1" });
  const readAt = new Date("2026-10-16T00:00:00Z");
  assert.deepEqual(notificationReadUpdate(readAt), { isRead: true, readAt });
});
