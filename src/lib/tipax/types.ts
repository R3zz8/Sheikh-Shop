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
  packType?: number;
  packageContentId?: number;
}

export interface TipaxPricingMinRequest {
  originCityId?: number;
  destinationCityId: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  declaredValue?: number;
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

export interface TipaxPackingPrice {
  id: number;
  title: string;
  price: number;
  code?: string;
}

export interface TipaxPackContentRate {
  id: number;
  title: string;
  rate?: number;
  description?: string;
}

export interface TipaxParcelType {
  id: number;
  title: string;
  code?: string;
}

export interface TipaxPaymentType {
  id: number;
  title: string;
  description?: string;
}

export interface TipaxParcelBook {
  id: number;
  title: string;
  senderAddressId?: number;
  receiverAddressId?: number;
}

export interface TipaxSenderInput {
  name: string;
  mobile: string;
  phone?: string;
  address: string;
  cityId: number;
  postalCode?: string;
  email?: string;
}

export interface TipaxReceiverInput {
  name: string;
  mobile: string;
  phone?: string;
  address: string;
  cityId: number;
  postalCode?: string;
  email?: string;
}

export interface TipaxPackageInput {
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  value: number; // Rial
  description?: string;
  packType?: number;
  packageContentId?: number;
}

export interface TipaxCreateOrderRequest {
  sender?: TipaxSenderInput;
  receiver: TipaxReceiverInput;
  originAddressId?: number;
  destinationAddressId?: number;
  packages: TipaxPackageInput[];
  paymentType?: number; // 1 = Cash/Prepaid, 2 = Credit, 3 = COD
  pickupType?: number; // 1 = Courier Pickup, 2 = Dropoff
  distributionType?: number; // 1 = Door Delivery, 2 = Branch/Locker Pickup
  serviceId?: number;
  orderType?: number;
  contractNumber?: string;
  description?: string;
}

export interface TipaxCreateOrderResponse {
  isSuccess?: boolean;
  status?: number;
  message?: string;
  data?: {
    orderId?: string | number;
    trackingCode?: string;
    price?: number;
    status?: string;
  };
  orderId?: string | number;
  trackingCode?: string;
}

export interface TipaxTrackingEvent {
  status: string;
  title: string;
  description?: string;
  location?: string;
  timestamp?: string;
}

export interface TipaxTrackingResponse {
  isSuccess?: boolean;
  message?: string;
  data?: {
    orderId?: string | number;
    trackingCode?: string;
    currentStatus?: string;
    currentStatusTitle?: string;
    senderName?: string;
    receiverName?: string;
    originCity?: string;
    destinationCity?: string;
    events?: TipaxTrackingEvent[];
    lastUpdate?: string;
  };
  trackingCode?: string;
  status?: string;
}
