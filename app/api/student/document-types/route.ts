import { studentErrorResponse } from "../../../../services/student/student-http";
import { getAvailableStudentDocumentTypes } from "../../../../services/documents/document-service";

export async function GET() {
  try {
    return Response.json({ documentTypes: await getAvailableStudentDocumentTypes() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studentErrorResponse(error);
  }
}
