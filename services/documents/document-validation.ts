import { getDocumentConfiguration, type DocumentConfiguration } from "./document-config";

export class DocumentInputError extends Error { constructor() { super("Invalid document input"); this.name = "DocumentInputError"; } }
export type DocumentReviewStatus = "VERIFIED" | "REJECTED" | "REVISION_REQUIRED";

export function parseDocumentVerification(statusInput: unknown, notesInput: unknown) {
  const allowed: DocumentReviewStatus[] = ["VERIFIED", "REJECTED", "REVISION_REQUIRED"];
  if (typeof statusInput !== "string" || !allowed.includes(statusInput as DocumentReviewStatus)) throw new DocumentInputError();
  const notes = typeof notesInput === "string" ? notesInput.trim().slice(0, 1000) : "";
  return { status: statusInput as DocumentReviewStatus, notes: notes || null };
}

function matchesFileSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === "application/pdf") return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  return false;
}

function safeFileName(name: string) {
  const base = name.replace(/[\\/]/g, "_").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(-160);
  return base || "document";
}

export function validateDocumentUpload(input: { fileName: string; mimeType: string; bytes: Uint8Array }, config: DocumentConfiguration | null = getDocumentConfiguration()) {
  if (!config || !input.fileName.trim() || input.bytes.length < 1 || input.bytes.length > config.maxFileSizeBytes) throw new DocumentInputError();
  const mimeType = input.mimeType.trim().toLowerCase();
  if (!config.allowedMimeTypes.includes(mimeType) || !matchesFileSignature(mimeType, input.bytes)) throw new DocumentInputError();
  return { fileName: safeFileName(input.fileName), mimeType, fileSize: input.bytes.length };
}
