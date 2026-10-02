import { studentErrorResponse } from "../../../../services/student/student-http";
import { getCurrentStudentData, saveCurrentStudentData } from "../../../../services/student/student-service";

export async function GET() {
  try {
    return Response.json(await getCurrentStudentData(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studentErrorResponse(error);
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
    return Response.json(await saveCurrentStudentData(input), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studentErrorResponse(error);
  }
}
