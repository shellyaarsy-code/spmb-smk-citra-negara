ALTER TABLE "payments"
  ADD COLUMN "paymentProofFileName" TEXT,
  ADD COLUMN "paymentProofMimeType" TEXT,
  ADD COLUMN "paymentProofSize" INTEGER,
  ADD COLUMN "paymentMethod" TEXT,
  ADD COLUMN "paymentDestination" TEXT;
