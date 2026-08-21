import React from 'react';
import { requireSuperAdmin } from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';
import CategoryManagementView, { type CategoryData } from '@/modules/categories/views/CategoryManagementView';

export const dynamic = 'force-dynamic';

export default async function DashboardCategoriesPage() {
  await requireSuperAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const serializedCategories: CategoryData[] = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    imagePublicId: c.imagePublicId,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <CategoryManagementView initialCategories={serializedCategories} />;
}
