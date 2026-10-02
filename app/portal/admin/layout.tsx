import type { ReactNode } from "react";
import { RoleName } from "@prisma/client";
import RoleProtectedLayout from "../../components/role-protected-layout";

export default function AdminPortalLayout({ children }: { children: ReactNode }) {
  return <RoleProtectedLayout role={RoleName.ADMIN}>{children}</RoleProtectedLayout>;
}
