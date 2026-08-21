import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      return NextResponse.json({ error: 'شما دسترسی لازم برای این عملیات را ندارید.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی نامعتبر است.' }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, isActive, sortOrder, slug, image } = body;

    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد.' }, { status: 404 });
    }

    if (image !== undefined && (!image || typeof image !== 'string' || image.trim() === '')) {
      return NextResponse.json({ error: 'دسته‌بندی باید همواره دارای یک تصویر معتبر باشد.' }, { status: 400 });
    }

    if (name && name !== existingCategory.name) {
      const nameConflict = await prisma.category.findFirst({
        where: { name, id: { not: id } }
      });
      if (nameConflict) {
        return NextResponse.json({ error: 'دسته‌بندی دیگری با این نام وجود دارد.' }, { status: 409 });
      }
    }

    if (slug && slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findFirst({
        where: { slug, id: { not: id } }
      });
      if (slugConflict) {
        return NextResponse.json({ error: 'دسته‌بندی دیگری با این نام مستعار (Slug) وجود دارد.' }, { status: 409 });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) })
      }
    });

    await cacheService.del('categories_list_false_false');
    await cacheService.del('categories_list_true_false');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/categories');
    } catch (e) {
      // Ignore static generation store missing in unit tests
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory
    });
  } catch (error: any) {
    console.error('[CATEGORY UPDATE ERROR]:', error);
    return NextResponse.json({ error: 'خطا در ویرایش اطلاعات دسته‌بندی.' }, { status: 500 });
  }
}
