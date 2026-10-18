import { listPrincipalApplicants } from "../../../../services/principal/principal-service";
import { principalApplicantErrorResponse } from "../../../../services/principal/principal-http";

export async function GET(request: Request) {
  try {
    return Response.json(await listPrincipalApplicants(new URL(request.url).searchParams), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return principalApplicantErrorResponse(error);
  }
}
