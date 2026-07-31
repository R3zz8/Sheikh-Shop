-- AlterTable
ALTER TABLE "public"."Image" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Image_sortOrder_idx" ON "public"."Image"("sortOrder");

-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "thumbnailUrl" VARCHAR(500),
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Video_productId_idx" ON "public"."Video"("productId");

-- CreateIndex
CREATE INDEX "Video_sortOrder_idx" ON "public"."Video"("sortOrder");

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
