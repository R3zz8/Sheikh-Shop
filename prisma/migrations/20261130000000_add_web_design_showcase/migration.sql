-- CreateTable
CREATE TABLE "WebDesignShowcase" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL DEFAULT 'شیخ وب؛ جایی که ایده‌ها تبدیل به وب‌سایت می‌شوند.',
    "description" TEXT NOT NULL DEFAULT 'طراحی و توسعه وب‌سایت‌های فروشگاهی، شرکتی، خدماتی و اختصاصی با تکنولوژی‌های مدرن، طراحی حرفه‌ای و تمرکز بر سرعت و تجربه کاربری.',
    "services" TEXT[] DEFAULT ARRAY['فروشگاهی', 'شرکتی', 'خدماتی', 'شخصی', 'اختصاصی']::TEXT[],
    "imageUrl" VARCHAR(500),
    "imagePublicId" VARCHAR(255),
    "ctaText" VARCHAR(100) DEFAULT 'مشاهده خدمات طراحی سایت',
    "ctaUrl" VARCHAR(500) DEFAULT '/services/web-design',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebDesignShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebDesignShowcase_isEnabled_idx" ON "WebDesignShowcase"("isEnabled");
