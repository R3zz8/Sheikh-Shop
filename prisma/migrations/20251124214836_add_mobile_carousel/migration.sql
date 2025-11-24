-- CreateTable
CREATE TABLE "MobileCarousel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobileCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MobileCarousel_order_idx" ON "MobileCarousel"("order");
