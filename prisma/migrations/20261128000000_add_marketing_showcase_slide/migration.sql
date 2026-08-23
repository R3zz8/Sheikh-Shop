-- CreateTable
CREATE TABLE "MarketingShowcaseSlide" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imagePublicId" VARCHAR(255),
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingShowcaseSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingShowcaseSlide_productId_idx" ON "MarketingShowcaseSlide"("productId");

-- CreateIndex
CREATE INDEX "MarketingShowcaseSlide_isActive_idx" ON "MarketingShowcaseSlide"("isActive");

-- CreateIndex
CREATE INDEX "MarketingShowcaseSlide_sortOrder_idx" ON "MarketingShowcaseSlide"("sortOrder");

-- AddForeignKey
ALTER TABLE "MarketingShowcaseSlide" ADD CONSTRAINT "MarketingShowcaseSlide_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
