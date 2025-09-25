#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔄 Creating Super Admin user...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'rezadhu615@gmail.com' }
    });

    if (existingUser) {
      console.log('User already exists, updating to Super Admin...');
      
      // Update existing user to Super Admin
      const updatedUser = await prisma.user.update({
        where: { email: 'rezadhu615@gmail.com' },
        data: { 
          role: 'SUPERADMIN',
          emailVerified: true,
          canLogin: true,
          disabled: false
        }
      });
      
      console.log('✅ Existing user promoted to Super Admin successfully!');
      console.log('User details:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified
      });
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash('Temp@1378', 12);
      
      // Create new Super Admin user
      const newUser = await prisma.user.create({
        data: {
          email: 'rezadhu615@gmail.com',
          password: hashedPassword,
          role: 'SUPERADMIN',
          emailVerified: true,
          canLogin: true,
          disabled: false,
          username: 'rezadhu615',
          firstName: 'Reza',
          lastName: 'Admin'
        }
      });
      
      console.log('✅ New Super Admin user created successfully!');
      console.log('User details:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        username: newUser.username
      });
    }

    // Verify the user exists and has Super Admin role
    const verification = await prisma.user.findUnique({
      where: { email: 'rezadhu615@gmail.com' },
      select: { id: true, email: true, role: true, emailVerified: true, canLogin: true, disabled: true }
    });

    if (verification?.role === 'SUPERADMIN') {
      console.log('✅ Verification: User successfully created/updated with SUPERADMIN role');
      console.log('Login credentials:');
      console.log('  Email: rezadhu615@gmail.com');
      console.log('  Password: Temp@1378');
    } else {
      console.log('❌ Verification failed: User role not set correctly');
    }

  } catch (error) {
    console.error('❌ Error creating Super Admin user:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
