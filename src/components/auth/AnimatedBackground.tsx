"use client";

import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
    children: React.ReactNode;
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
    return (
        <div className="relative min-h-screen w-full">
            {/* Animated background that fills the content area */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                {/* Radial glow 1 - top left */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(59,130,246,0.30), rgba(59,130,246,0) 70%)" }}
                    animate={{ x: [0, 20, -10, 0], y: [0, 10, -15, 0] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />

                {/* Radial glow 2 - bottom right */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25), rgba(99,102,241,0) 70%)" }}
                    animate={{ x: [0, -15, 10, 0], y: [0, -10, 15, 0] }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                />

                {/* Center soft glow */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
                    style={{ background: "radial-gradient(circle, rgba(34,211,238,0.18), rgba(34,211,238,0) 70%)" }}
                    animate={{ scale: [1, 1.05, 0.98, 1] }}
                    transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Content container */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
}
