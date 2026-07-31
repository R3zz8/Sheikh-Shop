'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, ShieldCheck, Truck, Lock, Star } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

// Isolate form component to prevent typing re-renders from reaching AnimatedBackground & AuthCard
const LoginForm = React.memo(() => {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
    mode: 'onChange',
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const isEmailValid = useMemo(() => (emailValue ? validateEmail(emailValue) : true), [emailValue]);
  const isPasswordValid = useMemo(() => (passwordValue ? passwordValue.length >= 1 : true), [passwordValue]);
  const isFormValid = isEmailValid && isPasswordValid && emailValue.length > 0 && passwordValue.length > 0;

  async function onSubmit(data: LoginFormValues) {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            remember: data.remember,
          }),
        });
        const resData = await res.json().catch(() => ({}));

        if (res.ok && resData?.success) {
          queryClient.setQueryData(['user'], resData.user ?? null);
          toast.success('خوش آمدید!');
          router.push('/');
          return;
        }

        if (res.status === 429) {
          setMessage(resData?.message || 'تعداد دفعات ورود بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.');
          return;
        }
        if (res.status === 401) {
          setMessage(resData?.message || 'اطلاعات ورود نادرست است.');
          return;
        }
        
        if (res.status === 403) {
          if (resData?.requiresEmailVerification) {
            setMessage(resData?.message || 'لطفاً قبل از ورود به حساب، ایمیل خود را تایید کنید.');
            if (resData?.email) {
              localStorage.setItem('pendingVerificationEmail', resData.email);
            }
          } else {
            setMessage(resData?.message || 'حساب کاربری شما غیرفعال شده است.');
          }
          return;
        }

        setMessage(resData?.message || 'ورود به حساب با خطا مواجه شد.');
      } catch (err: any) {
        setMessage(err?.message || 'ورود به حساب با خطا مواجه شد.');
      }
    });
  }

  function handleGoogleLogin() {
    toast.info('اتصال به درگاه امن گوگل... ورود از طریق گوگل در نسخه‌های بعدی فعال خواهد شد.');
  }

  return (
    <div className="space-y-4">
      {/* Google Login Section - Above Email Form */}
      <GoogleAuthButton onClick={handleGoogleLogin} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Login form">
        <InputField
          label="نشانی ایمیل"
          type="email"
          placeholder="ایمیل خود را وارد کنید"
          {...register('email')}
          icon={<Mail className="size-4.5 text-slate-400" aria-hidden />}
          error={emailValue && !isEmailValid ? 'نشانی ایمیل نامعتبر است' : undefined}
          required
        />

        <PasswordField
          label="رمز عبور"
          placeholder="رمز عبور خود را وارد کنید"
          {...register('password')}
          error={passwordValue === '' ? undefined : !isPasswordValid ? 'وارد کردن رمز عبور الزامی است' : undefined}
          required
        />

        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex items-center gap-2.5 text-sm sm:text-base text-slate-200 cursor-pointer select-none font-vazirmatn font-medium">
            <input
              type="checkbox"
              className="h-4.5 w-4.5 rounded border-white/[0.08] text-amber-600 focus:ring-amber-500 cursor-pointer bg-neutral-950"
              {...register('remember')}
            />
            مرا به خاطر بسپار
          </label>
        </div>

        {/* Premium Submit Button with Gradient and Framer Motion hover/tap scales */}
        <motion.button
          type="submit"
          disabled={!isFormValid || isPending}
          whileHover={isFormValid ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" } : {}}
          whileTap={isFormValid ? { scale: 0.98 } : {}}
          className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-base sm:text-lg px-4 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-3 cursor-pointer"
          aria-busy={isPending}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-vazirmatn">در حال ورود...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="font-vazirmatn">ورود به حساب کاربری</span>
              <ArrowLeft className="size-4.5 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden />
            </div>
          )}
        </motion.button>

        {message && (
          <p className="text-center text-sm font-semibold text-red-400 mt-3 bg-red-950/20 py-2.5 px-4 rounded-xl border border-red-950/40 font-vazirmatn" role="alert">{message}</p>
        )}

        {/* Premium Trust Badges Section */}
        <div className="pt-6 mt-4 border-t border-white/[0.08]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-amber-500/10 transition-all duration-300">
              <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500">
                <ShieldCheck className="size-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 font-vazirmatn">ضمانت اصالت</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-amber-500/10 transition-all duration-300">
              <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500">
                <Truck className="size-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 font-vazirmatn">ارسال سریع</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-amber-500/10 transition-all duration-300">
              <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500">
                <Lock className="size-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 font-vazirmatn">پرداخت امن</span>
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
          <span className="text-xs sm:text-sm font-extrabold text-slate-200 font-vazirmatn">
            ۴.۹ از ۵ رضایت مشتریان
          </span>
          <p className="text-[11px] sm:text-xs text-slate-400 font-vazirmatn leading-relaxed max-w-[280px] sm:max-w-none">
            بیش از هزاران مشتری به فروشگاه شیخ اعتماد کرده‌اند.
          </p>
        </div>
      </form>
    </div>
  );
});

LoginForm.displayName = 'LoginForm';

export default function LoginPage() {
  return (
    <AnimatedBackground>
      <AuthCard
        title="خوش آمدید"
        subtitle="برای ادامه وارد حساب خود شوید"
        footer={(
          <div className="space-y-5">
            {/* Main footer links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-base">
              <Link href="/forgot-password" className="text-slate-300 hover:text-amber-400 transition-colors text-center sm:text-right font-medium font-vazirmatn text-sm sm:text-base">
                رمز عبور را فراموش کرده‌اید؟
              </Link>
              <div className="text-slate-300 text-center sm:text-left font-medium font-vazirmatn text-sm sm:text-base">
                حساب کاربری ندارید؟{' '}
                <Link href="/register" className="text-amber-500 hover:text-amber-400 transition-colors font-bold">ثبت‌نام کنید</Link>
              </div>
            </div>
            
            {/* Terms and Privacy links */}
            <div className="text-center text-xs sm:text-sm text-slate-400 leading-relaxed pt-3 border-t border-white/[0.08] font-vazirmatn">
              با ورود به حساب، شما با{' '}
              <Link href="/terms" className="hover:text-amber-500 transition-colors underline decoration-dotted font-medium">شرایط و قوانین خدمات</Link>
              {' '}و{' '}
              <Link href="/privacy" className="hover:text-amber-500 transition-colors underline decoration-dotted font-medium">سیاست حریم خصوصی</Link>
              {' '}ما موافقت می‌کنید.
            </div>
          </div>
        )}
      >
        <LoginForm />
      </AuthCard>
    </AnimatedBackground>
  );
}
