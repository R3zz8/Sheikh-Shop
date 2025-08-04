import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategoryProducts() {
    try {
        console.log('🌱 Seeding category products...');

        // Sample products for each category
        const sampleProducts = [
            // Dates Category
            {
                name: 'Premium Medjool Dates',
                category: 'DATES',
                description: 'Sweet and succulent Medjool dates, perfect for snacking or dessert.',
                price: 24.99,
                quantity: 50,
                status: 'ACTIVE',
                images: ['/dates.jpg']
            },
            {
                name: 'Organic Deglet Noor Dates',
                category: 'DATES',
                description: 'Traditional Deglet Noor dates with a delicate, honey-like flavor.',
                price: 19.99,
                quantity: 75,
                status: 'ACTIVE',
                images: ['/dates.jpg']
            },
            {
                name: 'Date Assortment Gift Box',
                category: 'DATES',
                description: 'Luxury gift box featuring a variety of premium date varieties.',
                price: 39.99,
                quantity: 25,
                status: 'ACTIVE',
                images: ['/dates.jpg']
            },

            // Honey Category
            {
                name: 'Pure Wildflower Honey',
                category: 'HONEY',
                description: 'Natural wildflower honey harvested from pristine meadows.',
                price: 18.99,
                quantity: 60,
                status: 'ACTIVE',
                images: ['/honey.jpg']
            },
            {
                name: 'Manuka Honey Premium Grade',
                category: 'HONEY',
                description: 'Premium Manuka honey with exceptional antibacterial properties.',
                price: 89.99,
                quantity: 30,
                status: 'ACTIVE',
                images: ['/honey.jpg']
            },
            {
                name: 'Organic Acacia Honey',
                category: 'HONEY',
                description: 'Light and delicate acacia honey with a subtle floral taste.',
                price: 22.99,
                quantity: 45,
                status: 'ACTIVE',
                images: ['/honey.jpg']
            },

            // Saffron Category
            {
                name: 'Premium Persian Saffron',
                category: 'SAFFRON',
                description: 'The finest Persian saffron threads with intense color and aroma.',
                price: 149.99,
                quantity: 20,
                status: 'ACTIVE',
                images: ['/saffron.jpg']
            },
            {
                name: 'Spanish Saffron Threads',
                category: 'SAFFRON',
                description: 'High-quality Spanish saffron with rich flavor and color.',
                price: 89.99,
                quantity: 35,
                status: 'ACTIVE',
                images: ['/saffron.jpg']
            },
            {
                name: 'Saffron Gift Set',
                category: 'SAFFRON',
                description: 'Luxury saffron gift set with premium packaging.',
                price: 199.99,
                quantity: 15,
                status: 'ACTIVE',
                images: ['/saffron.jpg']
            },

            // Other Category
            {
                name: 'Premium Black Tea',
                category: 'OTHERS',
                description: 'Exquisite black tea blend with rich, full-bodied flavor.',
                price: 15.99,
                quantity: 80,
                status: 'ACTIVE',
                images: ['/other.jpg']
            },
            {
                name: 'Organic Green Tea',
                category: 'OTHERS',
                description: 'Fresh organic green tea with delicate, refreshing taste.',
                price: 12.99,
                quantity: 90,
                status: 'ACTIVE',
                images: ['/other.jpg']
            },
            {
                name: 'Herbal Tea Collection',
                category: 'OTHERS',
                description: 'Assorted herbal tea collection with natural ingredients.',
                price: 29.99,
                quantity: 40,
                status: 'ACTIVE',
                images: ['/other.jpg']
            }
        ];

        // Create products and their images
        for (const productData of sampleProducts) {
            const { images, ...productInfo } = productData;

            const product = await prisma.product.create({
                data: {
                    ...productInfo,
                    category: productInfo.category as any,
                    status: productInfo.status as any
                }
            });

            // Create images for the product
            for (const imageUrl of images) {
                await prisma.image.create({
                    data: {
                        image: imageUrl,
                        productId: product.id
                    }
                });
            }

            console.log(`✅ Created product: ${product.name}`);
        }

        console.log('🎉 Category products seeded successfully!');

        // Display summary
        const productCounts = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                id: true
            }
        });

        console.log('\n📊 Product Summary:');
        productCounts.forEach(({ category, _count }) => {
            console.log(`${category}: ${_count.id} products`);
        });

    } catch (error) {
        console.error('❌ Error seeding category products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeding function
seedCategoryProducts(); 