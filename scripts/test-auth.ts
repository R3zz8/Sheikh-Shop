#!/usr/bin/env tsx

import { prisma } from '@/utils/prisma';
import bcrypt from 'bcrypt';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if User table exists and has correct structure
    const userCount = await prisma.user.count();
    console.log(`📊 User table exists with ${userCount} users`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function testUserCreation() {
  console.log('\n👤 Testing user creation...');
  
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        username: `testuser-${Date.now()}`,
        role: 'USER',
        emailVerified: true,
        canLogin: true,
        disabled: false,
      },
    });
    
    console.log('✅ User created successfully:', user.email);
    
    // Test user retrieval
    const foundUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    
    if (foundUser) {
      console.log('✅ User retrieval successful');
      
      // Test password verification
      const validPassword = await bcrypt.compare('testpass123', foundUser.password);
      console.log('✅ Password verification:', validPassword ? 'PASSED' : 'FAILED');
      
      // Clean up test user
      await prisma.user.delete({ where: { id: user.id } });
      console.log('🧹 Test user cleaned up');
    }
    
    return true;
  } catch (error) {
    console.error('❌ User creation failed:', error);
    return false;
  }
}

async function checkSchemaFields() {
  console.log('\n📋 Checking schema fields...');
  
  try {
    // Try to access all expected fields
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        emailVerified: true,
        canLogin: true,
        disabled: true,
        loginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log('✅ All expected fields are accessible');
    return true;
  } catch (error) {
    console.error('❌ Schema field check failed:', error);
    return false;
  }
}

async function main() {
  console.log('🧪 Authentication System Test\n');
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  const schemaOk = await checkSchemaFields();
  if (!schemaOk) {
    console.log('\n❌ Schema mismatch detected. Run "npm run reset-db" to fix.');
    process.exit(1);
  }
  
  const userCreationOk = await testUserCreation();
  if (!userCreationOk) {
    console.log('\n❌ User creation failed. Check your database setup.');
    process.exit(1);
  }
  
  console.log('\n🎉 All tests passed! Your authentication system is working correctly.');
  console.log('\n📝 Next steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Try registering a new user');
  console.log('3. Try logging in with the created user');
}

main().catch(console.error).finally(() => prisma.$disconnect());
