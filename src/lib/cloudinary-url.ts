/**
 * Utility to apply Cloudinary image transformations to raw Cloudinary URLs.
 * Automatically injects format, quality, width, height, and crop options.
 * Safe for client and server execution.
 */

export interface CloudinaryTransformOptions {
    width?: number;
    height?: number;
    quality?: number | string;
    crop?: 'fill' | 'scale' | 'limit' | 'fit' | 'thumb' | 'pad' | string;
    format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif' | string;
}

export function getOptimizedCloudinaryUrl(
    url: string | null | undefined,
    options: CloudinaryTransformOptions = {}
): string {
    if (!url || typeof url !== 'string') {
        return url || '';
    }

    // Pass through non-Cloudinary images (e.g. local /sheikhhome.webp, /noImage.jpg, data URLs)
    if (!url.includes('res.cloudinary.com') && !url.includes('cloudinary.com')) {
        return url;
    }

    // Check if the URL contains /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        return url;
    }

    const prefix = url.substring(0, uploadIndex + 8); // includes '/upload/'
    let suffix = url.substring(uploadIndex + 8);

    // Remove existing transformation string if already present before /v1/ or public ID
    // Transformation segments don't start with 'v1', 'v2', etc. (version numbers) and contain '_' or ','
    const suffixParts = suffix.split('/');
    if (
        suffixParts.length > 1 &&
        suffixParts[0] &&
        !/^v\d+$/.test(suffixParts[0]) &&
        (suffixParts[0].includes('_') || suffixParts[0].includes(','))
    ) {
        // Drop existing initial transformation segment
        suffix = suffixParts.slice(1).join('/');
    }

    const transforms: string[] = [];

    // Format
    transforms.push(options.format ? `f_${options.format}` : 'f_auto');

    // Quality
    if (options.quality) {
        transforms.push(`q_${options.quality}`);
    } else {
        transforms.push('q_auto');
    }

    // Dimensions & Crop
    if (options.width) {
        transforms.push(`w_${options.width}`);
    }
    if (options.height) {
        transforms.push(`h_${options.height}`);
    }
    if (options.crop) {
        transforms.push(`c_${options.crop}`);
    } else if (options.width || options.height) {
        transforms.push('c_limit');
    }

    const transformStr = transforms.join(',');

    return `${prefix}${transformStr}/${suffix}`;
}
