import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getCurrentUserId } from './session';
import { logLogin } from './audit';
import { verifyCsrfToken } from '@/lib/auth/csrf';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Security: Temporary 2FA secret storage (in production, use Redis)
const temporary2FASecrets = new Map<string, { secret: string; expiresAt: number }>();

// Security: Clean up expired temporary secrets
function cleanupExpiredTemporarySecrets() {
    const now = Date.now();
    for (const [userId, data] of temporary2FASecrets.entries()) {
        if (data.expiresAt < now) {
            temporary2FASecrets.delete(userId);
        }
    }
}

// Security: Store temporary 2FA secret
function storeTemporary2FASecret(userId: string, secret: string): void {
    cleanupExpiredTemporarySecrets();
    temporary2FASecrets.set(userId, {
        secret,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
}

// Security: Get temporary 2FA secret
function getTemporary2FASecret(userId: string): string | null {
    cleanupExpiredTemporarySecrets();
    const data = temporary2FASecrets.get(userId);
    if (!data || data.expiresAt < Date.now()) {
        temporary2FASecrets.delete(userId);
        return null;
    }
    return data.secret;
}

// Security: Remove temporary 2FA secret
function removeTemporary2FASecret(userId: string): void {
    temporary2FASecrets.delete(userId);
}

export async function generate2FASecret() {
    const userId = await getCurrentUserId();
    
    // Security: Generate a new secret
    const secret = speakeasy.generateSecret({ 
        length: 32, 
        name: `SheikhShop (${userId})`,
        issuer: 'SheikhShop'
    });
    
    // Security: Store secret temporarily
    storeTemporary2FASecret(userId, secret.base32!);
    
    const otpauthUrl = secret.otpauth_url!;
    const qr = await QRCode.toDataURL(otpauthUrl);
    
    return { 
        secret: secret.base32, 
        otpauthUrl, 
        qr,
        expiresIn: 10 * 60 * 1000 // 10 minutes
    };
}

export async function enable2FA(code: string, csrfToken: string) {
    await verifyCsrfToken(csrfToken);
    const userId = await getCurrentUserId();
    
    // Security: Get secret from temporary storage
    const secret = getTemporary2FASecret(userId);
    if (!secret) {
        throw new Error('2FA setup session expired. Please generate a new QR code.');
    }
    
    // Security: Verify the provided code
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window: 1, // Allow 1 time step tolerance
    });
    
    if (!verified) {
        throw new Error('Invalid verification code. Please try again.');
    }
    
    // Security: Store the secret permanently and enable 2FA
    await prisma.user.update({
        where: { id: userId },
        data: { 
            twoFactorEnabled: true, 
            twoFactorSecret: secret 
        },
    });
    
    // Security: Clean up temporary secret
    removeTemporary2FASecret(userId);
    
    await logLogin(userId, '2fa_enabled');
}

const failed2FAAttempts: Record<string, { count: number; last: number; lockedUntil?: number }> = {};
const MAX_2FA_ATTEMPTS = 5;
const LOCKOUT_2FA_TIME = 15 * 60 * 1000; // 15 minutes

export async function verify2FA(code: string) {
    const userId = await getCurrentUserId();
    const now = Date.now();
    const fail = failed2FAAttempts[userId];
    
    // Security: Check if 2FA is temporarily locked
    if (fail?.lockedUntil && now < fail.lockedUntil) {
        throw new Error('2FA temporarily locked due to too many failed attempts. Try again later.');
    }
    
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { twoFactorEnabled: true, twoFactorSecret: true }
    });
    
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('2FA is not enabled for this account.');
    }
    
    // Security: Verify the provided code
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1, // Allow 1 time step tolerance
    });
    
    if (!verified) {
        // Security: Track failed attempts
        failed2FAAttempts[userId] = { 
            count: (fail?.count || 0) + 1, 
            last: now 
        };
        
        if (failed2FAAttempts[userId].count >= MAX_2FA_ATTEMPTS) {
            failed2FAAttempts[userId].lockedUntil = now + LOCKOUT_2FA_TIME;
        }
        
        await logLogin(userId, '2fa_failed');
        throw new Error('Invalid verification code. Please try again.');
    }
    
    // Security: Reset failed attempts on success
    delete failed2FAAttempts[userId];
    await logLogin(userId, '2fa_verified');
}

