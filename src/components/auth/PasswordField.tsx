"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    id?: string;
}

export default function PasswordField({ label = 'Password', error, id, ...props }: PasswordFieldProps) {
    const [show, setShow] = useState(false);
    const inputId = id || 'password';
    const hasError = Boolean(error);
    return (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor={inputId}>
            {label}
            <div className={`mt-1 flex items-center rounded-xl border bg-white/80 dark:bg-slate-950/40 backdrop-blur-sm px-3 py-2 focus-within:ring-2 ${hasError ? 'border-red-300 focus-within:ring-red-300' : 'border-slate-200/60 dark:border-slate-700/60 focus-within:ring-blue-400/50'}`}>
                <Lock className="size-4 text-slate-400" aria-hidden />
                <input
                    id={inputId}
                    type={show ? 'text' : 'password'}
                    className="ml-2 w-full bg-transparent outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${inputId}-error` : undefined}
                    {...props}
                />
                <button
                    type="button"
                    className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    onClick={() => setShow(s => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
            {hasError && (
                <p id={`${inputId}-error`} className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </label>
    );
}


