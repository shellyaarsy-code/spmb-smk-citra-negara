import "dotenv/config";
import { PrismaClient, ApplicationStatus, GuardianType, RoleName } from "@prisma/client";
import { registerStudent, loginUser } from "../../services/auth/auth-service";
import { hashSessionToken } from "../../services/auth/credentials";
import { generateRegistrationNumber } from "../../services/application/registration-number";

const prisma = new PrismaClient();

async function runSmokeTest() {
  const timestamp = Date.now().toString().slice(-6);
  const testNisn = `99${timestamp}12`; // 10 digits
  const testEmail = `smoke.student.${timestamp}@citranegara.sch.id`;
  const testPassword = "Password123#Secure!";
  const testWhatsapp = "081234567890";
  const testFullName = `Siswa Smoke Test ${timestamp}`;

  console.log("=== SPMB LIVE DATABASE SMOKE TEST ===");
  console.log("Using test NISN:", testNisn);
  console.log("Using test Email:", testEmail);

  let createdUserId: string | null = null;

  try {
    // 1. REGISTRATION SMOKE TEST
    console.log("\n[1/7] Testing Student Registration...");
    const regResult = await registerStudent({
      nisn: testNisn,
      fullName: testFullName,
      email: testEmail,
      whatsapp: testWhatsapp,
      password: testPassword,
      passwordConfirmation: testPassword,
      consent: true,
    });

    createdUserId = regResult.id;
    if (!createdUserId) throw new Error("Registration failed: missing user id");

    const dbUser = await prisma.user.findUnique({
      where: { id: createdUserId },
      include: {
        role: true,
        student: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!dbUser) throw new Error("User record not found in database");
    if (dbUser.email !== testEmail) throw new Error("User email mismatch");
    if (dbUser.role.name !== RoleName.SISWA) throw new Error("User role is not SISWA");
    if (!dbUser.student) throw new Error("Student relation missing in database");
    if (!dbUser.student.profile) throw new Error("StudentProfile relation missing in database");
    if (dbUser.student.profile.nisn !== testNisn) throw new Error("Profile NISN mismatch");
    if (dbUser.student.profile.fullName !== testFullName) throw new Error("Profile fullName mismatch");

    console.log("✔ Registration: PASS (User, Role, Student, StudentProfile created)");

    const studentId = dbUser.student.id;

    // 2. LOGIN / SESSION SMOKE TEST
    console.log("\n[2/7] Testing Login and Session Creation...");
    const loginResult = await loginUser({
      identifier: testEmail,
      password: testPassword,
    });

    if (!loginResult.token) throw new Error("Login failed: missing token");
    if (loginResult.user.id !== createdUserId) throw new Error("Login user mismatch");

    const expectedTokenHash = hashSessionToken(loginResult.token);
    const dbSession = await prisma.userSession.findUnique({
      where: { tokenHash: expectedTokenHash },
    });

    if (!dbSession) throw new Error("Session token hash not found in user_sessions table");
    if (dbSession.userId !== createdUserId) throw new Error("Session userId mismatch");

    const updatedUser = await prisma.user.findUnique({
      where: { id: createdUserId },
      select: { lastLoginAt: true },
    });
    if (!updatedUser?.lastLoginAt) throw new Error("User lastLoginAt was not updated upon login");

    console.log("✔ Login/Session: PASS (Password verified, Session created, lastLoginAt updated)");

    // 3. STUDENT PROFILE SMOKE TEST
    console.log("\n[3/7] Testing Student Profile Update...");
    const updatedProfile = await prisma.studentProfile.update({
      where: { studentId },
      data: {
        nik: "3276011234567890",
        gender: "L",
        birthPlace: "Depok",
        birthDate: new Date("2008-05-15"),
        address: "Jl. Raya Citra Negara No. 10",
        province: "Jawa Barat",
        city: "Kota Depok",
        district: "Pancoran Mas",
        village: "Mampang",
        postalCode: "16436",
        religion: "Islam",
        familyStatus: "ANAK_KANDUNG",
        schoolOrigin: "SMP Negeri 1 Depok",
        schoolNpsn: "20228899",
        schoolType: "SMP",
        schoolStatus: "NEGERI",
        graduationYear: "2026",
      },
    });

    if (updatedProfile.nik !== "3276011234567890") throw new Error("Profile NIK mismatch");
    if (updatedProfile.city !== "Kota Depok") throw new Error("Profile city mismatch");
    if (updatedProfile.schoolOrigin !== "SMP Negeri 1 Depok") throw new Error("Profile schoolOrigin mismatch");

    console.log("✔ Student Profile: PASS (Profile fields updated and persisted in student_profiles)");

    // 4. GUARDIAN SMOKE TEST
    console.log("\n[4/7] Testing Parent/Guardian Persistence...");
    await prisma.parentGuardian.upsert({
      where: {
        studentId_guardianType: {
          studentId,
          guardianType: GuardianType.FATHER,
        },
      },
      create: {
        studentId,
        guardianType: GuardianType.FATHER,
        guardianName: "Budi Santoso",
        relationship: "Ayah Kandung",
        occupation: "Wiraswasta",
        incomeBracket: "2-5-to-5",
        phoneNumber: "081298765432",
      },
      update: {
        guardianName: "Budi Santoso",
      },
    });

    await prisma.parentGuardian.upsert({
      where: {
        studentId_guardianType: {
          studentId,
          guardianType: GuardianType.MOTHER,
        },
      },
      create: {
        studentId,
        guardianType: GuardianType.MOTHER,
        guardianName: "Siti Rahmawati",
        relationship: "Ibu Kandung",
        occupation: "Ibu Rumah Tangga",
        incomeBracket: "none",
        phoneNumber: "081298765433",
      },
      update: {
        guardianName: "Siti Rahmawati",
      },
    });

    const dbGuardians = await prisma.parentGuardian.findMany({
      where: { studentId },
    });
    if (dbGuardians.length !== 2) throw new Error(`Expected 2 guardians, found ${dbGuardians.length}`);

    console.log("✔ Parent/Guardian: PASS (Father and Mother records created in parent_guardians)");

    // 5. APPLICATION DRAFT SMOKE TEST
    console.log("\n[5/7] Testing Application Draft & Program Choices...");
    const availablePrograms = await prisma.studyProgram.findMany({
      where: { isActive: true },
      take: 2,
    });
    if (availablePrograms.length < 2) throw new Error("Need at least 2 active study programs");

    const draft = await prisma.application.create({
      data: {
        studentId,
        status: ApplicationStatus.DRAFT,
        registrationNumber: null,
        semester1Average: "85.50",
        semester2Average: "86.25",
        semester3Average: "87.00",
        semester4Average: "88.75",
        programChoices: {
          create: [
            {
              studyProgramId: availablePrograms[0].id,
              priority: 1,
            },
            {
              studyProgramId: availablePrograms[1].id,
              priority: 2,
            },
          ],
        },
      },
      include: {
        programChoices: {
          include: { studyProgram: true },
        },
      },
    });

    if (draft.status !== ApplicationStatus.DRAFT) throw new Error("Draft status mismatch");
    if (draft.registrationNumber !== null) throw new Error("Draft should not have registrationNumber");
    if (draft.programChoices.length !== 2) throw new Error("Draft program choices count mismatch");
    if (draft.semester1Average?.toString() !== "85.5") throw new Error("Draft semester1 average mismatch");

    console.log("✔ Application Draft: PASS (Draft created with semester averages and 2 program choices)");

    // 6. APPLICATION SUBMISSION SMOKE TEST
    console.log("\n[6/7] Testing Application Submission State Machine...");
    const registrationNumber = generateRegistrationNumber();
    const submittedAt = new Date();

    const submittedApp = await prisma.application.update({
      where: { id: draft.id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        registrationNumber,
        submittedAt,
      },
      include: {
        programChoices: true,
      },
    });

    if (submittedApp.status !== ApplicationStatus.SUBMITTED) throw new Error("Application status not SUBMITTED");
    if (!submittedApp.registrationNumber) throw new Error("Registration number was not assigned");
    if (!submittedApp.submittedAt) throw new Error("SubmittedAt timestamp was not set");

    console.log("✔ Application Submission: PASS (Transitioned DRAFT -> SUBMITTED with registration number: " + registrationNumber + ")");

    // 7. APPLICATION STATUS HISTORY SMOKE TEST
    console.log("\n[7/7] Testing Application Status History Audit Trail...");
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: draft.id,
        status: ApplicationStatus.SUBMITTED,
        changedByUserId: createdUserId,
        notes: "Aplikasi diserahkan secara online oleh calon siswa.",
      },
    });

    const dbHistory = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: draft.id },
    });

    if (dbHistory.length !== 1) throw new Error("Status history entry not found");
    if (dbHistory[0].status !== ApplicationStatus.SUBMITTED) throw new Error("Status history status mismatch");
    if (dbHistory[0].changedByUserId !== createdUserId) throw new Error("Status history changedByUserId mismatch");

    console.log("✔ Application Status History: PASS (Audit trail logged in application_status_history)");

    console.log("\n========================================");
    console.log("ALL 7 DATABASE-BACKED SMOKE TESTS PASSED!");
    console.log("========================================");

  } finally {
    // Clean up test data
    if (createdUserId) {
      console.log("\nCleaning up test user data...");
      await prisma.user.delete({
        where: { id: createdUserId },
      });
      console.log("✔ Cleanup complete. Database is pristine.");
    }
    await prisma.$disconnect();
  }
}

runSmokeTest()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ SMOKE TEST FAILED:", err);
    process.exit(1);
  });
