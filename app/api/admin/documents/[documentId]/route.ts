import { downloadAdminDocument, verifyAdminDocument } from "../../../../../services/documents/document-service";
import { documentErrorResponse, documentFileResponse } from "../../../../../services/documents/document-http";

export async function GET(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  try { return documentFileResponse(await downloadAdminDocument((await context.params).documentId)); }
  catch (error) { return documentErrorResponse(error); }
}

export async function PATCH(request: Request, context: { params: Promise<{ documentId: string }> }) {
  try {
    const body = await request.json();
    const document = await verifyAdminDocument((await context.params).documentId, body?.status, body?.notes);
    return Response.json({ document }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return documentErrorResponse(error); }
}
