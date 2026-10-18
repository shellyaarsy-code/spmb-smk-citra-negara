import assert from "node:assert/strict";
import test from "node:test";
import { canGrantTkaEligibility, canPublishTkaScore, isWithinTkaAnswerWindow, parseTkaAnswer, parseTkaDuration, parseTkaQuestionInput, parseTkaScheduleInput, parseTkaTestInput, resolveTkaSubmissionTime, scoreMultipleChoice, TkaConflictError, TkaInputError } from "../../services/tka/tka-policy";

test("TKA duration requires explicit positive integer configuration and eligibility excludes terminal states", () => {
  assert.equal(parseTkaDuration({ durationMinutes: 60 }), 60);
  for (const value of [null, {}, { durationMinutes: 0 }, { durationMinutes: 1.5 }, { durationMinutes: 1441 }]) assert.throws(() => parseTkaDuration(value), TkaInputError);
  assert.equal(canGrantTkaEligibility("PAYMENT_VERIFIED"), true);
  assert.equal(canGrantTkaEligibility("TKA_STARTED"), false);
  assert.equal(canGrantTkaEligibility("PASSED"), false);
  assert.equal(canGrantTkaEligibility("DRAFT"), false);
});

test("TKA answer input accepts only question and option identifiers", () => {
  assert.deepEqual(parseTkaAnswer({ questionId: "q1", selectedOptionId: "o1", isCorrect: true }), { questionId: "q1", selectedOptionId: "o1" });
  assert.throws(() => parseTkaAnswer({ questionId: "q1", selectedOptionId: "" }), TkaInputError);
  assert.throws(() => parseTkaAnswer(null), TkaInputError);
});

test("TKA scoring awards only explicit points for correct selected options", () => {
  const questions = [
    { id: "q1", points: 4, options: [{ id: "a", isCorrect: true }, { id: "b", isCorrect: false }] },
    { id: "q2", points: 7, options: [{ id: "c", isCorrect: false }, { id: "d", isCorrect: true }] },
  ];
  assert.equal(scoreMultipleChoice(questions, new Map([["q1", "a"], ["q2", "c"]])), 4);
  assert.equal(scoreMultipleChoice(questions, new Map([["q1", "unknown"], ["q2", "d"]])), 7);
});

test("admin TKA input validates question keys, explicit points, and one answer key", () => {
  const input = { questionText: "  2 + 2? ", difficulty: "MUDAH", points: 5, options: [{ text: "4", isCorrect: true }, { text: "5", isCorrect: false }] };
  assert.equal(parseTkaQuestionInput(input).questionText, "2 + 2?");
  assert.throws(() => parseTkaQuestionInput({ ...input, points: -1 }), TkaInputError);
  assert.throws(() => parseTkaQuestionInput({ ...input, options: [{ text: "4", isCorrect: true }, { text: "5", isCorrect: true }] }), TkaInputError);
});

test("admin TKA test and schedule inputs reject malformed or unsafe values", () => {
  assert.equal(parseTkaTestInput({ code: " tka-1 ", name: " Tes ", startsAt: null }).code, "TKA-1");
  assert.throws(() => parseTkaTestInput({ code: "?", name: "Tes" }), TkaInputError);
  assert.equal(parseTkaScheduleInput({ testId: "test-id", scheduledAt: "2026-11-01T02:00:00Z", capacity: 10 }).capacity, 10);
  assert.throws(() => parseTkaScheduleInput({ testId: "test-id", scheduledAt: "not-a-date", capacity: 10 }), TkaInputError);
});

test("server deadline blocks answers after timeout but permits a controlled submit path", () => {
  const startedAt = new Date("2026-10-16T00:00:00Z");
  assert.equal(isWithinTkaAnswerWindow(startedAt, 60, new Date("2026-10-16T00:59:59Z")), true);
  assert.equal(isWithinTkaAnswerWindow(startedAt, 60, new Date("2026-10-16T01:00:00Z")), true);
  assert.equal(isWithinTkaAnswerWindow(startedAt, 60, new Date("2026-10-16T01:00:01Z")), false);
  assert.equal(isWithinTkaAnswerWindow(null, 60), false);
  const timely = resolveTkaSubmissionTime(startedAt, 60, new Date("2026-10-16T00:59:59Z"));
  const atDeadline = resolveTkaSubmissionTime(startedAt, 60, new Date("2026-10-16T01:00:00Z"));
  const timedOut = resolveTkaSubmissionTime(startedAt, 60, new Date("2026-10-16T01:03:00Z"));
  assert.equal(timely.timedOut, false);
  assert.equal(timely.submittedAt.toISOString(), "2026-10-16T00:59:59.000Z");
  assert.equal(atDeadline.timedOut, false);
  assert.equal(atDeadline.submittedAt.toISOString(), "2026-10-16T01:00:00.000Z");
  assert.equal(timedOut.timedOut, true);
  assert.equal(timedOut.submittedAt.toISOString(), "2026-10-16T01:00:00.000Z");
  assert.equal(isWithinTkaAnswerWindow(startedAt, 45, new Date("2026-10-16T00:45:00Z")), true);
  assert.equal(isWithinTkaAnswerWindow(startedAt, 45, new Date("2026-10-16T00:45:01Z")), false);
  const shortened = resolveTkaSubmissionTime(startedAt, 45, new Date("2026-10-16T00:50:00Z"));
  assert.equal(shortened.timedOut, true);
  assert.equal(shortened.submittedAt.toISOString(), "2026-10-16T00:45:00.000Z");
  assert.equal(scoreMultipleChoice([{ id: "saved-q", points: 5, options: [{ id: "saved-correct", isCorrect: true }] }], new Map([["saved-q", "saved-correct"]])), 5);
  const extended = resolveTkaSubmissionTime(startedAt, 75, new Date("2026-10-16T01:05:00Z"));
  assert.equal(extended.timedOut, false);
  assert.equal(extended.submittedAt.toISOString(), "2026-10-16T01:05:00.000Z");
  assert.throws(() => resolveTkaSubmissionTime(startedAt, 1441), TkaConflictError);
  assert.throws(() => resolveTkaSubmissionTime(new Date(Number.NaN), 60), TkaConflictError);
  assert.equal(canPublishTkaScore("COMPLETED", 0), true);
  assert.equal(canPublishTkaScore("ACTIVE", 90), false);
  assert.equal(canPublishTkaScore("COMPLETED", null), false);
});
