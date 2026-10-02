import {
  AnnouncementStatus,
  ApplicationStatus,
  PaymentStatus,
  PrismaClient,
  RoleName,
  SelectionStatus,
  VerificationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: RoleName.SISWA, description: "Calon siswa yang mendaftar melalui portal PPDB." },
    { name: RoleName.ADMIN, description: "Administrator operasional PPDB." },
    { name: RoleName.KEPALA_SEKOLAH, description: "Kepala sekolah dengan akses read-only untuk monitoring dan laporan." },
  ] as const;

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
  }

  const studyPrograms = [
    { code: "PPLG", name: "Pengembangan Perangkat Lunak dan Gim", description: "Program keahlian teknologi perangkat lunak dan game.", capacity: null },
    { code: "TJKT", name: "Teknik Jaringan Komputer dan Telekomunikasi", description: "Program keahlian jaringan dan telekomunikasi.", capacity: null },
    { code: "DKV", name: "Desain Komunikasi Visual", description: "Program keahlian desain komunikasi visual.", capacity: null },
    { code: "MPLB", name: "Manajemen Perkantoran dan Layanan Bisnis", description: "Program keahlian administrasi perkantoran dan layanan bisnis.", capacity: null },
    { code: "BDR", name: "Bisnis Digital dan Ritel", description: "Program keahlian bisnis digital dan ritel.", capacity: null },
    { code: "PHT", name: "Perhotelan", description: "Program keahlian perhotelan.", capacity: null },
  ] as const;

  for (const program of studyPrograms) {
    await prisma.studyProgram.upsert({
      where: { code: program.code },
      update: {
        name: program.name,
        description: program.description,
        capacity: program.capacity,
      },
      create: {
        code: program.code,
        name: program.name,
        description: program.description,
        capacity: program.capacity,
      },
    });
  }

  const admissionPeriod = await prisma.admissionPeriod.upsert({
    where: { code: "UNCONFIGURED" },
    update: {
      name: "Periode belum dikonfigurasi",
      startsAt: null,
      endsAt: null,
      isActive: false,
    },
    create: {
      code: "UNCONFIGURED",
      name: "Periode belum dikonfigurasi",
      startsAt: null,
      endsAt: null,
      isActive: false,
    },
  });

  await prisma.admissionWave.upsert({
    where: {
      periodId_code: {
        periodId: admissionPeriod.id,
        code: "UNCONFIGURED",
      },
    },
    update: {
      name: "Gelombang belum dikonfigurasi",
      startsAt: null,
      endsAt: null,
      isActive: false,
    },
    create: {
      periodId: admissionPeriod.id,
      code: "UNCONFIGURED",
      name: "Gelombang belum dikonfigurasi",
      startsAt: null,
      endsAt: null,
      isActive: false,
    },
  });

  await prisma.documentType.upsert({
    where: { code: "UNCONFIGURED" },
    update: {
      name: "Tipe dokumen belum dikonfigurasi",
      required: false,
      description: null,
      isActive: false,
    },
    create: {
      code: "UNCONFIGURED",
      name: "Tipe dokumen belum dikonfigurasi",
      required: false,
      description: null,
      isActive: false,
    },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "admission.default_status" },
    update: { value: ApplicationStatus.DRAFT, description: "Status awal pendaftaran baru." },
    create: { key: "admission.default_status", value: ApplicationStatus.DRAFT, description: "Status awal pendaftaran baru." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "payment.default_status" },
    update: { value: PaymentStatus.PENDING, description: "Status awal pembayaran yang belum diverifikasi." },
    create: { key: "payment.default_status", value: PaymentStatus.PENDING, description: "Status awal pembayaran yang belum diverifikasi." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "document.default_status" },
    update: { value: VerificationStatus.PENDING, description: "Status awal verifikasi dokumen." },
    create: { key: "document.default_status", value: VerificationStatus.PENDING, description: "Status awal verifikasi dokumen." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "selection.default_status" },
    update: { value: SelectionStatus.PENDING, description: "Status awal untuk peserta yang belum diproses seleksi." },
    create: { key: "selection.default_status", value: SelectionStatus.PENDING, description: "Status awal untuk peserta yang belum diproses seleksi." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "announcement.default_status" },
    update: { value: AnnouncementStatus.DRAFT, description: "Status awal pengumuman sebelum dipublikasikan." },
    create: { key: "announcement.default_status", value: AnnouncementStatus.DRAFT, description: "Status awal pengumuman sebelum dipublikasikan." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "tka.default_status" },
    update: { value: "DRAFT", description: "Status awal konfigurasi tes TKA." },
    create: { key: "tka.default_status", value: "DRAFT", description: "Status awal konfigurasi tes TKA." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "system.placeholder_quota" },
    update: { value: "TBD", description: "Placeholder kapasitas final belum ditentukan oleh sekolah." },
    create: { key: "system.placeholder_quota", value: "TBD", description: "Placeholder kapasitas final belum ditentukan oleh sekolah." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "system.placeholder_payment_amount" },
    update: { value: "TBD", description: "Placeholder biaya formulir belum ditentukan oleh sekolah." },
    create: { key: "system.placeholder_payment_amount", value: "TBD", description: "Placeholder biaya formulir belum ditentukan oleh sekolah." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "system.placeholder_tka_scoring" },
    update: { value: "TBD", description: "Placeholder skoring TKA belum ditentukan oleh sekolah." },
    create: { key: "system.placeholder_tka_scoring", value: "TBD", description: "Placeholder skoring TKA belum ditentukan oleh sekolah." },
  });

  await prisma.schoolSetting.upsert({
    where: { key: "system.placeholder_waiting_list_policy" },
    update: { value: "TBD", description: "Placeholder kebijakan waiting list belum ditentukan oleh sekolah." },
    create: { key: "system.placeholder_waiting_list_policy", value: "TBD", description: "Placeholder kebijakan waiting list belum ditentukan oleh sekolah." },
  });

  await prisma.tkaTest.upsert({
    where: { code: "UNCONFIGURED" },
    update: {
      name: "TKA belum dikonfigurasi",
      description: null,
      status: "DRAFT",
      isActive: false,
    },
    create: {
      code: "UNCONFIGURED",
      name: "TKA belum dikonfigurasi",
      description: null,
      status: "DRAFT",
      isActive: false,
    },
  });

  console.log("Database foundation seed applied.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
