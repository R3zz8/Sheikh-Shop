-- CreateIndex
CREATE INDEX "Product_category_status_price_idx" ON "public"."Product"("category", "status", "price");

-- CreateIndex
CREATE INDEX "Product_status_createdAt_idx" ON "public"."Product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_category_price_status_idx" ON "public"."Product"("category", "price", "status");
