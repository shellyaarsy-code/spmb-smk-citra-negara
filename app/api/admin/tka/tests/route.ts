import { createAdminTkaTest, listAdminTkaTests } from "../../../../../services/tka/admin-tka-service";
import { readTkaBody, tkaErrorResponse } from "../../../../../services/tka/tka-http";

const headers = { "Cache-Control": "no-store" };
export async function GET() { try { return Response.json(await listAdminTkaTests(), { headers }); } catch (error) { return tkaErrorResponse(error); } }
export async function POST(request: Request) { try { return Response.json(await createAdminTkaTest(await readTkaBody(request)), { status: 201, headers }); } catch (error) { return tkaErrorResponse(error); } }
