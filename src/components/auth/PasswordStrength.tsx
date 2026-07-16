"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
    password: string;
}

function checks(password: string) {
    return {
        length: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
}

function score(password: string) {
    const c = checks(password);
    let s = 0;
    Object.values(c).forEach(v => (s += v ? 1 : 0));
    if (password.length >= 16) s += 1;
    return Math.min(5, s);
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    if (!password) return null;
    const s = score(password);

    // Luxury color gradient mappings for progress bar
    const barColors = [
        'from-red-500 to-rose-600 shadow-red-500/20',
        'from-orange-500 to-amber-500 shadow-orange-500/20',
        'from-amber-500 to-yellow-500 shadow-amber-500/20',
        'from-emerald-500 to-teal-500 shadow-emerald-500/20',
        'from-emerald-500 to-green-600 shadow-green-600/20'
    ];

    const labels = ['بسیار ضعیف', 'ضعیف', 'متوسط', 'قوی', 'بسیار قوی'];
    const barColor = barColors[Math.max(0, s - 1)];
    const label = labels[Math.max(0, s - 1)];

    const validationRequirements = [
        { key: 'length', text: 'حداقل ۱۲ نویسه (کاراکتر)' },
        { key: 'upper', text: 'حرف بزرگ انگلیسی (A-Z)' },
        { key: 'lower', text: 'حرف کوچک انگلیسی (a-z)' },
        { key: 'number', text: 'عدد انگلیسی (0-9)' },
        { key: 'special', text: 'نویسه خاص (مانند @، $، !، #)' },
    ];

    const currentChecks = checks(password);

    return (
        <div className="mt-3.5 p-4 rounded-2xl bg-slate-500/5 dark:bg-slate-400/5 border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-sm">
            {/* Header section with password strength percentage and label */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 font-vazirmatn">
                    امنیت رمز عبور:
                </span>
                <span className={`text-xs sm:text-sm font-bold font-vazirmatn transition-colors duration-300 ${
                    s <= 2 ? 'text-red-500' : s === 3 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                    {label}
                </span>
            </div>

            {/* Dynamic premium progress bar */}
            <div className="h-2 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s / 5) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${barColor} shadow-md transition-all duration-300 rounded-full`}
                />
            </div>

            {/* Verification checklist layout */}
            <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-vazirmatn">
                    {validationRequirements.map((req) => {
                        const passed = currentChecks[req.key as keyof typeof currentChecks];
                        return (
                            <li
                                key={req.key}
                                className={`flex items-center gap-2 transition-colors duration-300 ${
                                    passed
                                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                <span className={`p-0.5 rounded-full ${
                                    passed
                                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600'
                                }`}>
                                    {passed ? (
                                        <Check className="size-3" strokeWidth={3} aria-hidden />
                                    ) : (
                                        <X className="size-3" strokeWidth={3} aria-hidden />
                                    )}
                                </span>
                                <span>{req.text}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
