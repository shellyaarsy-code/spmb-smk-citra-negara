import assert from "node:assert/strict";
import test from "node:test";
import { isSelectionReleaseEnabled, parseSelectionDecision, parseSelectionPolicyDraft, SelectionPolicyInputError } from "../../services/selection/selection-policy";

test("selection results stay hidden unless approved and explicitly published", () => {
  assert.equal(isSelectionReleaseEnabled(false, "true"), false);
  assert.equal(isSelectionReleaseEnabled(true, undefined), false);
  assert.equal(isSelectionReleaseEnabled(true, "false"), false);
  assert.equal(isSelectionReleaseEnabled(true, " TRUE "), true);
});

test("selection decisions use only stored statuses and require an audit note", () => {
  assert.deepEqual(parseSelectionDecision({ status: "PASSED", notes: "Keputusan rapat panitia" }), { status: "PASSED", notes: "Keputusan rapat panitia" });
  assert.throws(() => parseSelectionDecision({ status: "AUTO_PASS", notes: "" }), SelectionPolicyInputError);
  assert.throws(() => parseSelectionDecision({ status: "FAILED", notes: " " }), SelectionPolicyInputError);
});

test("selection policy draft requires unique criteria and exactly 100 provisional points", () => {
  assert.deepEqual(parseSelectionPolicyDraft({ criteria: [{ name: "Academic", weight: 70 }, { name: "Other", weight: 30 }] }).criteria.length, 2);
  assert.throws(() => parseSelectionPolicyDraft({ criteria: [{ name: "A", weight: 40 }] }), SelectionPolicyInputError);
  assert.throws(() => parseSelectionPolicyDraft({ criteria: [{ name: "A", weight: 50 }, { name: "a", weight: 50 }] }), SelectionPolicyInputError);
});
