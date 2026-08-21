/**
 * ZarinPal Payment Gateway Integration Module (v4 REST API)
 * Official Documentation: https://www.zarinpal.com/docs/paymentGateway/
 */

export const ZARINPAL_REQUEST_URL = "https://payment.zarinpal.com/pg/v4/payment/request.json";
export const ZARINPAL_VERIFY_URL = "https://payment.zarinpal.com/pg/v4/payment/verify.json";
export const ZARINPAL_START_PAY_URL = "https://payment.zarinpal.com/pg/StartPay/";

export interface ZarinPalPaymentRequestPayload {
  merchant_id: string;
  amount: number; // Amount in Rial
  description: string;
  callback_url: string;
  metadata?: {
    mobile?: string;
    email?: string;
    order_id?: string;
  };
}

export interface ZarinPalPaymentResponse {
  data: {
    code: number;
    message: string;
    authority?: string;
    fee_type?: string;
    fee?: number;
  };
  errors: Array<{
    code: number;
    message: string;
    validations?: Record<string, string[]>;
  }>;
}

export interface ZarinPalVerifyPayload {
  merchant_id: string;
  amount: number; // Amount in Rial
  authority: string;
}

export interface ZarinPalVerifyResponse {
  data: {
    code: number; // 100 = Verified, 101 = Already Verified
    message: string;
    card_hash?: string;
    card_pan?: string;
    ref_id?: number;
    fee_type?: string;
    fee?: number;
  };
  errors: Array<{
    code: number;
    message: string;
    validations?: Record<string, string[]>;
  }>;
}

/**
 * Currency Conversion Helper
 * App internal pricing is in TOMAN.
 * ZarinPal API strictly expects amounts in RIAL (1 Toman = 10 Rials).
 */
export function tomanToRial(amountInToman: number): number {
  if (typeof amountInToman !== "number" || isNaN(amountInToman) || amountInToman < 0) {
    throw new Error("Invalid amount in Toman provided for conversion");
  }
  return Math.round(amountInToman * 10);
}

export function rialToToman(amountInRial: number): number {
  if (typeof amountInRial !== "number" || isNaN(amountInRial) || amountInRial < 0) {
    throw new Error("Invalid amount in Rial provided for conversion");
  }
  return Math.floor(amountInRial / 10);
}

/**
 * Generates the redirect URL for the customer to complete payment on ZarinPal.
 */
export function getZarinPalStartPayUrl(authority: string): string {
  if (!authority || typeof authority !== "string" || authority.trim().length === 0) {
    throw new Error("Invalid ZarinPal authority token");
  }
  return `${ZARINPAL_START_PAY_URL}${authority.trim()}`;
}

/**
 * Gets the active ZarinPal Merchant ID from environment variables.
 */
export function getZarinPalMerchantId(): string {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID || process.env.PAYMENT_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("ZARINPAL_MERCHANT_ID environment variable is missing");
  }
  return merchantId.trim();
}

/**
 * Step 1: Request Payment creation from ZarinPal
 */
export async function createZarinPalPaymentRequest(params: {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
  orderId?: string;
  merchantId?: string;
}): Promise<ZarinPalPaymentResponse> {
  const merchant_id = params.merchantId || getZarinPalMerchantId();
  const amountInRial = tomanToRial(params.amountToman);

  const payload: ZarinPalPaymentRequestPayload = {
    merchant_id,
    amount: amountInRial,
    description: params.description || `سفارش شماره ${params.orderId || ''}`,
    callback_url: params.callbackUrl,
    metadata: {
      mobile: params.mobile,
      email: params.email,
      order_id: params.orderId,
    },
  };

  const response = await fetch(ZARINPAL_REQUEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ZarinPal Request Error]", response.status, errorText);
    throw new Error(`ZarinPal request failed with status ${response.status}`);
  }

  const result: ZarinPalPaymentResponse = await response.json();
  return result;
}

/**
 * Step 4: Verify Payment with ZarinPal
 */
export async function verifyZarinPalPayment(params: {
  amountToman: number;
  authority: string;
  merchantId?: string;
}): Promise<ZarinPalVerifyResponse> {
  const merchant_id = params.merchantId || getZarinPalMerchantId();
  const amountInRial = tomanToRial(params.amountToman);

  const payload: ZarinPalVerifyPayload = {
    merchant_id,
    amount: amountInRial,
    authority: params.authority,
  };

  const response = await fetch(ZARINPAL_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ZarinPal Verify Error]", response.status, errorText);
    throw new Error(`ZarinPal verification failed with status ${response.status}`);
  }

  const result: ZarinPalVerifyResponse = await response.json();
  return result;
}
