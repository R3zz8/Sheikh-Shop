'use client';
import {
    Crown,
    Home,
    ShoppingBag,
    Users,
    FileText,
    LogOut,
    ShoppingCart,
    Sparkles,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import CartDropdown from '@/components/cart';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function ClientHeader() {
    const { data: user, refetch } = useUser();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        refetch();
        window.location.href = '/login';
    };

    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Products', href: '/products', icon: ShoppingBag },
        { name: 'About Us', href: '/about', icon: Users },
        { name: 'Article', href: '/article', icon: FileText },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Subtle background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-2xl border-b border-amber-200/10" />
            <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
                <nav className="flex items-center justify-between h-20">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Crown className="w-8 h-8 text-amber-300" />
                            <Link href="/" className="font-bold text-2xl tracking-wide bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                                Sheikh Shop
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "relative group px-6 py-3 rounded-xl transition-all duration-300",
                                        "flex items-center gap-2 font-medium text-sm",
                                        active
                                            ? "text-amber-200 bg-white/12 backdrop-blur-sm border border-amber-200/20"
                                            : "text-gray-300 hover:text-amber-200 hover:bg-white/8 backdrop-blur-sm"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-4 h-4 transition-all duration-300",
                                        active ? "text-amber-300" : "text-gray-400 group-hover:text-amber-300"
                                    )} />
                                    {item.name}

                                    {/* Active indicator */}
                                    {active && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 rounded-full" />
                                    )}

                                    {/* Hover glow effect */}
                                    <div className={cn(
                                        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                                        "bg-gradient-to-r from-amber-200/10 via-yellow-200/8 to-orange-200/10",
                                        "group-hover:opacity-100"
                                    )} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - User actions */}
                    <div className="flex items-center gap-3">
                        {/* User info and logout */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 backdrop-blur-sm border border-white/20 shadow-lg">
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                    <span className="text-gray-200 text-sm font-medium">
                                        Welcome, {user.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl",
                                        "bg-gradient-to-r from-amber-600/20 via-yellow-600/20 to-orange-600/20",
                                        "backdrop-blur-sm border border-amber-500/30 shadow-lg",
                                        "text-amber-200 hover:text-white font-medium text-sm",
                                        "hover:bg-gradient-to-r hover:from-amber-600/30 hover:via-yellow-600/30 hover:to-orange-600/30",
                                        "hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-900/20",
                                        "transform hover:-translate-y-0.5 transition-all duration-300",
                                        "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                                    )}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link href="/login">
                                    <button className={cn(
                                        "px-4 py-2 rounded-xl bg-white/8 backdrop-blur-sm",
                                        "border border-white/20 text-gray-200 hover:text-white",
                                        "font-medium text-sm transition-all duration-300",
                                        "hover:bg-white/12 hover:border-white/30",
                                        "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                                    )}>
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className={cn(
                                        "px-4 py-2 rounded-xl",
                                        "bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600",
                                        "hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700",
                                        "text-white font-medium text-sm border border-amber-500/30",
                                        "shadow-lg hover:shadow-xl hover:shadow-amber-900/20",
                                        "transform hover:-translate-y-0.5 transition-all duration-300",
                                        "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                                    )}>
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Cart */}
                        <div className="relative">
                            <CartDropdown />
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={cn(
                                "lg:hidden p-2 rounded-xl bg-white/8 backdrop-blur-sm",
                                "border border-white/20 text-gray-300 hover:text-white",
                                "transition-all duration-300 hover:bg-white/12 hover:border-white/30",
                                "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                            )}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden">
                        <div className="py-4 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                                            "text-sm font-medium",
                                            active
                                                ? "text-amber-200 bg-white/12 backdrop-blur-sm border border-amber-200/20"
                                                : "text-gray-300 hover:text-amber-200 hover:bg-white/8 backdrop-blur-sm"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-4 h-4",
                                            active ? "text-amber-300" : "text-gray-400"
                                        )} />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile user actions */}
                            {user ? (
                                <div className="pt-4 border-t border-amber-200/10 space-y-2">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 backdrop-blur-sm border border-white/20">
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span className="text-gray-200 text-sm">
                                            Welcome, {user.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-4 py-2 rounded-xl",
                                            "bg-gradient-to-r from-amber-600/20 via-yellow-600/20 to-orange-600/20",
                                            "backdrop-blur-sm border border-amber-500/30",
                                            "text-amber-200 hover:text-white font-medium text-sm",
                                            "hover:bg-gradient-to-r hover:from-amber-600/30 hover:via-yellow-600/30 hover:to-orange-600/30",
                                            "transition-all duration-300"
                                        )}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-amber-200/10 space-y-2">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className={cn(
                                            "w-full px-4 py-2 rounded-xl bg-white/8 backdrop-blur-sm",
                                            "border border-white/20 text-gray-200 hover:text-white",
                                            "font-medium text-sm transition-all duration-300",
                                            "hover:bg-white/12 hover:border-white/30"
                                        )}>
                                            Login
                                        </button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className={cn(
                                            "w-full px-4 py-2 rounded-xl",
                                            "bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600",
                                            "hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700",
                                            "text-white font-medium text-sm border border-amber-500/30",
                                            "shadow-lg hover:shadow-xl hover:shadow-amber-900/20",
                                            "transition-all duration-300"
                                        )}>
                                            Sign Up
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
} 