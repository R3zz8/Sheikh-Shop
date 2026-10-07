-- CreateTable
CREATE TABLE "PrePurchaseNotice" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "title" VARCHAR(255) NOT NULL DEFAULT 'اطلاعیه مهم پیش از ثبت سفارش',
    "message" TEXT NOT NULL DEFAULT 'با توجه به نوسانات قیمت ارز و محدودیت موجودی برخی کالاها، لطفاً پیش از ثبت نهایی سفارش و پرداخت، جهت اطمینان از قیمت روز و موجودی کالا با واحد فروش فروشگاه شیخ هماهنگ فرمایید.',
    "phoneNumber" VARCHAR(20) NOT NULL DEFAULT '09178769556',
    "updatedBy" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrePurchaseNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrePurchaseNotice_isEnabled_idx" ON "PrePurchaseNotice"("isEnabled");
