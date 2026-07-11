"use client";

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
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    const labels = ['بسیار ضعیف', 'ضعیف', 'متوسط', 'قوی', 'بسیار قوی'];
    const color = colors[Math.max(0, s - 1)];
    const label = labels[Math.max(0, s - 1)];

    return (
        <div className="mt-1.5">
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${(s / 5) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm sm:text-[15px] font-medium text-slate-700 dark:text-slate-300 leading-normal">
                امنیت رمز عبور: <span className="font-semibold">{label}</span>
            </p>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed list-inside list-disc">
                <li className={`${checks(password).length ? 'text-green-600 font-medium' : ''} list-none before:content-['•'] before:me-2`}>حداقل ۱۲ نویسه (کاراکتر)</li>
                <li className={`${checks(password).upper ? 'text-green-600 font-medium' : ''} list-none before:content-['•'] before:me-2`}>حرف بزرگ انگلیسی</li>
                <li className={`${checks(password).lower ? 'text-green-600 font-medium' : ''} list-none before:content-['•'] before:me-2`}>حرف کوچک انگلیسی</li>
                <li className={`${checks(password).number ? 'text-green-600 font-medium' : ''} list-none before:content-['•'] before:me-2`}>عدد (۰-۹)</li>
                <li className={`${checks(password).special ? 'text-green-600 font-medium' : ''} list-none before:content-['•'] before:me-2 col-span-1 sm:col-span-2`}>نویسه خاص (مانند @، $، !)</li>
            </ul>
        </div>
    );
}


