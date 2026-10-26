import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword, isPasswordWithinHashLimit } from "../services/auth/credentials";
import { isSafeDemoSeedDatabaseUrl } from "../services/database/database-safety";

let prisma: PrismaClient | undefined;
const accounts = [
  { email: "admin.demo@spmb.test", role: RoleName.ADMIN },
  { email: "kepala-sekolah.demo@spmb.test", role: RoleName.KEPALA_SEKOLAH },
] as const;

async function main() {
  if (process.env.SPMB_DEMO_MODE !== "true") {
    throw new Error("Demo mode is not enabled; no data changed.");
  }
  if (process.env.SPMB_DEMO_STAFF_CONFIRM !== "CREATE_ONLY_THE_TWO_DEMO_STAFF_ACCOUNTS") {
    throw new Error("Explicit confirmation is required; no data changed.");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !isSafeDemoSeedDatabaseUrl(databaseUrl, process.env.SPMB_DEMO_SEED_TARGET)) {
    throw new Error("Demo staff creation requires an explicitly allowlisted PostgreSQL demo target; no data changed.");
  }

  const password = process.env.SPMB_DEMO_PASSWORD;
  if (!password || password.length < 12 || !isPasswordWithinHashLimit(password)) {
    throw new Error("Set a demo-only SPMB_DEMO_PASSWORD with at least 12 characters and within the bcrypt limit; no data changed.");
  }

  const passwordHash = await hashPassword(password);
  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findMany({
      where: { email: { in: accounts.map(({ email }) => email) } },
      select: { email: true },
    });
    if (existing.length) throw new Error("A demo staff email already exists; both accounts were left unchanged.");

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

  console.log("Created exactly these two demo staff accounts.");
  for (const account of accounts) console.log("  " + account.email);
}

main().catch(() => {
  console.error("Demo staff creation failed. Check local configuration without sharing credentials or connection details.");
  process.exitCode = 1;
}).finally(async () => prisma?.$disconnect());