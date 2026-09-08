/**
 * Tipax V3 Metadata & Reference Services
 * Handles location data, packaging types, content categories, payment models, and parcel books.
 */

import { getValidTipaxToken, getTipaxCredentials } from './auth';
import { TIPAX_CITIES_MAP } from './cities';
import type {
  TipaxCity,
  TipaxPackingPrice,
  TipaxPackContentRate,
  TipaxParcelType,
  TipaxPaymentType,
  TipaxParcelBook,
} from './types';

// In-memory reference caches with TTL
let cachedCities: TipaxCity[] | null = null;
let citiesCacheExpiresAt = 0;

/**
 * Retrieves official list of active Tipax operational cities (`GET /api/OM/v3/Cities`)
 */
export async function getTipaxCities(): Promise<TipaxCity[]> {
  if (cachedCities && citiesCacheExpiresAt > Date.now()) {
    return cachedCities;
  }

  const { baseUrl, apiKey } = getTipaxCredentials();
  const token = await getValidTipaxToken();

  if (token) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      if (apiKey) {
        headers['X-API-KEY'] = apiKey;
        headers['ApiKey'] = apiKey;
      }

      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/Cities`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (res.ok) {
        const body = await res.json();
        const cityList: TipaxCity[] = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
          ? body.data
          : [];

        if (cityList.length > 0) {
          cachedCities = cityList;
          citiesCacheExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
          return cachedCities;
        }
      }
    } catch (err: any) {
      console.warn('[Tipax Metadata] Failed to fetch live cities from Tipax API:', err?.message || err);
    }
  }

  // Fallback to internal normalized city map
  const fallbackCities: TipaxCity[] = Object.entries(TIPAX_CITIES_MAP).map(([name, id]) => ({
    id,
    name,
  }));

  cachedCities = fallbackCities;
  citiesCacheExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  return cachedCities;
}

/**
 * Fetches packaging price profiles (`GET /api/OM/v3/PackingPrices`)
 */
export async function getTipaxPackingPrices(): Promise<TipaxPackingPrice[]> {
  const { baseUrl, apiKey } = getTipaxCredentials();
  const token = await getValidTipaxToken();

  if (!token) {
    return [
      { id: 10, title: 'پاکت / نامه', price: 0, code: 'ENVELOPE' },
      { id: 20, title: 'بسته استاندارد / کارتنی', price: 0, code: 'PACKAGE' },
      { id: 50, title: 'مینی پک', price: 0, code: 'MINI_PACK' },
    ];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/PackingPrices`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (res.ok) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
      if (list.length > 0) return list;
    }
  } catch (err: any) {
    console.warn('[Tipax Metadata] Error fetching PackingPrices:', err?.message || err);
  }

  return [
    { id: 10, title: 'پاکت / نامه', price: 0, code: 'ENVELOPE' },
    { id: 20, title: 'بسته استاندارد / کارتنی', price: 0, code: 'PACKAGE' },
    { id: 50, title: 'مینی پک', price: 0, code: 'MINI_PACK' },
  ];
}

/**
 * Fetches package content rates (`GET /api/OM/v3/PackContentRates`)
 */
export async function getTipaxPackContentRates(): Promise<TipaxPackContentRate[]> {
  const { baseUrl, apiKey } = getTipaxCredentials();
  const token = await getValidTipaxToken();

  if (!token) {
    return [
      { id: 1, title: 'کالای عمومی و لوازم الکترونیکی' },
      { id: 2, title: 'پوشاک و لوازم شخصی' },
      { id: 3, title: 'مواد غذایی خشک و آرایشی' },
    ];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/PackContentRates`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (res.ok) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
      if (list.length > 0) return list;
    }
  } catch (err: any) {
    console.warn('[Tipax Metadata] Error fetching PackContentRates:', err?.message || err);
  }

  return [
    { id: 1, title: 'کالای عمومی و لوازم الکترونیکی' },
    { id: 2, title: 'پوشاک و لوازم شخصی' },
    { id: 3, title: 'مواد غذایی خشک و آرایشی' },
  ];
}

/**
 * Fetches parcel types (`GET /api/OM/v3/ParcelType`)
 */
export async function getTipaxParcelTypes(): Promise<TipaxParcelType[]> {
  const { baseUrl, apiKey } = getTipaxCredentials();
  const token = await getValidTipaxToken();

  if (!token) {
    return [
      { id: 1, title: 'بسته عادی' },
      { id: 2, title: 'بسته شکستی' },
    ];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/ParcelType`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (res.ok) {
      const body = await res.json();
      const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
      if (list.length > 0) return list;
    }
  } catch (err: any) {
    console.warn('[Tipax Metadata] Error fetching ParcelType:', err?.message || err);
  }

  return [
    { id: 1, title: 'بسته عادی' },
    { id: 2, title: 'بسته شکستنی' },
  ];
}

/**
 * Fetches valid payment types (`GET /api/OM/v3/PaymentType`)
 */
export async function getTipaxPaymentTypes(): Promise<TipaxPaymentType[]> {
  return [
    { id: 1, title: 'نقدی / آنلاین (نقدی در مبدا)', description: 'پرداخت توسط فرستنده' },
    { id: 2, title: 'اعتباری (قراردادی)', description: 'تسویه حساب بر اساس قرارداد' },
    { id: 3, title: 'پس‌کرایه (نقدی در مقصد)', description: 'پرداخت توسط گیرنده' },
  ];
}

/**
 * Fetches parcel books (`GET /api/OM/v3/ParcelBooks`)
 */
export async function getTipaxParcelBooks(): Promise<TipaxParcelBook[]> {
  const { baseUrl, apiKey } = getTipaxCredentials();
  const token = await getValidTipaxToken();

  if (!token) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/OM/v3/ParcelBooks`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (res.ok) {
      const body = await res.json();
      return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    }
  } catch (err: any) {
    console.warn('[Tipax Metadata] Error fetching ParcelBooks:', err?.message || err);
  }

  return [];
}
