BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "parent_guardians") THEN
        RAISE EXCEPTION 'Student data model migration stopped: existing parent_guardians rows require verified guardianType mapping.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "application_program_choices"
        GROUP BY "applicationId", "studyProgramId"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Student data model migration stopped: duplicate study programs exist within an application.';
    END IF;
END $$;

CREATE TYPE "GuardianType" AS ENUM ('FATHER', 'MOTHER', 'OTHER');

ALTER TABLE "student_profiles"
    ADD COLUMN "religion" TEXT,
    ADD COLUMN "familyStatus" TEXT,
    ADD COLUMN "citizenship" TEXT,
    ADD COLUMN "familyCardNumber" VARCHAR(16),
    ADD COLUMN "province" TEXT,
    ADD COLUMN "city" TEXT,
    ADD COLUMN "district" TEXT,
    ADD COLUMN "village" TEXT,
    ADD COLUMN "postalCode" VARCHAR(5),
    ADD COLUMN "schoolNpsn" VARCHAR(8),
    ADD COLUMN "schoolType" TEXT,
    ADD COLUMN "schoolStatus" TEXT,
    ADD COLUMN "graduationYear" VARCHAR(4),
    ADD COLUMN "parentWhatsapp" TEXT;

ALTER TABLE "parent_guardians"
    ADD COLUMN "guardianType" "GuardianType" NOT NULL,
    ADD COLUMN "occupation" TEXT,
    ADD COLUMN "incomeBracket" TEXT;

DROP INDEX "parent_guardians_studentId_key";
CREATE UNIQUE INDEX "parent_guardians_studentId_guardianType_key"
    ON "parent_guardians"("studentId", "guardianType");

ALTER TABLE "applications"
    ALTER COLUMN "registrationNumber" DROP NOT NULL,
    ADD COLUMN "semester1Average" DECIMAL(5,2),
    ADD COLUMN "semester2Average" DECIMAL(5,2),
    ADD COLUMN "semester3Average" DECIMAL(5,2),
    ADD COLUMN "semester4Average" DECIMAL(5,2);

CREATE UNIQUE INDEX "application_program_choices_applicationId_studyProgramId_key"
    ON "application_program_choices"("applicationId", "studyProgramId");

DROP INDEX "documents_applicationId_documentTypeId_key";

COMMIT;