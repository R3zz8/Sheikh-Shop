'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, User } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import PasswordStrength from '@/components/auth/PasswordStrength';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getChecks(password: string) {
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const emailValid = useMemo(() => (email ? validateEmail(email) : true), [email]);
  const checks = useMemo(() => getChecks(password), [password]);
  const passwordsMatch = useMemo(() => (confirmPassword ? password === confirmPassword : true), [password, confirmPassword]);

  const formValid =
    fullName.trim().length > 0 &&
    validateEmail(email) &&
    checks.length && checks.upper && checks.lower && checks.number && checks.special &&
    password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const [firstName, ...rest] = fullName.trim().split(' ');
        const lastName = rest.join(' ') || 'User'; // Fallback if no last name
        const safeFirstName = firstName || 'User'; // Fallback if no first name
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            email, 
            password, 
            firstName: safeFirstName, 
            lastName,
            username: `${safeFirstName.toLowerCase()}${Date.now()}` // Auto-generate username with safe fallback
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          toast.success('حساب کاربری با موفقیت ایجاد شد!');
          // Store email for verification page
          localStorage.setItem('pendingVerificationEmail', email);
          router.push('/verify-email');
          return;
        }
        if (res.status === 409) {
          setMessage(data?.message || 'این نشانی ایمیل قبلاً ثبت شده است.');
          return;
        }
        setMessage(data?.message || 'ثبت‌نام با خطا مواجه شد.');
      } catch (err: any) {
        setMessage(err?.message || 'ثبت‌نام با خطا مواجه شد.');
      }
    });
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="ایجاد حساب کاربری"
        subtitle="به تجربه ممتاز و لوکس ما بپیوندید"
        footer={(
          <div className="space-y-4">
            {/* Main footer link */}
            <div className="text-center text-base text-slate-600 font-medium">
              قبلاً حساب کاربری دارید؟{' '}
              <Link href="/login" className="text-amber-600 hover:text-amber-700 transition-colors font-semibold">وارد شوید</Link>
            </div>
            
            {/* Terms and Privacy links */}
            <div className="text-center text-sm text-slate-500 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/40">
              با ایجاد حساب کاربری، شما با{' '}
              <Link href="/terms" className="hover:text-amber-600 transition-colors underline decoration-dotted font-medium">شرایط و قوانین خدمات</Link>
              {' '}و{' '}
              <Link href="/privacy" className="hover:text-amber-600 transition-colors underline decoration-dotted font-medium">سیاست حریم خصوصی</Link>
              {' '}ما موافقت می‌کنید.
            </div>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-label="Register form">
          <InputField
            label="نام و نام خانوادگی"
            type="text"
            placeholder="نام و نام خانوادگی خود را وارد کنید"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            icon={<User className="size-4 text-slate-400" aria-hidden />}
            required
          />

          <InputField
            label="نشانی ایمیل"
            type="email"
            placeholder="ایمیل خود را وارد کنید"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="size-4 text-slate-400" aria-hidden />}
            error={email && !emailValid ? 'نشانی ایمیل نامعتبر است' : undefined}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField
              label="رمز عبور"
              placeholder="حداقل ۱۲ نویسه، حروف بزرگ/کوچک/عدد/نماد"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <PasswordField
              label="تکرار رمز عبور"
              placeholder="رمز عبور را دوباره وارد کنید"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={confirmPassword && !passwordsMatch ? 'رمزهای عبور با هم مطابقت ندارند' : undefined}
              required
            />
          </div>

          <PasswordStrength password={password} />

          <button
            type="submit"
            disabled={!formValid || isPending}
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-2"
            aria-busy={isPending}
          >
            <span className="ms-2">{isPending ? 'در حال ایجاد حساب...' : 'ایجاد حساب'}</span>
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          </button>

          {message && (
            <p className="text-center text-sm sm:text-base font-medium text-red-600 mt-2 bg-red-50 dark:bg-red-950/20 py-2 px-3 rounded-lg border border-red-100 dark:border-red-950/40" role="alert">{message}</p>
          )}

          <div className="relative my-4 pt-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-950 px-3 text-slate-500 dark:text-slate-400 font-medium">یا ادامه با</span>
            </div>
          </div>
          <SocialAuthButtons showGoogle={false} showGithub={false} />
        </form>
      </AuthCard>
    </AnimatedBackground>
  );
}
