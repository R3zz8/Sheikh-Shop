import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP allowed.' }, { status: 400 });
        }

        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'File too large. Max size is 2MB.' }, { status: 413 });
        }

        // Convert to buffer for upload_stream
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'digitalshop/products',
                    resource_type: 'image',
                    overwrite: true,
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );
            stream.end(buffer);
        });

        return NextResponse.json(
            {
                success: true,
                url: uploadResult.secure_url as string,
                publicId: uploadResult.public_id as string,
            },
            { status: 200 },
        );
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Cloudinary upload error:', err);
        }
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
