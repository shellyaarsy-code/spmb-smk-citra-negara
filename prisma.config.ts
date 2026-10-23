import "dotenv/config";
import { defineConfig } from "prisma/config";

const runtimeUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

function isNeonPooler(connectionString: string | undefined) {
  if (!connectionString) return false;

  try {
    const hostname = new URL(connectionString).hostname;
    return hostname.endsWith(".neon.tech") && hostname.split(".")[0].endsWith("-pooler");
  } catch {
    return false;
  }
}

if (isNeonPooler(runtimeUrl) && !directUrl) {
  throw new Error("Set DIRECT_URL to the direct Neon connection before running Prisma CLI commands.");
}

const datasourceUrl = directUrl ?? runtimeUrl;

if (!datasourceUrl) {
  throw new Error("Set DATABASE_URL or DIRECT_URL before running Prisma CLI commands.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
