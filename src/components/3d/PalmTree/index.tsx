'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import ErrorBoundary from './ErrorBoundary';

// Lazy load the 3D component to avoid SSR issues
const PalmTreeScene = dynamic(() => import('./PalmTreeScene'), {
    ssr: false,
    loading: () => null
});

// Fallback component for loading state
function PalmTreeFallback() {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-amber-700 font-medium">Loading 3D Palm Tree...</p>
            </div>
        </div>
    );
}

// Static fallback for when 3D is not supported
function StaticPalmTree() {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
            {/* Static palm tree illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-b from-green-600 to-green-800 rounded-full mx-auto mb-4 relative">
                        {/* Palm leaves */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-8 bg-green-600 rounded-full origin-bottom"
                                    style={{
                                        transform: `rotate(${(i * 45)}deg) translateY(-20px)`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-4 h-16 bg-amber-800 rounded-full mx-auto"></div>
                    <p className="text-amber-700 font-medium">Date Palm Tree</p>
                </div>
            </div>

            {/* Ambient sparkles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-300 rounded-full animate-pulse"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`,
                            animationDelay: `${i * 0.5}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

interface PalmTreeContainerProps {
    className?: string;
    height?: string;
    enableControls?: boolean;
    autoRotate?: boolean;
    intensity?: number;
}

export default function PalmTreeContainer({
    className = "",
    height = "400px",
    enableControls = false,
    autoRotate = true,
    intensity = 1
}: PalmTreeContainerProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Show loading fallback on server-side
    if (!isClient) {
        return <PalmTreeFallback />;
    }

    return (
        <div
            className={`relative w-full ${className}`}
            style={{ height }}
        >
            <ErrorBoundary fallback={<StaticPalmTree />}>
                <Suspense fallback={<PalmTreeFallback />}>
                    <Canvas
                        shadows
                        camera={{ position: [0, 0, 8], fov: 50 }}
                        gl={{
                            antialias: true,
                            alpha: true,
                            powerPreference: "high-performance"
                        }}
                        dpr={[1, 2]} // Responsive pixel ratio
                    >
                        <PalmTreeScene
                            enableControls={enableControls}
                            autoRotate={autoRotate}
                            intensity={intensity}
                        />
                    </Canvas>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}

// Export the static fallback for use in SSR
export { StaticPalmTree }; 