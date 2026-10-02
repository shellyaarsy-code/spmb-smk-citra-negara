import type { ReactNode } from "react";
import { RoleName } from "@prisma/client";
import RoleProtectedLayout from "../../components/role-protected-layout";

export default function PrincipalPortalLayout({ children }: { children: ReactNode }) {
  return <RoleProtectedLayout role={RoleName.KEPALA_SEKOLAH}>{children}</RoleProtectedLayout>;
}
