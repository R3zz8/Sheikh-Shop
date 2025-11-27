// src/app/api/admin/mobile-carousel/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromToken } from '@/lib/jwt';
import { prisma } from '@/utils/prisma';

export const dynamic = "force-dynamic";

const carouselSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  link: z.string().url('Link must be a valid URL').optional(),
  order: z.number().int().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Health-check log: PUT /api/admin/mobile-carousel/${params.id}`);
  }

  try {
    const user = getUserFromToken(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const validation = carouselSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
    }

    const { title, image, link, order } = validation.data;

    const updatedSlide = await prisma.mobileCarousel.update({
      where: { id },
      data: {
        title,
        image,
        link,
        order,
      },
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_PUT]', error);
    return NextResponse.json({ message: 'An error occurred while updating the carousel slide' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Health-check log: DELETE /api/admin/mobile-carousel/${params.id}`);
  }

  try {
    const user = getUserFromToken(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.mobileCarousel.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[MOBILE_CAROUSEL_DELETE]', error);
    return NextResponse.json({ message: 'An error occurred while deleting the carousel slide' }, { status: 500 });
  }
}
