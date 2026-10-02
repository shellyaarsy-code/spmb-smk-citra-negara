import { studentErrorResponse } from "../../../../../services/student/student-http";
import { deleteCurrentStudentGuardian } from "../../../../../services/student/student-service";

export async function DELETE(_request: Request, context: { params: Promise<{ guardianType: string }> }) {
  try {
    const { guardianType } = await context.params;
    return Response.json({ guardians: await deleteCurrentStudentGuardian(guardianType) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studentErrorResponse(error);
  }
}
