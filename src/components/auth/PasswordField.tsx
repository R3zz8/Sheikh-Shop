"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    id?: string;
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({ label = 'رمز عبور', error, id, ...props }, ref) => {
        const [show, setShow] = useState(false);
        const inputId = id || 'password';
        const hasError = Boolean(error);
        return (
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed" htmlFor={inputId}>
                <span className="font-vazirmatn mb-2 block text-right">{label}</span>
                <div
                    className={`flex items-center rounded-2xl border bg-neutral-950/40 px-4 py-3 sm:py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500/20 ${
                        hasError
                            ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/20'
                            : 'border-white/[0.08] focus-within:border-amber-500/50'
                    }`}
                >
                    <div className="text-slate-400 shrink-0">
                        <Lock className="size-4.5" aria-hidden />
                    </div>
                    <input
                        ref={ref}
                        id={inputId}
                        type={show ? 'text' : 'password'}
                        className="ms-3 w-full bg-transparent outline-none placeholder-slate-500 text-slate-100 text-sm sm:text-base leading-normal font-vazirmatn font-normal text-right"
                        dir="rtl"
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${inputId}-error` : undefined}
                        {...props}
                    />
                    <button
                        type="button"
                        className="ms-2 text-slate-400 hover:text-amber-400 focus:outline-none transition-colors duration-200 shrink-0 cursor-pointer"
                        onClick={() => setShow(s => !s)}
                        aria-label={show ? 'پنهان‌سازی رمز عبور' : 'نمایش رمز عبور'}
                    >
                        {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                    </button>
                </div>
                {hasError && (
                    <p id={`${inputId}-error`} className="text-xs text-red-400 mt-1.5 font-medium leading-normal font-vazirmatn text-right">{error}</p>
                )}
            </label>
        );
    }
);

PasswordField.displayName = "PasswordField";

export default PasswordField;
