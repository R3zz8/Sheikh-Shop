#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToSuperAdmin() {
  try {
    console.log('🔄 Promoting user to Super Admin...');
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'rezadhu615@gmail.com' },
      select: { id: true, email: true, role: true, emailVerified: true }
    });

    if (!user) {
      throw new Error('User with email rezadhu615@gmail.com not found');
    }

    console.log(`Found user: ${user.email} (current role: ${user.role})`);

    // Update user to Super Admin role
    const updatedUser = await prisma.user.update({
      where: { email: 'rezadhu615@gmail.com' },
      data: { 
        role: 'SUPERADMIN',
        emailVerified: true,
        canLogin: true,
        disabled: false
      },
      select: { id: true, email: true, role: true, emailVerified: true, canLogin: true, disabled: true }
    });

    console.log('✅ User promoted to Super Admin successfully!');
    console.log('Updated user details:', updatedUser);

    // Verify the update
    const verification = await prisma.user.findUnique({
      where: { email: 'rezadhu615@gmail.com' },
      select: { id: true, email: true, role: true, emailVerified: true, canLogin: true, disabled: true }
    });

    if (verification?.role === 'SUPERADMIN') {
      console.log('✅ Verification: User role successfully updated to SUPERADMIN');
    } else {
      console.log('❌ Verification failed: User role not updated correctly');
    }

  } catch (error) {
    console.error('❌ Error promoting user to Super Admin:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToSuperAdmin();
