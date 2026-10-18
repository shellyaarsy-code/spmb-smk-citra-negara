import { changeAdminTkaTestStatus } from "../../../../../../services/tka/admin-tka-service";
import { readTkaBody, tkaErrorResponse } from "../../../../../../services/tka/tka-http";
import { TkaInputError } from "../../../../../../services/tka/tka-policy";

export async function PATCH(request: Request, { params }: { params: Promise<{ testId: string }> }) {
  try {
    const body = await readTkaBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).status !== "string") throw new TkaInputError();
    const { testId } = await params;
    return Response.json(await changeAdminTkaTestStatus(testId, (body as { status: string }).status), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return tkaErrorResponse(error); }
}
