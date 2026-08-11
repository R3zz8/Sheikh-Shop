import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- DB connection test ---');
  try {
    const count = await prisma.product.count();
    console.log('Total products:', count);

    const productId = 'dcf36af5-71dd-4418-94e1-b109c3ccbb38';
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!product) {
      console.log(`Product with ID ${productId} not found!`);
      // Let's look for any other product or print first 3 products
      const firstThree = await prisma.product.findMany({
        take: 3,
        include: { images: true }
      });
      console.log('First 3 products in DB:', JSON.stringify(firstThree, null, 2));
    } else {
      console.log('Product Name:', product.name);
      console.log('Slug:', product.slug);
      console.log('Images count:', product.images.length);
      console.log('Images details:', JSON.stringify(product.images, null, 2));
    }
  } catch (error) {
    console.error('Error during database check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
