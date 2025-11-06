import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductCategory, ProductCategoryType } from '@prisma/client';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'This endpoint is for testing only' }, { status: 403 });
  }

  const { name, category, categoryType, price, quantity } = await request.json();

  const product = await prisma.product.create({
    data: {
      name,
      category: category as ProductCategory,
      categoryType: categoryType as ProductCategoryType,
      basePrice: price,
      quantity,
    },
  });

  return NextResponse.json(product);
}
