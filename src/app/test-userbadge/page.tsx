import { prisma } from '@/lib/prisma';
import UserBadge from '@/components/UserBadge';

export default async function TestUserBadgePage() {
    // Get a few sample users for testing
    const users = await prisma.user.findMany({
        take: 5,
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            gender: true,
            profilePicture: true,
            role: true,
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    UserBadge Component Demo
                </h1>

                <div className="space-y-8">
                    {/* Default Variant */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-4">Default Variant</h2>
                        <div className="flex flex-wrap gap-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex flex-col items-center gap-2">
                                    <UserBadge user={user} />
                                    <span className="text-gray-400 text-sm text-center max-w-[200px]">
                                        {user.email}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Compact Variant */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-4">Compact Variant</h2>
                        <div className="flex flex-wrap gap-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex flex-col items-center gap-2">
                                    <UserBadge user={user} variant="compact" />
                                    <span className="text-gray-400 text-sm text-center max-w-[100px]">
                                        {user.email}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Mobile Variant */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-4">Mobile Variant</h2>
                        <div className="space-y-4 max-w-md">
                            {users.map((user) => (
                                <div key={user.id}>
                                    <UserBadge user={user} variant="mobile" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* User Information */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-4">User Information</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {users.map((user) => (
                                <div key={user.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <UserBadge user={user} variant="compact" />
                                        <div>
                                            <h3 className="text-white font-medium">
                                                {user.username || `${user.firstName} ${user.lastName}` || user.email}
                                            </h3>
                                            <p className="text-gray-400 text-sm">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-400">Email:</span> <span className="text-white">{user.email}</span></p>
                                        <p><span className="text-gray-400">Gender:</span> <span className="text-white">{user.gender || 'Not specified'}</span></p>
                                        <p><span className="text-gray-400">Username:</span> <span className="text-white">{user.username || 'Not set'}</span></p>
                                        <p><span className="text-gray-400">Name:</span> <span className="text-white">
                                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}
                                        </span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 