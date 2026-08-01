import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { rateLimit } from '@/lib/rateLimit';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        let userId: string;
        try {
            userId = await getCurrentUserId();
        } catch {
            return NextResponse.json({ error: 'برای بارگذاری فایل باید وارد حساب خود شوید.' }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = await rateLimit(`review_upload:${ip}`, 10, 60); // 10 uploads per min max
        if (!rl.allowed) {
            return NextResponse.json({ error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.' }, { status: 429 });
        }

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'فایلی ارسال نشده است.' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'فرمت فایل معتبر نیست. تنها تصاویر JPG, PNG, WEBP یا ویدیوهای MP4, WebM, MOV مجاز هستند.' }, { status: 400 });
        }

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (isImage && file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json({ error: 'حجم تصویر بیش از حد مجاز است. حداکثر حجم ۲ مگابایت می‌باشد.' }, { status: 413 });
        }

        if (isVideo && file.size > MAX_VIDEO_SIZE) {
            return NextResponse.json({ error: 'حجم ویدیو بیش از حد مجاز است. حداکثر حجم ۱۵ مگابایت می‌باشد.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudinary = getCloudinary();
        const resourceType = isImage ? 'image' : 'video';
        const folder = isImage ? 'digitalshop/reviews/images' : 'digitalshop/reviews/videos';

        const uploadResult: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: resourceType,
                    overwrite: false,
                    transformation: isImage ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
                },
                (error: any, result: any) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                },
            );
            stream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            type: resourceType,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        }, { status: 200 });

    } catch (err: any) {
        console.error('[REVIEW UPLOAD ERROR]', err);
        return NextResponse.json({ error: 'بارگذاری فایل با خطا مواجه شد.' }, { status: 500 });
    }
}
