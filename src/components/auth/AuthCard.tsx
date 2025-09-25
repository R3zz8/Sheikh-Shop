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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.1
            }}
            className="w-full max-w-md"
        >
            {/* Mobile: Full width with padding, Larger screens: Centered card with shadow */}
            <div className="w-full px-4 sm:px-0 sm:mx-auto">
                <div className="w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/95 sm:backdrop-blur-xl sm:shadow-2xl sm:p-8 p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl">
                    {/* Brand Logo/Title - Enhanced for mobile */}
                    {showBrand && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex items-center justify-center gap-2 mb-6 sm:mb-4"
                        >
                            <Crown className="size-6 sm:size-5 text-amber-500" aria-hidden />
                            <span className="text-lg sm:text-base font-semibold tracking-wide text-slate-800">Sheikh Shop</span>
                        </motion.div>
                    )}
                    
                    {/* Title and Subtitle - Better mobile spacing */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center mb-6 sm:mb-6"
                    >
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
                        {subtitle && (
                            <p className="text-sm sm:text-sm text-slate-600/90 mt-2 sm:mt-1">{subtitle}</p>
                        )}
                    </motion.div>
                    
                    {/* Form Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {children}
                    </motion.div>
                    
                    {/* Footer - Better mobile spacing */}
                    {footer && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="mt-6 sm:mt-6"
                        >
                            {footer}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

