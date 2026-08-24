-- CreateTable
CREATE TABLE "BmwCarouselItem" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "imageUrl" VARCHAR(500) NOT NULL,
    "imagePublicId" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BmwCarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BmwCarouselItem_isActive_idx" ON "BmwCarouselItem"("isActive");

-- CreateIndex
CREATE INDEX "BmwCarouselItem_sortOrder_idx" ON "BmwCarouselItem"("sortOrder");
