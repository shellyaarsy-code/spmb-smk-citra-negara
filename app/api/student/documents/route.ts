import { getCurrentStudentDocuments } from "../../../../services/documents/document-service";
import { documentErrorResponse } from "../../../../services/documents/document-http";
import { uploadCurrentStudentDocument } from "../../../../services/documents/document-service";
import { getDocumentConfiguration } from "../../../../services/documents/document-config";
import { DocumentInputError } from "../../../../services/documents/document-validation";
import { DocumentStorageUnavailableError } from "../../../../services/documents/document-storage";

export async function GET() {
  try {
    return Response.json({ documents: await getCurrentStudentDocuments() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return documentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const config = getDocumentConfiguration();
    if (!config) throw new DocumentStorageUnavailableError();
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > config.maxFileSizeBytes + 65_536) throw new DocumentInputError();
    const form = await request.formData();
    const file = form.get("file");
    const documentTypeCode = form.get("documentTypeCode");
    if (!(file instanceof File) || typeof documentTypeCode !== "string") return Response.json({ error: "Periksa tipe dan file dokumen." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    if (file.size > config.maxFileSizeBytes) throw new DocumentInputError();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const document = await uploadCurrentStudentDocument({ documentTypeCode, fileName: file.name, mimeType: file.type, bytes });
    return Response.json({ document }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return documentErrorResponse(error); }
}
