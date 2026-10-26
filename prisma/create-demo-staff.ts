import { randomInt } from "node:crypto";
import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword } from "../services/auth/credentials";

const prisma = new PrismaClient();
const accounts = [
  { email: "admin.demo@spmb.test", role: RoleName.ADMIN },
  { email: "kepala-sekolah.demo@spmb.test", role: RoleName.KEPALA_SEKOLAH },
] as const;
const beginnings = ["ba", "be", "bi", "bo", "bu", "ca", "ce", "ci", "co", "cu", "da", "de", "di", "do", "du", "fa", "fe", "fi", "fo", "fu", "ga", "ge", "gi", "go", "gu", "ha", "he", "hi", "ho", "hu", "ja", "je"];
const endings = ["lan", "len", "lin", "lon", "lun", "ran", "ren", "rin", "ron", "run", "san", "sen", "sin", "son", "sun", "tan", "ten", "tin", "ton", "tun", "kan", "ken", "kin", "kon", "kun", "man", "men", "min", "mon", "mun", "pan", "pen"];

function createPassphrase() {
  const syllables = Array.from({ length: 5 }, () => `${beginnings[randomInt(beginnings.length)]}${endings[randomInt(endings.length)]}`);
  return `${syllables.join("-")}-${randomInt(10, 100)}!`;
}

async function main() {
  if (process.env.SPMB_DEMO_MODE !== "true") throw new Error("Demo mode is not enabled; no data changed.");
  if (process.env.SPMB_DEMO_STAFF_CONFIRM !== "CREATE_ONLY_THE_TWO_DEMO_STAFF_ACCOUNTS") throw new Error("Explicit confirmation is required; no data changed.");
  if (!process.env.DATABASE_URL) throw new Error("Preview database configuration is unavailable; no data changed.");
  const password = createPassphrase();
  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findMany({ where: { email: { in: accounts.map(({ email }) => email) } }, select: { email: true } });
    if (existing.length) throw new Error("A demo staff email already exists; both accounts were left unchanged.");
    const roles = await tx.role.findMany({ where: { name: { in: accounts.map(({ role }) => role) } }, select: { id: true, name: true } });
    const roleIds = new Map(roles.map(({ id, name }) => [name, id]));
    if (accounts.some(({ role }) => !roleIds.has(role))) throw new Error("Required staff roles are unavailable; no data changed.");
    for (const account of accounts) await tx.user.create({ data: { email: account.email, roleId: roleIds.get(account.role)!, passwordHash, isActive: true } });
  }, { isolationLevel: "Serializable" });

  console.log("Created exactly these two demo staff accounts; both use this passphrase:");
  for (const account of accounts) console.log(`  ${account.email}`);
  console.log(`Passphrase: ${password}`);
  console.log("These accounts use the linked Neon database shared with Production. Save the passphrase privately.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Demo staff creation failed.");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
