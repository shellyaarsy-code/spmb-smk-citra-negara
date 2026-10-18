import { publishAdminTkaResult } from "../../../../../../../services/tka/admin-tka-service";
import { tkaErrorResponse } from "../../../../../../../services/tka/tka-http";

export async function POST(_request: Request, { params }: { params: Promise<{ resultId: string }> }) {
  try { return Response.json(await publishAdminTkaResult((await params).resultId), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return tkaErrorResponse(error); }
}
