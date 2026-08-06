'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface VerifyEmailValues {
  email: string;
  verificationCode: string;
}

export default function VerifyEmailPage() {
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values for email
  const [initialEmail, setInitialEmail] = useState('');

  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    if (emailFromParams) {
      setInitialEmail(emailFromParams);
      localStorage.setItem('pendingVerificationEmail', emailFromParams);
    } else if (emailFromStorage) {
      setInitialEmail(emailFromStorage);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<VerifyEmailValues>({
    defaultValues: {
      email: '',
      verificationCode: '',
    },
    mode: 'onBlur',
  });

  // Dynamically set default email value once loaded
  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
    }
  }, [initialEmail, setValue]);

  async function handleVerifyEmail(data: VerifyEmailValues) {
    setMessage(null);

    if (!data.verificationCode.trim() || !data.email.trim()) {
      setMessage('لطفاً ایمیل و کد تایید را وارد کنید');
      return;
    }

    if (data.verificationCode.length !== 6) {
      setMessage('کد تایید باید ۶ رقمی باشد');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, code: data.verificationCode }),
        });

        const resData = await res.json();

        if (res.ok && resData?.success) {
          setIsVerified(true);
          toast.success('حساب کاربری شما با موفقیت تایید شد!');
          localStorage.removeItem('pendingVerificationEmail');
          
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setMessage(resData?.message || 'کد تایید نامعتبر است');
        }
      } catch (err: any) {
        setMessage(err?.message || 'تایید حساب با خطا مواجه شد');
      }
    });
  }

  async function handleResendCode() {
    const emailVal = getValues('email');
    if (!emailVal || !emailVal.trim()) {
      setMessage('لطفاً نشانی ایمیل خود را وارد کنید');
      return;
    }

    setIsResending(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal }),
      });

      const resData = await res.json();

      if (res.ok && resData?.success) {
        toast.success('کد تایید جدید با موفقیت ارسال شد!');
        setMessage('یک کد تایید جدید به ایمیل شما ارسال شد');
      } else {
        setMessage(resData?.message || 'ارسال مجدد کد با خطا مواجه شد');
      }
    } catch (err: any) {
      setMessage(err?.message || 'ارسال مجدد کد با خطا مواجه شد');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title={isVerified ? "تایید حساب کاربری" : "فعال‌سازی حساب"}
        subtitle={isVerified ? "حساب کاربری شما فعال شد و آماده استفاده است" : "کد ۶ رقمی ارسال شده به ایمیل خود را وارد کنید"}
        footer={(
          <div className="space-y-4 font-vazirmatn">
            <div className="text-center text-sm">
              <span className="text-slate-400">حساب کاربری ندارید؟ </span>
              <Link href="/register" className="text-amber-500 hover:text-amber-400 transition-colors font-bold">ثبت‌نام کنید</Link>
            </div>
            
            <div className="text-center text-sm">
              <span className="text-slate-400">قبلاً فعال کرده‌اید؟ </span>
              <Link href="/login" className="text-amber-500 hover:text-amber-400 transition-colors font-bold">وارد شوید</Link>
            </div>
          </div>
        )}
      >
        {isVerified ? (
          <div className="text-center space-y-4 py-6 font-vazirmatn">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-slate-200 text-base font-semibold">ایمیل شما با موفقیت تایید شد!</p>
            <p className="text-xs text-slate-400">در حال انتقال به صفحه ورود...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleVerifyEmail)} className="space-y-4 font-vazirmatn">
            <InputField
              label="نشانی ایمیل"
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'وارد کردن نشانی ایمیل الزامی است',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'نشانی ایمیل نامعتبر است',
                },
              })}
              icon={<Mail className="size-4.5 text-slate-400" aria-hidden />}
              error={errors.email?.message}
              required
            />

            <InputField
              label="کد تایید ۶ رقمی"
              type="text"
              placeholder="123456"
              {...register('verificationCode', {
                required: 'وارد کردن کد تایید الزامی است',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'کد تایید باید دقیقاً ۶ رقم باشد',
                },
              })}
              maxLength={6}
              icon={<ShieldCheck className="size-4.5 text-slate-400" aria-hidden />}
              error={errors.verificationCode?.message}
              required
            />

            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs sm:text-sm ${
                message.includes('موفقیت') || message.includes('جدید')
                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-950/40'
                  : 'bg-red-950/20 text-red-400 border border-red-950/40'
              }`}>
                {message.includes('موفقیت') || message.includes('جدید') ? (
                  <CheckCircle className="size-4 shrink-0" />
                ) : (
                  <XCircle className="size-4 shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isPending || !isValid}
              whileHover={isValid ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-base sm:text-lg px-4 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-3 cursor-pointer"
              aria-busy={isPending}
            >
              {isPending ? 'در حال تایید...' : 'فعال‌سازی حساب کاربری'}
            </motion.button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`size-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'در حال ارسال...' : "کد را دریافت نکردید؟ ارسال مجدد"}
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </AnimatedBackground>
  );
}
