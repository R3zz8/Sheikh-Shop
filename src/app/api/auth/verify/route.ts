import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCode, EMAIL_CONFIG } from '@/lib/email/sendEmail';
import { logAudit } from '@/lib/actions/auth/audit';
import { z } from 'zod';

// Security: Input validation schema
const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// Security: Rate limiting for verification attempts
const verificationAttempts = new Map<string, { count: number; resetTime: number }>();

function isVerificationRateLimited(email: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = EMAIL_CONFIG.MAX_VERIFICATION_ATTEMPTS;

  const record = verificationAttempts.get(email);
  if (!record || now > record.resetTime) {
    verificationAttempts.set(email, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Security: Parse and validate request body
    const body = await req.json();
    const validationResult = verifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, code } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    // Security: Rate limiting for verification attempts
    if (isVerificationRateLimited(normalizedEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many verification attempts. Please wait before trying again.' 
        },
        { status: 429 },
      );
    }

    // Security: Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    // Security: Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 },
      );
    }

    // Security: Find active verification record
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!emailVerification) {
      return NextResponse.json(
        { success: false, message: 'No active verification code found. Please request a new one.' },
        { status: 400 },
      );
    }

    // Security: Check if maximum attempts reached
    if (emailVerification.attempts >= EMAIL_CONFIG.MAX_VERIFICATION_ATTEMPTS) {
      // Security: Delete the verification record to force a new one
      await prisma.emailVerification.delete({
        where: { id: emailVerification.id },
      });

      return NextResponse.json(
        { success: false, message: 'Too many failed attempts. Please request a new verification code.' },
        { status: 400 },
      );
    }

    // Security: Verify the code
    const isValidCode = verifyCode(code, emailVerification.codeHash);

    if (!isValidCode) {
      // Security: Increment attempt counter
      await prisma.emailVerification.update({
        where: { id: emailVerification.id },
        data: { attempts: emailVerification.attempts + 1 },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 },
      );
    }

    // Security: Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Security: Clean up verification record
    await prisma.emailVerification.delete({
      where: { id: emailVerification.id },
    });

    // Security: Get client information
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'Unknown';

    // Security: Log email verification success
    await logAudit(user.id, 'email_verified', {
      email: normalizedEmail,
      ip,
      userAgent,
      verificationId: emailVerification.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('Email verification error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
