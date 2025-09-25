# Email Verification System Setup Guide

## Overview
This guide covers the implementation of a professional email verification system using Resend API for the Sheikh Shop Next.js application. The system includes secure code generation, rate limiting, audit logging, and automatic cleanup.

## Features
- ✅ Secure 6-digit numeric verification codes
- ✅ Hashed code storage in database
- ✅ Rate limiting for verification attempts
- ✅ Automatic cleanup of expired codes
- ✅ Professional HTML email templates
- ✅ Audit logging for security tracking
- ✅ Mobile-responsive verification UI
- ✅ Integration with existing JWT authentication

## Environment Setup

### 1. Install Dependencies
```bash
npm install resend
```

### 2. Environment Variables
Create or update your `.env.local` file:
```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Database (existing)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sheikh_shop"
```

### 3. Resend API Setup
1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Verify your domain or use Resend's sandbox domain for testing
4. Add the API key to your `.env.local`

## Database Schema

### New Models Added
```prisma
model EmailVerification {
  id        String   @id @default(cuid())
  userId    String
  email     String   @db.VarChar(255)
  codeHash  String   @db.VarChar(255)
  attempts  Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([email])
  @@index([expiresAt])
  @@index([createdAt])
}
```

### Updated User Model
```prisma
model User {
  // ... existing fields ...
  emailVerified Boolean @default(false)
  emailVerifications EmailVerification[]
}
```

## API Endpoints

### POST /api/auth/send-verification
Sends a new verification code to the user's email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

### POST /api/auth/verify
Verifies the submitted code and marks the user's email as verified.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

## File Structure

### Core Implementation
- `src/lib/email/sendEmail.ts` - Email utility and code generation
- `src/app/api/auth/send-verification/route.ts` - Send verification API
- `src/app/api/auth/verify/route.ts` - Verify code API
- `src/app/verify-email/page.tsx` - Frontend verification UI
- `src/lib/actions/auth/cleanup.ts` - Automatic cleanup service

### Updated Files
- `src/app/login/page.tsx` - Updated login flow
- `src/app/register/page.tsx` - Updated registration flow
- `prisma/schema.prisma` - Added EmailVerification model

## User Flow

### Registration Flow
1. User fills registration form
2. Account is created with `emailVerified: false`
3. Verification code is automatically generated and sent
4. User is redirected to `/verify-email`
5. User enters the 6-digit code
6. Email is marked as verified
7. User can now log in

### Login Flow
1. User attempts to log in
2. System checks `emailVerified` status
3. If not verified, returns error with verification requirement
4. If verified, proceeds with normal login

## Security Features

### Code Security
- 6-digit numeric codes (1,000,000 possible combinations)
- SHA-256 hashed storage in database
- 15-minute expiration window
- Maximum 5 verification attempts per code
- Automatic cleanup of expired codes

### Rate Limiting
- Email sending: 3 attempts per 15 minutes per email
- Code verification: 5 attempts per 15 minutes per user
- In-memory rate limiting with automatic cleanup

### Audit Logging
- `VERIFICATION_CODE_SENT` events
- `EMAIL_VERIFIED` events
- Includes user ID, email, and timestamp

## Testing

### Manual Testing
1. **Registration Test:**
   ```bash
   # Register a new user
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123","firstName":"Test","lastName":"User"}'
   ```

2. **Send Verification Test:**
   ```bash
   # Send verification code
   curl -X POST http://localhost:3000/api/auth/send-verification \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Verify Code Test:**
   ```bash
   # Verify the code (replace 123456 with actual code)
   curl -X POST http://localhost:3000/api/auth/verify \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","code":"123456"}'
   ```

### Automated Testing
Run the authentication test script:
```bash
npm run test-auth
```

## Troubleshooting

### Common Issues

1. **"Resend API key not configured"**
   - Ensure `RESEND_API_KEY` is set in `.env.local`
   - Verify the API key is valid in Resend dashboard

2. **"Email not sent"**
   - Check Resend dashboard for delivery status
   - Verify sender email domain is configured
   - Check rate limiting (3 emails per 15 minutes)

3. **"Code verification failed"**
   - Ensure code is entered within 15 minutes
   - Check attempt limit (5 attempts per code)
   - Verify code format (6 digits only)

4. **"User not found"**
   - Ensure user exists in database
   - Check email spelling and case sensitivity

### Database Issues
```bash
# Reset database if needed
npm run reset-db

# Check database connection
npm run test-auth
```

### Email Delivery Issues
- Use Resend's sandbox domain for testing
- Check spam folder for verification emails
- Verify domain DNS settings for production

## Production Considerations

### Email Provider Setup
1. **Domain Verification:**
   - Add DNS records as specified by Resend
   - Verify domain ownership
   - Set up SPF, DKIM, and DMARC records

2. **Monitoring:**
   - Monitor email delivery rates
   - Set up webhook notifications for bounces
   - Track verification success rates

### Security Hardening
1. **Environment Variables:**
   - Use strong, unique API keys
   - Rotate keys regularly
   - Use different keys for staging/production

2. **Rate Limiting:**
   - Adjust limits based on traffic patterns
   - Monitor for abuse patterns
   - Implement IP-based rate limiting for production

3. **Database:**
   - Regular backups of verification codes
   - Monitor cleanup job performance
   - Index optimization for large datasets

### Performance Optimization
1. **Email Templates:**
   - Optimize HTML for various email clients
   - Use CDN for images and assets
   - Implement email preview testing

2. **Database:**
   - Monitor query performance
   - Optimize indexes for verification queries
   - Implement connection pooling

## Maintenance

### Regular Tasks
- Monitor email delivery rates
- Review audit logs for suspicious activity
- Update email templates for branding changes
- Clean up old verification records (automatic)

### Updates
- Keep Resend SDK updated
- Monitor for security patches
- Update rate limiting rules as needed

## Support

For issues related to:
- **Resend API**: Check [Resend Documentation](https://resend.com/docs)
- **Database**: Run `npm run test-auth` for diagnostics
- **Email Templates**: Test with various email clients
- **Rate Limiting**: Adjust limits in `src/lib/email/sendEmail.ts`

## Migration from Other Email Providers

To switch from Resend to another provider (SendGrid, Mailgun, etc.):

1. **Install new provider SDK:**
   ```bash
   npm install @sendgrid/mail  # or mailgun-js
   ```

2. **Update environment variables:**
   ```env
   SENDGRID_API_KEY=your_key_here  # or MAILGUN_API_KEY
   EMAIL_FROM=noreply@yourdomain.com
   ```

3. **Modify `src/lib/email/sendEmail.ts`:**
   - Replace Resend initialization
   - Update `sendEmail` function
   - Keep all other logic unchanged

The verification flow and database schema remain the same, only the email sending mechanism changes.
