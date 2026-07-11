'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isEmailValid = useMemo(() => (email ? validateEmail(email) : true), [email]);
  const isPasswordValid = useMemo(() => (password ? password.length >= 1 : true), [password]);
  const isFormValid = isEmailValid && isPasswordValid && email.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, remember }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          // Optimistically set user cache for instant UI update
          queryClient.setQueryData(['user'], data.user ?? null);
          toast.success('خوش آمدید!');
          router.push('/');
          return;
        }

        if (res.status === 429) {
          setMessage(data?.message || 'تعداد دفعات ورود بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.');
          return;
        }
        if (res.status === 401) {
          setMessage(data?.message || 'اطلاعات ورود نادرست است.');
          return;
        }
        
        if (res.status === 403) {
          if (data?.requiresEmailVerification) {
            setMessage(data?.message || 'لطفاً قبل از ورود به حساب، ایمیل خود را تایید کنید.');
            // Store email for verification page
            if (data?.email) {
              localStorage.setItem('pendingVerificationEmail', data.email);
            }
          } else {
            setMessage(data?.message || 'حساب کاربری شما غیرفعال شده است.');
          }
          return;
        }

        setMessage(data?.message || 'ورود به حساب با خطا مواجه شد.');
      } catch (err: any) {
        setMessage(err?.message || 'ورود به حساب با خطا مواجه شد.');
      }
    });
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="خوش آمدید"
        subtitle="برای ادامه وارد حساب خود شوید"
        footer={(
          <div className="space-y-4">
            {/* Main footer links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-base">
              <Link href="/forgot-password" className="text-slate-600 hover:text-amber-600 transition-colors text-center sm:text-right font-medium">
                رمز عبور را فراموش کرده‌اید؟
              </Link>
              <div className="text-slate-600 text-center sm:text-left font-medium">
                حساب کاربری ندارید؟{' '}
                <Link href="/register" className="text-amber-600 hover:text-amber-700 transition-colors font-semibold">ثبت‌نام کنید</Link>
              </div>
            </div>
            
            {/* Terms and Privacy links */}
            <div className="text-center text-sm text-slate-500 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/40">
              با ورود به حساب، شما با{' '}
              <Link href="/terms" className="hover:text-amber-600 transition-colors underline decoration-dotted font-medium">شرایط و قوانین خدمات</Link>
              {' '}و{' '}
              <Link href="/privacy" className="hover:text-amber-600 transition-colors underline decoration-dotted font-medium">سیاست حریم خصوصی</Link>
              {' '}ما موافقت می‌کنید.
            </div>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
          <InputField
            label="نشانی ایمیل"
            type="email"
            placeholder="ایمیل خود را وارد کنید"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="size-4 text-slate-400" aria-hidden />}
            error={email && !isEmailValid ? 'نشانی ایمیل نامعتبر است' : undefined}
            required
          />

          <PasswordField
            label="رمز عبور"
            placeholder="رمز عبور خود را وارد کنید"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={password === '' ? undefined : !isPasswordValid ? 'وارد کردن رمز عبور الزامی است' : undefined}
            required
          />

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2.5 text-base text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4.5 w-4.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              مرا به خاطر بسپار
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isPending}
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-2"
            aria-busy={isPending}
          >
            <span className="ms-2">{isPending ? 'در حال ورود...' : 'ورود به حساب'}</span>
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
