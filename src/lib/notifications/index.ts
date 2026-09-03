import { prisma } from '@/utils/prisma';
import { sendEmail } from '@/lib/email/sendEmail';

/**
 * Process back-in-stock notifications for a product that was restocked.
 * Idempotently fetches active subscriptions, sends emails if available, and updates status.
 */
export async function processBackInStockNotifications(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, slug: true, basePrice: true, images: { take: 1 } },
    });

    if (!product) {
      return { success: false, error: 'Product not found', notifiedCount: 0 };
    }

    // Find active subscriptions
    const activeSubscriptions = await prisma.backInStockSubscription.findMany({
      where: {
        productId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (activeSubscriptions.length === 0) {
      return { success: true, notifiedCount: 0 };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sheikhshops.com';
    const productUrl = `${appUrl}/products/${product.slug || product.id}`;
    let notifiedCount = 0;

    for (const sub of activeSubscriptions) {
      const recipientEmail = sub.email || sub.user?.email;

      // Atomically update subscription status to prevent duplicate processing
      const updated = await prisma.backInStockSubscription.updateMany({
        where: {
          id: sub.id,
          status: 'ACTIVE', // Enforce concurrency lock
        },
        data: {
          status: 'NOTIFIED',
          notifiedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        // Already processed by a concurrent thread
        continue;
      }

      if (recipientEmail) {
        const subject = `📢 محصول «${product.name}» در فروشگاه شیخ موجود شد!`;
        const html = `
          <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; padding: 20px; background-color: #FAF7F2; color: #2C1A11;">
            <div style="max-width: 600px; margin: 0 auto; background: #2A1A12; padding: 30px; border-radius: 20px; border: 1px solid #D97706; text-align: center;">
              <h1 style="color: #F59E0B; font-size: 24px; margin-bottom: 20px;">👑 خبر خوش از فروشگاه بزرگ شیخ</h1>
              <p style="color: #E2E8F0; font-size: 16px; leading-height: 1.8;">
                سلام، محصول مورد نظر شما با نام <strong>«${product.name}»</strong> مجدداً در انبار فروشگاه موجود گردید.
              </p>
              <div style="margin: 30px 0;">
                <a href="${productUrl}" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: #000; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
                  🛒 مشاهده و خرید آنلاین کالا
                </a>
              </div>
              <p style="color: #A0AEC0; font-size: 12px;">
                این ایمیل به درخواست شما برای اطلاع‌رسانی موجودی ارسال شده است.
              </p>
            </div>
          </div>
        `;

        await sendEmail(recipientEmail, subject, html);
      }

      notifiedCount++;
    }

    return { success: true, notifiedCount };
  } catch (error) {
    console.error('Error processing back in stock notifications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', notifiedCount: 0 };
  }
}
