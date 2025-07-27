import { z } from 'zod';

// Security: Input validation schemas
export const emailSchema = z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .transform((email) => email.toLowerCase().trim());

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export const productNameSchema = z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name too long')
    .trim();

export const productDescriptionSchema = z
    .string()
    .max(1000, 'Description too long')
    .optional();

export const priceSchema = z
    .number()
    .min(0, 'Price must be non-negative')
    .max(999999.99, 'Price too high');

export const quantitySchema = z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity must be non-negative')
    .max(999999, 'Quantity too high');

// Security: File validation
export const fileSchema = z.object({
    name: z.string().max(255),
    size: z.number().max(5 * 1024 * 1024), // 5MB
    type: z.string().refine(
        (type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(type),
        'Invalid file type'
    ),
});

// Security: UUID validation
export const uuidSchema = z
    .string()
    .uuid('Invalid UUID format');

// Security: Rate limiting validation
export const rateLimitSchema = z.object({
    identifier: z.string(),
    maxRequests: z.number().min(1).max(1000),
    windowMs: z.number().min(1000).max(3600000), // 1 second to 1 hour
});

// Security: Input sanitization functions
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
}

export function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Invalid protocol');
        }
        return parsed.toString();
    } catch {
        throw new Error('Invalid URL');
    }
}

// Security: XSS prevention
export function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Security: CSRF token validation
export function validateCsrfToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) return false;
    return token === storedToken;
}

// Security: Input length validation
export function validateInputLength(input: string, min: number, max: number): boolean {
    const length = input.trim().length;
    return length >= min && length <= max;
}

// Security: Email format validation
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase().trim());
}

// Security: Password strength validation
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Security: Rate limiting helper
export class RateLimiter {
    private attempts = new Map<string, { count: number; resetTime: number }>();

    isRateLimited(identifier: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const record = this.attempts.get(identifier);

        if (!record || now > record.resetTime) {
            this.attempts.set(identifier, { count: 1, resetTime: now + windowMs });
            return false;
        }

        if (record.count >= maxRequests) {
            return true;
        }

        record.count++;
        return false;
    }

    clear(identifier: string): void {
        this.attempts.delete(identifier);
    }

    getRemainingAttempts(identifier: string): number {
        const record = this.attempts.get(identifier);
        if (!record) return 5; // Default max attempts
        return Math.max(0, 5 - record.count);
    }
}

// Security: Export validation schemas
export const validationSchemas = {
    email: emailSchema,
    password: passwordSchema,
    username: usernameSchema,
    productName: productNameSchema,
    productDescription: productDescriptionSchema,
    price: priceSchema,
    quantity: quantitySchema,
    file: fileSchema,
    uuid: uuidSchema,
    rateLimit: rateLimitSchema,
}; 