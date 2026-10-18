import "server-only";
import { getDocumentConfiguration } from "./document-config";

export class DocumentStorageUnavailableError extends Error {
  constructor() { super("Document storage is unavailable"); this.name = "DocumentStorageUnavailableError"; }
}

function objectUrl(path: string) {
  const config = getDocumentConfiguration();
  if (!config) throw new DocumentStorageUnavailableError();
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.bucket)}${path ? `/${encodedPath}` : ""}`;
}

function headers(contentType?: string) {
  const config = getDocumentConfiguration();
  if (!config) throw new DocumentStorageUnavailableError();
  return { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}`, ...(contentType ? { "Content-Type": contentType } : {}) };
}

async function assertPrivateBucket() {
  const config = getDocumentConfiguration();
  if (!config) throw new DocumentStorageUnavailableError();
  const response = await fetch(`${config.supabaseUrl}/storage/v1/bucket/${encodeURIComponent(config.bucket)}`, { headers: headers() });
  if (!response.ok) throw new DocumentStorageUnavailableError();
  const bucket = await response.json() as { public?: unknown };
  if (bucket.public !== false) throw new DocumentStorageUnavailableError();
}

async function assertResponse(response: Response) {
  if (!response.ok) throw new Error("Document storage request failed");
}

export const documentStorage = {
  async isAvailable() {
    try { await assertPrivateBucket(); return true; } catch { return false; }
  },
  async upload(path: string, bytes: Uint8Array, mimeType: string) {
    await assertPrivateBucket();
    const response = await fetch(objectUrl(path), { method: "POST", headers: { ...headers(mimeType), "x-upsert": "false" }, body: new Blob([Buffer.from(bytes)]) });
    await assertResponse(response);
  },
  async download(path: string) {
    await assertPrivateBucket();
    const response = await fetch(objectUrl(path), { headers: headers() });
    await assertResponse(response);
    return new Uint8Array(await response.arrayBuffer());
  },
  async delete(path: string) {
    await assertPrivateBucket();
    const response = await fetch(objectUrl(""), { method: "DELETE", headers: { ...headers(), "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [path] }) });
    await assertResponse(response);
  },
};
