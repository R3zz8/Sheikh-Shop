import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

const estimateSchema = z.object({
  siteTypeKey: z.string().min(1, 'انتخاب نوع وب‌سایت الزامی است'),
  selectedFeatureKeys: z.array(z.string()).optional().default([]),
  name: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  submitLead: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = estimateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const { siteTypeKey, selectedFeatureKeys, name, phone, notes, submitLead } = validation.data;

    // Fetch active rules from DB
    const allRules = await prisma.webCalculatorRule.findMany({
      where: { isActive: true },
    });

    const typeRule = allRules.find((r: { category: string; key: string }) => r.category === 'TYPE' && r.key === siteTypeKey);
    if (!typeRule) {
      return NextResponse.json({ message: 'نوع وب‌سایت انتخاب شده معتبر نمی‌باشد' }, { status: 400 });
    }

    let calculatedPrice = typeRule.price;

    const matchedFeatures: string[] = [];
    selectedFeatureKeys.forEach((key) => {
      const featRule = allRules.find((r: { category: string; key: string }) => r.category === 'FEATURE' && r.key === key);
      if (featRule) {
        calculatedPrice += featRule.price;
        matchedFeatures.push(featRule.title);
      }
    });

    let createdLead = null;
    if (submitLead) {
      if (!name || !phone) {
        return NextResponse.json({ message: 'جهت ثبت درخواست مشاوره، نام و شماره تماس الزامی است' }, { status: 400 });
      }

      // Check for matching WebService
      const matchingService = await prisma.webService.findFirst({
        where: { slug: siteTypeKey },
      });

      createdLead = await prisma.webLead.create({
        data: {
          serviceId: matchingService?.id || null,
          name,
          phone,
          siteType: typeRule.title,
          selectedFeatures: matchedFeatures,
          estimatedPrice: calculatedPrice,
          notes: notes || null,
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json({
      siteTypeTitle: typeRule.title,
      matchedFeatures,
      estimatedPrice: calculatedPrice,
      currency: 'تومان',
      disclaimer: 'این مبلغ یک برآورد اولیه بوده و پس از مشاوره تخصصی و بررسی نیازمندی‌ها قطعی خواهد شد.',
      leadId: createdLead?.id || null,
    });
  } catch (error) {
    console.error('[WEB_CALCULATOR_ESTIMATE_POST_ERROR]', error);
    return NextResponse.json({ message: 'خطا در محاسبه برآورد قیمت' }, { status: 500 });
  }
}
