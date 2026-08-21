-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "orderId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_orderId_idx" ON "Transaction"("orderId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_orderId_fkey'
    ) THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
