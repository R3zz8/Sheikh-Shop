import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  sendVerificationEmail, 
  generateVerificationCode, 
  hashVerificationCode, 
  isEmailRateLimited,
  EMAIL_CONFIG 
} from '@/lib/email/sendEmail';
import { logAudit } from '@/lib/actions/auth/audit';
import { z } from 'zod';

// Security: Input validation schema
const sendVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(req: NextRequest) {
  try {
    // Security: Parse and validate request body
    const body = await req.json();
    const validationResult = sendVerificationSchema.safeParse(body);

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

    const { email } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    // Security: Rate limiting for email sending
    if (isEmailRateLimited(normalizedEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many verification requests. Please wait before requesting another code.' 
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
        firstName: true,
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

    // Security: Generate verification code
    const verificationCode = generateVerificationCode();
    const codeHash = hashVerificationCode(verificationCode);
    const expiresAt = new Date(Date.now() + EMAIL_CONFIG.VERIFICATION_CODE_EXPIRY);

    // Security: Clean up existing verification codes for this user
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Security: Create new verification record
    const emailVerification = await prisma.emailVerification.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Security: Send verification email
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      user.firstName || 'User',
      verificationCode,
      15 // 15 minutes expiry
    );

    if (!emailResult.success) {
      // Security: Clean up verification record if email fails
      await prisma.emailVerification.delete({
        where: { id: emailVerification.id },
      });

      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to send verification email. Please try again later.' 
        },
        { status: 500 },
      );
    }

    // Security: Get client information
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'Unknown';

    // Security: Log verification code sent
    await logAudit(user.id, 'verification_code_sent', {
      email: normalizedEmail,
      ip,
      userAgent,
      verificationId: emailVerification.id,
      messageId: emailResult.messageId,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: EMAIL_CONFIG.VERIFICATION_CODE_EXPIRY / 1000, // seconds
    });

  } catch (error) {
    console.error('Send verification error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
