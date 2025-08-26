import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupSuperadmin() {
  try {
    console.log('🧹 Cleaning up superadmin setup...\n');

    // Remove superadmin user
    const deletedUser = await prisma.user.deleteMany({
      where: { email: 'rezadhu615@gmail.com' }
    });

    if (deletedUser.count > 0) {
      console.log('✅ Superadmin user removed from database');
    } else {
      console.log('ℹ️  Superadmin user not found in database');
    }

    // Remove verification script
    console.log('ℹ️  Remember to manually delete these files:');
    console.log('   - scripts/verify-superadmin.ts');
    console.log('   - scripts/test-superadmin-access.ts');
    console.log('   - scripts/cleanup-superadmin.ts (this file)');
    console.log('   - Update prisma/seed.ts to remove superadmin creation');

    console.log('\n✅ Cleanup completed!');
    console.log('⚠️  Make sure to remove the superadmin creation code from prisma/seed.ts');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSuperadmin(); 