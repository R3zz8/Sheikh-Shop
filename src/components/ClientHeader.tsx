'use client';
import { MonitorSmartphone } from 'lucide-react';
import Link from 'next/link';
import CartDropdown from '@/components/cart';
import { useUser } from '@/hooks/useUser';

export default function ClientHeader() {
    const { data: user, refetch } = useUser();

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        refetch();
        window.location.href = '/login';
    };

    return (
        <header className="fixed flex justify-between items-center shadow-xl bg-white/80 backdrop-blur-md px-6 md:px-20 w-full h-20 z-40">
            <div className="flex items-center gap-3">
                <MonitorSmartphone />
                <Link href="/" className="font-bold text-2xl tracking-wide">
                    Sheikh Shop
                </Link>
            </div>
            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <span className="font-semibold tracking-wide px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md text-gray-900">
                            Welcome, {user.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="font-semibold tracking-wide px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150 text-gray-900 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="hidden sm:block">
                            <button
                                className="font-semibold tracking-wide px-5 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150 text-gray-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                Login
                            </button>
                        </Link>
                        <Link href="/register" className="hidden sm:block">
                            <button
                                className="font-semibold tracking-wide px-5 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150 text-gray-900 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                            >
                                Sign Up
                            </button>
                        </Link>
                    </>
                )}
                <CartDropdown />
            </div>
        </header>
    );
} 