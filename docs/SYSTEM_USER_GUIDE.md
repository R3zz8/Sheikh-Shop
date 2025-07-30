# System User Authentication Guide

## Overview

This guide explains how to authenticate as a system user and access system-level privileges in the Digital Shop platform.

## 🔐 System User Authentication

### What is a System User?

A system user has the highest level of privileges in the platform with the `SYSTEM` role. System users have:

- **Extended session duration** (1 year vs 7 days for regular users)
- **Access to system dashboard** with comprehensive statistics
- **User management capabilities**
- **Audit log access**
- **System monitoring tools**

### Available User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `USER` | Regular customer | Basic shopping features |
| `ADMIN` | Administrator | Dashboard access, user management |
| `EDITOR` | Content editor | Product management |
| `MODERATOR` | Content moderator | Content moderation |
| `SUPERADMIN` | Super administrator | Full system access |
| `SYSTEM` | System user | **Highest privileges with extended features** |

## 🚀 How to Log In as a System User

### Step 1: Create a System User

First, you need to create a system user account using the provided script:

```bash
# Run the system user creation script
npx tsx scripts/create-system-user.ts
```

The script will prompt you for:
- **Email**: System user email (e.g., `system@sheikhshop.com`)
- **Password**: Minimum 12 characters
- **Password confirmation**

### Step 2: Access System Login Portal

Navigate to the system login portal:
```
http://localhost:3008/system-login
```

### Step 3: Authenticate

1. Enter your system user email
2. Enter your system user password
3. Click "Access System"

### Step 4: Access System Dashboard

After successful authentication, you'll be redirected to:
```
http://localhost:3008/dashboard/system
```

## 🔧 System User Features

### System Dashboard

The system dashboard (`/dashboard/system`) provides:

- **System Statistics**: Total system users, login attempts, super admins
- **Current User Info**: Your system user details and status
- **Privileges Overview**: Available system permissions
- **System Actions**: Quick access to system management tools

### API Endpoints

#### Create System Users
```http
POST /api/system/create
Content-Type: application/json

{
  "email": "new-system@sheikhshop.com",
  "password": "secure-password-12-chars"
}
```

**Requirements:**
- Must be authenticated as SYSTEM or SUPERADMIN
- Password minimum 12 characters
- Email must be unique

#### Check System Status
```http
GET /api/system/status
```

**Response includes:**
- Current user information
- System statistics
- Available privileges
- Recent system activity

## 🔒 Security Features

### Authentication Security

1. **Rate Limiting**: Failed login attempts are tracked and accounts can be locked
2. **Account Lockout**: After 5 failed attempts, account is locked for 15 minutes
3. **Secure Tokens**: JWT tokens with 1-year expiration for system users
4. **Audit Logging**: All system access is logged for security monitoring

### Protected Routes

The following routes require system user authentication:

- `/dashboard/*` - All dashboard routes
- `/admin/*` - All admin routes
- `/dashboard/system` - System dashboard (SYSTEM users only)

### Middleware Protection

The middleware (`src/middleware.ts`) enforces:

```typescript
const ALLOWED_ROLES = ['admin', 'superadmin', 'system'] as const;
```

## 🛠️ Technical Implementation

### Database Schema

System users are stored in the `User` table with:

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  role        UserRole @default(USER)
  canLogin    Boolean  @default(true)
  disabled    Boolean  @default(false)
  lastLoginAt DateTime?
  loginAttempts Int    @default(0)
  lockedUntil DateTime?
  // ... other fields
}

enum UserRole {
  USER
  ADMIN
  EDITOR
  MODERATOR
  SUPERADMIN
  SYSTEM
}
```

### JWT Token Generation

System users get extended tokens:

```typescript
// Regular users: 7 days
// System users: 1 year
export function generateSystemUserToken(user: { id: string; email: string; role: string }): string {
  const expiresIn = 365 * 24 * 60 * 60; // 1 year in seconds
  return signJwtToken(user, expiresIn);
}
```

### Authentication Flow

1. **Login Request**: User submits credentials to `/system-login`
2. **Validation**: System checks email, password, and role
3. **Token Generation**: Extended JWT token created
4. **Cookie Setting**: Secure HTTP-only cookie set
5. **Redirect**: User redirected to system dashboard

## 🚨 Troubleshooting

### Common Issues

#### "Invalid system credentials"
- Check that the user exists with `SYSTEM` role
- Verify email and password are correct
- Ensure account is not disabled or locked

#### "System account is disabled"
- Contact a super admin to re-enable the account
- Check the `canLogin` and `disabled` fields in database

#### "System account is temporarily locked"
- Wait 15 minutes for automatic unlock
- Or contact a super admin to manually unlock

#### "Insufficient privileges"
- Ensure you're logged in as a SYSTEM or SUPERADMIN user
- Check that your JWT token is valid and not expired

### Debugging

#### Check User Status
```sql
SELECT id, email, role, canLogin, disabled, lockedUntil 
FROM "User" 
WHERE role = 'SYSTEM';
```

#### Check Audit Logs
```sql
SELECT * FROM "AuditLog" 
WHERE action LIKE 'SYSTEM_%' 
ORDER BY createdAt DESC 
LIMIT 10;
```

#### Verify JWT Token
```javascript
// In browser console
document.cookie.split(';').find(c => c.trim().startsWith('session-token='))
```

## 📋 Best Practices

### Security
1. **Use strong passwords**: Minimum 12 characters with complexity
2. **Regular rotation**: Change system user passwords periodically
3. **Monitor access**: Review audit logs regularly
4. **Limit access**: Only create system users when necessary

### Management
1. **Documentation**: Keep track of all system users
2. **Backup accounts**: Have multiple system users for redundancy
3. **Regular review**: Audit system user access quarterly
4. **Cleanup**: Remove unused system accounts

### Development
1. **Environment separation**: Use different system users for dev/staging/prod
2. **Testing**: Test system user features in isolated environments
3. **Monitoring**: Set up alerts for system user login attempts
4. **Logging**: Ensure all system actions are properly logged

## 🔗 Related Files

- `src/middleware.ts` - Route protection and role validation
- `src/lib/auth/jwt.ts` - JWT token generation and validation
- `src/lib/auth/system.ts` - System user utilities
- `src/app/system-login/` - System login portal
- `src/app/dashboard/system/` - System dashboard
- `scripts/create-system-user.ts` - System user creation script
- `prisma/schema.prisma` - Database schema with user roles 