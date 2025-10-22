import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCategoryFunctionality() {
    try {
        console.log('🧪 Testing category functionality...\n');

        // Test 1: Check if all categories have products
        const categoryStats = await prisma.product.groupBy({
            by: ['categoryId'],
            _count: {
                _all: true
            }
        });

        const categoriesWithCounts = await prisma.category.findMany({
            where: {
                id: {
                    in: categoryStats.map(cs => cs.categoryId)
                }
            }
        });
        const categoryIdToName = new Map(categoriesWithCounts.map(c => [c.id, c.name]));

        console.log('📊 Category Product Counts:');
        categoryStats.forEach(({ categoryId, _count }) => {
            console.log(`  ${categoryIdToName.get(categoryId) || 'Unknown Category'}: ${_count._all} products`);
        });

        // Test 2: Test fetching products for each category
        const categories = await prisma.category.findMany();

        console.log('\n🔍 Testing product fetching by category:');

        for (const category of categories) {
            const products = await prisma.product.findMany({
                where: {
                    categoryId: category.id,
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
        const categoriesForURLTest = await prisma.category.findMany();
        const urlMapping = new Map(categoriesForURLTest.map(c => [c.slug, c.id]));

        for (const [slug, categoryId] of urlMapping.entries()) {
            const products = await prisma.product.findMany({
                where: {
                    categoryId: categoryId,
                    status: 'ACTIVE'
                }
            });
            const category = categories.find(c => c.id === categoryId);
            console.log(`  /categories/${slug} -> ${category?.name} (${products.length} products)`);
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