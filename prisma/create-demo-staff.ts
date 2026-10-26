import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword, isPasswordWithinHashLimit } from "../services/auth/credentials";
import { isSafeDemoSeedDatabaseUrl } from "../services/database/database-safety";

const prisma = new PrismaClient();
const accounts = [
  { email: "admin.demo@spmb.test", role: RoleName.ADMIN },
  { email: "kepala-sekolah.demo@spmb.test", role: RoleName.KEPALA_SEKOLAH },
] as const;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const expectedTarget = process.env.SPMB_DEMO_SEED_TARGET;

  if (process.env.SPMB_DEMO_MODE !== "true") {
    throw new Error("Demo mode is not enabled; no data changed.");
  }
  if (process.env.SPMB_DEMO_SEED_CONFIRM !== "SEED_ONLY_A_DISPOSABLE_DEMO_DATABASE") {
    throw new Error("Explicit disposable-database confirmation is required; no data changed.");
  }
  if (!isSafeDemoSeedDatabaseUrl(databaseUrl, expectedTarget)) {
    throw new Error("Demo database hostname/name did not match the exact allowlisted demo target; no data changed.");
  }

  const password = process.env.SPMB_DEMO_PASSWORD;
  if (!password || password.length < 12 || !isPasswordWithinHashLimit(password)) {
    throw new Error("Set SPMB_DEMO_PASSWORD to a demo-only password of 12–72 UTF-8 bytes; no data changed.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findMany({
      where: { email: { in: accounts.map(({ email }) => email) } },
      select: { email: true },
    });
    if (existing.length) {
      throw new Error("A demo staff email already exists; both accounts were left unchanged.");
    }

    const roles = await tx.role.findMany({
      where: { name: { in: accounts.map(({ role }) => role) } },
      select: { id: true, name: true },
    });
    const roleIds = new Map(roles.map(({ id, name }) => [name, id]));
    if (accounts.some(({ role }) => !roleIds.has(role))) {
      throw new Error("Required staff roles are unavailable; no data changed.");
    }

    for (const account of accounts) {
      await tx.user.create({
        data: {
          email: account.email,
          roleId: roleIds.get(account.role)!,
          passwordHash,
          isActive: true,
        },
      });
    }
  }, { isolationLevel: "Serializable" });

  console.log("Created exactly the two demo staff accounts on the explicitly allowlisted disposable database:");
  for (const account of accounts) console.log(`  ${account.email}`);
  console.log("The password was read from SPMB_DEMO_PASSWORD and was not printed.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Demo staff creation failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
