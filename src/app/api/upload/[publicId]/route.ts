import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { prisma } from '@/lib/prisma';
import { getServerSession as getNextAuthServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    // RBAC: Only SUPER_ADMIN, ADMIN, EDITOR can delete
    // Get user role from middleware headers (middleware handles auth)
    const userRole = req.headers.get('x-user-role');
    const allowed = userRole === 'SUPERADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'EDITOR';
    if (!allowed) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[UPLOAD DELETE RBAC] Unauthorized delete attempt, role:', userRole);
      }
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




