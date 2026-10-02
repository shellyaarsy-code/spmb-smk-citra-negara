import { AuthenticationError, loginUser } from "../../../../services/auth/auth-service";
import { roleDashboardPath } from "../../../../services/auth/authorization-policy";
import { setSessionCookie } from "../../../../services/auth/sessions";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Email/NISN atau kata sandi tidak valid.", }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { user, token, expiresAt } = await loginUser(input);
    await setSessionCookie(token, expiresAt);
    return Response.json(
      { user, redirectTo: roleDashboardPath(user.role) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return Response.json({ error: "Email/NISN atau kata sandi tidak valid." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    return Response.json({ error: "Layanan masuk belum tersedia." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
