import { studentErrorResponse } from "../../../../services/student/student-http";
import { getCurrentStudentGuardians, upsertCurrentStudentGuardian } from "../../../../services/student/student-service";

export async function GET() {
  try {
    return Response.json({ guardians: await getCurrentStudentGuardians() }, { headers: { "Cache-Control": "no-store" } });
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
    return Response.json({ guardians: await upsertCurrentStudentGuardian(input) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return studentErrorResponse(error);
  }
}
