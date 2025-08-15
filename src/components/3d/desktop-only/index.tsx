'use client';

import { useEffect, useState } from 'react';

interface DesktopOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function DesktopOnly({ children, fallback }: DesktopOnlyProps) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkDevice = () => {
            const isDesktopDevice = window.innerWidth >= 1024 && !navigator.userAgent.includes('Mobile');
            setIsDesktop(isDesktopDevice);
            setIsLoading(false);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-amber-700 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isDesktop) {
        return fallback || (
            <div className="w-full h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <p className="text-amber-700 font-medium">Enhanced Experience on Desktop</p>
                    <p className="text-amber-600 text-sm mt-2">Switch to desktop for 3D visualization</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

// Export a lightweight version for mobile
export function MobileOptimizedPalmTree() {
    return (
        <div className="w-full h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <p className="text-amber-700 font-medium">Premium Experience</p>
                <p className="text-amber-600 text-sm mt-2">Desktop recommended for full features</p>
            </div>
        </div>
    );
} 