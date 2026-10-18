import { tkaErrorResponse } from "../../../../../../../services/tka/tka-http";
import { submitCurrentTkaAttempt } from "../../../../../../../services/tka/tka-service";

export async function POST(_request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try { const { attemptId } = await params; return Response.json(await submitCurrentTkaAttempt(attemptId), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return tkaErrorResponse(error); }
}
