import { applicationErrorResponse } from "../../../../../services/application/application-http";
import { submitCurrentApplication } from "../../../../../services/application/application-service";

export async function POST() {
  try {
    const application = await submitCurrentApplication();
    return Response.json(application, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return applicationErrorResponse(error);
  }
}
