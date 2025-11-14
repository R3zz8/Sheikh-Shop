import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request payload validation schema
const paymentVerifySchema = z.object({
  authority: z.string().min(1, 'Authority is required'),
  status: z.union([z.string(), z.number()]).optional(),
});

// YekPay verification response interface
interface YekPayVerifyResponse {
  Code?: number;
  code?: number;
  Description?: string;
  description?: string;
  Authority?: string;
  authority?: string;
  Reference?: string;
  reference?: string;
  Amount?: string;
  amount?: string;
  [key: string]: unknown; // Allow additional fields
}

// Utility function to format YekPay parameters as form-urlencoded
function formatYekPayParams(params: Record<string, string>): string {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    urlParams.append(key, value);
  });
  return urlParams.toString();
}

// Helper function to add a small delay for UX realism
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/payment/verify - Verify payment with YekPay
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = paymentVerifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // Validate environment variables
    const merchantId = process.env.YEKPAY_MERCHANT_ID;
    if (!merchantId) {
      console.error('[YekPay] YEKPAY_MERCHANT_ID environment variable is not set');
      return NextResponse.json(
        {
          success: false,
          error: 'Payment gateway configuration error',
        },
        { status: 500 }
      );
    }

    // Prepare YekPay verification parameters
    const yekpayParams = formatYekPayParams({
      merchantId: merchantId,
      authority: payload.authority,
    });

    // Call YekPay sandbox verification API
    const yekpayUrl = 'https://api.ypsapi.com/api/sandbox/verify';

    console.log('[YekPay] Sending verification request:', {
      authority: payload.authority,
      status: payload.status,
    });

    const yekpayResponse = await fetch(yekpayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: yekpayParams,
    });

    // Check if request was successful
    if (!yekpayResponse.ok) {
      const errorText = await yekpayResponse.text();
      console.error('[YekPay] Verification API request failed:', {
        status: yekpayResponse.status,
        statusText: yekpayResponse.statusText,
        error: errorText,
        authority: payload.authority,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment gateway request failed',
          details: `HTTP ${yekpayResponse.status}: ${yekpayResponse.statusText}`,
        },
        { status: 502 }
      );
    }

    // Parse YekPay response
    let yekpayData: YekPayVerifyResponse;
    try {
      yekpayData = await yekpayResponse.json();
    } catch (parseError) {
      const responseText = await yekpayResponse.text();
      console.error('[YekPay] Failed to parse verification response:', {
        error: parseError,
        response: responseText,
        authority: payload.authority,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from payment gateway',
        },
        { status: 502 }
      );
    }

    // Normalize response code (YekPay may use 'Code' or 'code')
    const responseCode = yekpayData.Code ?? yekpayData.code;
    const responseDescription = yekpayData.Description ?? yekpayData.description;
    const responseAuthority = yekpayData.Authority ?? yekpayData.authority;
    const responseReference = yekpayData.Reference ?? yekpayData.reference;
    const responseAmount = yekpayData.Amount ?? yekpayData.amount;

    // Check YekPay response code (100 = success)
    if (responseCode === 100) {
      // Payment verified successfully
      console.log('[YekPay] Payment verification successful:', {
        authority: responseAuthority,
        reference: responseReference,
        amount: responseAmount,
      });

      // Add small delay for UX realism (300ms as suggested)
      await delay(300);

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        authority: responseAuthority || payload.authority,
        reference: responseReference || undefined,
        details: {
          Code: responseCode,
          Description: responseDescription || 'Success',
          Authority: responseAuthority || payload.authority,
          Reference: responseReference,
          Amount: responseAmount,
        },
      });
    } else {
      // Payment verification failed
      const errorDescription = responseDescription || 'Unknown error from payment gateway';
      console.error('[YekPay] Payment verification failed:', {
        code: responseCode,
        description: errorDescription,
        authority: payload.authority,
      });

      return NextResponse.json(
        {
          success: false,
          error: errorDescription,
          code: responseCode,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[YekPay] Unexpected error in payment verification:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

