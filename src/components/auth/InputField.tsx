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
        <label className={`block text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed ${containerClassName || ''}`} htmlFor={inputId}>
            {label}
            <div className={`mt-1.5 flex items-center rounded-xl border bg-white/80 dark:bg-slate-950/40 backdrop-blur-sm px-3 py-2.5 focus-within:ring-2 ${hasError ? 'border-red-300 focus-within:ring-red-300' : 'border-slate-200/60 dark:border-slate-700/60 focus-within:ring-amber-500/50'}`}>
                {icon}
                <input
                    id={inputId}
                    className="ms-2 w-full bg-transparent outline-none placeholder-slate-400 dark:placeholder-slate-500 text-base leading-normal"
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    {...props}
                />
            </div>
            {hasError && (
                <p id={`${inputId}-error`} className="text-sm text-red-600 mt-1.5 font-normal leading-normal">{error}</p>
            )}
        </label>
    );
}


