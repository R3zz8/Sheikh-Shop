# Superadmin Setup Documentation

## Overview
This document describes the superadmin user setup for the Digital Shop Next.js application.

## ✅ Completed Setup

### 1. Database User Creation
- **Email:** Configured via `SUPERADMIN_EMAIL` environment variable
- **Role:** SUPERADMIN
- **Password:** Configured via `SUPERADMIN_PASSWORD` environment variable (hashed with bcrypt)
- **Status:** Email verified, can login, not disabled

### 2. Authentication & Authorization
- ✅ Password properly hashed using bcrypt (same as registration flow)
- ✅ JWT token includes correct role (SUPERADMIN)
- ✅ Middleware updated to recognize uppercase roles
- ✅ RBAC hooks properly configured for SUPERADMIN access

### 3. Access Control
- ✅ Dashboard access: `/dashboard`
- ✅ User management: `/dashboard/users`
- ✅ Product management: `/dashboard/products`
- ✅ Audit logs: `/dashboard/audit-logs`
- ✅ Security settings: `/dashboard/security`

### 4. Role-Based Features
- ✅ Can manage all user roles (USER, EDITOR, MODERATOR, ADMIN, SUPERADMIN)
- ✅ Can enable/disable user accounts
- ✅ Can view audit logs
- ✅ Can manage products
- ✅ Can access all admin features

## 🔧 Technical Implementation

### Database Schema
```sql
-- User created with:
INSERT INTO "User" (
  id, email, password, role, emailVerified, 
  canLogin, disabled, createdAt, updatedAt
) VALUES (
  'cmdqbxypm0000120tnjsnt6ce', 
  '${SUPERADMIN_EMAIL}', 
  '$2b$10$...', -- bcrypt hashed password from SUPERADMIN_PASSWORD
  'SUPERADMIN', 
  true, true, false, 
  NOW(), NOW()
);
```

### Authentication Flow
1. User logs in with email/password
2. bcrypt.compare() verifies password
3. JWT token created with role: "SUPERADMIN"
4. Middleware validates token and role
5. RBAC hooks check role for component access

### Files Modified
- `prisma/seed.ts` - Added superadmin user creation
- `src/middleware.ts` - Updated role validation to uppercase
- `src/app/(private)/dashboard/users/page.tsx` - Fixed role dropdown

## 🧪 Testing

### Verification Commands
```bash
# Verify superadmin user exists
npx tsx scripts/verify-superadmin.ts

# Test all access permissions
npx tsx scripts/test-superadmin-access.ts

# Run database seed (creates superadmin)
npm run db:seed
```

### Manual Testing
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3008/login`
3. Login with:
   - Email: Check your `SUPERADMIN_EMAIL` environment variable
   - Password: Check your `SUPERADMIN_PASSWORD` environment variable
4. Test access to all admin routes

## 🧹 Cleanup Instructions

### After confirming everything works:

1. **Remove superadmin user from database:**
   ```bash
   npx tsx scripts/cleanup-superadmin.ts
   ```

2. **Remove superadmin creation from seed file:**
   - Edit `prisma/seed.ts`
   - Remove the superadmin user creation code
   - Keep only the system user creation

3. **Delete test scripts:**
   ```bash
   rm scripts/verify-superadmin.ts
   rm scripts/test-superadmin-access.ts
   rm scripts/cleanup-superadmin.ts
   rm SUPERADMIN_SETUP.md
   ```

4. **Update seed file:**
   ```typescript
   // The seed file now uses environment variables:
   const superadminEmail = process.env.SUPERADMIN_EMAIL || 'rezadhu615@gmail.com';
   const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Temp#1234';
   // ... rest of superadmin creation code
   ```

## ⚠️ Security Notes

1. **Password Security:** The default password "Temp#1234" should be changed immediately after first login
2. **Environment:** This setup is for development/testing only
3. **Production:** Never commit superadmin credentials to version control
4. **Access Control:** The SUPERADMIN role has full access to all admin features

## 🔗 Access URLs

- **Login:** http://localhost:3008/login
- **Dashboard:** http://localhost:3008/dashboard
- **Users:** http://localhost:3008/dashboard/users
- **Products:** http://localhost:3008/dashboard/products
- **Audit Logs:** http://localhost:3008/dashboard/audit-logs
- **Security:** http://localhost:3008/dashboard/security

## 📋 Login Credentials

- **Email:** Configured via `SUPERADMIN_EMAIL` environment variable
- **Password:** Configured via `SUPERADMIN_PASSWORD` environment variable

**⚠️ IMPORTANT:** Change the password after first login! 