import "server-only";
import type { RoleName } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "../../db/prisma";
import { createSessionToken, hashSessionToken } from "./credentials";

export const SESSION_COOKIE_NAME = "spmb_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type SafeUser = {
  id: string;
  email: string;
  createdAt: Date;
  role: RoleName;
};

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function createServerSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(new Date(0)),
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.userSession.findFirst({
    where: {
      tokenHash: hashSessionToken(token),
      expiresAt: { gt: new Date() },
      user: { isActive: true },
    },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          createdAt: true,
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!session) return null;

  return { ...session.user, role: session.user.role.name };
}

export async function requireAuthenticatedUser(redirectTo = "/portal/login/siswa") {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationRequiredError(redirectTo);
  return user;
}

export class AuthenticationRequiredError extends Error {
  constructor(readonly redirectTo: string) {
    super("Authentication required");
    this.name = "AuthenticationRequiredError";
  }
}

export async function revokeSession(token: string) {
  await prisma.userSession.deleteMany({
    where: { tokenHash: hashSessionToken(token) },
  });
}

export async function logoutCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  try {
    if (token) await revokeSession(token);
  } finally {
    await clearSessionCookie();
  }
}
