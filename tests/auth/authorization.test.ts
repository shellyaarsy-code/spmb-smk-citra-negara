import assert from "node:assert/strict";
import test from "node:test";
import { RoleName } from "@prisma/client";
import { canAccessRolePortal, canMutateAsRole, roleDashboardPath, roleLoginPath } from "../../services/auth/authorization-policy";

const roles = [RoleName.SISWA, RoleName.ADMIN, RoleName.KEPALA_SEKOLAH] as const;
const portalPaths = {
  [RoleName.SISWA]: "/portal/siswa",
  [RoleName.ADMIN]: "/portal/admin",
  [RoleName.KEPALA_SEKOLAH]: "/portal/kepala-sekolah",
};

test("only the matching role can access each protected portal", () => {
  for (const actualRole of roles) {
    for (const requiredRole of roles) {
      assert.equal(
        canAccessRolePortal(actualRole, [requiredRole]),
        actualRole === requiredRole,
        `${actualRole} access to ${requiredRole}`,
      );
    }
  }
});

test("unauthenticated portal redirects point to the corresponding login entry", () => {
  assert.equal(roleLoginPath(RoleName.SISWA), "/portal/login/siswa");
  assert.equal(roleLoginPath(RoleName.ADMIN), "/portal/login/admin");
  assert.equal(roleLoginPath(RoleName.KEPALA_SEKOLAH), "/portal/login/kepala-sekolah");
});

test("wrong-role redirects point to the authenticated user's own dashboard", () => {
  for (const role of roles) assert.equal(roleDashboardPath(role), portalPaths[role]);
});

test("principal is denied mutation access while other roles remain eligible for future checks", () => {
  assert.equal(canMutateAsRole(RoleName.SISWA), true);
  assert.equal(canMutateAsRole(RoleName.ADMIN), true);
  assert.equal(canMutateAsRole(RoleName.KEPALA_SEKOLAH), false);
});
