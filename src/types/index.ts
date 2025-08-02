import { Prisma } from '@prisma/client';

export type ProductsWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export type CartWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

export type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        email: true;
      };
    };
  };
}>;

export type Article = Prisma.ArticleGetPayload<{}>;
