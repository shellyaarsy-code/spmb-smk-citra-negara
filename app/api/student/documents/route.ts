import { studentErrorResponse } from "../../../../services/student/student-http";
import { getCurrentStudentDocuments } from "../../../../services/documents/document-service";

export async function GET() {
  try {
    return Response.json({ documents: await getCurrentStudentDocuments() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studentErrorResponse(error);
  }
}
