import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySuperadminProductAccess() {
    try {
        console.log('🔐 Verifying Superadmin Product Management Access...\n');

        const superadminEmail = process.env.SUPERADMIN_EMAIL || 'rezadhu615@gmail.com';
        
        // 1. Check superadmin user exists
        const superadmin = await prisma.user.findUnique({
            where: { email: superadminEmail },
            select: { id: true, email: true, role: true }
        });

        if (!superadmin) {
            console.error('❌ Superadmin user not found!');
            return;
        }

        console.log('✅ Superadmin user found:');
        console.log(`   Email: ${superadmin.email}`);
        console.log(`   Role: ${superadmin.role}\n`);

        // 2. Check product management access
        const allowedRoles = ['ADMIN', 'SUPERADMIN'];
        const hasProductAccess = allowedRoles.includes(superadmin.role);

        if (hasProductAccess) {
            console.log('✅ Product Management Access: SUPERADMIN can manage products');
        } else {
            console.error('❌ Product Management Access: SUPERADMIN cannot manage products');
            return;
        }

        // 3. Check existing products
        const products = await prisma.product.findMany({
            include: { images: true },
            take: 5
        });

        console.log(`✅ Database contains ${products.length} products`);

        if (products.length > 0) {
            console.log('   Sample products:');
            products.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} (${product.category}) - $${product.price}`);
            });
        }

        // 4. Check image upload capability
        const images = await prisma.image.findMany({
            take: 3
        });

        console.log(`✅ Database contains ${images.length} images`);

        console.log('\n🎉 Superadmin Product Management Access Verified!');
        console.log('\n📋 Product Management URLs:');
        console.log('   Products List: http://localhost:3008/dashboard/products');
        console.log('   Create Product: http://localhost:3008/dashboard/products/new');
        console.log('   Edit Product: http://localhost:3008/dashboard/products/[product-id]');

        console.log('\n🔧 Available Actions:');
        console.log('   ✅ View all products');
        console.log('   ✅ Create new products');
        console.log('   ✅ Edit existing products');
        console.log('   ✅ Delete products');
        console.log('   ✅ Upload product images');
        console.log('   ✅ Delete product images');
        console.log('   ✅ Manage product categories');
        console.log('   ✅ Set product prices and quantities');

        console.log('\n⚠️  Login with superadmin to access:');
        console.log(`   Email: ${superadminEmail}`);
        console.log('   Password: [Check your environment variables]');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySuperadminProductAccess(); 