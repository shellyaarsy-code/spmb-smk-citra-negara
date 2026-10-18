import { applicationErrorResponse } from "../../../../../services/application/application-http";
import { ApplicationInputValidationError } from "../../../../../services/application/application-validation";
import { submitCurrentApplication } from "../../../../../services/application/application-service";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return applicationErrorResponse(new ApplicationInputValidationError());
  }

  try {
    const application = await submitCurrentApplication(input);
    return Response.json(application, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return applicationErrorResponse(error);
  }
}
