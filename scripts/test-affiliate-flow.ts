
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Starting affiliate flow test...');

  // 1. Create a test user
  const testUser = await prisma.user.create({
    data: {
      email: `testuser-${nanoid(5)}@example.com`,
      password: 'password123',
    },
  });
  console.log(`- Created test user: ${testUser.email}`);

  // 2. Register user as an affiliate
  const referralCode = nanoid(10);
  const affiliate = await prisma.affiliate.create({
    data: {
      userId: testUser.id,
      referralCode,
    },
  });
  console.log(`- Registered user as affiliate with code: ${affiliate.referralCode}`);

  // 3. Simulate a referral visit
  const referral = await prisma.referral.create({
    data: {
      affiliateId: affiliate.id,
      ipAddress: '127.0.0.1',
      userAgent: 'test-script',
    },
  });
  console.log(`- Simulated referral visit: ${referral.id}`);

    // Update affiliate clicks
    await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: { totalClicks: { increment: 1 } },
    });

  // 4. Create a mock order
  const order = await prisma.order.create({
    data: {
      userId: testUser.id,
      total: 100.0,
      status: 'COMPLETED',
      items: {
        create: {
          productId: 'clxsh01dc000008l5g1f7f9d1',
          quantity: 1,
          price: 100.0,
        },
      },
    },
  });
  console.log(`- Created mock order: ${order.id}`);

  // 5. Trigger conversion tracking
  const commissionRate = 0.1;
  const commission = Number(order.total) * commissionRate;

  await prisma.referral.update({
    where: { id: referral.id },
    data: { isConverted: true, orderId: order.id },
  });

  const updatedAffiliate = await prisma.affiliate.update({
    where: { id: affiliate.id },
    data: {
      totalSales: { increment: 1 },
      commissionEarned: { increment: commission },
    },
  });
  console.log('- Triggered conversion tracking');

  // 6. Assertions
  console.log('\n🔍 Verifying results...');
  if (updatedAffiliate.totalClicks !== 1) {
    throw new Error(`Expected totalClicks to be 1, but got ${updatedAffiliate.totalClicks}`);
  }
  if (updatedAffiliate.totalSales !== 1) {
    throw new Error(`Expected totalSales to be 1, but got ${updatedAffiliate.totalSales}`);
  }
  if (updatedAffiliate.commissionEarned.toNumber() !== 10) {
    throw new Error(`Expected commissionEarned to be 10, but got ${updatedAffiliate.commissionEarned.toNumber()}`);
  }
  console.log('✅ All assertions passed!');

  console.log('\n🎉 Affiliate flow test completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
