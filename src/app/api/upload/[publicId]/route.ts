import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    // RBAC: Only SUPERADMIN, ADMIN, EDITOR can delete
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      console.warn('[UPLOAD DELETE RBAC] Unauthorized delete attempt');
      return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    const { publicId } = params;
    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    // Delete from Cloudinary first
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId);

    // Delete from database (publicId is optional field, match records that have it)
    await prisma.image.deleteMany({ where: { publicId: { equals: publicId } } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Cloudinary delete error:', err);
    }
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}




