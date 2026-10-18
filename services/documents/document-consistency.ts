export type DocumentStorageOperations = {
  upload(path: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  download(path: string): Promise<Uint8Array>;
  delete(path: string): Promise<void>;
};

export async function uploadWithCompensation<T>(storage: DocumentStorageOperations, path: string, bytes: Uint8Array, mimeType: string, persist: () => Promise<T>, onCompensationFailure?: () => Promise<void>) {
  await storage.upload(path, bytes, mimeType);
  try { return await persist(); }
  catch (error) {
    try { await storage.delete(path); } catch { await onCompensationFailure?.().catch(() => undefined); }
    throw error;
  }
}

export async function deleteWithCompensation<T>(storage: DocumentStorageOperations, path: string, mimeType: string, removeRecord: () => Promise<T>, onCompensationFailure?: () => Promise<void>) {
  const bytes = await storage.download(path);
  await storage.delete(path);
  try { return await removeRecord(); }
  catch (error) {
    try { await storage.upload(path, bytes, mimeType); } catch { await onCompensationFailure?.().catch(() => undefined); }
    throw error;
  }
}
