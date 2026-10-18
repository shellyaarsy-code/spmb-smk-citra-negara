import { documentErrorDetails } from "./document-error-policy";

const headers = { "Cache-Control": "no-store" };
export function documentErrorResponse(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  const details = documentErrorDetails(name);
  return Response.json({ error: details.message }, { status: details.status, headers });
}

export function documentFileResponse(file: { bytes: Uint8Array; fileName: string; mimeType: string }) {
  const safeName = file.fileName.replace(/[\r\n"\\]/g, "_");
  const fallbackName = safeName.replace(/[^\x20-\x7e]/g, "_");
  const encodedName = encodeURIComponent(safeName).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return new Response(Buffer.from(file.bytes), { headers: { ...headers, "Content-Type": file.mimeType, "Content-Disposition": `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`, "X-Content-Type-Options": "nosniff" } });
}
