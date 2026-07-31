"use client";

import React from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface AuthCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    footer?: React.ReactNode;
    showBrand?: boolean;
}

const AuthCard = React.memo(({ children, title, subtitle, footer, showBrand = true }: AuthCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // premium custom cubic-bezier
                delay: 0.05
            }}
            whileHover={{
                boxShadow: "0 30px 60px -15px rgba(245, 158, 11, 0.15)",
                borderColor: "rgba(245, 158, 11, 0.45)"
            }}
            className="w-full max-w-md transition-all duration-500 rounded-3xl"
        >
            {/* Mobile: Full width with padding, Larger screens: Centered card with shadow */}
            <div className="w-full px-4 sm:px-0 sm:mx-auto">
                <div className="w-full sm:max-w-md rounded-3xl border border-amber-500/20 bg-neutral-950/45 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-6 sm:p-8 relative overflow-hidden">

                    {/* Subtle Top Golden Shine Line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                    {/* Inner gold radial glow glow */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

                    {/* Brand Logo/Title - Redesigned to be premium and luxury */}
                    {showBrand && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="flex flex-col items-center justify-center gap-1.5 mb-6"
                        >
                            <div className="relative p-2.5 rounded-full bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 shadow-inner">
                                <Crown className="size-6 text-amber-500 animate-pulse" aria-hidden />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold tracking-wide bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent font-vazirmatn">
                                فروشگاه شیخ
                            </span>
                        </motion.div>
                    )}
                    
                    {/* Title and Subtitle - Elegant luxury Persian typography */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="text-center mb-6"
                    >
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100 font-vazirmatn bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                            {title}
                        </h1>
                        {subtitle ? (
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-2 font-vazirmatn leading-relaxed">
                                {subtitle}
                            </p>
                        ) : (
                            <p className="text-xs sm:text-sm text-amber-500 font-medium mt-2 font-vazirmatn leading-relaxed">
                                تجربه خریدی مطمئن، سریع و لوکس
                            </p>
                        )}
                    </motion.div>
                    
                    {/* Form Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                    >
                        {children}
                    </motion.div>
                    
                    {/* Footer - Better spacing & clean alignment */}
                    {footer && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="mt-6 pt-4 border-t border-slate-800/40"
                        >
                            {footer}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

AuthCard.displayName = "AuthCard";

export default AuthCard;
