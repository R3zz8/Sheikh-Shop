# SHEIKH SHOP - COMPLETE ENVIRONMENT CONFIGURATION

This file contains ALL environment variables required for a fully functional, production-ready Next.js + Prisma + Neon + Cloudinary + NextAuth + Resend project.

## Copy this content to your `.env.local` file:

```bash
# =============================================================================
# SHEIKH SHOP - COMPLETE ENVIRONMENT CONFIGURATION
# =============================================================================

# =============================================================================
# CORE APPLICATION CONFIGURATION
# =============================================================================

# Application Environment (development | production)
NODE_ENV=production

# Application URL (used for email links, OG images, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =============================================================================
# DATABASE CONFIGURATION (PRISMA + NEON POSTGRESQL)
# =============================================================================

# Primary Database Connection (REQUIRED)
# Format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sheikh_shop"

# =============================================================================
# AUTHENTICATION & SECURITY (JWT + NEXTAUTH)
# =============================================================================

# JWT Secret Keys for Rotation (REQUIRED - Each must be at least 32 characters)
# Comma-separated list of secrets. The first is used for signing, all are used for verification.
# To rotate, add a new secret at the beginning of the list.
JWT_SECRETS="new-secret-key,old-secret-key"

# Legacy JWT_SECRET (still supported for backward compatibility, but JWT_SECRETS is preferred)
JWT_SECRET=""

# NextAuth Configuration (REQUIRED)
# Secret for NextAuth session encryption
NEXTAUTH_SECRET="your-nextauth-secret-key-at-least-32-characters-long"

# NextAuth URL (REQUIRED)
# The canonical URL of your site for NextAuth callbacks
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# SUPERADMIN CONFIGURATION
# =============================================================================

# SuperAdmin Account Credentials (REQUIRED)
# These will be used to create the initial superadmin user during seeding
SUPERADMIN_EMAIL="rezadhu615@gmail.com"
SUPERADMIN_PASSWORD="Temp@1374"

# =============================================================================
# CLOUDINARY CONFIGURATION (IMAGE UPLOAD & MANAGEMENT)
# =============================================================================

# Cloudinary Credentials (REQUIRED for image uploads)
# Get these from your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# =============================================================================
# EMAIL SERVICE CONFIGURATION (RESEND)
# =============================================================================

# Resend API Configuration (REQUIRED for email verification)
# Get your API key from resend.com
RESEND_API_KEY="re_your_resend_api_key_here"

# Email Configuration
# The email address that will appear as the sender
EMAIL_FROM="noreply@sheikhshop.com"

# =============================================================================
# REDIS CACHING (OPTIONAL - ENHANCES PERFORMANCE)
# =============================================================================

# Upstash Redis Configuration (OPTIONAL)
# Used for session caching and performance optimization
# If not provided, the app will work without caching (less optimal)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Alternative Redis Configuration (Phase 2 Enhancement)
# For advanced caching and analytics
REDIS_URL="redis://username:password@host:port"
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# =============================================================================
# AI INTEGRATION (PHASE 2 ENHANCEMENT)
# =============================================================================

# OpenAI API Key (REQUIRED for AI Content Assistant)
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-your-openai-api-key-here"

# =============================================================================
# ANALYTICS & SECURITY (PHASE 2 ENHANCEMENT)
# =============================================================================

# Analytics Security Salt (REQUIRED for Phase 2)
# Generate a secure random string for analytics data salting
ANALYTICS_SALT="your-secure-random-string-here"

# =============================================================================
# SEO & VERIFICATION CONFIGURATION (OPTIONAL)
# =============================================================================

# Search Engine Verification Codes (OPTIONAL)
# Used for search engine verification in meta tags
GOOGLE_VERIFICATION_CODE="your-google-verification-code"
YANDEX_VERIFICATION_CODE="your-yandex-verification-code"
YAHOO_VERIFICATION_CODE="your-yahoo-verification-code"

# =============================================================================
# FEATURE FLAGS
# =============================================================================

# Next.js 16 Upgrade Flag (OPTIONAL)
# Set to "true" to enable experimental features and changes during the upgrade process.
NEXT_UPGRADE_IN_PROGRESS="false"

# =============================================================================
# E-COMMERCE & PAYMENT GATEWAY CONFIGURATION
# =============================================================================

# ZarinPal Merchant ID (REQUIRED for payment processing in production)
# 36-character UUID provided by ZarinPal merchant portal
ZARINPAL_MERCHANT_ID="00000000-0000-0000-0000-000000000000"

# Default Currency (TOMAN)
SHOP_DEFAULT_CURRENCY="TOMAN"

# =============================================================================
# DEPLOYMENT CONFIGURATION (OPTIONAL)
# =============================================================================

# Vercel Configuration (OPTIONAL - auto-detected on Vercel)
# Used as fallback for NEXT_PUBLIC_APP_URL
VERCEL_URL=""

# Custom Key (OPTIONAL - used in next.config.ts)
CUSTOM_KEY="your-custom-key"
```

## Quick Setup Checklist

### Required Variables (Must be configured):
- ✅ `NODE_ENV` - Set to 'production' for production deployments
- ✅ `DATABASE_URL` - Your Neon/PostgreSQL connection string
- ✅ `JWT_SECRET` - Strong secret key (32+ characters)
- ✅ `NEXTAUTH_SECRET` - Strong secret key (32+ characters)
- ✅ `NEXTAUTH_URL` - Your domain URL (https://yourdomain.com)
- ✅ `SUPERADMIN_EMAIL` - Admin email (rezadhu615@gmail.com)
- ✅ `SUPERADMIN_PASSWORD` - Admin password (Temp@1374)
- ✅ `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- ✅ `CLOUDINARY_API_KEY` - Your Cloudinary API key
- ✅ `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `EMAIL_FROM` - Your sender email address

### Phase 2 Variables (Required for new features):
- ✅ `OPENAI_API_KEY` - For AI Content Assistant and title optimization
- ✅ `ANALYTICS_SALT` - For analytics data security

### Optional Variables (Enhance functionality):
- 🔧 `UPSTASH_REDIS_REST_URL` - For session caching
- 🔧 `UPSTASH_REDIS_REST_TOKEN` - For session caching
- 🔧 `REDIS_URL` - Alternative Redis configuration
- 🔧 `REDIS_HOST` - Redis host for advanced caching
- 🔧 `REDIS_PORT` - Redis port (default: 6379)
- 🔧 `REDIS_PASSWORD` - Redis password
- 🔧 `GOOGLE_VERIFICATION_CODE` - For SEO
- 🔧 `YANDEX_VERIFICATION_CODE` - For SEO
- 🔧 `YAHOO_VERIFICATION_CODE` - For SEO
- 🔧 `SHOP_DEFAULT_CURRENCY` - Default currency (defaults to USD)
- 🔧 `NEXT_PUBLIC_APP_URL` - App URL (auto-detected)
- 🔧 `VERCEL_URL` - Vercel URL (auto-detected)
- 🔧 `CUSTOM_KEY` - Custom configuration key

## Security Notes

1. **NEVER commit this file with real values to version control**
2. **Use strong, unique passwords and secrets**
3. **Rotate secrets regularly in production**
4. **Use environment-specific values for different deployments**
5. **Keep JWT_SECRET and NEXTAUTH_SECRET at least 32 characters long**
6. **Use HTTPS URLs in production (https://yourdomain.com)**
