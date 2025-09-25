"use client";

import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
    children: React.ReactNode;
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            {/* Luxury dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d1a0d] via-[#1a0e07] to-[#0f0804]">
                {/* Decorative luxury orbs - top left */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full blur-3xl opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(245,158,11,0.4), rgba(245,158,11,0) 70%)" }}
                    animate={{ 
                        x: [0, 15, -8, 0], 
                        y: [0, 8, -12, 0],
                        scale: [1, 1.1, 0.95, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Decorative luxury orbs - bottom right */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl opacity-15"
                    style={{ background: "radial-gradient(circle, rgba(180,83,9,0.3), rgba(180,83,9,0) 70%)" }}
                    animate={{ 
                        x: [0, -12, 8, 0], 
                        y: [0, -8, 12, 0],
                        scale: [1, 0.9, 1.05, 1]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Center luxury glow */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-10"
                    style={{ background: "radial-gradient(circle, rgba(245,158,11,0.3), rgba(245,158,11,0) 70%)" }}
                    animate={{ 
                        scale: [1, 1.08, 0.98, 1],
                        opacity: [0.1, 0.15, 0.08, 0.1]
                    }}
                    transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Subtle geometric patterns */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute top-1/4 right-1/4 h-32 w-32 rounded-full blur-2xl opacity-5"
                    style={{ background: "radial-gradient(circle, rgba(180,83,9,0.2), rgba(180,83,9,0) 70%)" }}
                    animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute bottom-1/4 left-1/4 h-24 w-24 rounded-full blur-2xl opacity-5"
                    style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2), rgba(245,158,11,0) 70%)" }}
                    animate={{ 
                        rotate: [360, 0],
                        scale: [1, 0.8, 1]
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Content container - Enhanced for mobile with bottom padding */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pb-16 sm:pb-4">
                {children}
            </div>
        </div>
    );
}
