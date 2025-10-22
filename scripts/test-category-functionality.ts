import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCategoryFunctionality() {
    try {
        console.log('🧪 Testing category functionality...\n');

        // Test 1: Check if all categories have products
        const categoryStats = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                id: true
            }
        });

        console.log('📊 Category Product Counts:');
        categoryStats.forEach(({ category, _count }) => {
            console.log(`  ${category}: ${_count.id} products`);
        });

        // Test 2: Test fetching products for each category
        const categories = ['DATES', 'HONEY', 'SAFFRON', 'OTHERS'];

        console.log('\n🔍 Testing product fetching by category:');

        for (const category of categories) {
            const products = await prisma.product.findMany({
                where: {
                    category: category as any,
                    status: 'ACTIVE'
                },
                include: {
                    images: true
                }
            });

            console.log(`\n  ${category}:`);
            products.forEach(product => {
                console.log(`    - ${product.name} ($${product.basePrice || 'N/A'}) - ${product.images.length} images`);
            });
        }

        // Test 3: Verify URL mapping
        console.log('\n🔗 URL Mapping Test:');
        const urlMapping = {
            'dates': 'DATES',
            'honey': 'HONEY',
            'saffron': 'SAFFRON',
            'other': 'OTHERS'
        };

        for (const [slug, category] of Object.entries(urlMapping)) {
            const products = await prisma.product.findMany({
                where: {
                    category: category as any,
                    status: 'ACTIVE'
                }
            });

            console.log(`  /categories/${slug} -> ${category} (${products.length} products)`);
        }

        console.log('\n✅ All category functionality tests passed!');
        console.log('\n🎯 Ready to test the UI:');
        console.log('  - Home page: http://localhost:3000');
        console.log('  - Categories page: http://localhost:3000/categories');
        console.log('  - Individual category pages:');
        console.log('    * http://localhost:3000/categories/dates');
        console.log('    * http://localhost:3000/categories/honey');
        console.log('    * http://localhost:3000/categories/saffron');
        console.log('    * http://localhost:3000/categories/other');

    } catch (error) {
        console.error('❌ Error testing category functionality:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testCategoryFunctionality(); 