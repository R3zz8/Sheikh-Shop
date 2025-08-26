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
    const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
    const color = colors[Math.max(0, s - 1)];
    const label = labels[Math.max(0, s - 1)];

    return (
        <div className="mt-1">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all`} style={{ width: `${(s / 5) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Strength: {label}</p>
            <ul className="mt-1 grid grid-cols-2 gap-x-4 text-xs text-slate-600 dark:text-slate-300">
                <li className={checks(password).length ? 'text-green-600' : ''}>≥ 12 characters</li>
                <li className={checks(password).upper ? 'text-green-600' : ''}>Uppercase letter</li>
                <li className={checks(password).lower ? 'text-green-600' : ''}>Lowercase letter</li>
                <li className={checks(password).number ? 'text-green-600' : ''}>Number</li>
                <li className={checks(password).special ? 'text-green-600' : ''}>Special character</li>
            </ul>
        </div>
    );
}


