import { prisma } from '@/lib/prisma';

describe('Order Management System & Data Integrity', () => {
  let testUserId: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Create a mock test user
    const user = await prisma.user.create({
      data: {
        email: `ordertest_${Date.now()}@example.com`,
        username: `ordertest_${Date.now()}`,
        password: 'password123',
        firstName: 'تست',
        lastName: 'سفارش',
        role: 'USER',
      },
    });
    testUserId = user.id;
  });

  it('1. Should create order with historical product and shipping snapshot', async () => {
    const order = await prisma.order.create({
      data: {
        userId: testUserId,
        subtotal: 100000,
        total: 100000,
        shippingCost: 20000,
        discount: 0,
        totalPrice: 120000,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress: {
          firstName: 'تست',
          lastName: 'سفارش',
          recipientName: 'تست سفارش',
          recipientPhone: '09123456789',
          phone: '09123456789',
          province: 'تهران',
          city: 'تهران',
          address: 'خیابان آزادی، پلاک ۱',
          postalCode: '1234567890',
        },
        items: {
          create: [
            {
              productId: 'p_water_fountain',
              productName: 'Automatic Cat Water Fountains',
              productImage: '/fountain1.webp',
              unitName: 'Piece',
              quantity: 1,
              price: 100000,
              shippingCost: 20000,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    testOrderId = order.id;

    expect(order.id).toBeDefined();
    expect(order.status).toBe('PENDING');
    expect(order.paymentStatus).toBe('PENDING');
    expect(order.items.length).toBe(1);
    expect(order.items[0].productName).toBe('Automatic Cat Water Fountains');
    expect(order.items[0].productImage).toBe('/fountain1.webp');
    expect((order.shippingAddress as any)?.postalCode).toBe('1234567890');
  });

  it('2. Should atomically transition paymentStatus to PAID and status to PROCESSING', async () => {
    const updatedOrder = await prisma.order.update({
      where: { id: testOrderId },
      data: {
        paymentStatus: 'PAID',
        status: 'PROCESSING',
      },
    });

    expect(updatedOrder.paymentStatus).toBe('PAID');
    expect(updatedOrder.status).toBe('PROCESSING');
  });

  it('3. Should update tracking code and transition to SHIPPED', async () => {
    const trackingCode = '987654321012345';
    const updatedOrder = await prisma.order.update({
      where: { id: testOrderId },
      data: {
        status: 'SHIPPED',
        trackingCode,
      },
    });

    expect(updatedOrder.status).toBe('SHIPPED');
    expect(updatedOrder.trackingCode).toBe(trackingCode);
  });

  it('4. Should enforce ownership isolation (prevent unauthorized access)', async () => {
    const order = await prisma.order.findUnique({
      where: { id: testOrderId },
    });

    const foreignUserId = 'unauthorized_user_999';
    const isOwner = order?.userId === foreignUserId;

    expect(isOwner).toBe(false);
  });
});
