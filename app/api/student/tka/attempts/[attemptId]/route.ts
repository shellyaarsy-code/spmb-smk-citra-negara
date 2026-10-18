import { getCurrentTkaAttemptTiming } from "../../../../../../services/tka/tka-service";
import { tkaErrorResponse } from "../../../../../../services/tka/tka-http";

export async function GET(_request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params;
    return Response.json(await getCurrentTkaAttemptTiming(attemptId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return tkaErrorResponse(error); }
}
