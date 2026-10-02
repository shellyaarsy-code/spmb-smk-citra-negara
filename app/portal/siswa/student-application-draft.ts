export type StudentApplicationDraft = {
  values: Record<string, string>;
};

const DRAFT_KEY = "spmb-student-application-draft-v3";
const persistedStudentFields = new Set([
  "fullName", "nisn", "nik", "gender", "birthPlace", "birthDate", "religion", "familyCardNumber",
  "familyStatus", "citizenship", "streetAddress", "address", "province", "city", "district", "village",
  "postalCode", "phoneNumber", "schoolOrigin", "schoolName", "schoolNpsn", "schoolType", "schoolStatus",
  "graduationYear", "parentWhatsapp", "fatherName", "fatherOccupation", "fatherIncome", "motherName",
  "motherOccupation", "motherIncome", "otherGuardianName", "otherGuardianOccupation", "otherGuardianIncome",
  "photoFileName", "semester1Average", "semester2Average", "semester3Average", "semester4Average",
  "primaryProgram", "backupProgram",
]);

const emptyDraft: StudentApplicationDraft = { values: {} };

function transientValues(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).filter(([key, value]) => !persistedStudentFields.has(key) && typeof value === "string"),
  ) as Record<string, string>;
}

export function deferStudentDraftHydration(callback: () => void) {
  const timer = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timer);
}

export function readStudentDraft(): StudentApplicationDraft {
  if (typeof window === "undefined") return emptyDraft;
  try {
    const saved = window.sessionStorage.getItem(DRAFT_KEY);
    if (!saved) return emptyDraft;
    const parsed = JSON.parse(saved) as Partial<StudentApplicationDraft> & {
      documents?: unknown;
      certificateFiles?: unknown;
      submission?: unknown;
    };
    const storedValues = parsed.values && typeof parsed.values === "object" ? parsed.values : {};
    const values = transientValues(storedValues);
    const hasLegacyDocumentMetadata = "documents" in parsed || "certificateFiles" in parsed;
    const hasLegacySubmission = "submission" in parsed;
    const draft = { values };
    if (
      Object.keys(values).length !== Object.keys(storedValues).length ||
      hasLegacyDocumentMetadata ||
      hasLegacySubmission
    ) {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
    return draft;
  } catch {
    return emptyDraft;
  }
}

function writeStudentDraft(draft: StudentApplicationDraft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Keep the form usable when browser storage is unavailable or full.
  }
}

export function saveStudentDraftValues(values: Record<string, string>) {
  const draft = readStudentDraft();
  writeStudentDraft({ ...draft, values: { ...draft.values, ...transientValues(values) } });
}

export function saveStudentDraftForm(form: HTMLFormElement) {
  const values: Record<string, string> = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string") values[key] = value;
  }
  saveStudentDraftValues(values);
}

export function hydrateStudentDraftForm(form: HTMLFormElement) {
  const { values } = readStudentDraft();
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
    if (!element.name || !(element.name in values) || element.type === "file") continue;
    if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) continue;
    element.value = values[element.name];
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
}


