import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getCurrentUserId } from './session';
import { logLogin } from './audit';
import { verifyCsrfToken } from '@/lib/auth/csrf';
import bcrypt from 'bcrypt';

export async function generate2FASecret() {
  const userId = await getCurrentUserId();
  const secret = speakeasy.generateSecret({ length: 32, name: `DigitalShop (${userId})` });
  const otpauthUrl = secret.otpauth_url!;
  const qr = await QRCode.toDataURL(otpauthUrl);
  return { secret: secret.base32, otpauthUrl, qr };
}

export async function enable2FA(secret: string, code: string, csrfToken: string) {
  await verifyCsrfToken(csrfToken);
  const userId = await getCurrentUserId();
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1,
  });
  if (!verified) throw new Error('Invalid code');
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true, twoFactorSecret: secret },
  });
  await logLogin(userId, '2fa_enabled');
}

const failed2FAAttempts: Record<string, { count: number; last: number; lockedUntil?: number }> = {};
const MAX_2FA_ATTEMPTS = 5;
const LOCKOUT_2FA_TIME = 15 * 60 * 1000; // 15 minutes

export async function verify2FA(code: string) {
  const userId = await getCurrentUserId();
  const now = Date.now();
  const fail = failed2FAAttempts[userId];
  if (fail?.lockedUntil && now < fail.lockedUntil) {
    throw new Error('2FA temporarily locked due to too many failed attempts. Try again later.');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) throw new Error('2FA not enabled');
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });
  if (!verified) {
    failed2FAAttempts[userId] = { count: (fail?.count || 0) + 1, last: now };
    if (failed2FAAttempts[userId].count >= MAX_2FA_ATTEMPTS) {
      failed2FAAttempts[userId].lockedUntil = now + LOCKOUT_2FA_TIME;
    }
    await logLogin(userId, '2fa_failed');
    throw new Error('Invalid code');
  }
  // Reset failed attempts on success
  delete failed2FAAttempts[userId];
  await logLogin(userId, '2fa_verified');
}

export async function disable2FA(csrfToken: string) {
  await verifyCsrfToken(csrfToken);
  const userId = await getCurrentUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
  await logLogin(userId, '2fa_disabled');
}

export async function get2FAStatus() {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return { enabled: !!user?.twoFactorEnabled };
}

const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_LENGTH = 10;

function randomCode() {
  return Array.from({ length: RECOVERY_CODE_LENGTH }, () => Math.floor(Math.random() * 10)).join('');
}

export async function generateRecoveryCodes(userId: string) {
  // Remove old codes
  await prisma.recoveryCode.deleteMany({ where: { userId } });
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, randomCode);
  const hashed = await Promise.all(codes.map(code => bcrypt.hash(code, 10)));
  await Promise.all(hashed.map(codeHash => prisma.recoveryCode.create({ data: { userId, codeHash } })));
  return codes;
}

export async function getRecoveryCodes(csrfToken: string) {
  await verifyCsrfToken(csrfToken);
  const userId = await getCurrentUserId();
  // Only allow if 2FA is enabled
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorEnabled) throw new Error('2FA not enabled');
  // For security, only show unhashed codes immediately after generation
  throw new Error('Recovery codes can only be viewed after regeneration.');
}

export async function useRecoveryCode(code: string) {
  const userId = await getCurrentUserId();
  const now = Date.now();
  const fail = failed2FAAttempts[userId];
  if (fail?.lockedUntil && now < fail.lockedUntil) {
    throw new Error('2FA temporarily locked due to too many failed attempts. Try again later.');
  }
  const codes = await prisma.recoveryCode.findMany({ where: { userId, used: false } });
  for (const c of codes) {
    if (await bcrypt.compare(code, c.codeHash)) {
      await prisma.recoveryCode.update({ where: { id: c.id }, data: { used: true } });
      await logLogin(userId, '2fa_recovery_code_used');
      // Reset failed attempts on success
      delete failed2FAAttempts[userId];
      return true;
    }
  }
  failed2FAAttempts[userId] = { count: (fail?.count || 0) + 1, last: now };
  if (failed2FAAttempts[userId].count >= MAX_2FA_ATTEMPTS) {
    failed2FAAttempts[userId].lockedUntil = now + LOCKOUT_2FA_TIME;
  }
  await logLogin(userId, '2fa_recovery_code_failed');
  return false;
}

export async function regenerateRecoveryCodes(csrfToken: string) {
  await verifyCsrfToken(csrfToken);
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorEnabled) throw new Error('2FA not enabled');
  const codes = await generateRecoveryCodes(userId);
  await logLogin(userId, '2fa_recovery_codes_regenerated');
  return codes;
}
