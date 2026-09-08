/**
 * Tipax V3 Order Creation Module
 * Handles official order creation and shipment registration with Tipax (`POST /api/OM/v3/Orders`).
 */

import { getValidTipaxToken, getTipaxCredentials } from './auth';
import { resolveTipaxCityId, DEFAULT_TIPAX_ORIGIN_CITY_ID } from './cities';
import type {
  TipaxCreateOrderRequest,
  TipaxCreateOrderResponse,
  TipaxReceiverInput,
  TipaxPackageInput,
} from './types';

export interface CreateTipaxOrderParams {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientMobile?: string;
  recipientEmail?: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  totalValueToman: number;
  items: Array<{
    productName?: string;
    quantity: number;
    weightKg?: number | null;
    lengthCm?: number | null;
    widthCm?: number | null;
    heightCm?: number | null;
    priceToman?: number | null;
  }>;
  orderNotes?: string;
}

export interface CreateTipaxOrderResult {
  success: boolean;
  trackingCode?: string;
  tipaxOrderId?: string;
  priceRial?: number;
  message?: string;
  error?: string;
}

/**
 * Submits an order shipment to official Tipax V3 API (`POST /api/OM/v3/Orders`)
 */
export async function createTipaxOrderServer(
  params: CreateTipaxOrderParams
): Promise<CreateTipaxOrderResult> {
  const { baseUrl, apiKey } = getTipaxCredentials();
  const token = await getValidTipaxToken();

  if (!token) {
    console.warn('[Tipax Order Creation] Cannot create Tipax order: No valid auth token.');
    return {
      success: false,
      error: 'احراز هویت تیپاکس در دسترس نیست',
    };
  }

  try {
    const destinationCityId = resolveTipaxCityId(params.city, params.province);

    // Build receiver details
    const receiver: TipaxReceiverInput = {
      name: params.recipientName.trim() || 'مشتری فروشگاه شیخ',
      mobile: params.recipientMobile?.trim() || params.recipientPhone.trim() || '09000000000',
      phone: params.recipientPhone.trim() || params.recipientMobile?.trim() || '02100000000',
      address: params.address.trim(),
      cityId: destinationCityId,
      postalCode: params.postalCode.replace(/\D/g, '') || '1111111111',
      email: params.recipientEmail?.trim() || undefined,
    };

    // Build package specs
    let totalWeightKg = 0;
    let totalVolumeCm3 = 0;

    for (const item of params.items) {
      const q = Math.max(1, item.quantity);
      const w = typeof item.weightKg === 'number' && item.weightKg > 0 ? item.weightKg : 1.0;
      totalWeightKg += w * q;

      const l = typeof item.lengthCm === 'number' && item.lengthCm > 0 ? item.lengthCm : 20;
      const wi = typeof item.widthCm === 'number' && item.widthCm > 0 ? item.widthCm : 15;
      const h = typeof item.heightCm === 'number' && item.heightCm > 0 ? item.heightCm : 10;
      totalVolumeCm3 += (l * wi * h) * q;
    }

    const approxSide = Math.max(10, Math.round(Math.cbrt(totalVolumeCm3)));
    const totalValueRial = Math.max(1000000, Math.round(params.totalValueToman * 10));

    const packages: TipaxPackageInput[] = [
      {
        weight: Math.max(0.5, totalWeightKg),
        length: approxSide,
        width: approxSide,
        height: approxSide,
        value: totalValueRial,
        description: `سفارش فروشگاه شیخ شماره ${params.orderId}`,
        packType: 20, // Standard packaging box
        packageContentId: 1, // General merchandise
      },
    ];

    // Predefined Store Sender Info
    const sender = {
      name: 'فروشگاه آنلاین شیخ (Sheikh Shops)',
      mobile: process.env.TIPAX_USERNAME || '09178769556',
      address: 'تهران، مرکز توزیع فروشگاه شیخ',
      cityId: DEFAULT_TIPAX_ORIGIN_CITY_ID, // Tehran
    };

    const payload: TipaxCreateOrderRequest = {
      sender,
      receiver,
      packages,
      paymentType: 1, // Prepaid / Cash in Origin
      pickupType: 1, // Courier Pickup
      distributionType: 1, // Door Delivery
      description: params.orderNotes || `ثبت خودکار سفارش ${params.orderId}`,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/Orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[Tipax Order Creation Error] HTTP ${response.status}: ${errText}`);
      return {
        success: false,
        error: `خطا در ثبت سفارش در تیپاکس (کد ${response.status})`,
      };
    }

    const resJson: TipaxCreateOrderResponse = await response.json();

    const trackingCode =
      resJson.data?.trackingCode ||
      resJson.trackingCode ||
      (typeof resJson.data?.orderId === 'string' ? resJson.data.orderId : undefined);

    const tipaxOrderId =
      resJson.data?.orderId !== undefined
        ? String(resJson.data.orderId)
        : resJson.orderId !== undefined
        ? String(resJson.orderId)
        : undefined;

    if (!trackingCode && !tipaxOrderId) {
      console.warn('[Tipax Order Creation] Unexpected response schema (no trackingCode or orderId returned):', resJson);
      return {
        success: false,
        error: resJson.message || 'پاسخ نامعتبر از سامانه تیپاکس',
      };
    }

    return {
      success: true,
      trackingCode: trackingCode || tipaxOrderId,
      tipaxOrderId: tipaxOrderId || trackingCode,
      priceRial: resJson.data?.price,
      message: 'سفارش با موفقیت در سامانه تیپاکس ثبت شد',
    };
  } catch (error: any) {
    console.error('[Tipax Order Creation Exception]', error?.message || error);
    return {
      success: false,
      error: 'خطا در ارتباط با سامانه ثبت سفارش تیپاکس',
    };
  }
}
