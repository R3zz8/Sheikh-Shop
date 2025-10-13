-- CreateIndex
CREATE INDEX "CartItem_userId_productId_idx" ON "public"."CartItem"("userId", "productId");

-- CreateIndex
CREATE INDEX "CartItem_createdAt_idx" ON "public"."CartItem"("createdAt");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "Product_category_status_idx" ON "public"."Product"("category", "status");

-- CreateIndex
CREATE INDEX "Product_price_status_idx" ON "public"."Product"("price", "status");
