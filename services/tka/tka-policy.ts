export class TkaInputError extends Error { constructor() { super("Invalid TKA input"); this.name = "TkaInputError"; } }
export class TkaUnavailableError extends Error { constructor() { super("TKA is unavailable"); this.name = "TkaUnavailableError"; } }
export class TkaConflictError extends Error { constructor() { super("TKA state conflict"); this.name = "TkaConflictError"; } }

export const MAX_TKA_DURATION_MINUTES = 1440;

export function parseTkaDuration(value: unknown): number {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TkaInputError();
  const durationMinutes = (value as Record<string, unknown>).durationMinutes;
  if (!Number.isSafeInteger(durationMinutes) || (durationMinutes as number) < 1 || (durationMinutes as number) > MAX_TKA_DURATION_MINUTES) throw new TkaInputError();
  return durationMinutes as number;
}

export function canGrantTkaEligibility(status: string) {
  return ["SUBMITTED", "WAITING_DOCUMENT_VERIFICATION", "DOCUMENT_REVISION_REQUIRED", "DOCUMENT_VERIFIED", "WAITING_PAYMENT", "PAYMENT_VERIFIED", "WAITING_SELECTION"].includes(status);
}

export function parseTkaTestInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TkaInputError();
  const body = value as Record<string, unknown>;
  if (typeof body.code !== "string" || !/^[A-Za-z0-9_-]{2,30}$/.test(body.code.trim()) || typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 150) throw new TkaInputError();
  if (body.description !== undefined && body.description !== null && (typeof body.description !== "string" || body.description.length > 2000)) throw new TkaInputError();
  const date = (entry: unknown) => entry == null || entry === "" ? null : typeof entry === "string" && Number.isFinite(Date.parse(entry)) ? new Date(entry) : undefined;
  const startsAt = date(body.startsAt); const endsAt = date(body.endsAt);
  if (startsAt === undefined || endsAt === undefined || (startsAt && endsAt && startsAt >= endsAt)) throw new TkaInputError();
  return { code: body.code.trim().toUpperCase(), name: body.name.trim(), description: typeof body.description === "string" ? body.description.trim() : null, startsAt, endsAt };
}

export function parseTkaQuestionInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TkaInputError();
  const body = value as Record<string, unknown>;
  const difficulties = ["MUDAH", "SEDANG", "SULIT"];
  if (typeof body.questionText !== "string" || !body.questionText.trim() || body.questionText.length > 10000 || !Number.isSafeInteger(body.points) || (body.points as number) < 0 || !difficulties.includes(String(body.difficulty))) throw new TkaInputError();
  if (!Array.isArray(body.options) || body.options.length < 2 || body.options.length > 8 || body.options.some((option) => !option || typeof option !== "object" || typeof (option as Record<string, unknown>).text !== "string" || !(option as Record<string, string>).text.trim() || typeof (option as Record<string, unknown>).isCorrect !== "boolean") || body.options.filter((option) => (option as Record<string, unknown>).isCorrect === true).length !== 1) throw new TkaInputError();
  return { questionText: body.questionText.trim(), points: body.points as number, difficulty: body.difficulty as "MUDAH" | "SEDANG" | "SULIT", options: body.options.map((option) => ({ optionText: (option as { text: string }).text.trim(), isCorrect: (option as { isCorrect: boolean }).isCorrect })) };
}

export function parseTkaScheduleInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TkaInputError();
  const body = value as Record<string, unknown>;
  const scheduledAt = typeof body.scheduledAt === "string" && Number.isFinite(Date.parse(body.scheduledAt)) ? new Date(body.scheduledAt) : null;
  if (typeof body.testId !== "string" || !body.testId.trim() || !scheduledAt || (body.location !== undefined && body.location !== null && typeof body.location !== "string") || (body.capacity !== undefined && body.capacity !== null && (!Number.isSafeInteger(body.capacity) || (body.capacity as number) <= 0)) || (body.studyProgramId !== undefined && body.studyProgramId !== null && typeof body.studyProgramId !== "string")) throw new TkaInputError();
  return { tkaTestId: body.testId, scheduledAt, location: typeof body.location === "string" ? body.location.trim() || null : null, capacity: (body.capacity as number | null | undefined) ?? null, studyProgramId: (body.studyProgramId as string | null | undefined) ?? null };
}

export function parseTkaAnswer(value: unknown): { questionId: string; selectedOptionId: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TkaInputError();
  const body = value as Record<string, unknown>;
  if (typeof body.questionId !== "string" || !body.questionId.trim() || typeof body.selectedOptionId !== "string" || !body.selectedOptionId.trim()) throw new TkaInputError();
  return { questionId: body.questionId.trim(), selectedOptionId: body.selectedOptionId.trim() };
}

export function scoreMultipleChoice(questions: readonly { id: string; points: number | null; options: readonly { id: string; isCorrect: boolean }[] }[], answers: ReadonlyMap<string, string>) {
  let total = 0;
  for (const question of questions) {
    const selectedId = answers.get(question.id);
    if (selectedId && question.options.some((option) => option.id === selectedId && option.isCorrect)) total += question.points ?? 0;
  }
  return total;
}

export function isWithinTkaAnswerWindow(startedAt: Date | null, durationMinutes: number, now = new Date()) {
  return startedAt !== null && Number.isFinite(startedAt.getTime()) && Number.isSafeInteger(durationMinutes) && durationMinutes > 0 && durationMinutes <= MAX_TKA_DURATION_MINUTES && now.getTime() <= startedAt.getTime() + durationMinutes * 60_000;
}

export function resolveTkaSubmissionTime(startedAt: Date | null, durationMinutes: number, now = new Date()) {
  if (startedAt === null || !Number.isFinite(startedAt.getTime()) || !Number.isSafeInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > MAX_TKA_DURATION_MINUTES) throw new TkaConflictError();
  const deadline = new Date(startedAt.getTime() + durationMinutes * 60_000);
  const timedOut = now.getTime() > deadline.getTime();
  return { timedOut, submittedAt: timedOut ? deadline : now };
}

export function canPublishTkaScore(attemptStatus: string, totalScore: number | null) {
  return attemptStatus === "COMPLETED" && totalScore !== null && Number.isSafeInteger(totalScore) && totalScore >= 0;
}
