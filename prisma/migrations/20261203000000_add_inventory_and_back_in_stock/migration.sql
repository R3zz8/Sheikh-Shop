-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'COMING_SOON', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "BackInStockSubscriptionStatus" AS ENUM ('ACTIVE', 'NOTIFIED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "allowBackInStockNotification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inventoryStatus" "InventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "BackInStockSubscription" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "status" "BackInStockSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackInStockSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackInStockSubscription_productId_idx" ON "BackInStockSubscription"("productId");

-- CreateIndex
CREATE INDEX "BackInStockSubscription_userId_idx" ON "BackInStockSubscription"("userId");

-- CreateIndex
CREATE INDEX "BackInStockSubscription_email_idx" ON "BackInStockSubscription"("email");

-- CreateIndex
CREATE INDEX "BackInStockSubscription_phone_idx" ON "BackInStockSubscription"("phone");

-- CreateIndex
CREATE INDEX "BackInStockSubscription_status_idx" ON "BackInStockSubscription"("status");

-- CreateIndex
CREATE INDEX "BackInStockSubscription_createdAt_idx" ON "BackInStockSubscription"("createdAt");

-- CreateIndex
CREATE INDEX "BackInStockSubscription_productId_status_idx" ON "BackInStockSubscription"("productId", "status");

-- AddForeignKey
ALTER TABLE "BackInStockSubscription" ADD CONSTRAINT "BackInStockSubscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
