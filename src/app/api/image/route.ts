//GET,POST,DELETE

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Security: File validation schema
const fileSchema = z.object({
  file: z.instanceof(File),
  productId: z.string().uuid('Invalid product ID'),
});

// Security: Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Security: Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
  }

  return { valid: true };
}

// Security: Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Security: Validate input
    const validationResult = fileSchema.safeParse({
      file: formData.get('file'),
      productId: formData.get('productId'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { file, productId } = validationResult.data;

    // Security: Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 },
      );
    }

    // Security: Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Security: Create secure upload directory
    const uploadDir = path.join(process.cwd(), 'public/assets', productId);
    await mkdir(uploadDir, { recursive: true });

    // Security: Sanitize filename and create unique name
    const sanitizedFilename = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Security: Write file to disk
    await writeFile(filePath, buffer);

    // Security: Construct the public URL
    const fileUrl = `/assets/${productId}/${uniqueFilename}`;

    // Security: Save to database with error handling
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        images: {
          create: { image: fileUrl },
        },
      },
      include: { images: true },
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      data: updatedProduct?.images,
    });

  } catch (error) {
    // Security: Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Image upload error:', error);
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      );
    }

    // Security: Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 },
      );
    }

    const images = await prisma.image.findMany({
      where: { productId },
      select: { id: true, image: true, productId: true },
    });

    return NextResponse.json({ images });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Image fetch error:', error);
    }

    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 },
      );
    }

    // Security: Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imageId)) {
      return NextResponse.json(
        { error: 'Invalid image ID format' },
        { status: 400 },
      );
    }

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: { product: true },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 },
      );
    }

    // Security: Construct the file path from stored URL
    const imagePath = path.join(process.cwd(), 'public', image.image);

    // Security: Remove the image file from the filesystem
    try {
      await unlink(imagePath);
    } catch (fileError) {
      // File might not exist, continue with DB deletion
      if (process.env.NODE_ENV === 'development') {
        console.warn('File not found during deletion:', imagePath);
      }
    }

    // Security: Delete from database
    await prisma.image.delete({ where: { id: imageId } });

    return NextResponse.json(
      {
        message: 'Image deleted successfully',
        data: image.productId,
      },
      { status: 200 },
    );

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Image deletion error:', error);
    }

    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    );
  }
}
