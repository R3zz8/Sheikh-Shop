"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface GoogleAuthButtonProps {
    onClick?: () => void;
}

export default function GoogleAuthButton({ onClick }: GoogleAuthButtonProps) {
    return (
        <div className="w-full">
            <motion.button
                type="button"
                onClick={onClick}
                whileHover={{
                    scale: 1.01,
                    boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.2)",
                    borderColor: "rgba(245, 158, 11, 0.4)",
                    backgroundColor: "rgba(245, 158, 11, 0.05)"
                }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-[52px] inline-flex items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-neutral-950/45 text-slate-200 hover:text-amber-400 transition-all duration-300 shadow-lg font-vazirmatn text-sm sm:text-base font-semibold px-4 cursor-pointer"
            >
                {/* Official Google SVG Logo */}
                <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-bold">ادامه با حساب گوگل</span>
            </motion.button>

            {/* Premium Persian Divider - Golden line, soft gradient, tiny crown in center */}
            <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                </div>
                <div className="relative flex justify-center px-4 bg-neutral-950/25 backdrop-blur-md rounded-full py-1 border border-amber-500/10">
                    <div className="flex items-center gap-2 text-amber-500">
                        <Crown className="size-3 text-amber-500/80" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider font-vazirmatn text-amber-400">
                            یا ورود با ایمیل
                        </span>
                        <Crown className="size-3 text-amber-500/80" />
                    </div>
                </div>
            </div>
        </div>
    );
}
