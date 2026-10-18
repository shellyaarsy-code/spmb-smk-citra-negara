import { setAdminSelectionPublication } from "../../../../../services/selection/admin-selection-service";
import { readSelectionBody, selectionErrorResponse } from "../../../../../services/selection/selection-http";

export async function PATCH(request: Request) { try { return Response.json(await setAdminSelectionPublication(await readSelectionBody(request)), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return selectionErrorResponse(error); } }
