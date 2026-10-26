import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function createNeonAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return undefined;

  try {
    const hostname = new URL(connectionString).hostname;
    const isNeonPooler = hostname.endsWith(".neon.tech") && hostname.split(".")[0].endsWith("-pooler");
    return isNeonPooler ? new PrismaNeon({ connectionString }) : undefined;
  } catch {
    return undefined;
  }
}

const adapter = createNeonAdapter();

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(adapter ? { adapter } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
