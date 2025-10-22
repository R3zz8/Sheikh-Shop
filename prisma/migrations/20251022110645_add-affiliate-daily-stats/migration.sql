-- CreateTable
CREATE TABLE "AffiliateDailyStat" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "commissionEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateDailyStat_affiliateId_date_key" ON "AffiliateDailyStat"("affiliateId", "date");

-- CreateIndex
CREATE INDEX "AffiliateDailyStat_affiliateId_idx" ON "AffiliateDailyStat"("affiliateId");

-- CreateIndex
CREATE INDEX "AffiliateDailyStat_date_idx" ON "AffiliateDailyStat"("date");

-- AddForeignKey
ALTER TABLE "AffiliateDailyStat" ADD CONSTRAINT "AffiliateDailyStat_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
