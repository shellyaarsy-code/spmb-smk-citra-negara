import { getAdminDocuments } from "../../../../../../services/documents/document-service";
import { documentErrorResponse } from "../../../../../../services/documents/document-http";

export async function GET(_request: Request, context: { params: Promise<{ registrationNumber: string }> }) {
  try { return Response.json({ documents: await getAdminDocuments((await context.params).registrationNumber) }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return documentErrorResponse(error); }
}
