/**
 * Tipax API Type Definitions (OM v3)
 */

export interface TipaxAuthConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  apiKey?: string;
}

export interface TipaxTokenResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  expiresIn?: number;
  expiration?: string;
  isSuccess?: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

export interface TipaxAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface TipaxCity {
  id: number;
  name: string;
  provinceName?: string;
  provinceId?: number;
  code?: string;
}

export interface TipaxPackageSpec {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  valueRial?: number;
}

export interface TipaxPricingMinRequest {
  originCityId?: number;
  destinationCityId: number;
  weight: number; // in kg or grams depending on Tipax schema (we handle conversions)
  length?: number;
  width?: number;
  height?: number;
  declaredValue?: number; // in Toman or Rial
}

export interface TipaxPricingRequest {
  originCityId?: number;
  destinationCityId: number;
  originAddressId?: number;
  destinationAddressId?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  declaredValue?: number;
  packages?: Array<{
    weight: number;
    length: number;
    width: number;
    height: number;
    value?: number;
  }>;
}

export interface TipaxPricingResponse {
  isSuccess?: boolean;
  status?: number;
  message?: string;
  data?: {
    price?: number;
    totalPrice?: number;
    finalPrice?: number;
    shippingFee?: number;
    tax?: number;
    vat?: number;
    insuranceFee?: number;
    currency?: string;
  } | number;
  price?: number;
  totalPrice?: number;
}

export interface TipaxQuoteResult {
  shippingCostToman: number;
  currency: 'TOMAN';
  isFallback: boolean;
  provider: 'TIPAX' | 'DEFAULT_FALLBACK';
  message?: string;
  details?: {
    tipaxPriceRial?: number;
    destinationCityId?: number;
    destinationCityName?: string;
    totalWeightKg?: number;
  };
}