export async function disable2FA(csrfToken: string) {
    await verifyCsrfToken(csrfToken);
    const userId = await getCurrentUserId();
    
    await prisma.user.update({
        where: { id: userId },
        data: { 
            twoFactorEnabled: false, 
            twoFactorSecret: null 
        },
    });
    
    // Security: Clean up any temporary secrets
    removeTemporary2FASecret(userId);
    
    await logLogin(userId, '2fa_disabled');
}

export async function get2FAStatus() {
    const userId = await getCurrentUserId();
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { twoFactorEnabled: true }
    });
    return { enabled: !!user?.twoFactorEnabled };
}

const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_LENGTH = 10;

export async function generateRecoveryCodes(csrfToken: string) {
    await verifyCsrfToken(csrfToken);
    const userId = await getCurrentUserId();
    
    // Security: Generate secure recovery codes
    const codes: string[] = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
        codes.push(crypto.randomBytes(RECOVERY_CODE_LENGTH).toString('hex').toUpperCase());
    }
    
    // Security: Hash and store recovery codes
    const hashedCodes = await Promise.all(
        codes.map(code => bcrypt.hash(code, 12))
    );
    
    // Security: Delete existing recovery codes
    await prisma.recoveryCode.deleteMany({ where: { userId } });
    
    // Security: Store new recovery codes
    await prisma.recoveryCode.createMany({
        data: hashedCodes.map(codeHash => ({
            userId,
            codeHash,
            used: false,
        })),
    });
    
    await logLogin(userId, 'recovery_codes_regenerated');
    return codes;
}

export async function getRecoveryCodes(csrfToken: string) {
    await verifyCsrfToken(csrfToken);
    const userId = await getCurrentUserId();
    
    // Security: Recovery codes can only be viewed after regeneration
    // This prevents viewing codes that were already shown
    throw new Error('Recovery codes can only be viewed after regeneration.');
}

export async function useRecoveryCode(code: string) {
    const userId = await getCurrentUserId();
    const now = Date.now();
    const fail = failed2FAAttempts[userId];
    
    // Security: Check if 2FA is temporarily locked
    if (fail?.lockedUntil && now < fail.lockedUntil) {
        throw new Error('2FA temporarily locked due to too many failed attempts. Try again later.');
    }
    
    const codes = await prisma.recoveryCode.findMany({ 
        where: { userId, used: false } 
    });
    
    // Security: Check each recovery code
    for (const c of codes) {
        if (await bcrypt.compare(code, c.codeHash)) {
            // Security: Mark code as used
            await prisma.recoveryCode.update({ 
                where: { id: c.id }, 
                data: { used: true } 
            });
            
            await logLogin(userId, '2fa_recovery_code_used');
            
            // Security: Reset failed attempts on success
            delete failed2FAAttempts[userId];
            return true;
        }
    }
    
    // Security: Track failed attempts
    failed2FAAttempts[userId] = { 
        count: (fail?.count || 0) + 1, 
        last: now 
    };
    
    if (failed2FAAttempts[userId].count >= MAX_2FA_ATTEMPTS) {
        failed2FAAttempts[userId].lockedUntil = now + LOCKOUT_2FA_TIME;
    }
    
    await logLogin(userId, '2fa_recovery_code_failed');
    return false;
}

export async function regenerateRecoveryCodes(csrfToken: string) {
    await verifyCsrfToken(csrfToken);
    const userId = await getCurrentUserId();
    
    // Security: Verify 2FA is enabled
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true }
    });
    
    if (!user?.twoFactorEnabled) {
        throw new Error('2FA must be enabled to generate recovery codes.');
    }
    
    return await generateRecoveryCodes(csrfToken);
}
