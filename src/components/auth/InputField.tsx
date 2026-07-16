"use client";

import type { ReactNode } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: ReactNode;
    error?: string;
    containerClassName?: string;
}

export default function InputField({ label, icon, error, containerClassName, id, ...props }: InputFieldProps) {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(error);
    return (
        <label className={`block text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed ${containerClassName || ''}`} htmlFor={inputId}>
            <span className="font-vazirmatn mb-2 block text-right">{label}</span>
            <div
                className={`flex items-center rounded-2xl border bg-neutral-950/40 px-4 py-3 sm:py-3.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-500/20 ${
                    hasError
                        ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/20'
                        : 'border-white/[0.08] focus-within:border-amber-500/50'
                }`}
            >
                {icon && <div className="text-slate-400 shrink-0 transition-colors duration-300 focus-within:text-amber-500">{icon}</div>}
                <input
                    id={inputId}
                    className="ms-3 w-full bg-transparent outline-none placeholder-slate-500 text-slate-100 text-sm sm:text-base leading-normal font-vazirmatn font-normal text-right"
                    dir="rtl"
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    {...props}
                />
            </div>
            {hasError && (
                <p id={`${inputId}-error`} className="text-xs text-red-400 mt-1.5 font-medium leading-normal font-vazirmatn text-right">{error}</p>
            )}
        </label>
    );
}
