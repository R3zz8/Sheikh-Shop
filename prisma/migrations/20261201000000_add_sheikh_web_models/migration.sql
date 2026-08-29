-- CreateTable
CREATE TABLE "WebService" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "shortDescription" VARCHAR(500) NOT NULL,
    "fullDescription" TEXT,
    "startingPrice" INTEGER NOT NULL DEFAULT 0,
    "previousPrice" INTEGER,
    "currency" VARCHAR(20) NOT NULL DEFAULT 'تومان',
    "isStartingFrom" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedDelivery" VARCHAR(100),
    "imageUrl" VARCHAR(500),
    "imagePublicId" VARCHAR(255),
    "icon" VARCHAR(100),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "ctaText" VARCHAR(100) DEFAULT 'مشاهده و سفارش',
    "ctaUrl" VARCHAR(500),
    "seoTitle" VARCHAR(100),
    "seoDescription" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebServicePackage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "oldPrice" INTEGER,
    "description" VARCHAR(500),
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "badge" VARCHAR(50),
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebPortfolio" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imagePublicId" VARCHAR(255),
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectUrl" VARCHAR(500),
    "category" VARCHAR(100),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebFaq" (
    "id" TEXT NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "answer" TEXT NOT NULL,
    "category" VARCHAR(100),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebCalculatorRule" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "icon" VARCHAR(100),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebCalculatorRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebLead" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "siteType" VARCHAR(100) NOT NULL,
    "selectedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedPrice" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebService_slug_key" ON "WebService"("slug");
CREATE INDEX "WebService_slug_idx" ON "WebService"("slug");
CREATE INDEX "WebService_isActive_idx" ON "WebService"("isActive");
CREATE INDEX "WebService_displayOrder_idx" ON "WebService"("displayOrder");
CREATE INDEX "WebService_isFeatured_idx" ON "WebService"("isFeatured");

-- CreateIndex
CREATE INDEX "WebServicePackage_serviceId_idx" ON "WebServicePackage"("serviceId");
CREATE INDEX "WebServicePackage_isActive_idx" ON "WebServicePackage"("isActive");
CREATE INDEX "WebServicePackage_displayOrder_idx" ON "WebServicePackage"("displayOrder");

-- CreateIndex
CREATE INDEX "WebPortfolio_isActive_idx" ON "WebPortfolio"("isActive");
CREATE INDEX "WebPortfolio_displayOrder_idx" ON "WebPortfolio"("displayOrder");
CREATE INDEX "WebPortfolio_category_idx" ON "WebPortfolio"("category");

-- CreateIndex
CREATE INDEX "WebFaq_isActive_idx" ON "WebFaq"("isActive");
CREATE INDEX "WebFaq_displayOrder_idx" ON "WebFaq"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WebCalculatorRule_key_key" ON "WebCalculatorRule"("key");
CREATE INDEX "WebCalculatorRule_key_idx" ON "WebCalculatorRule"("key");
CREATE INDEX "WebCalculatorRule_category_idx" ON "WebCalculatorRule"("category");
CREATE INDEX "WebCalculatorRule_isActive_idx" ON "WebCalculatorRule"("isActive");
CREATE INDEX "WebCalculatorRule_displayOrder_idx" ON "WebCalculatorRule"("displayOrder");

-- CreateIndex
CREATE INDEX "WebLead_serviceId_idx" ON "WebLead"("serviceId");
CREATE INDEX "WebLead_status_idx" ON "WebLead"("status");
CREATE INDEX "WebLead_createdAt_idx" ON "WebLead"("createdAt");

-- AddForeignKey
ALTER TABLE "WebServicePackage" ADD CONSTRAINT "WebServicePackage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "WebService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebLead" ADD CONSTRAINT "WebLead_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "WebService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
