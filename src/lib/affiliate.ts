import { prisma } from '@/lib/prisma';
import { type NextRequest } from 'next/server';
import { type RequestCookies, type ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';

export async function trackReferral(
  url: URL,
  headers: Headers,
  cookies: RequestCookies,
  responseCookies: ResponseCookies,
) {
  const refCode = url.searchParams.get('ref');

  if (refCode) {
    try {
      responseCookies.set('referral_code', refCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
      const userAgent = headers.get('user-agent') || 'unknown';

      const affiliate = await prisma.affiliate.findUnique({ where: { referralCode: refCode } });

      if (affiliate) {
        await prisma.referral.create({
          data: {
            affiliateId: affiliate.id,
            ipAddress: ip,
            userAgent: userAgent,
          },
        });

        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: { totalClicks: { increment: 1 } },
        });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await prisma.affiliateDailyStat.upsert({
          where: {
            affiliateId_date: {
              affiliateId: affiliate.id,
              date: today,
            },
          },
          update: {
            clicks: { increment: 1 },
          },
          create: {
            affiliateId: affiliate.id,
            date: today,
            clicks: 1,
            sales: 0,
            commissionEarned: 0,
          },
        });
      }
    } catch (dbError) {
      console.error('Error logging referral visit:', dbError);
    }
  }
}
