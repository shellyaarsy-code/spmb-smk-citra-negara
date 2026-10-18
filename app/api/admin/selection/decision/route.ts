import { saveAdminSelectionDecision } from "../../../../../services/selection/admin-selection-service";
import { readSelectionBody, selectionErrorResponse } from "../../../../../services/selection/selection-http";

export async function PUT(request: Request) {
  try {
    const raw = await readSelectionBody(request);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return Response.json({ error: "Data seleksi tidak valid." }, { status: 400 });
    const body = raw as Record<string, unknown>;
    if (typeof body.applicationId !== "string" || typeof body.studyProgramId !== "string") return Response.json({ error: "Data seleksi tidak valid." }, { status: 400 });
    return Response.json(await saveAdminSelectionDecision(body.applicationId, body.studyProgramId, body), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return selectionErrorResponse(error); }
}
