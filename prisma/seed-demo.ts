import { ApplicationStatus, PrismaClient, RoleName, SelectionStatus } from "@prisma/client";
import { hashPassword } from "../services/auth/credentials";

// This script only accepts a separately named demo database URL. It never falls
// back to DATABASE_URL, which protects the developer's local database.
const databaseUrl = process.env.SPMB_DEMO_DATABASE_URL;
const adminEmail = process.env.SPMB_DEMO_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.SPMB_DEMO_ADMIN_PASSWORD;

if (!databaseUrl || !adminEmail || !adminPassword) {
  throw new Error("Set SPMB_DEMO_DATABASE_URL, SPMB_DEMO_ADMIN_EMAIL, and SPMB_DEMO_ADMIN_PASSWORD.");
}
if (!/^postgres(?:ql)?:\/\//i.test(databaseUrl) || /localhost|127\.0\.0\.1|::1/i.test(new URL(databaseUrl).hostname)) {
  throw new Error("Demo seed only accepts a remote PostgreSQL URL; local database hosts are refused.");
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminPassword.length < 16 || Buffer.byteLength(adminPassword, "utf8") > 72) {
  throw new Error("Use a valid demo email and a unique password of 16–72 bytes.");
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const applicants = [
  ["Alya Maharani", "PPLG", ApplicationStatus.WAITING_DOCUMENT_VERIFICATION],
  ["Bima Pratama", "TJKT", ApplicationStatus.DOCUMENT_VERIFIED],
  ["Citra Lestari", "DKV", ApplicationStatus.PASSED],
  ["Dafa Ramadhan", "MPLB", ApplicationStatus.WAITING_PAYMENT],
  ["Eka Safitri", "BDR", ApplicationStatus.FAILED],
  ["Farhan Nugraha", "PHT", ApplicationStatus.SUBMITTED],
  ["Gita Permata", "PPLG", ApplicationStatus.PAYMENT_VERIFIED],
  ["Hadi Saputra", "TJKT", ApplicationStatus.WAITING_SELECTION],
] as const;

async function main() {
  const adminRole = await prisma.role.upsert({ where: { name: RoleName.ADMIN }, update: {}, create: { name: RoleName.ADMIN } });
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail! }, include: { role: { select: { name: true } } } });
  if (existingAdmin && existingAdmin.role.name !== RoleName.ADMIN) {
    throw new Error("The configured demo email already belongs to a non-admin account; choose a dedicated demo email.");
  }
  const passwordHash = await hashPassword(adminPassword!);
  await prisma.user.upsert({
    where: { email: adminEmail! },
    update: { passwordHash, isActive: true, roleId: adminRole.id },
    create: { email: adminEmail!, passwordHash, roleId: adminRole.id, isActive: true },
  });

  const role = await prisma.role.upsert({ where: { name: RoleName.SISWA }, update: {}, create: { name: RoleName.SISWA } });
  const programs = await prisma.studyProgram.findMany({ select: { id: true, code: true } });
  const programIds = new Map(programs.map(({ id, code }) => [code, id]));
  if (applicants.some(([, code]) => !programIds.has(code))) throw new Error("Run the standard foundation seed before the demo seed.");

  for (const [index, [name, programCode, status]] of applicants.entries()) {
    const n = String(index + 1).padStart(2, "0");
    const email = `demo.siswa${n}@example.invalid`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { isActive: true },
      create: {
        email, roleId: role.id, passwordHash: null,
        student: { create: { registrationCode: `DEMO-SISWA-${n}`, profile: { create: { fullName: name, nisn: `9999${String(index + 1).padStart(6, "0")}`, birthPlace: "Kota Contoh", schoolOrigin: "SMP Contoh Demo", city: "Kota Depok", province: "Jawa Barat" } } } },
      },
    });
    const student = await prisma.student.findUniqueOrThrow({ where: { userId: user.id } });
    const registrationNumber = `DEMO-SPMB-2026-${n}`;
    const application = await prisma.application.upsert({
      where: { registrationNumber },
      update: { status, isFinalized: true, submittedAt: new Date("2026-10-01T00:00:00.000Z") },
      create: { studentId: student.id, registrationNumber, status, isFinalized: true, submittedAt: new Date("2026-10-01T00:00:00.000Z") },
    });
    const studyProgramId = programIds.get(programCode)!;
    await prisma.applicationProgramChoice.upsert({
      where: { applicationId_studyProgramId: { applicationId: application.id, studyProgramId } },
      update: { priority: 1 }, create: { applicationId: application.id, studyProgramId, priority: 1 },
    });
    const selectionStatus = status === ApplicationStatus.PASSED ? SelectionStatus.PASSED : status === ApplicationStatus.FAILED ? SelectionStatus.FAILED : SelectionStatus.PENDING;
    await prisma.selection.upsert({
      where: { applicationId_studyProgramId: { applicationId: application.id, studyProgramId } },
      update: { status: selectionStatus }, create: { applicationId: application.id, studyProgramId, status: selectionStatus },
    });
  }
  console.log(`Demo seed applied: ${adminEmail} and ${applicants.length} synthetic applicants.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
