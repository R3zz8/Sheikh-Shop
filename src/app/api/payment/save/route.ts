import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth/jwt';
import { resolveShipping, calculateCartShipping, calculateSubtotal } from '@/lib/shipping';

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

// Request payload validation schema
const saveTransactionSchema = z.object({
  authority: z.string().min(1, 'Authority is required'),
  reference: z.string().optional(),
  amount: z.number().positive('Amount must be a positive number'),
  status: z.string().min(1, 'Status is required'),
  description: z.string().optional(),
});

// POST /api/payment/save - Save verified transaction to database
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = saveTransactionSchema.safeParse(body);

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

    // Check if transaction with this authority already exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { authority: payload.authority },
    });

    if (existingTransaction) {
      console.log('[YekPay] Transaction already exists:', {
        authority: payload.authority,
        id: existingTransaction.id,
      });

      // Update existing transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { authority: payload.authority },
        data: {
          reference: payload.reference || existingTransaction.reference,
          amount: payload.amount,
          status: payload.status,
          description: payload.description || existingTransaction.description,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Transaction updated successfully',
        transaction: updatedTransaction,
      });
    }

    // Create new transaction
    const transaction = await prisma.transaction.create({
      data: {
        authority: payload.authority,
        reference: payload.reference,
        amount: payload.amount,
        status: payload.status,
        description: payload.description,
      },
    });

    console.log('[YekPay] Transaction saved successfully:', {
      id: transaction.id,
      authority: transaction.authority,
      status: transaction.status,
    });

    // Authenticate user to calculate server-safe totals and create Order
    const userId = await getUserIdFromToken(request);

    if (userId && (payload.status === 'SUCCESSFUL' || payload.status === 'SUCCESS' || payload.status === 'COMPLETED')) {
      // 1. Fetch user's cart from database
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
        },
      });

      if (cartItems && cartItems.length > 0) {
        // 2. Calculate subtotal and shipping total
        const itemsForCalc = cartItems.map((item: any) => {
          const price = item.unitPrice || item.product.basePrice;
          return {
            price: Number(price),
            quantity: item.quantity,
          };
        });

        const subtotal = calculateSubtotal(itemsForCalc);
        const shippingTotal = calculateCartShipping(cartItems);
        const grandTotal = subtotal + shippingTotal;

        // 3. Create the Order
        const order = await prisma.order.create({
          data: {
            userId,
            total: subtotal,
            shippingCost: shippingTotal,
            totalPrice: grandTotal,
            status: 'COMPLETED',
            items: {
              create: cartItems.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.unitPrice || item.product.basePrice,
                shippingCost: resolveShipping(item.product),
              })),
            },
          },
        });

        // 4. Empty the user's cart
        await prisma.cartItem.deleteMany({
          where: { userId },
        });

        console.log('[Order Creation] Saved order and order items:', {
          orderId: order.id,
          userId,
          itemsCount: cartItems.length,
          subtotal,
          shippingCost: shippingTotal,
          totalPrice: grandTotal,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction saved successfully',
      transaction,
    });
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[YekPay] Error saving transaction:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save transaction',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

