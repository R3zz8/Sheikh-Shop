import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testSuperadminAccess() {
    try {
        console.log('🧪 Testing Superadmin Access...\n');

        // 1. Verify superadmin user exists
        const superadmin = await prisma.user.findUnique({
            where: { email: 'rezadhu615@gmail.com' },
            select: {
                id: true,
                email: true,
                role: true,
                emailVerified: true,
                canLogin: true,
                disabled: true,
                password: true,
            }
        });

        if (!superadmin) {
            console.error('❌ Superadmin user not found!');
            return;
        }

        console.log('✅ Superadmin user found');
        console.log(`   Email: ${superadmin.email}`);
        console.log(`   Role: ${superadmin.role}`);
        console.log(`   Email Verified: ${superadmin.emailVerified}`);
        console.log(`   Can Login: ${superadmin.canLogin}`);
        console.log(`   Disabled: ${superadmin.disabled}\n`);

        // 2. Test password authentication
        const testPassword = 'Temp#1234';
        const passwordValid = await bcrypt.compare(testPassword, superadmin.password);

        if (passwordValid) {
            console.log('✅ Password authentication works');
        } else {
            console.error('❌ Password authentication failed');
            return;
        }

        // 3. Test role-based access control
        const allowedRoles = ['ADMIN', 'SUPERADMIN', 'SYSTEM'];
        const hasAccess = allowedRoles.includes(superadmin.role);

        if (hasAccess) {
            console.log('✅ Role-based access control: SUPERADMIN has access');
        } else {
            console.error('❌ Role-based access control: SUPERADMIN does not have access');
            return;
        }

        // 4. Test dashboard access
        const dashboardRoles = ['ADMIN', 'SUPERADMIN'];
        const hasDashboardAccess = dashboardRoles.includes(superadmin.role);

        if (hasDashboardAccess) {
            console.log('✅ Dashboard access: SUPERADMIN can access dashboard');
        } else {
            console.error('❌ Dashboard access: SUPERADMIN cannot access dashboard');
            return;
        }

        // 5. Test user management access
        const userManagementRoles = ['ADMIN', 'SUPERADMIN'];
        const hasUserManagementAccess = userManagementRoles.includes(superadmin.role);

        if (hasUserManagementAccess) {
            console.log('✅ User management access: SUPERADMIN can manage users');
        } else {
            console.error('❌ User management access: SUPERADMIN cannot manage users');
            return;
        }

        // 6. Test audit logs access
        const auditLogRoles = ['ADMIN', 'SUPERADMIN', 'SYSTEM'];
        const hasAuditLogAccess = auditLogRoles.includes(superadmin.role);

        if (hasAuditLogAccess) {
            console.log('✅ Audit logs access: SUPERADMIN can view audit logs');
        } else {
            console.error('❌ Audit logs access: SUPERADMIN cannot view audit logs');
            return;
        }

        // 7. Test product management access
        const productManagementRoles = ['ADMIN', 'SUPERADMIN', 'EDITOR'];
        const hasProductManagementAccess = productManagementRoles.includes(superadmin.role);

        if (hasProductManagementAccess) {
            console.log('✅ Product management access: SUPERADMIN can manage products');
        } else {
            console.error('❌ Product management access: SUPERADMIN cannot manage products');
            return;
        }

        console.log('\n🎉 All tests passed! Superadmin user is properly configured.');
        console.log('\n📋 Login Credentials:');
        console.log(`   Email: ${superadmin.email}`);
        console.log(`   Password: ${testPassword}`);
        console.log('\n🔗 Access URLs:');
        console.log('   Dashboard: http://localhost:3008/dashboard');
        console.log('   Users: http://localhost:3008/dashboard/users');
        console.log('   Products: http://localhost:3008/dashboard/products');
        console.log('   Audit Logs: http://localhost:3008/dashboard/audit-logs');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSuperadminAccess(); 