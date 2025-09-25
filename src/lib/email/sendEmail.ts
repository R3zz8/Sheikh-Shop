import { Resend } from 'resend';

// Security: Validate environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@sheikhshop.com';

// Only throw error if we're not in build mode
if (!RESEND_API_KEY && process.env.NODE_ENV !== 'production' && !process.env.NEXT_PHASE) {
  console.warn('RESEND_API_KEY environment variable not set - email verification will not work');
}

// Initialize Resend client (only if API key is available)
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Email configuration
export const EMAIL_CONFIG = {
  FROM: EMAIL_FROM,
  VERIFICATION_CODE_EXPIRY: 15 * 60 * 1000, // 15 minutes in milliseconds
  MAX_VERIFICATION_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
} as const;

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email verification template
export function generateVerificationEmailTemplate(
  userFirstName: string,
  verificationCode: string,
  expiryMinutes: number = 15
): EmailTemplate {
  const subject = 'Verify Your Email - Sheikh Shop';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #d97706;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .greeting {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        .verification-code {
          background: linear-gradient(135deg, #fbbf24, #d97706);
          color: white;
          font-size: 32px;
          font-weight: bold;
          text-align: center;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        .instructions {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛒 Sheikh Shop</div>
          <h1 class="title">Verify Your Email Address</h1>
        </div>
        
        <p class="greeting">Hello ${userFirstName || 'there'},</p>
        
        <p>Thank you for creating an account with Sheikh Shop! To complete your registration and start shopping, please verify your email address.</p>
        
        <div class="verification-code">
          ${verificationCode}
        </div>
        
        <div class="instructions">
          <strong>How to verify your email:</strong>
          <ol>
            <li>Copy the 6-digit verification code above</li>
            <li>Return to Sheikh Shop and enter the code</li>
            <li>Click "Verify Email" to complete the process</li>
          </ol>
        </div>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> This verification code will expire in ${expiryMinutes} minutes for security reasons. If you don't verify your email within this time, you'll need to request a new code.
        </div>
        
        <p>If you didn't create an account with Sheikh Shop, you can safely ignore this email.</p>
        
        <div class="footer">
          <p>This email was sent by Sheikh Shop</p>
          <p>If you have any questions, please contact our support team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Verify Your Email - Sheikh Shop
    
    Hello ${userFirstName || 'there'},
    
    Thank you for creating an account with Sheikh Shop! To complete your registration and start shopping, please verify your email address.
    
    Your verification code is: ${verificationCode}
    
    How to verify your email:
    1. Copy the 6-digit verification code above
    2. Return to Sheikh Shop and enter the code
    3. Click "Verify Email" to complete the process
    
    Important: This verification code will expire in ${expiryMinutes} minutes for security reasons.
    
    If you didn't create an account with Sheikh Shop, you can safely ignore this email.
    
    This email was sent by Sheikh Shop
  `;
  
  return { subject, html, text };
}

// Generic email sending function
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    return {
      success: false,
      error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    });

    if (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Send verification email
export async function sendVerificationEmail(
  to: string,
  userFirstName: string,
  verificationCode: string,
  expiryMinutes: number = 15
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = generateVerificationEmailTemplate(userFirstName, verificationCode, expiryMinutes);
  
  return sendEmail(to, template.subject, template.html, template.text);
}

// Generate secure verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash verification code for storage
export function hashVerificationCode(code: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Verify code against hash
export function verifyCode(code: string, hash: string): boolean {
  const crypto = require('crypto');
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  return codeHash === hash;
}

// Rate limiting for email sending
const emailRateLimit = new Map<string, { count: number; resetTime: number }>();

export function isEmailRateLimited(email: string): boolean {
  const now = Date.now();
  const windowMs = EMAIL_CONFIG.RATE_LIMIT_WINDOW;
  const maxAttempts = 3; // Max 3 emails per 15 minutes

  const record = emailRateLimit.get(email);
  if (!record || now > record.resetTime) {
    emailRateLimit.set(email, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxAttempts) {
    return true;
  }

  record.count++;
  return false;
}

// Clean up expired rate limit records
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [email, record] of emailRateLimit.entries()) {
    if (now > record.resetTime) {
      emailRateLimit.delete(email);
    }
  }
}

// Schedule cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
}
