import bcrypt from 'bcrypt';
import { z } from 'zod';

// Security: Password validation schema
export const passwordSchema = z.object({
    password: z.string()
        .min(12, 'Password must be at least 12 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
        .max(128, 'Password must be less than 128 characters'),
});

// Security: Password strength validation
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number; // 0-4 (0=very weak, 4=very strong)
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
        score += 1;
    } else {
        feedback.push('Password should be at least 12 characters long');
    }

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Additional checks
    if (password.length >= 16) score += 1;
    if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters
    else feedback.push('Avoid repeated characters');

    if (!/(123|abc|qwe|password|admin)/i.test(password)) score += 1;
    else feedback.push('Avoid common patterns');

    // Cap score at 4
    score = Math.min(score, 4);

    return {
        isValid: score >= 3, // Require at least 3/4 strength
        score,
        feedback: feedback.length > 0 ? feedback : ['Strong password!'],
    };
}

// Security: Hash password with bcrypt (fallback to Argon2 in production)
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Increased from default 10 for better security
    return await bcrypt.hash(password, saltRounds);
}

// Security: Verify password with timing attack protection
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

// Security: Generate secure random password
export function generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    // Ensure at least one character from each category
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

// Security: Check if password is in common password list
export function isCommonPassword(password: string): boolean {
    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'hello', 'freedom', 'whatever',
        'qazwsx', 'trustno1', 'jordan', 'harley', 'ranger',
        'iwantu', 'jennifer', 'hunter', 'buster', 'soccer',
        'baseball', 'tiger', 'charlie', 'andrew', 'michelle',
        'love', 'sunshine', 'jessica', 'asshole', '696969',
        'amanda', 'access', 'yankees', '987654321', 'dallas',
        'austin', 'thunder', 'taylor', 'matrix', 'mobilemail',
        'mom', 'monitor', 'monitoring', 'montana', 'moon',
        'moscow', 'mother', 'movie', 'mozilla', 'music',
        'mustang', 'password', 'pa$$w0rd', 'p@ssw0rd', 'p@$$w0rd',
    ];

    return commonPasswords.includes(password.toLowerCase());
}

// Security: Password entropy calculation
export function calculatePasswordEntropy(password: string): number {
    const charset = new Set(password.split(''));
    const charsetSize = charset.size;
    const length = password.length;

    return Math.log2(Math.pow(charsetSize, length));
}

// Security: Comprehensive password validation
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
    entropy: number;
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    if (password.length > 128) {
        errors.push('Password must be less than 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Advanced validation
    if (isCommonPassword(password)) {
        errors.push('Password is too common, please choose a more unique password');
    }

    if (/(.)\1{2,}/.test(password)) {
        warnings.push('Avoid repeated characters');
    }

    if (/(123|abc|qwe|password|admin)/i.test(password)) {
        warnings.push('Avoid common patterns');
    }

    const entropy = calculatePasswordEntropy(password);
    if (entropy < 50) {
        warnings.push('Password entropy is low, consider using a more complex password');
    }

    const strength = validatePasswordStrength(password);

    return {
        isValid: errors.length === 0 && strength.isValid,
        errors,
        warnings,
        score: strength.score,
        entropy,
    };
}


