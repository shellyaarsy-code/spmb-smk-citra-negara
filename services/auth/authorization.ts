import "server-only";
import type { RoleName } from "@prisma/client";
import {
  requireAuthenticatedUser,
  type SafeUser,
} from "./sessions";
import { canAccessRolePortal, canMutateAsRole, roleDashboardPath, roleLoginPath } from "./authorization-policy";

export class AuthorizationDeniedError extends Error {
  constructor(readonly redirectTo: string) {
    super("Access denied");
    this.name = "AuthorizationDeniedError";
  }
}

export async function requireRole(role: RoleName): Promise<SafeUser> {
  return requireAnyRole([role]);
}

export async function requireAnyRole(roles: readonly RoleName[]): Promise<SafeUser> {
  const user: SafeUser = await requireAuthenticatedUser(roles[0] ? roleLoginPath(roles[0]) : "/portal");
  if (roles.length === 0) throw new AuthorizationDeniedError("/portal");

  if (!canAccessRolePortal(user.role, roles)) {
    throw new AuthorizationDeniedError(roleDashboardPath(user.role));
  }

  return user;
}

export async function requireMutationActor(): Promise<SafeUser> {
  const user = await requireAuthenticatedUser();
  if (!canMutateAsRole(user.role)) {
    throw new AuthorizationDeniedError(roleDashboardPath(user.role));
  }
  return user;
}
