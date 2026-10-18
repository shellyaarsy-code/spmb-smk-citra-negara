import { adminSummaryErrorResponse } from "../../../../../services/admin/admin-http";
import { getAdminDashboardSummary } from "../../../../../services/admin/dashboard-service";

export async function GET() {
  try { return Response.json(await getAdminDashboardSummary(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return adminSummaryErrorResponse(error); }
}
