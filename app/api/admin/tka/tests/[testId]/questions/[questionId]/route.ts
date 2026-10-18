import { deactivateAdminTkaQuestion, updateAdminTkaQuestion } from "../../../../../../../../services/tka/admin-tka-service";
import { readTkaBody, tkaErrorResponse } from "../../../../../../../../services/tka/tka-http";

export async function PATCH(request: Request, { params }: { params: Promise<{ testId: string; questionId: string }> }) {
  try {
    const { testId, questionId } = await params;
    return Response.json(await updateAdminTkaQuestion(testId, questionId, await readTkaBody(request)), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return tkaErrorResponse(error); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ testId: string; questionId: string }> }) {
  try {
    const { testId, questionId } = await params;
    return Response.json(await deactivateAdminTkaQuestion(testId, questionId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return tkaErrorResponse(error); }
}
