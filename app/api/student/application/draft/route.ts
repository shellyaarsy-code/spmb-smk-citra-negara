import { applicationErrorResponse } from "../../../../../services/application/application-http";
import { getCurrentDraftApplication, updateCurrentDraftApplication } from "../../../../../services/application/application-service";

function publicDraft(application: Awaited<ReturnType<typeof getCurrentDraftApplication>>) {
  const { id, ...draft } = application;
  void id;
  return draft;
}

export async function GET() {
  try {
    return Response.json(publicDraft(await getCurrentDraftApplication()), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return applicationErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Periksa kembali data yang dimasukkan." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    return Response.json(publicDraft(await updateCurrentDraftApplication(input)), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return applicationErrorResponse(error);
  }
}
