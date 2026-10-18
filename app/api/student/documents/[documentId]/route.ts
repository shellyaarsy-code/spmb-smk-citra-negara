import { deleteCurrentStudentDocument, downloadStudentDocument } from "../../../../../services/documents/document-service";
import { documentErrorResponse, documentFileResponse } from "../../../../../services/documents/document-http";

export async function GET(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  try { return documentFileResponse(await downloadStudentDocument((await context.params).documentId)); }
  catch (error) { return documentErrorResponse(error); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  try {
    await deleteCurrentStudentDocument((await context.params).documentId);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return documentErrorResponse(error); }
}
