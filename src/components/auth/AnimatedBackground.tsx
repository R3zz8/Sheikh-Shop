"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
    children: React.ReactNode;
}

const AnimatedBackground = React.memo(({ children }: AnimatedBackgroundProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Elegant, slow-moving particle details
    const particles = [
        { size: 4, x: "10%", y: "20%", duration: 15, delay: 0 },
        { size: 6, x: "80%", y: "15%", duration: 20, delay: 2 },
        { size: 3, x: "30%", y: "75%", duration: 18, delay: 1 },
        { size: 5, x: "70%", y: "80%", duration: 22, delay: 3 },
        { size: 4, x: "50%", y: "40%", duration: 25, delay: 4 },
        { size: 5, x: "15%", y: "60%", duration: 17, delay: 2 },
    ];

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            {/* Luxury dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#201007] via-[#0f0703] to-[#050201] overflow-hidden">
                {/* Decorative luxury orbs - top left */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -top-20 -left-20 h-[350px] w-[350px] rounded-full blur-3xl opacity-25"
                    style={{ background: "radial-gradient(circle, rgba(245,158,11,0.25), rgba(245,158,11,0) 70%)" }}
                    animate={isMobile ? undefined : {
                        x: [0, 20, -10, 0],
                        y: [0, 10, -15, 0],
                        scale: [1, 1.15, 0.95, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Decorative luxury orbs - bottom right */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full blur-3xl opacity-20"
                    style={{ background: "radial-gradient(circle, rgba(180,83,9,0.2), rgba(180,83,9,0) 70%)" }}
                    animate={isMobile ? undefined : {
                        x: [0, -15, 10, 0],
                        y: [0, -10, 15, 0],
                        scale: [1, 0.95, 1.1, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Center luxury glow */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] opacity-15"
                    style={{ background: "radial-gradient(circle, rgba(245,158,11,0.15), rgba(217,119,6,0.05) 50%, rgba(245,158,11,0) 100%)" }}
                    animate={isMobile ? undefined : {
                        scale: [1, 1.1, 0.95, 1],
                        opacity: [0.15, 0.2, 0.12, 0.15]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Ambient gold secondary glow */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute top-1/4 right-1/4 h-80 w-80 rounded-full blur-3xl opacity-10"
                    style={{ background: "radial-gradient(circle, rgba(217,119,6,0.15), rgba(217,119,6,0) 70%)" }}
                    animate={isMobile ? undefined : {
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                />

                {/* Soft Floating Particles for a luxury shimmer effect - Disabled on mobile viewports for optimal rendering performance */}
                {!isMobile && (
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        {particles.map((p, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-amber-400/30 blur-[1px]"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    left: p.x,
                                    top: p.y,
                                }}
                                animate={{
                                    y: [0, -40, 0],
                                    opacity: [0.2, 0.7, 0.2],
                                    scale: [1, 1.3, 1]
                                }}
                                transition={{
                                    duration: p.duration,
                                    delay: p.delay,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content container - Enhanced for mobile with bottom padding */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pb-16 sm:pb-4">
                {children}
            </div>
        </div>
    );
});

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
