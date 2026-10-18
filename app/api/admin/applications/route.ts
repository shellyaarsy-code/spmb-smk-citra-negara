import { adminApplicantErrorResponse } from "../../../../services/admin/admin-http";
import { listAdminApplicants } from "../../../../services/admin/application-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return Response.json(await listAdminApplicants(url.searchParams), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return adminApplicantErrorResponse(error); }
}
