import { listAdminTkaResults } from "../../../../../services/tka/admin-tka-service";
import { tkaErrorResponse } from "../../../../../services/tka/tka-http";

export async function GET() { try { return Response.json(await listAdminTkaResults(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return tkaErrorResponse(error); } }
