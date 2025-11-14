import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Transaction } from '@prisma/client';

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

