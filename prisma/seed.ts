import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { generateSystemUserToken } from '../src/lib/auth/jwt';

const prisma = new PrismaClient();

async function main() {
    // Create system user (existing logic)
    const systemEmail = 'system@myapp.com';
    const randomPassword = crypto.randomBytes(32).toString('hex');
    await prisma.user.upsert({
        where: { email: systemEmail },
        update: {
            role: 'SYSTEM',
            canLogin: false,
            password: randomPassword,
            disabled: false,
        },
        create: {
            email: systemEmail,
            password: randomPassword,
            role: 'SYSTEM',
            canLogin: false,
            disabled: false,
            emailVerified: true,
        },
    });
    console.log('System user seeded/updated.');

    // Create superadmin user
    const superadminEmail = 'rezadhu615@gmail.com';
    const superadminPassword = 'Temp#1234'; // This will be hashed
    const hashedPassword = await bcrypt.hash(superadminPassword, 10);

    await prisma.user.upsert({
        where: { email: superadminEmail },
        update: {
            role: 'SUPERADMIN',
            password: hashedPassword,
            emailVerified: true,
            canLogin: true,
            disabled: false,
        },
        create: {
            email: superadminEmail,
            password: hashedPassword,
            role: 'SUPERADMIN',
            emailVerified: true,
            canLogin: true,
            disabled: false,
        },
    });
    console.log('Superadmin user seeded/updated.');
    console.log('Superadmin credentials:');
    console.log(`Email: ${superadminEmail}`);
    console.log(`Password: ${superadminPassword}`);
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    // Generate system user token (existing logic)
    const user = await prisma.user.findUnique({ where: { email: systemEmail } });
    if (user) {
        const token = generateSystemUserToken({ id: user.id, email: user.email, role: user.role });
        console.log('System user JWT (for internal use only):', token);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 