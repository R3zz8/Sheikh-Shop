-- CreateTable
CREATE TABLE "MarketAsset" (
    "id" TEXT NOT NULL,
    "symbol" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "nameFa" VARCHAR(150) NOT NULL,
    "nameEn" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "market" VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
    "unit" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" VARCHAR(150),
    "seoDescription" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketQuote" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "buyPrice" DOUBLE PRECISION,
    "sellPrice" DOUBLE PRECISION,
    "priceChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "percentChange" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "direction" VARCHAR(20) NOT NULL DEFAULT 'NEUTRAL',
    "provider" VARCHAR(50) NOT NULL DEFAULT 'NAVASAN',
    "unit" VARCHAR(50) NOT NULL,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "providerTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketPriceHistory" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "close" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketProviderStatus" (
    "id" TEXT NOT NULL,
    "providerName" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'HEALTHY',
    "lastSuccessFetch" TIMESTAMP(3),
    "lastFailedFetch" TIMESTAMP(3),
    "latencyMs" INTEGER,
    "errorCode" VARCHAR(50),
    "errorMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketProviderStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketAsset_symbol_key" ON "MarketAsset"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "MarketAsset_slug_key" ON "MarketAsset"("slug");

-- CreateIndex
CREATE INDEX "MarketAsset_category_idx" ON "MarketAsset"("category");

-- CreateIndex
CREATE INDEX "MarketAsset_isActive_idx" ON "MarketAsset"("isActive");

-- CreateIndex
CREATE INDEX "MarketAsset_isFeatured_idx" ON "MarketAsset"("isFeatured");

-- CreateIndex
CREATE INDEX "MarketAsset_sortOrder_idx" ON "MarketAsset"("sortOrder");

-- CreateIndex
CREATE INDEX "MarketAsset_slug_idx" ON "MarketAsset"("slug");

-- CreateIndex
CREATE INDEX "MarketQuote_assetId_idx" ON "MarketQuote"("assetId");

-- CreateIndex
CREATE INDEX "MarketQuote_fetchedAt_idx" ON "MarketQuote"("fetchedAt");

-- CreateIndex
CREATE INDEX "MarketQuote_providerTimestamp_idx" ON "MarketQuote"("providerTimestamp");

-- CreateIndex
CREATE INDEX "MarketPriceHistory_assetId_idx" ON "MarketPriceHistory"("assetId");

-- CreateIndex
CREATE INDEX "MarketPriceHistory_timestamp_idx" ON "MarketPriceHistory"("timestamp");

-- CreateIndex
CREATE INDEX "MarketPriceHistory_assetId_timestamp_idx" ON "MarketPriceHistory"("assetId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "MarketProviderStatus_providerName_key" ON "MarketProviderStatus"("providerName");

-- CreateIndex
CREATE INDEX "MarketProviderStatus_status_idx" ON "MarketProviderStatus"("status");

-- AddForeignKey
ALTER TABLE "MarketQuote" ADD CONSTRAINT "MarketQuote_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MarketAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketPriceHistory" ADD CONSTRAINT "MarketPriceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MarketAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
