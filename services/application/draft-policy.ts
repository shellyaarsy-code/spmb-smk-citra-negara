export type DraftApplicationRecord = { id: string; status: string; registrationNumber: null | string };

export type DraftApplicationRepository<T extends DraftApplicationRecord> = {
  findDraft(studentId: string): Promise<T | null>;
  createDraft(studentId: string): Promise<T>;
};

export async function getOrCreateDraftApplication<T extends DraftApplicationRecord>(
  studentId: string,
  repository: DraftApplicationRepository<T>,
) {
  const existing = await repository.findDraft(studentId);
  if (existing) return existing;
  return repository.createDraft(studentId);
}
