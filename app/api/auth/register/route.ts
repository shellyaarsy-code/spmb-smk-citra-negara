import { AuthenticationError, registerStudent, RegistrationValidationError } from "../../../../services/auth/auth-service";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Data pendaftaran tidak dapat diproses." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    await registerStudent(input);
    return Response.json(
      { message: "Jika pendaftaran dapat diproses, akun akan tersedia untuk masuk." },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RegistrationValidationError) {
      return Response.json({ error: "Periksa kembali data pendaftaran." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    if (error instanceof AuthenticationError) {
      return Response.json(
        { message: "Jika pendaftaran dapat diproses, akun akan tersedia untuk masuk." },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json({ error: "Pendaftaran belum dapat diproses." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
