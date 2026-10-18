import { getAdminSelectionOverview, saveAdminSelectionPolicy } from "../../../../services/selection/admin-selection-service";
import { selectionErrorResponse, readSelectionBody } from "../../../../services/selection/selection-http";

export async function GET(request: Request) { try { const page = new URL(request.url).searchParams.get("page"); return Response.json(await getAdminSelectionOverview(page), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return selectionErrorResponse(error); } }
export async function PUT(request: Request) { try { return Response.json(await saveAdminSelectionPolicy(await readSelectionBody(request)), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return selectionErrorResponse(error); } }
