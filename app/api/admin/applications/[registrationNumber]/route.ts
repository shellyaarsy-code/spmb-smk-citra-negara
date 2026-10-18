import { adminApplicantErrorResponse } from "../../../../../services/admin/admin-http";
import { getAdminApplicant } from "../../../../../services/admin/application-service";

export async function GET(_request: Request, context: { params: Promise<{ registrationNumber: string }> }) {
  try { return Response.json(await getAdminApplicant((await context.params).registrationNumber), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return adminApplicantErrorResponse(error); }
}
