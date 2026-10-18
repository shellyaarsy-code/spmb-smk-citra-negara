import { getCurrentPublishedTkaResults } from "../../../../../services/tka/tka-service";
import { tkaErrorResponse } from "../../../../../services/tka/tka-http";

export async function GET() { try { return Response.json(await getCurrentPublishedTkaResults(), { headers: { "Cache-Control": "no-store" } }); } catch (error) { return tkaErrorResponse(error); } }
