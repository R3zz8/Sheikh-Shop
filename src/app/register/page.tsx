'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, User, ShieldCheck, Truck, Lock, Star } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import PasswordStrength from '@/components/auth/PasswordStrength';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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

  function handleGoogleRegister() {
    toast.info('اتصال به درگاه امن گوگل... ثبت‌نام از طریق گوگل در نسخه‌های بعدی فعال خواهد شد.');
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="ایجاد حساب کاربری"
        subtitle="به تجربه ممتاز و لوکس ما بپیوندید"
        footer={(
          <div className="space-y-4">
            {/* Main footer link */}
            <div className="text-center text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium font-vazirmatn">
              قبلاً حساب کاربری دارید؟{' '}
              <Link href="/login" className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-bold">وارد شوید</Link>
            </div>
            
            {/* Terms and Privacy links */}
            <div className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-3 border-t border-slate-200/50 dark:border-slate-800/40 font-vazirmatn">
              با ایجاد حساب کاربری، شما با{' '}
              <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors underline decoration-dotted font-medium">شرایط و قوانین خدمات</Link>
              {' '}و{' '}
              <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors underline decoration-dotted font-medium">سیاست حریم خصوصی</Link>
              {' '}ما موافقت می‌کنید.
            </div>
          </div>
        )}
      >
        <div className="space-y-4">
          {/* Google Register Section - Above Email Form */}
          <GoogleAuthButton onClick={handleGoogleRegister} />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-label="Register form">
            <InputField
              label="نام و نام خانوادگی"
              type="text"
              placeholder="نام و نام خانوادگی خود را وارد کنید"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              icon={<User className="size-4.5 text-slate-400" aria-hidden />}
              required
            />

            <InputField
              label="نشانی ایمیل"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="size-4.5 text-slate-400" aria-hidden />}
              error={email && !emailValid ? 'نشانی ایمیل نامعتبر است' : undefined}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordField
                label="رمز عبور"
                placeholder="حداقل ۱۲ نویسه"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <PasswordField
                label="تکرار رمز عبور"
                placeholder="تکرار رمز عبور"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={confirmPassword && !passwordsMatch ? 'رمزهای عبور مطابقت ندارند' : undefined}
                required
              />
            </div>

            <PasswordStrength password={password} />

            {/* Premium Submit Button with Gradient and Framer Motion hover/tap scales */}
            <motion.button
              type="submit"
              disabled={!formValid || isPending}
              whileHover={formValid ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" } : {}}
              whileTap={formValid ? { scale: 0.98 } : {}}
              className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-base sm:text-lg px-4 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-3 cursor-pointer"
              aria-busy={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-vazirmatn">در حال ایجاد حساب...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full">
                  <span className="font-vazirmatn">ایجاد حساب کاربری</span>
                  <ArrowLeft className="size-4.5 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden />
                </div>
              )}
            </motion.button>

            {message && (
              <p className="text-center text-sm font-semibold text-red-600 dark:text-red-400 mt-3 bg-red-50 dark:bg-red-950/20 py-2.5 px-4 rounded-xl border border-red-100 dark:border-red-950/40 font-vazirmatn" role="alert">{message}</p>
            )}

            {/* Premium Trust Badges Section */}
            <div className="pt-6 mt-4 border-t border-slate-200/50 dark:border-slate-800/40">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
                    <ShieldCheck className="size-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 font-vazirmatn">ضمانت اصالت</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
                    <Truck className="size-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 font-vazirmatn">ارسال سریع</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
                    <Lock className="size-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 font-vazirmatn">پرداخت امن</span>
                </div>
              </div>
            </div>

            {/* Social Proof Rating */}
            <div className="text-center pt-4 flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 font-vazirmatn">
                ۴.۹ از ۵ رضایت مشتریان
              </span>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-vazirmatn leading-relaxed max-w-[280px] sm:max-w-none">
                بیش از هزاران مشتری به فروشگاه شیخ اعتماد کرده‌اند.
              </p>
            </div>
          </form>
        </div>
      </AuthCard>
    </AnimatedBackground>
  );
}
