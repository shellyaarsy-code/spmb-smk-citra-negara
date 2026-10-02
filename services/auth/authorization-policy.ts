import type { RoleName } from "@prisma/client";

export function roleDashboardPath(role: RoleName) {
  switch (role) {
    case "SISWA":
      return "/portal/siswa";
    case "ADMIN":
      return "/portal/admin";
    case "KEPALA_SEKOLAH":
      return "/portal/kepala-sekolah";
  }
}

export function roleLoginPath(role: RoleName) {
  switch (role) {
    case "SISWA":
      return "/portal/login/siswa";
    case "ADMIN":
      return "/portal/login/admin";
    case "KEPALA_SEKOLAH":
      return "/portal/login/kepala-sekolah";
  }
}

export function canAccessRolePortal(actualRole: RoleName, requiredRoles: readonly RoleName[]) {
  return requiredRoles.includes(actualRole);
}

export function canMutateAsRole(role: RoleName) {
  return role !== "KEPALA_SEKOLAH";
}
