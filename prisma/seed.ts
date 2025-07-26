import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { generateSystemUserToken } from '../src/lib/auth/jwt';

const prisma = new PrismaClient();

async function main() {
    const systemEmail = 'system@myapp.com';
    const randomPassword = crypto.randomBytes(32).toString('hex');
    await prisma.user.upsert({
        where: { email: systemEmail },
        update: {
            role: 'system',
            canLogin: false,
            password: randomPassword,
            disabled: false,
        },
        create: {
            email: systemEmail,
            password: randomPassword,
            role: 'system',
            canLogin: false,
            disabled: false,
            emailVerified: true,
        },
    });
    console.log('System user seeded/updated.');
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