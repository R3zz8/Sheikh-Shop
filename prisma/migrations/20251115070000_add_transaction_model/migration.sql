-- CreateTable
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "authority" VARCHAR(255) NOT NULL,
    "reference" VARCHAR(255),
    "amount" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_authority_key" ON "Transaction"("authority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_reference_idx" ON "Transaction"("reference");

