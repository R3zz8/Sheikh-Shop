import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { getShippingCost, calculateSubtotal, calculateOrderTotal } from '@/lib/shipping';

// Request payload validation schema
const paymentRequestSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  currencyFrom: z.number().int('Currency code must be an integer'),
  currencyTo: z.number().int('Currency code must be an integer'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  mobile: z.string().min(1, 'Mobile number is required'),
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  description: z.string().optional(),
});

// Helper function to extract user ID from request cookies
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const accessToken = request.cookies.get('access-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;
    const sessionToken = request.cookies.get('session-token')?.value;

    if (accessToken) {
      const user = await verifyJwtToken(accessToken);
      if (user?.id) return user.id;
    }
    if (refreshToken) {
      const user = await verifyJwtToken(refreshToken);
      if (user?.id) return user.id;
    }
    if (sessionToken) {
      const user = await verifyJwtToken(sessionToken);
      if (user?.id) return user.id;
    }
    return null;
  } catch {
    return null;
  }
}

// YekPay API response interface
interface YekPayResponse {
  code: number;
  description?: string;
  authority?: string;
  paymentUrl?: string;
}

// Helper function to generate unique order ID
function generateUniqueOrderId(): string {
  // Generate a unique order ID using nanoid (16 characters for uniqueness)
  return `ORD-${nanoid(16)}`;
}

// Helper function to get base URL for callback
function getBaseUrl(): string {
  // Try NEXT_PUBLIC_BASE_URL first, then NEXT_PUBLIC_APP_URL, then fallback
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  );
}

// POST /api/payment/request - Create payment request with YekPay
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = paymentRequestSchema.safeParse(body);

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

    // Generate unique order number
    const orderNumber = generateUniqueOrderId();

    // Get base URL for callback
    const baseUrl = getBaseUrl();
    const callbackUrl = `${baseUrl}/api/payment/verify`;

    // Authenticate user to calculate server-safe totals
    const userId = await getUserIdFromToken(request);
    let finalAmount = payload.amount;

    if (userId) {
      // Fetch user's cart from database to do server-safe recalculation
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
        },
      });

      if (cartItems && cartItems.length > 0) {
        // Map cart items to prices (relying on the stored unitPrice or fallback basePrice)
        const itemsForCalc = cartItems.map((item: any) => {
          const price = item.unitPrice || item.product.basePrice;
          return {
            price: Number(price),
            quantity: item.quantity,
          };
        });

        const subtotal = calculateSubtotal(itemsForCalc);
        finalAmount = calculateOrderTotal(subtotal);

        console.log('[Server-side Recalculation] Successful:', {
          userId,
          itemCount: cartItems.length,
          subtotal,
          finalAmount,
          frontendAmount: payload.amount,
        });
      }
    }

    // Prepare YekPay request parameters using the server-safe finalAmount
    const yekpayParams = new URLSearchParams({
      merchantId: merchantId,
      fromCurrencyCode: payload.currencyFrom.toString(),
      toCurrencyCode: payload.currencyTo.toString(),
      amount: finalAmount.toString(),
      orderNumber: orderNumber,
      callback: callbackUrl,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      mobile: payload.mobile,
      address: payload.address,
      postalCode: payload.postalCode,
      country: payload.country,
      city: payload.city,
      description: payload.description || 'Payment',
    });

    // Call YekPay sandbox API
    const yekpayUrl = 'https://api.ypsapi.com/api/sandbox/request';
    
    console.log('[YekPay] Sending payment request:', {
      orderNumber,
      amount: payload.amount,
      currencyFrom: payload.currencyFrom,
      currencyTo: payload.currencyTo,
      callbackUrl,
    });

    const yekpayResponse = await fetch(yekpayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: yekpayParams.toString(),
    });

    // Check if request was successful
    if (!yekpayResponse.ok) {
      const errorText = await yekpayResponse.text();
      console.error('[YekPay] API request failed:', {
        status: yekpayResponse.status,
        statusText: yekpayResponse.statusText,
        error: errorText,
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
    let yekpayData: YekPayResponse;
    try {
      yekpayData = await yekpayResponse.json();
    } catch (parseError) {
      const responseText = await yekpayResponse.text();
      console.error('[YekPay] Failed to parse response:', {
        error: parseError,
        response: responseText,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from payment gateway',
        },
        { status: 502 }
      );
    }

    // Check YekPay response code
    if (yekpayData.code === 100) {
      // Success - return payment URL and authority
      if (!yekpayData.authority || !yekpayData.paymentUrl) {
        console.error('[YekPay] Missing authority or paymentUrl in success response:', yekpayData);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid response from payment gateway',
            details: 'Missing payment information',
          },
          { status: 502 }
        );
      }

      console.log('[YekPay] Payment request successful:', {
        orderNumber,
        authority: yekpayData.authority,
      });

      return NextResponse.json({
        success: true,
        authority: yekpayData.authority,
        paymentUrl: yekpayData.paymentUrl,
        orderNumber, // Include order number for reference
      });
    } else {
      // Error from YekPay
      const errorDescription = yekpayData.description || 'Unknown error from payment gateway';
      console.error('[YekPay] Payment request failed:', {
        code: yekpayData.code,
        description: errorDescription,
        orderNumber,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment request failed',
          description: errorDescription,
          code: yekpayData.code,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[YekPay] Unexpected error in payment request:', {
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


