import type { ReactNode } from "react";
import { RoleName } from "@prisma/client";
import RoleProtectedLayout from "../../components/role-protected-layout";

export default function StudentPortalLayout({ children }: { children: ReactNode }) {
  return <RoleProtectedLayout role={RoleName.SISWA}>{children}</RoleProtectedLayout>;
}
