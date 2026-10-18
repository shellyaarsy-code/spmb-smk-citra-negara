export type AnnouncementInput = { title: string; content: string };
export class AnnouncementInputError extends Error { constructor() { super("Invalid announcement input"); this.name = "AnnouncementInputError"; } }
export class AnnouncementNotFoundError extends Error { constructor() { super("Announcement not found"); this.name = "AnnouncementNotFoundError"; } }
export class AnnouncementConflictError extends Error { constructor() { super("Announcement cannot be changed in this state"); this.name = "AnnouncementConflictError"; } }

export function parseAnnouncementInput(value: unknown): AnnouncementInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AnnouncementInputError();
  const body = value as Record<string, unknown>;
  if (typeof body.title !== "string" || typeof body.content !== "string") throw new AnnouncementInputError();
  const title = body.title.trim();
  const content = body.content.trim();
  if (!title || title.length > 200 || !content || content.length > 10000) throw new AnnouncementInputError();
  return { title, content };
}

export function parseAnnouncementStatus(value: unknown): "PUBLISHED" | "ARCHIVED" {
  if (value !== "PUBLISHED" && value !== "ARCHIVED") throw new AnnouncementInputError();
  return value;
}
