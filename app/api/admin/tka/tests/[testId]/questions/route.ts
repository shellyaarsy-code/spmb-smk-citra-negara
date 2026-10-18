import { addAdminTkaQuestion } from "../../../../../../../services/tka/admin-tka-service";
import { readTkaBody, tkaErrorResponse } from "../../../../../../../services/tka/tka-http";

export async function POST(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try { const { testId } = await params; return Response.json(await addAdminTkaQuestion(testId, await readTkaBody(request)), { status: 201, headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return tkaErrorResponse(error); }
}
