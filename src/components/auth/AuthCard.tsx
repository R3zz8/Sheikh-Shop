"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import Image from "next/image";

interface AuthCardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    footer?: React.ReactNode;
    showBrand?: boolean;
}

export default function AuthCard({ children, title, subtitle, footer, showBrand = true }: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
        >
            {/* Mobile: Full width with padding, Larger screens: Centered card with shadow */}
            <div className="w-full px-4 sm:px-0 sm:mx-auto">
                <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-white/20 sm:bg-white/70 sm:dark:bg-slate-900/60 sm:backdrop-blur-xl sm:shadow-2xl sm:p-8 p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                    {/* Brand Logo/Title - Enhanced for mobile */}
                    {showBrand && (
                        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-4">
                            <Crown className="size-6 sm:size-5 text-amber-500" aria-hidden />
                            <span className="text-lg sm:text-base font-semibold tracking-wide text-slate-800 dark:text-slate-200">Sheikh Shop</span>
                        </div>
                    )}
                    
                    {/* Title and Subtitle - Better mobile spacing */}
                    <div className="text-center mb-6 sm:mb-6">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="text-sm sm:text-sm text-slate-600/90 dark:text-slate-300/80 mt-2 sm:mt-1">{subtitle}</p>
                        )}
                    </div>
                    
                    {/* Form Content */}
                    {children}
                    
                    {/* Footer - Better mobile spacing */}
                    {footer && <div className="mt-6 sm:mt-6">{footer}</div>}
                </div>
            </div>
        </motion.div>
    );
}

