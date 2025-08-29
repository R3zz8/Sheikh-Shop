#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  try {
    // Drop the database
    console.log('📦 Dropping database...');
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    await prisma.$executeRaw`CREATE SCHEMA public`;
    
    // Reset Prisma migrations
    console.log('🗂️  Resetting migrations...');
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    if (existsSync(migrationsDir)) {
      execSync('rm -rf prisma/migrations', { stdio: 'inherit' });
    }
    
    // Create fresh migration
    console.log('📝 Creating fresh migration...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Database reset complete!');
    console.log('🚀 You can now start your development server.');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Create a super admin user for testing
async function createSuperAdmin() {
  console.log('👑 Creating super admin user...');
  
  try {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@sheikhshop.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        username: 'superadmin',
        role: 'SUPERADMIN',
        emailVerified: true,
        canLogin: true,
        disabled: false,
      },
    });
    
    console.log('✅ Super admin created:', superAdmin.email);
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed to create super admin:', error);
  }
}

async function main() {
  await resetDatabase();
  await createSuperAdmin();
}

if (require.main === module) {
  main().catch(console.error);
}
