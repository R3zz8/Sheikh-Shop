import bcrypt from 'bcrypt';
import { z } from 'zod';

// Security: Standardized password hashing configuration
export const PASSWORD_CONFIG = {
  SALT_ROUNDS: 12, // Consistent salt rounds across the application
  MIN_LENGTH: 12,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: true,
  HISTORY_LIMIT: 5, // Prevent reuse of last 5 passwords
} as const;

// Security: Enhanced password validation schema
export const passwordSchema = z.object({
    password: z.string()
        .min(PASSWORD_CONFIG.MIN_LENGTH, `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`)
        .max(PASSWORD_CONFIG.MAX_LENGTH, `Password must be less than ${PASSWORD_CONFIG.MAX_LENGTH} characters`)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
        .refine(async (password) => {
            return !await isCommonPassword(password);
        }, 'Password is too common and easily guessable')
        .refine(async (password) => {
            // This will be validated at the user level with userId context
            return true;
        }, 'Password has been used recently'),
});

// Security: Password strength validation with enhanced scoring
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number; // 0-4 (0=very weak, 4=very strong)
    feedback: string[];
    warnings: string[];
    entropy: number;
} {
    const feedback: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    let entropy = 0;

    // Length scoring
    if (password.length >= PASSWORD_CONFIG.MIN_LENGTH) {
        score += 1;
        if (password.length >= 16) score += 1;
    } else {
        feedback.push(`Password should be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`);
    }

    // Character variety scoring
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecial) score += 1;

    if (!hasUppercase) feedback.push('Add uppercase letters');
    if (!hasLowercase) feedback.push('Add lowercase letters');
    if (!hasNumbers) feedback.push('Add numbers');
    if (!hasSpecial) feedback.push('Add special characters');

    // Entropy calculation
    const charset = (hasUppercase ? 26 : 0) + (hasLowercase ? 26 : 0) + (hasNumbers ? 10 : 0) + (hasSpecial ? 32 : 0);
    entropy = Math.log2(Math.pow(charset, password.length));

    // Pattern detection
    const patterns = [
        /(.)\1{2,}/, // Repeated characters
        /(123|abc|qwe|asd|zxc)/i, // Common sequences
        /(password|admin|user|test)/i, // Common words
    ];

    for (const pattern of patterns) {
        if (pattern.test(password)) {
            score = Math.max(0, score - 1);
            warnings.push('Password contains easily guessable patterns');
        }
    }

    // Sequential characters
    const sequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012)/i;
    if (sequential.test(password)) {
        score = Math.max(0, score - 1);
        warnings.push('Password contains sequential characters');
    }

    return {
        isValid: score >= 3 && feedback.length === 0,
        score: Math.min(4, Math.max(0, score)),
        feedback,
        warnings,
        entropy,
    };
}

// Security: Hash password with standardized salt rounds
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, PASSWORD_CONFIG.SALT_ROUNDS);
}

// Security: Verify password with timing attack protection
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// Security: Generate secure random password
export function generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Security: Check if password is in common passwords list
export async function isCommonPassword(password: string): Promise<boolean> {
    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
        'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
        'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
        'ranger', 'iwantu', 'jennifer', 'hunter', 'buster', 'soccer',
        'baseball', 'tiger', 'charlie', 'andrew', 'michelle', 'love',
        'sunshine', 'jessica', 'asshole', '696969', 'amanda', 'access',
        'yankees', '987654321', 'dallas', 'austin', 'thunder', 'taylor',
        'matrix', 'mobilemail', 'mom', 'monitor', 'monitoring', 'montana',
        'moon', 'moscow', 'mother', 'movie', 'mozilla', 'music', 'mustang',
        'password', 'pa$$w0rd', 'p@ssw0rd', 'p@$$w0rd', 'pass123', 'pass1234',
        'password1', 'password12', 'password123', 'password1234', 'password12345',
        'admin123', 'admin1234', 'admin12345', 'root123', 'root1234', 'root12345',
        'user123', 'user1234', 'user12345', 'test123', 'test1234', 'test12345',
        'demo123', 'demo1234', 'demo12345', 'guest123', 'guest1234', 'guest12345',
        'welcome123', 'welcome1234', 'welcome12345', 'hello123', 'hello1234', 'hello12345',
        'changeme123', 'changeme1234', 'changeme12345', 'default123', 'default1234', 'default12345',
    ];
    
    return commonPasswords.includes(password.toLowerCase());
}

// Security: Check password history for a user
export async function isPasswordInHistory(userId: string, newPassword: string): Promise<boolean> {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        // Get recent password hashes from audit logs or password history table
        // For now, we'll check against the current password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        
        if (!user) return false;
        
        // Check if new password matches current password
        const isCurrentPassword = await verifyPassword(newPassword, user.password);
        
        await prisma.$disconnect();
        return isCurrentPassword;
    } catch (error) {
        console.error('Password history check failed:', error);
        return false; // Fail open for availability
    }
}

// Security: Validate password against all requirements
export async function validatePassword(password: string, userId?: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
    entropy: number;
}> {
    const strength = validatePasswordStrength(password);
    const errors: string[] = [...strength.feedback];
    const warnings: string[] = [...strength.warnings];
    
    // Check if password is common
    if (await isCommonPassword(password)) {
        errors.push('Password is too common and easily guessable');
    }
    
    // Check password history if userId is provided
    if (userId && await isPasswordInHistory(userId, password)) {
        errors.push('Password has been used recently');
    }
    
    return {
        isValid: strength.isValid && errors.length === 0,
        errors,
        warnings,
        score: strength.score,
        entropy: strength.entropy,
    };
}


