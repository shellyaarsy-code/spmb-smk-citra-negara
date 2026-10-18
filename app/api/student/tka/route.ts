import { readTkaBody, tkaErrorResponse } from "../../../../services/tka/tka-http";
import { listCurrentTkaSchedules, startCurrentTkaAttempt } from "../../../../services/tka/tka-service";
import { TkaInputError } from "../../../../services/tka/tka-policy";

const headers = { "Cache-Control": "no-store" };
export async function GET() {
  try { return Response.json(await listCurrentTkaSchedules(), { headers }); }
  catch (error) { return tkaErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const body = await readTkaBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).scheduleId !== "string") throw new TkaInputError();
    return Response.json(await startCurrentTkaAttempt((body as { scheduleId: string }).scheduleId), { status: 201, headers });
  } catch (error) { return tkaErrorResponse(error); }
}
