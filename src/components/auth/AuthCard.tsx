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
            <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
                {showBrand && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Crown className="size-5 text-amber-500" aria-hidden />
                        <span className="text-base font-semibold tracking-wide">Sheikh Shop</span>
                    </div>
                )}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-slate-600/90 dark:text-slate-300/80 mt-1">{subtitle}</p>
                    )}
                </div>
                {children}
                {footer && <div className="mt-6">{footer}</div>}
            </div>
        </motion.div>
    );
}

