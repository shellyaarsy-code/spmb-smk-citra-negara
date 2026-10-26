import {
  AnnouncementStatus,
  ApplicationStatus,
  PaymentStatus,
  PrismaClient,
  RoleName,
  SelectionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { isSafeDemoSeedDatabaseUrl } from "../services/database/database-safety";

const prisma = new PrismaClient();

const accounts = [
  { email: "admin.demo@spmb.test", role: RoleName.ADMIN },
  { email: "kepala-sekolah.demo@spmb.test", role: RoleName.KEPALA_SEKOLAH },
  { email: "siswa1.demo@spmb.test", role: RoleName.SISWA, name: "Nadia Putri Lestari", nisn: "0098765401", code: "CN-DEMO-26001", program: "PPLG", status: ApplicationStatus.DOCUMENT_REVISION_REQUIRED },
  { email: "siswa2.demo@spmb.test", role: RoleName.SISWA, name: "Rafi Maulana", nisn: "0098765402", code: "CN-DEMO-26002", program: "DKV", status: ApplicationStatus.WAITING_PAYMENT },
  { email: "siswa3.demo@spmb.test", role: RoleName.SISWA, name: "Siti Aulia Rahma", nisn: "0098765403", code: "CN-DEMO-26003", program: "TJKT", status: ApplicationStatus.ELIGIBLE_FOR_TKA },
  { email: "siswa4.demo@spmb.test", role: RoleName.SISWA, name: "Dimas Wijaya", nisn: "0098765404", code: "CN-DEMO-26004", program: "MPLB", status: ApplicationStatus.PASSED },
] as const;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!isSafeDemoSeedDatabaseUrl(databaseUrl, process.env.SPMB_DEMO_SEED_TARGET)) throw new Error("Demo seed dibatasi ke target PostgreSQL bertanda demo yang host/database-nya cocok persis dengan SPMB_DEMO_SEED_TARGET.");
  const demoPassword = process.env.SPMB_DEMO_PASSWORD;
  if (process.env.SPMB_DEMO_SEED_CONFIRM !== "SEED_ONLY_A_DISPOSABLE_DEMO_DATABASE") {
    throw new Error("Set SPMB_DEMO_SEED_CONFIRM=SEED_ONLY_A_DISPOSABLE_DEMO_DATABASE only after confirming the target is a disposable demo database.");
  }
  if (!demoPassword || demoPassword.length < 12) {
    throw new Error("Set SPMB_DEMO_PASSWORD to a demo-only password of at least 12 characters before running the demo seed.");
  }
  const existingAccounts = await prisma.user.findMany({ where: { email: { in: accounts.map(({ email }) => email) } }, select: { email: true } });
  if (existingAccounts.length) throw new Error("Akun demo sudah tersedia; seed dihentikan sebelum menulis data agar kredensial dan role tidak tertimpa.");
  const existingApplications = await prisma.application.findMany({ where: { registrationNumber: { in: accounts.flatMap((account) => account.role === RoleName.SISWA ? [account.code] : []) } }, select: { id: true } });
  if (existingApplications.length) throw new Error("Pendaftaran demo sudah tersedia; seed dihentikan sebelum menulis data.");
  const passwordHash: string = await bcrypt.hash(demoPassword, 12);
  const roles = [RoleName.SISWA, RoleName.ADMIN, RoleName.KEPALA_SEKOLAH];
  const roleRows = new Map<RoleName, string>();
  for (const role of roles) {
    const row = await prisma.role.findUnique({ where: { name: role }, select: { id: true, name: true } });
    if (!row) throw new Error(`Role ${role} harus sudah tersedia; demo seed tidak membuat atau mengubah role sekolah.`);
    roleRows.set(row.name, row.id);
  }

  const programs = [
    { code: "PPLG", name: "Pengembangan Perangkat Lunak dan Gim" },
    { code: "TJKT", name: "Teknik Jaringan Komputer dan Telekomunikasi" },
    { code: "DKV", name: "Desain Komunikasi Visual" },
    { code: "MPLB", name: "Manajemen Perkantoran dan Layanan Bisnis" },
    { code: "BDR", name: "Bisnis Digital dan Ritel" },
    { code: "PHT", name: "Perhotelan" },
  ];
  const programRows = new Map<string, string>();
  for (const program of programs) {
    const row = await prisma.studyProgram.findUnique({ where: { code: program.code }, select: { id: true, code: true } });
    if (!row) throw new Error(`Program ${program.code} harus sudah tersedia; demo seed tidak membuat atau mengubah program sekolah.`);
    programRows.set(row.code, row.id);
  }

  const demoDocumentCodes = ["DEMO-KK", "DEMO-RAPOR", "DEMO-FOTO"];
  const [existingPeriod, existingTest, existingAnnouncement, existingDocumentTypes] = await Promise.all([
    prisma.admissionPeriod.findUnique({ where: { code: "DEMO-2026-2027" }, select: { id: true } }),
    prisma.tkaTest.findUnique({ where: { code: "DEMO-TKA-2026" }, select: { id: true } }),
    prisma.announcement.findFirst({ where: { title: "Informasi Demo SPMB 2026/2027" }, select: { id: true } }),
    prisma.documentType.findMany({ where: { code: { in: demoDocumentCodes } }, select: { id: true, code: true } }),
  ]);
  if (existingPeriod || existingTest || existingAnnouncement || existingDocumentTypes.length) {
    throw new Error("Fixture demo dengan kode yang sama sudah ada; seed dihentikan sebelum menulis agar tidak mengubah data yang sudah tersimpan.");
  }

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + 6);
  const period = await prisma.admissionPeriod.create({ data: { code: "DEMO-2026-2027", name: "Periode Demo SPMB 2026/2027", startsAt: now, endsAt, isActive: true } });
  const wave = await prisma.admissionWave.create({ data: { periodId: period.id, code: "DEMO-1", name: "Gelombang Demo 1", startsAt: now, endsAt, isActive: true } });

  for (const documentType of [
    { code: "DEMO-KK", name: "Kartu Keluarga (contoh)", required: true },
    { code: "DEMO-RAPOR", name: "Rapor (contoh)", required: true },
    { code: "DEMO-FOTO", name: "Pas foto (contoh)", required: true },
  ]) {
    await prisma.documentType.create({ data: { ...documentType, description: "Jenis dokumen untuk simulasi. Unggah berkas fiktif saja.", isActive: true } });
  }

  // School settings are intentionally not seeded: these keys control real fees,
  // payment destinations, TKA duration, and publication state.

  const test = await prisma.tkaTest.create({ data: { code: "DEMO-TKA-2026", name: "TKA Demo SPMB 2026/2027", description: "Tes contoh untuk demonstrasi; bukan instrumen seleksi resmi.", status: "PUBLISHED", startsAt: now, endsAt, isActive: true } });
  const demoQuestions = [
    { text: "Jika 3x + 5 = 20, berapa nilai x?", answer: "5", distractors: ["3", "4", "6"] },
    { text: "Sinonim kata 'cermat' adalah ...", answer: "Teliti", distractors: ["Cepat", "Lambat", "Ragu"] },
    { text: "Pola bilangan 2, 4, 8, 16, ... berlanjut dengan angka ...", answer: "32", distractors: ["18", "24", "30"] },
  ];
  const questionRows: Array<{ id: string; correctOptionId: string }> = [];
  for (const item of demoQuestions) {
    const question = await prisma.tkaQuestion.create({ data: { tkaTestId: test.id, questionText: item.text, difficulty: "MUDAH", points: 1, isActive: true } });
    for (const optionText of [item.answer, ...item.distractors]) {
      await prisma.tkaQuestionOption.create({ data: { questionId: question.id, optionText, isCorrect: optionText === item.answer } });
    }
    const correctOption = await prisma.tkaQuestionOption.findFirst({ where: { questionId: question.id, optionText: item.answer }, select: { id: true } });
    if (!correctOption) throw new Error(`Missing correct demo answer for question: ${item.text}`);
    questionRows.push({ id: question.id, correctOptionId: correctOption.id });
  }
  const schedule = await prisma.tkaSchedule.create({ data: { tkaTestId: test.id, scheduledAt: now, location: "Demo online", status: "SCHEDULED", capacity: 100 } });

  const userRows = new Map<string, string>();
  for (const account of accounts) {
    const user = await prisma.user.create({ data: { email: account.email, passwordHash, roleId: roleRows.get(account.role)!, isActive: true } });
    userRows.set(account.email, user.id);
    if (account.role !== RoleName.SISWA) continue;

    const student = await prisma.student.create({ data: { userId: user.id, registrationCode: account.code } });
    await prisma.studentProfile.create({ data: { studentId: student.id, fullName: account.name, nisn: account.nisn, phoneNumber: "081200000000", schoolOrigin: "SMP Demo Citra Negara", city: "Depok" } });

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        admissionPeriodId: period.id,
        admissionWaveId: wave.id,
        registrationNumber: account.code,
        status: account.status,
        isFinalized: true,
        submittedAt: now,
      },
    });
    const firstProgramId = programRows.get(account.program)!;
    const existingChoice = await prisma.applicationProgramChoice.findFirst({ where: { applicationId: application.id, priority: 1 } });
    if (!existingChoice) await prisma.applicationProgramChoice.create({ data: { applicationId: application.id, studyProgramId: firstProgramId, priority: 1 } });

    if (account.status === ApplicationStatus.WAITING_PAYMENT) {
      await prisma.payment.create({ data: { applicationId: application.id, referenceNumber: `DEMO-PAY-${account.code}`, amount: 500, paymentMethod: "SIMULASI DEMO - JANGAN TRANSFER", paymentDestination: "DATA DEMO SAJA - JANGAN MELAKUKAN TRANSFER", status: PaymentStatus.PENDING } });
    }

    if (account.status === ApplicationStatus.PASSED) {
      await prisma.payment.create({ data: { applicationId: application.id, referenceNumber: `DEMO-PAY-${account.code}`, amount: 500, paymentMethod: "SIMULASI DEMO - JANGAN TRANSFER", paymentDestination: "DATA DEMO SAJA - JANGAN MELAKUKAN TRANSFER", status: PaymentStatus.VERIFIED } });
      await prisma.selection.create({ data: { applicationId: application.id, studyProgramId: firstProgramId, status: SelectionStatus.PASSED, selectionRank: 1, notes: "Keputusan contoh untuk menunjukkan hasil seleksi demo." } });
      const attempt = await prisma.tkaAttempt.create({ data: { applicationId: application.id, studentId: student.id, scheduleId: schedule.id, status: "COMPLETED", startedAt: new Date(now.getTime() - 10 * 60_000), submittedAt: now, score: questionRows.length } });
      for (const question of questionRows) {
        await prisma.tkaAnswer.create({ data: { attemptId: attempt.id, questionId: question.id, selectedOptionId: question.correctOptionId, isCorrect: true } });
      }
      await prisma.tkaResult.create({ data: { attemptId: attempt.id, applicationId: application.id, totalScore: questionRows.length, passed: true, publishedAt: now } });
    }
  }

  const announcementTitle = "Informasi Demo SPMB 2026/2027";
  const announcement = await prisma.announcement.create({ data: { title: announcementTitle, content: "Ini data simulasi untuk demonstrasi alur SPMB SMK Citra Negara. Jangan gunakan data pribadi asli.", status: AnnouncementStatus.PUBLISHED, publishedAt: now } });

  const studentUserId = userRows.get("siswa1.demo@spmb.test")!;
  const studentApplication = await prisma.application.findUnique({ where: { registrationNumber: "CN-DEMO-26001" } });
  const notificationTitle = "Selamat datang di demo SPMB";
  await prisma.notification.create({
    data: { userId: studentUserId, applicationId: studentApplication?.id, announcementId: announcement.id, title: notificationTitle, message: "Lengkapi profil dan dokumen contoh untuk mencoba alur pendaftaran.", type: "INFO" },
  });

  console.log("Demo fixtures prepared: 2 staff accounts, 4 student accounts, active demo period, 6 programs, sample applications, a demo TKA, demo-only payment settings, and one announcement.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
