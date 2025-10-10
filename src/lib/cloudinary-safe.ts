import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

// Safe Cloudinary initialization that doesn't throw during import
export function getCloudinary() {
    const {
        CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET,
    } = process.env as Record<string, string | undefined>;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary environment variables are required');
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });

    return cloudinary;
}

// Lightweight helpers for common transformations
export const cloudinaryHelpers = {
    urlOptimized(publicId: string): string {
        const cloudinary = getCloudinary();
        return cloudinary.url(publicId, {
            fetch_format: 'auto',
            quality: 'auto',
        });
    },
    urlThumbnail(publicId: string, width = 300, height = 300): string {
        const cloudinary = getCloudinary();
        return cloudinary.url(publicId, {
            width,
            height,
            crop: 'fill',
            gravity: 'auto',
            fetch_format: 'auto',
            quality: 'auto',
        });
    },
    urlResponsive(publicId: string, width: number): string {
        const cloudinary = getCloudinary();
        return cloudinary.url(publicId, {
            width,
            crop: 'scale',
            fetch_format: 'auto',
            quality: 'auto',
        });
    },
};

export async function pingCloudinary(): Promise<{ ok: boolean; error?: any }> {
    try {
        const cld = getCloudinary();
        const result = await cld.api.ping();
        return { ok: result.status === 'ok' };
    } catch (error) {
        console.error('[Cloudinary] ping failed:', error);
        return { ok: false, error };
    }
}
