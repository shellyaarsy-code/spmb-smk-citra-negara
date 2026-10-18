export function isSelectionReleaseEnabled(rulesApproved: boolean, settingValue: string | undefined) {
  if (!rulesApproved) return false;
  return settingValue?.trim().toLowerCase() === "true";
}

export type SelectionPolicyDraft = { criteria: { name: string; weight: number }[] };
export class SelectionPolicyInputError extends Error { constructor() { super("Invalid selection policy"); this.name = "SelectionPolicyInputError"; } }

export function parseSelectionDecision(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new SelectionPolicyInputError();
  const body = value as Record<string, unknown>;
  if (!["PENDING", "PASSED", "WAITLISTED", "FAILED"].includes(String(body.status)) || typeof body.notes !== "string" || !body.notes.trim() || body.notes.trim().length > 1000) throw new SelectionPolicyInputError();
  return { status: body.status as "PENDING" | "PASSED" | "WAITLISTED" | "FAILED", notes: body.notes.trim() };
}

export function parseSelectionPolicyDraft(value: unknown): SelectionPolicyDraft {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray((value as Record<string, unknown>).criteria)) throw new SelectionPolicyInputError();
  const criteria = (value as { criteria: unknown[] }).criteria;
  if (!criteria.length || criteria.length > 10) throw new SelectionPolicyInputError();
  const parsed = criteria.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new SelectionPolicyInputError();
    const row = item as Record<string, unknown>;
    if (typeof row.name !== "string" || !row.name.trim() || row.name.trim().length > 100 || !Number.isSafeInteger(row.weight) || (row.weight as number) < 0 || (row.weight as number) > 100) throw new SelectionPolicyInputError();
    return { name: row.name.trim(), weight: row.weight as number };
  });
  if (new Set(parsed.map((item) => item.name.toLocaleLowerCase("id-ID"))).size !== parsed.length || parsed.reduce((sum, item) => sum + item.weight, 0) !== 100) throw new SelectionPolicyInputError();
  return { criteria: parsed };
}
