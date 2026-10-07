import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';

export interface PrePurchaseNoticeItem {
  id: string;
  isEnabled: boolean;
  title: string;
  message: string;
  phoneNumber: string;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicPrePurchaseNotice {
  isEnabled: boolean;
  title: string;
  message: string;
  phoneNumber: string;
}

const CACHE_KEY = 'pre_purchase_notice_active';
const CACHE_TTL_SECONDS = 300; // 5 minutes

export const DEFAULT_PRE_PURCHASE_NOTICE: PublicPrePurchaseNotice = {
  isEnabled: true,
  title: 'اطلاعیه مهم پیش از ثبت سفارش',
  message: 'با توجه به نوسانات قیمت ارز و محدودیت موجودی برخی کالاها، لطفاً پیش از ثبت نهایی سفارش و پرداخت، جهت اطمینان از قیمت روز و موجودی کالا با واحد فروش فروشگاه شیخ هماهنگ فرمایید.',
  phoneNumber: '09178769556',
};

export async function getPrePurchaseNotice(): Promise<PublicPrePurchaseNotice> {
  try {
    const cached = await cacheService.get<PublicPrePurchaseNotice>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    const item = await prisma.prePurchaseNotice.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!item) {
      // Return default configuration if no record exists
      return DEFAULT_PRE_PURCHASE_NOTICE;
    }

    const publicNotice: PublicPrePurchaseNotice = {
      isEnabled: item.isEnabled,
      title: item.title,
      message: item.message,
      phoneNumber: item.phoneNumber,
    };

    await cacheService.set(CACHE_KEY, publicNotice, CACHE_TTL_SECONDS);
    return publicNotice;
  } catch (error) {
    console.error('[GET_PRE_PURCHASE_NOTICE_ERROR]', error);
    return DEFAULT_PRE_PURCHASE_NOTICE;
  }
}

export async function getPrePurchaseNoticeAdmin(): Promise<PrePurchaseNoticeItem | null> {
  try {
    const item = await prisma.prePurchaseNotice.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!item) {
      return {
        id: 'default',
        ...DEFAULT_PRE_PURCHASE_NOTICE,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return item as PrePurchaseNoticeItem;
  } catch (error) {
    console.error('[GET_PRE_PURCHASE_NOTICE_ADMIN_ERROR]', error);
    return null;
  }
}
