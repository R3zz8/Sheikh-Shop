import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Starting image upload to Cloudinary...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No file provided in upload request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📁 File details: ${file.name}, ${file.size} bytes, ${file.type}`);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.error(`❌ Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('☁️  Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'articles',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, height: 630, crop: 'limit' }
          ]
        },
        (error: any, result: any) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', result?.public_id);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const uploadResult = result as any;

    console.log('🎉 Upload completed successfully');
    console.log('📊 Upload details:', {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height
    });

  } catch (error: any) {
    console.error('💥 Upload failed with error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Upload failed' 
      },
      { status: 500 }
    );
  }
}
