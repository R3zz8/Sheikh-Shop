import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

// Safe Cloudinary initialization with normalization and diagnostics
export function getCloudinary() {
    const rawCloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
    const rawApiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
    const rawApiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

    if (!rawCloudName || !rawApiKey || !rawApiSecret) {
        console.error('[Cloudinary] Missing environment variables', {
            cloudNamePresent: !!rawCloudName,
            apiKeyPresent: !!rawApiKey,
            apiSecretPresent: !!rawApiSecret,
        });
        throw new Error('Cloudinary environment variables are required');
    }

    const normalizedCloudName = rawCloudName.toLowerCase();
    const normalizedApiKey = rawApiKey;
    const normalizedApiSecret = rawApiSecret;

    cloudinary.config({
        cloud_name: normalizedCloudName,
        api_key: normalizedApiKey,
        api_secret: normalizedApiSecret,
        secure: true,
    });

    if (process.env.NODE_ENV !== 'production') {
        const maskedKey = normalizedApiKey.length >= 6
            ? `${normalizedApiKey.slice(0,3)}***${normalizedApiKey.slice(-3)}`
            : '***';
        console.log('[Cloudinary] Config loaded', {
            cloudName: normalizedCloudName,
            apiKeyMasked: maskedKey,
        });
    }

    return cloudinary;
}

// Lightweight helpers for common transformations
export const cloudinaryHelpers = {
    urlOptimized(publicId: string): string {
        const cloud = getCloudinary();
        return cloud.url(publicId, {
            fetch_format: 'auto',
            quality: 'auto',
        });
    },
    urlThumbnail(publicId: string, width = 300, height = 300): string {
        const cloud = getCloudinary();
        return cloud.url(publicId, {
            width,
            height,
            crop: 'fill',
            gravity: 'auto',
            fetch_format: 'auto',
            quality: 'auto',
        });
    },
    urlResponsive(publicId: string, width: number): string {
        const cloud = getCloudinary();
        return cloud.url(publicId, {
            width,
            crop: 'scale',
            fetch_format: 'auto',
            quality: 'auto',
        });
    },
};
// Diagnostic: ping Cloudinary API to validate credentials
export async function pingCloudinary(): Promise<{ ok: boolean; data?: unknown; error?: unknown }> {
    try {
        const cloud = getCloudinary();
        const res = await cloud.api.ping();
        return { ok: true, data: res };
    } catch (err) {
        console.error('[Cloudinary] ping failed:', err);
        return { ok: false, error: err };
    }
}
