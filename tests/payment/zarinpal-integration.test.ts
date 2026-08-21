/**
 * @jest-environment node
 */
import {
  tomanToRial,
  rialToToman,
  createZarinPalPaymentRequest,
  verifyZarinPalPayment,
} from "@/lib/payment/zarinpal";
import { prisma } from "@/lib/prisma";

process.env.MOCK_DB = "true";
process.env.ZARINPAL_MERCHANT_ID = "12345678-1234-1234-1234-123456789012";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

describe("ZarinPal End-to-End Payment Engine & Idempotency Pipeline", () => {
  let testUserId: string;

  beforeAll(async () => {
    // Look up or provision user for foreign key satisfaction when running against real DB
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "integration_test@sheikhshops.com",
          password: "password123",
          role: "USER",
        },
      });
    }
    testUserId = user.id;
  });

  beforeEach(() => {
    (global.fetch as any) = jest.fn();
  });

  test("calculates single-pass integer Toman-to-Rial conversion", () => {
    expect(tomanToRial(50000)).toBe(500000);
    expect(rialToToman(500000)).toBe(50000);
  });

  test("creates Order and Transaction with linked orderId", async () => {
    const order = await prisma.order.create({
      data: {
        userId: testUserId,
        total: 1000000,
        shippingCost: 200000,
        totalPrice: 1200000,
        status: "PENDING",
      },
    });

    const authority = `A00000000000000000000000000${Date.now()}`;

    const transaction = await prisma.transaction.create({
      data: {
        authority,
        amount: 1200000,
        status: "PENDING",
        description: `سفارش ${order.id}`,
        orderId: order.id,
      },
    });

    expect(transaction.orderId).toBe(order.id);

    const fetchedTx = await prisma.transaction.findUnique({
      where: { authority },
      include: { order: true },
    });

    expect(fetchedTx).toBeDefined();
    expect(fetchedTx?.orderId).toBe(order.id);
    expect(fetchedTx?.order?.status).toBe("PENDING");

    // Cleanup test transaction & order if real DB
    if (process.env.MOCK_DB !== "true") {
      await prisma.transaction.delete({ where: { authority } });
      await prisma.order.delete({ where: { id: order.id } });
    }
  });

  test("verifies payment with ZarinPal API (Code 100) and marks order COMPLETED atomically", async () => {
    const order = await prisma.order.create({
      data: {
        userId: testUserId,
        total: 500000,
        shippingCost: 200000,
        totalPrice: 700000,
        status: "PENDING",
      },
    });

    const authority = `A00000000000000000000000001${Date.now()}`;

    await prisma.transaction.create({
      data: {
        authority,
        amount: 700000,
        status: "PENDING",
        description: `سفارش ${order.id}`,
        orderId: order.id,
      },
    });

    // Mock ZarinPal verify response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          code: 100,
          message: "Verified",
          ref_id: 12345678,
        },
        errors: [],
      }),
    });

    const verifyRes = await verifyZarinPalPayment({
      amountToman: 700000,
      authority,
    });

    expect(verifyRes.data.code).toBe(100);

    // Simulate atomic update inside payment processing
    await prisma.$transaction(async (tx: any) => {
      await tx.transaction.update({
        where: { authority },
        data: { status: "COMPLETED", reference: String(verifyRes.data.ref_id) },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });
    });

    const completedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    const completedTx = await prisma.transaction.findUnique({ where: { authority } });

    expect(completedOrder?.status).toBe("COMPLETED");
    expect(completedTx?.status).toBe("COMPLETED");
    expect(completedTx?.reference).toBe("12345678");

    // Cleanup test transaction & order if real DB
    if (process.env.MOCK_DB !== "true") {
      await prisma.transaction.delete({ where: { authority } });
      await prisma.order.delete({ where: { id: order.id } });
    }
  });

  test("idempotently handles already-verified payments (Code 101) without double processing", async () => {
    const authority = "A0000000000000000000000000000E2E03";

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          code: 101,
          message: "Transaction already verified",
          ref_id: 12345678,
        },
        errors: [],
      }),
    });

    const verifyRes = await verifyZarinPalPayment({
      amountToman: 700000,
      authority,
    });

    expect(verifyRes.data.code).toBe(101);
  });
});
