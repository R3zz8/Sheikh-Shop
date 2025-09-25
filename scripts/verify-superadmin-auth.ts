#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifySuperadminAuth() {
  try {
    console.log('🔍 Verifying SUPERADMIN authentication...\n');

    // Check if SUPERADMIN user exists
    const superadmin = await prisma.user.findFirst({
      where: {
        email: 'rezadhu615@gmail.com',
        role: 'SUPERADMIN'
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        emailVerified: true,
        canLogin: true,
        disabled: true,
        createdAt: true
      }
    });

    if (!superadmin) {
      console.log('❌ SUPERADMIN user not found. Creating...');
      
      // Create SUPERADMIN user
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
      
      const newSuperadmin = await prisma.user.create({
        data: {
          email: 'rezadhu615@gmail.com',
          username: 'superadmin',
          firstName: 'Super',
          lastName: 'Admin',
          password: hashedPassword,
          role: 'SUPERADMIN',
          emailVerified: true,
          canLogin: true,
          disabled: false
        }
      });

      console.log('✅ SUPERADMIN user created successfully!');
      console.log(`   Email: ${newSuperadmin.email}`);
      console.log(`   Role: ${newSuperadmin.role}`);
      console.log(`   Password: SuperAdmin123!`);
    } else {
      console.log('✅ SUPERADMIN user found!');
      console.log(`   Email: ${superadmin.email}`);
      console.log(`   Role: ${superadmin.role}`);
      console.log(`   Username: ${superadmin.username}`);
      console.log(`   Email Verified: ${superadmin.emailVerified}`);
      console.log(`   Can Login: ${superadmin.canLogin}`);
      console.log(`   Disabled: ${superadmin.disabled}`);
      console.log(`   Created: ${superadmin.createdAt.toLocaleDateString()}`);
    }

    // Check existing articles
    const articles = await prisma.article.findMany({
      include: {
        author: {
          select: {
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n📰 Existing Articles:');
    if (articles.length === 0) {
      console.log('   No articles found in database');
    } else {
      articles.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      Status: ${article.status}`);
        console.log(`      Author: ${article.author.email} (${article.author.role})`);
        console.log(`      Created: ${article.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    console.log('\n🎯 Ready to create SEO-optimized articles!');
    console.log('   Login credentials:');
    console.log('   Email: rezadhu615@gmail.com');
    console.log('   Password: SuperAdmin123!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySuperadminAuth();



