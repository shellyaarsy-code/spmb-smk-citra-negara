import { applicationErrorResponse } from "../../../../services/application/application-http";
import { getAvailableStudyPrograms } from "../../../../services/application/application-service";

export async function GET() {
  try {
    return Response.json({ programs: await getAvailableStudyPrograms() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return applicationErrorResponse(error);
  }
}
