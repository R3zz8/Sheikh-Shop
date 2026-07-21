import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Zod validation schemas
const configSchema = z.object({
  isEnabled: z.boolean().default(true),
  animationSpeed: z.number().min(0.1).max(10).default(1.0),
  particleDensity: z.number().min(0).max(5).default(1.0),
  lightIntensity: z.number().min(0).max(5).default(1.0),
  cameraDistance: z.number().min(1).max(20).default(5.0),
  enableAudio: z.boolean().default(true),
  ribbonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#d97706'),
  goldenGlow: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#f59e0b'),
  backgroundStyle: z.enum(['dark-ambient', 'coffee', 'chocolate']).default('dark-ambient'),
  openingDuration: z.number().min(0.5).max(30).default(3.0),
  featuredProductMode: z.enum(['pedestal', '3d', 'floating']).default('pedestal'),
  autoPreview: z.boolean().default(false),
  introDuration: z.number().min(0).max(30).default(2.0),
  cameraSpeed: z.number().min(0.1).max(5).default(1.0),
  fogIntensity: z.number().min(0).max(5).default(1.0),
  audioVolume: z.number().min(0).max(1).default(0.5),
  animationPreset: z.string().default('classic'),
  autoClose: z.boolean().default(false),
  ctaStyle: z.string().default('luxury'),
  themePreset: z.string().default('gold-chocolate'),
});

const assetsSchema = z.object({
  boxTextureUrl: z.string().url().nullable().optional(),
  crownLogoUrl: z.string().url().nullable().optional(),
  unlockSoundUrl: z.string().url().nullable().optional(),
  openSoundUrl: z.string().url().nullable().optional(),
  sparkleSoundUrl: z.string().url().nullable().optional(),
  unwrapSoundUrl: z.string().url().nullable().optional(),
});

const settingsSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().nullable().optional(),
});

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user && (session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN');
}

// GET - Retrieve active config and related models
export async function GET() {
  try {
    let config = await prisma.luxuryUnboxingConfig.findFirst();
    if (!config) {
      config = await prisma.luxuryUnboxingConfig.create({
        data: {
          isEnabled: true,
          animationSpeed: 1.0,
          particleDensity: 1.0,
          lightIntensity: 1.0,
          cameraDistance: 5.0,
          enableAudio: true,
          ribbonColor: '#d97706',
          goldenGlow: '#f59e0b',
          backgroundStyle: 'dark-ambient',
          openingDuration: 3.0,
          featuredProductMode: 'pedestal',
          autoPreview: false,
          introDuration: 2.0,
          cameraSpeed: 1.0,
          fogIntensity: 1.0,
          audioVolume: 0.5,
          animationPreset: 'classic',
          autoClose: false,
          ctaStyle: 'luxury',
          themePreset: 'gold-chocolate',
        },
      });
    }

    let assets = await prisma.luxuryUnboxingAssets.findFirst();
    if (!assets) {
      assets = await prisma.luxuryUnboxingAssets.create({
        data: {},
      });
    }

    const settings = await prisma.luxuryUnboxingSettings.findMany();

    // Fetch all active products so the admin dashboard can choose any product for the unboxing preview simulation
    const allProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: {
          take: 1,
          select: {
            secureUrl: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      config,
      assets,
      settings,
      allProducts,
    });
  } catch (error: any) {
    console.error('Error fetching luxury unboxing configuration:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات جعبه گشایی لوکس' },
      { status: 500 }
    );
  }
}

