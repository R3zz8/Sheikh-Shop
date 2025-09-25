# Production Seeding Guide

## 🎯 Overview

This guide ensures reliable database seeding in both development and production environments.

## ✅ What Was Fixed

### 1. **Missing Prisma Seed Configuration**
- **Issue**: `package.json` was missing the `prisma.seed` configuration
- **Fix**: Added `"prisma": { "seed": "tsx prisma/seed.ts" }` to `package.json`
- **Impact**: `npx prisma db seed` now properly executes the seed script

### 2. **Silent Failures**
- **Issue**: Seed script failed silently without proper error reporting
- **Fix**: Enhanced error handling with detailed debugging information
- **Impact**: Clear error messages and debugging info for troubleshooting

### 3. **Production Environment Validation**
- **Issue**: No validation of environment variables or database connection
- **Fix**: Added connection testing and environment validation
- **Impact**: Immediate feedback if production setup is incorrect

### 4. **Verification System**
- **Issue**: No way to verify if seeding was successful
- **Fix**: Created `scripts/verify-seed.ts` and `npm run db:verify-seed`
- **Impact**: Easy verification of seed data integrity

## 🚀 Deployment Steps

### For Your Teammate (Production Environment)

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Environment Variables**
   Ensure `.env` file has correct production `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/prod_database"
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Seed the Database**
   ```bash
   npx prisma db seed
   ```

7. **Verify Seeding Success**
   ```bash
   npm run db:verify-seed
   ```

## 🔧 Troubleshooting

### If Seeding Fails

1. **Check Database Connection**
   ```bash
   npx prisma db pull
   ```

2. **Verify Environment Variables**
   ```bash
   echo $DATABASE_URL
   ```

3. **Run Seed with Debug Info**
   ```bash
   tsx prisma/seed.ts
   ```

4. **Check Database Tables Exist**
   ```bash
   npx prisma studio
   ```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Environment variables loaded from .env" only | Missing `prisma.seed` config | Ensure `package.json` has the prisma config block |
| "DATABASE_URL environment variable is required" | Missing or incorrect env var | Set correct `DATABASE_URL` in `.env` |
| "Database connection failed" | Database not running or wrong credentials | Check database server and credentials |
| "The table does not exist" | Migrations not applied | Run `npx prisma migrate deploy` |

## 📊 Expected Results

After successful seeding, you should have:

- **1 Super Admin User**: `rezadhu615@gmail.com` with role `SUPERADMIN`
- **6 Units**: g, kg, L, ml, pkg, pcs
- **5 Products**: Premium Iranian Honey, Organic Saffron Threads, Medjool Dates Premium, Persian Rose Water, Mixed Nuts Premium Pack
- **2 Discounts**: 20% off honey, $3.50 off dates

## 🔒 Security Notes

- Super admin password is securely hashed with bcrypt (salt rounds: 12)
- All operations use `upsert` for idempotency
- No plain text passwords stored anywhere
- Database connection uses connection pooling for performance

## 🧪 Testing Commands

```bash
# Seed database
npm run db:seed

# Verify seeding
npm run db:verify-seed

# Reset and re-seed (development only)
npm run db:reset

# Open database viewer
npx prisma studio
```

## 🚨 Production Checklist

- [ ] Database server is running and accessible
- [ ] Correct `DATABASE_URL` is set
- [ ] All dependencies are installed (`npm install`)
- [ ] Migrations are applied (`npx prisma migrate deploy`)
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Seed script runs without errors (`npx prisma db seed`)
- [ ] Verification passes (`npm run db:verify-seed`)
- [ ] Super admin can log in with provided credentials

## 📝 Notes for Team

- The seed script is **idempotent** - safe to run multiple times
- Use `npm run db:verify-seed` after any production deployment
- Never commit production `.env` files to version control
- The seed script includes detailed logging for troubleshooting
