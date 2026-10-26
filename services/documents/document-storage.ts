import "server-only";
import { del, get, list, put } from "@vercel/blob";
import { getDocumentConfiguration } from "./document-config";

export class DocumentStorageUnavailableError extends Error {
  constructor() { super("Document storage is unavailable"); this.name = "DocumentStorageUnavailableError"; }
}

function requireConfiguration() {
  if (!getDocumentConfiguration()) throw new DocumentStorageUnavailableError();
}

export const documentStorage = {
  async isAvailable() {
    if (!getDocumentConfiguration()) return false;
    try {
      await list({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  },
  async upload(path: string, bytes: Uint8Array, mimeType: string) {
    requireConfiguration();
    await put(path, Buffer.from(bytes), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: mimeType,
    });
  },
  async download(path: string) {
    requireConfiguration();
    const result = await get(path, { access: "private" });
    if (!result || result.statusCode !== 200) throw new DocumentStorageUnavailableError();
    return new Uint8Array(await new Response(result.stream).arrayBuffer());
  },
  async delete(path: string) {
    requireConfiguration();
    await del(path);
  },
};
