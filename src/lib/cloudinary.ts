import { v2 as cloudinary } from 'cloudinary';

// Ensure required environment variables exist
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env as Record<string, string | undefined>;

// Do not throw at import time; log once. Enforce in route handler before use.
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Cloudinary env vars not set, using fallbacks for development');
    }
}

// Configure cloudinary with fallbacks for development
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME || 'dev-cloud-name',
    api_key: CLOUDINARY_API_KEY || 'dev-api-key',
    api_secret: CLOUDINARY_API_SECRET || 'dev-api-secret',
    secure: true,
});

export default cloudinary;
