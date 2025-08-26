'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Folder, Lock, Store, ArrowUp } from 'lucide-react';

interface NavItem {
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    label: string;
}

const navItems: NavItem[] = [
    {
        icon: User,
        href: '/user',
        label: 'Profile'
    },
    {
        icon: Folder,
        href: '/categories',
        label: 'Categories'
    },
    {
        icon: Lock,
        href: '/products',
        label: 'Shop'
    },
    {
        icon: Store,
        href: '/',
        label: 'Home'
    },
    {
        icon: ArrowUp,
        href: '/',
        label: 'Top'
    }
];

export default function MobileFooter() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isCenter = index === 2; // Lock icon (Shop)
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={`${item.href}-${index}`}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 transition-colors duration-200 ${isActive && !isCenter
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            aria-label={item.label}
                        >
                            {isCenter ? (
                                // Special styling for the center Lock icon
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-amber-600 dark:bg-amber-500 shadow-lg flex items-center justify-center -mt-4">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    {/* Notification dot */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                </div>
                            ) : (
                                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                            )}

                            {!isCenter && (
                                <span className="text-xs mt-1 font-medium">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

