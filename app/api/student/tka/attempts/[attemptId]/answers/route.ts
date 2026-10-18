import { readTkaBody, tkaErrorResponse } from "../../../../../../../services/tka/tka-http";
import { saveCurrentTkaAnswer } from "../../../../../../../services/tka/tka-service";

export async function PUT(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try { const { attemptId } = await params; return Response.json(await saveCurrentTkaAnswer(attemptId, await readTkaBody(request)), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return tkaErrorResponse(error); }
}
