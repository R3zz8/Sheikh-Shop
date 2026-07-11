"use client";

import { Github, Mail } from "lucide-react";

interface SocialAuthButtonsProps {
    onGoogle?: () => void;
    onGithub?: () => void;
    showGoogle?: boolean;
    showGithub?: boolean;
}

export default function SocialAuthButtons({ onGoogle, onGithub, showGoogle = true, showGithub = true }: SocialAuthButtonsProps) {
    if (!showGoogle && !showGithub) return null;
    return (
        <div className="mt-4 grid grid-cols-1 gap-3">
            {showGoogle && (
                <button
                    type="button"
                    onClick={onGoogle}
                    className="inline-flex items-center justify-center gap-2.5 w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-950/40 backdrop-blur-sm px-4 py-3 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-slate-900/60 transition"
                >
                    <Mail className="size-4" /> ادامه با گوگل
                </button>
            )}
            {showGithub && (
                <button
                    type="button"
                    onClick={onGithub}
                    className="inline-flex items-center justify-center gap-2.5 w-full rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-950/40 backdrop-blur-sm px-4 py-3 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-white/90 dark:hover:bg-slate-900/60 transition"
                >
                    <Github className="size-4" /> ادامه با گیت‌هاب
                </button>
            )}
        </div>
    );
}


