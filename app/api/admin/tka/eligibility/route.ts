import { getAdminTkaEligibility, grantAdminTkaEligibility } from "../../../../../services/tka/admin-tka-service";
import { tkaErrorResponse } from "../../../../../services/tka/tka-http";
import { readTkaBody } from "../../../../../services/tka/tka-http";

export async function GET(request: Request) { try { const page = new URL(request.url).searchParams.get("page"); return Response.json(await getAdminTkaEligibility(page), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return tkaErrorResponse(error); } }
export async function POST(request: Request) {
  try {
    const raw = await readTkaBody(request);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return Response.json({ error: "Data kelayakan tidak valid." }, { status: 400 });
    const body = raw as Record<string, unknown>;
    if (typeof body.applicationId !== "string" || !body.applicationId.trim()) return Response.json({ error: "Data kelayakan tidak valid." }, { status: 400 });
    return Response.json(await grantAdminTkaEligibility(body.applicationId, body), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return tkaErrorResponse(error); }
}
