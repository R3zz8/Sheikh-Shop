require('dotenv').config();
const { prisma } = require('../src/lib/prisma');

async function main() {
  const productId = 'dcf36af5-71dd-4418-94e1-b109c3ccbb38';
  console.log(`Resetting images for product ${productId}...`);

  // Delete all existing images for this product
  const deleteRes = await prisma.image.deleteMany({
    where: { productId }
  });
  console.log(`Deleted images count: ${deleteRes.count}`);

  // Insert 4 new mock images
  const imagesData = [
    {
      image: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000001/cat1.jpg',
      secureUrl: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000001/cat1.jpg',
      isFeatured: true,
      isVisible: true,
      sortOrder: 0,
      productId
    },
    {
      image: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000002/cat2.jpg',
      secureUrl: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000002/cat2.jpg',
      isFeatured: false,
      isVisible: true,
      sortOrder: 1,
      productId
    },
    {
      image: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000003/cat3.jpg',
      secureUrl: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000003/cat3.jpg',
      isFeatured: false,
      isVisible: true,
      sortOrder: 2,
      productId
    },
    {
      image: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000004/cat4.jpg',
      secureUrl: 'https://res.cloudinary.com/dnbjvkr3n/image/upload/v1700000004/cat4.jpg',
      isFeatured: false,
      isVisible: true,
      sortOrder: 3,
      productId
    }
  ];

  for (const img of imagesData) {
    await prisma.image.create({
      data: img
    });
  }

  console.log('✅ Successfully reset and created 4 mock images in Postgres!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
