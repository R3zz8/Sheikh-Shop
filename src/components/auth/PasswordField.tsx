"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    id?: string;
}

export default function PasswordField({ label = 'رمز عبور', error, id, ...props }: PasswordFieldProps) {
    const [show, setShow] = useState(false);
    const inputId = id || 'password';
    const hasError = Boolean(error);
    return (
        <label className="block text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed" htmlFor={inputId}>
            <span className="font-vazirmatn mb-1.5 block">{label}</span>
            <div
                className={`flex items-center rounded-2xl border bg-white/70 dark:bg-slate-950/30 backdrop-blur-md px-4 py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-slate-900 ${
                    hasError
                        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-400/40'
                        : 'border-slate-200 dark:border-slate-800 focus-within:border-amber-500 focus-within:ring-amber-500/40'
                }`}
            >
                <div className="text-slate-400 dark:text-slate-500 shrink-0">
                    <Lock className="size-4.5" aria-hidden />
                </div>
                <input
                    id={inputId}
                    type={show ? 'text' : 'password'}
                    className="ms-3 w-full bg-transparent outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-normal font-vazirmatn font-normal text-right"
                    dir="rtl"
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    {...props}
                />
                <button
                    type="button"
                    className="ms-2 text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 focus:outline-none transition-colors duration-200 shrink-0"
                    onClick={() => setShow(s => !s)}
                    aria-label={show ? 'پنهان‌سازی رمز عبور' : 'نمایش رمز عبور'}
                >
                    {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
            </div>
            {hasError && (
                <p id={`${inputId}-error`} className="text-xs sm:text-sm text-red-500 mt-1.5 font-medium leading-normal font-vazirmatn">{error}</p>
            )}
        </label>
    );
}
