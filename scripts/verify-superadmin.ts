import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySuperadmin() {
    try {
        const superadminEmail = process.env.SUPERADMIN_EMAIL || 'rezadhu615@gmail.com';
        
        const superadmin = await prisma.user.findUnique({
            where: { email: superadminEmail },
            select: {
                id: true,
                email: true,
                role: true,
                emailVerified: true,
                canLogin: true,
                disabled: true,
                createdAt: true,
            }
        });

        if (!superadmin) {
            console.error('❌ Superadmin user not found!');
            return;
        }

        console.log('✅ Superadmin user found:');
        console.log(`ID: ${superadmin.id}`);
        console.log(`Email: ${superadmin.email}`);
        console.log(`Role: ${superadmin.role}`);
        console.log(`Email Verified: ${superadmin.emailVerified}`);
        console.log(`Can Login: ${superadmin.canLogin}`);
        console.log(`Disabled: ${superadmin.disabled}`);
        console.log(`Created: ${superadmin.createdAt}`);

        if (superadmin.role === 'SUPERADMIN' && superadmin.emailVerified && superadmin.canLogin && !superadmin.disabled) {
            console.log('\n🎉 Superadmin user is properly configured and ready to use!');
            console.log('You can now login with:');
            console.log(`Email: ${superadminEmail}`);
            console.log('Password: [Check your environment variables]');
            console.log('\n⚠️  Remember to change the password after first login!');
        } else {
            console.error('❌ Superadmin user configuration is incorrect!');
        }
    } catch (error) {
        console.error('Error verifying superadmin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySuperadmin(); 