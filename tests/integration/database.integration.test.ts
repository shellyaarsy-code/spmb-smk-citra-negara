import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { isSafeLocalTestDatabaseUrl } from "../../services/database/database-safety";

const databaseUrl = process.env.SPMB_TEST_DATABASE_URL;
const writesAllowed = process.env.SPMB_TEST_DATABASE_WRITES === "ALLOW_DISPOSABLE_DATABASE";

test("PostgreSQL application relations, ownership filters, and status history", { skip: !databaseUrl || !writesAllowed }, async () => {
  assert.ok(isSafeLocalTestDatabaseUrl(databaseUrl), "test URL must be local PostgreSQL with an explicit test/dev/local database name");

  const safeDatabaseUrl = databaseUrl!;
  const { PrismaClient, Prisma, ApplicationStatus, RoleName } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: safeDatabaseUrl });
  const rollback = new Error("rollback integration fixture");
  let rollbackReached = false;

  try {
    const probe = await prisma.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;
    assert.equal(Number(probe[0]?.value), 1, "read-only database preflight succeeds");

    try {
      await prisma.$transaction(async (tx) => {
        const role = await tx.role.findUnique({ where: { name: RoleName.SISWA }, select: { id: true } });
        const programs = await tx.studyProgram.findMany({ where: { isActive: true }, orderBy: { code: "asc" }, take: 2, select: { id: true } });
        assert.ok(role, "SISWA role must be present (run seed only on the confirmed disposable database)");
        assert.equal(programs.length, 2, "at least two active programs must be present");

        const nonce = randomUUID();
        const userA = await tx.user.create({ data: { roleId: role.id, email: `integration-a-${nonce}@example.invalid` } });
        const userB = await tx.user.create({ data: { roleId: role.id, email: `integration-b-${nonce}@example.invalid` } });
        const studentA = await tx.student.create({ data: { userId: userA.id } });
        const studentB = await tx.student.create({ data: { userId: userB.id } });
        const application = await tx.application.create({
          data: {
            studentId: studentA.id,
            status: ApplicationStatus.SUBMITTED,
            registrationNumber: `IT-${nonce}`,
            submittedAt: new Date(),
            programChoices: { create: programs.map((program, index) => ({ studyProgramId: program.id, priority: index + 1 })) },
          },
          include: { programChoices: true },
        });
        await tx.applicationStatusHistory.create({ data: { applicationId: application.id, status: ApplicationStatus.SUBMITTED, changedByUserId: userA.id } });

        assert.equal(application.programChoices.length, 2);
        assert.equal(await tx.application.count({ where: { id: application.id, studentId: studentA.id } }), 1);
        assert.equal(await tx.application.count({ where: { id: application.id, studentId: studentB.id } }), 0, "a different student's ownership filter returns no application");
        assert.equal(await tx.applicationStatusHistory.count({ where: { applicationId: application.id, changedByUserId: userA.id } }), 1);

        rollbackReached = true;
        throw rollback;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error !== rollback) throw error;
    }
    assert.ok(rollbackReached, "fixture transaction reached rollback after assertions");
  } finally {
    await prisma.$disconnect();
  }
});
