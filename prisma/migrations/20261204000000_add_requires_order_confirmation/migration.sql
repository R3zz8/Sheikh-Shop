-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "requiresOrderConfirmation" BOOLEAN NOT NULL DEFAULT false;
