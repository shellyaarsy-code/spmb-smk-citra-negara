export async function applyDocumentVerification<T>(input: {
  updateDocument(): Promise<{ count: number }>;
  createHistory(): Promise<unknown>;
  updateApplicationStatus(): Promise<unknown>;
  createAudit(): Promise<unknown>;
  findDocument(): Promise<T>;
  notFoundError: Error;
}) {
  const result = await input.updateDocument();
  if (result.count !== 1) throw input.notFoundError;
  await input.createHistory();
  await input.updateApplicationStatus();
  await input.createAudit();
  return input.findDocument();
}