// POST - Create or full update of settings / config
export async function POST(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'عدم دسترسی' }, { status: 401 });
    }

    const body = await request.json();
    const parsedConfig = configSchema.safeParse(body.config);
    if (!parsedConfig.success) {
      return NextResponse.json(
        { error: 'مقادیر تنظیمات نامعتبر است', details: parsedConfig.error.flatten() },
        { status: 400 }
      );
    }

    let config = await prisma.luxuryUnboxingConfig.findFirst();
    if (config) {
      config = await prisma.luxuryUnboxingConfig.update({
        where: { id: config.id },
        data: parsedConfig.data,
      });
    } else {
      config = await prisma.luxuryUnboxingConfig.create({
        data: parsedConfig.data,
      });
    }

    // Handle optional assets update if supplied
    let assets = await prisma.luxuryUnboxingAssets.findFirst();
    if (body.assets) {
      const parsedAssets = assetsSchema.safeParse(body.assets);
      if (parsedAssets.success) {
        if (assets) {
          assets = await prisma.luxuryUnboxingAssets.update({
            where: { id: assets.id },
            data: parsedAssets.data,
          });
        } else {
          assets = await prisma.luxuryUnboxingAssets.create({
            data: parsedAssets.data,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      config,
      assets,
    });
  } catch (error: any) {
    console.error('Error creating/updating luxury unboxing:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره تنظیمات جعبه گشایی لوکس' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific config / setting
export async function PUT(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'عدم دسترسی' }, { status: 401 });
    }

    const body = await request.json();
    let updatedConfig = null;
    let updatedAsset = null;
    let updatedSetting = null;

    if (body.config) {
      const parsedConfig = configSchema.partial().safeParse(body.config);
      if (!parsedConfig.success) {
        return NextResponse.json(
          { error: 'مقادیر تنظیمات نامعتبر است', details: parsedConfig.error.flatten() },
          { status: 400 }
        );
      }
      const existing = await prisma.luxuryUnboxingConfig.findFirst();
      if (existing) {
        updatedConfig = await prisma.luxuryUnboxingConfig.update({
          where: { id: existing.id },
          data: parsedConfig.data,
        });
      }
    }

    if (body.assets) {
      const parsedAssets = assetsSchema.partial().safeParse(body.assets);
      if (!parsedAssets.success) {
        return NextResponse.json(
          { error: 'مقادیر دارایی‌ها نامعتبر است', details: parsedAssets.error.flatten() },
          { status: 400 }
        );
      }
      const existing = await prisma.luxuryUnboxingAssets.findFirst();
      if (existing) {
        updatedAsset = await prisma.luxuryUnboxingAssets.update({
          where: { id: existing.id },
          data: parsedAssets.data,
        });
      }
    }

    if (body.setting) {
      const parsedSetting = settingsSchema.safeParse(body.setting);
      if (!parsedSetting.success) {
        return NextResponse.json(
          { error: 'تنظیمات نامعتبر است', details: parsedSetting.error.flatten() },
          { status: 400 }
        );
      }
      updatedSetting = await prisma.luxuryUnboxingSettings.upsert({
        where: { key: parsedSetting.data.key },
        update: {
          value: parsedSetting.data.value,
          description: parsedSetting.data.description,
        },
        create: parsedSetting.data,
      });
    }

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      assets: updatedAsset,
      setting: updatedSetting,
    });
  } catch (error: any) {
    console.error('Error updating luxury unboxing detail:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش اطلاعات جعبه گشایی لوکس' },
      { status: 500 }
    );
  }
}

// DELETE - Reset configurations / settings
export async function DELETE(request: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'عدم دسترسی' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');

    if (target === 'setting') {
      const key = searchParams.get('key');
      if (key) {
        await prisma.luxuryUnboxingSettings.delete({
          where: { key },
        });
        return NextResponse.json({ success: true, message: 'تنظیم با موفقیت حذف شد' });
      }
    }

    // Default: Reset config to factory defaults
    await prisma.luxuryUnboxingConfig.deleteMany();
    await prisma.luxuryUnboxingAssets.deleteMany();

    const config = await prisma.luxuryUnboxingConfig.create({
      data: {
        isEnabled: true,
        animationSpeed: 1.0,
        particleDensity: 1.0,
        lightIntensity: 1.0,
        cameraDistance: 5.0,
        enableAudio: true,
        ribbonColor: '#d97706',
        goldenGlow: '#f59e0b',
        backgroundStyle: 'dark-ambient',
        openingDuration: 3.0,
        featuredProductMode: 'pedestal',
        autoPreview: false,
        introDuration: 2.0,
        cameraSpeed: 1.0,
        fogIntensity: 1.0,
        audioVolume: 0.5,
        animationPreset: 'classic',
        autoClose: false,
        ctaStyle: 'luxury',
        themePreset: 'gold-chocolate',
      },
    });

    const assets = await prisma.luxuryUnboxingAssets.create({
      data: {},
    });

    return NextResponse.json({
      success: true,
      message: 'تنظیمات با موفقیت به حالت پیش‌فرض بازنشانی شد',
      config,
      assets,
    });
  } catch (error: any) {
    console.error('Error resetting luxury unboxing configuration:', error);
    return NextResponse.json(
      { error: 'خطا در بازنشانی تنظیمات جعبه گشایی لوکس' },
      { status: 500 }
    );
  }
}
