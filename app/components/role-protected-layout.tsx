import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { RoleName } from "@prisma/client";
import { AuthorizationDeniedError, requireRole } from "../../services/auth/authorization";
import { AuthenticationRequiredError } from "../../services/auth/sessions";

export default async function RoleProtectedLayout({ role, children }: { role: RoleName; children: ReactNode }) {
  try {
    await requireRole(role);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof AuthorizationDeniedError) {
      redirect(error.redirectTo);
    }
    throw error;
  }

  return children;
}
