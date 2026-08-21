import {
  tomanToRial,
  rialToToman,
  getZarinPalStartPayUrl,
  getZarinPalMerchantId,
  createZarinPalPaymentRequest,
  verifyZarinPalPayment,
  ZARINPAL_REQUEST_URL,
  ZARINPAL_VERIFY_URL,
} from "@/lib/payment/zarinpal";

// Save original env
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  process.env.ZARINPAL_MERCHANT_ID = "12345678-1234-1234-1234-123456789012";
  (global.fetch as any) = jest.fn();
});

afterAll(() => {
  process.env = originalEnv;
});

describe("ZarinPal Payment Gateway Engine", () => {
  describe("Currency Conversion Helpers", () => {
    test("converts Toman to Rial accurately using integer math", () => {
      expect(tomanToRial(100)).toBe(1000);
      expect(tomanToRial(0)).toBe(0);
      expect(tomanToRial(150000)).toBe(1500000);
      expect(tomanToRial(99.9)).toBe(999);
    });

    test("throws error on invalid Toman inputs", () => {
      expect(() => tomanToRial(-100)).toThrow("Invalid amount in Toman");
      expect(() => tomanToRial(NaN)).toThrow("Invalid amount in Toman");
      expect(() => tomanToRial("100" as any)).toThrow("Invalid amount in Toman");
    });

    test("converts Rial to Toman accurately", () => {
      expect(rialToToman(1000)).toBe(100);
      expect(rialToToman(0)).toBe(0);
      expect(rialToToman(1500000)).toBe(150000);
    });

    test("throws error on invalid Rial inputs", () => {
      expect(() => rialToToman(-100)).toThrow("Invalid amount in Rial");
      expect(() => rialToToman(NaN)).toThrow("Invalid amount in Rial");
    });
  });

  describe("URL & Environment Generators", () => {
    test("generates StartPay URL correctly", () => {
      const authority = "A0000000000000000000000000000wwOGYpd";
      expect(getZarinPalStartPayUrl(authority)).toBe(
        `https://payment.zarinpal.com/pg/StartPay/${authority}`
      );
    });

    test("throws error when authority is invalid", () => {
      expect(() => getZarinPalStartPayUrl("")).toThrow("Invalid ZarinPal authority token");
      expect(() => getZarinPalStartPayUrl("   ")).toThrow("Invalid ZarinPal authority token");
    });

    test("retrieves Merchant ID from environment", () => {
      expect(getZarinPalMerchantId()).toBe("12345678-1234-1234-1234-123456789012");
    });

    test("falls back to PAYMENT_MERCHANT_ID if ZARINPAL_MERCHANT_ID is unset", () => {
      delete process.env.ZARINPAL_MERCHANT_ID;
      process.env.PAYMENT_MERCHANT_ID = "fallback-merchant-id";
      expect(getZarinPalMerchantId()).toBe("fallback-merchant-id");
    });

    test("throws error if no merchant ID is set", () => {
      delete process.env.ZARINPAL_MERCHANT_ID;
      delete process.env.PAYMENT_MERCHANT_ID;
      expect(() => getZarinPalMerchantId()).toThrow("environment variable is missing");
    });
  });

  describe("Payment Request Creation (Step 1)", () => {
    test("sends valid POST payload with amount converted to Rial", async () => {
      const mockResponse = {
        data: {
          code: 100,
          message: "Success",
          authority: "A0000000000000000000000000000wwOGYpd",
          fee_type: "Merchant",
          fee: 100,
        },
        errors: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createZarinPalPaymentRequest({
        amountToman: 15000,
        description: "Test Purchase",
        callbackUrl: "https://example.com/callback",
        orderId: "order-123",
        email: "test@example.com",
        mobile: "09123456789",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        ZARINPAL_REQUEST_URL,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            merchant_id: "12345678-1234-1234-1234-123456789012",
            amount: 150000, // 15000 Toman * 10 = 150000 Rial
            description: "Test Purchase",
            callback_url: "https://example.com/callback",
            metadata: {
              mobile: "09123456789",
              email: "test@example.com",
              order_id: "order-123",
            },
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test("handles API error code response from ZarinPal", async () => {
      const mockErrorResponse = {
        data: [],
        errors: [
          {
            code: -11,
            message: "مرچنت کد نامعتبر است",
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      });

      const result = await createZarinPalPaymentRequest({
        amountToman: 1000,
        description: "Test",
        callbackUrl: "https://example.com/callback",
      });

      expect(result.errors[0].code).toBe(-11);
    });

    test("throws error when ZarinPal HTTP status is not ok", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(
        createZarinPalPaymentRequest({
          amountToman: 1000,
          description: "Test",
          callbackUrl: "https://example.com/callback",
        })
      ).rejects.toThrow("ZarinPal request failed with status 500");
    });
  });

  describe("Payment Verification (Step 4)", () => {
    test("sends valid verification request with amount converted to Rial", async () => {
      const mockVerifyResponse = {
        data: {
          code: 100,
          message: "Verified",
          card_hash: "123456",
          card_pan: "502229******5995",
          ref_id: 201202,
          fee_type: "Merchant",
          fee: 0,
        },
        errors: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVerifyResponse,
      });

      const authority = "A0000000000000000000000000000wwOGYpd";
      const result = await verifyZarinPalPayment({
        amountToman: 15000,
        authority,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        ZARINPAL_VERIFY_URL,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            merchant_id: "12345678-1234-1234-1234-123456789012",
            amount: 150000, // 15000 Toman -> 150000 Rial
            authority,
          }),
        })
      );

      expect(result.data.code).toBe(100);
      expect(result.data.ref_id).toBe(201202);
    });

    test("handles code 101 (Already Verified) gracefully", async () => {
      const mockVerifyResponse = {
        data: {
          code: 101,
          message: "Transaction already verified",
          ref_id: 201202,
        },
        errors: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVerifyResponse,
      });

      const result = await verifyZarinPalPayment({
        amountToman: 15000,
        authority: "A0000000000000000000000000000wwOGYpd",
      });

      expect(result.data.code).toBe(101);
      expect(result.data.ref_id).toBe(201202);
    });

    test("throws error when verification HTTP response is not ok", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 502,
        text: async () => "Bad Gateway",
      });

      await expect(
        verifyZarinPalPayment({
          amountToman: 5000,
          authority: "A0000000000000000000000000000wwOGYpd",
        })
      ).rejects.toThrow("ZarinPal verification failed with status 502");
    });
  });
});
