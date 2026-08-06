'use client';

import React, { useState } from 'react';
import { Mail, SendHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  async function onSubmit(data: ForgotPasswordValues) {
    setLoading(true);
    setMessage(null);

    try {
      // Fetch CSRF token
      const csrfRes = await fetch('/api/csrf');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: data.email, csrfToken: csrfData.csrfToken }),
      });

      const resJson = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('ایمیل بازیابی رمز عبور ارسال شد! صندوق ورودی خود را بررسی کنید.');
        setMessage('ایمیل بازیابی رمز عبور ارسال شد! صندوق ورودی خود را بررسی کنید.');
      } else {
        setMessage(resJson?.message || 'ارسال ایمیل بازیابی با خطا مواجه شد.');
      }
    } catch (err: any) {
      setMessage(err?.message || 'ارسال ایمیل بازیابی با خطا مواجه شد.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="بازیابی رمز عبور"
        subtitle="لینک بازیابی رمز عبور به ایمیل شما ارسال خواهد شد"
        footer={(
          <div className="text-center text-sm font-medium font-vazirmatn">
            <Link href="/login" className="text-slate-300 hover:text-amber-500 transition-colors">بازگشت به صفحه ورود</Link>
          </div>
        )}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Forgot password form">
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
            icon={<Mail className="size-4 text-slate-400" aria-hidden />}
            error={errors.email?.message}
            required
          />

          <button
            type="submit"
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 font-vazirmatn cursor-pointer"
            disabled={loading || !isValid}
            aria-busy={loading}
          >
            <span className="mr-2">{loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}</span>
            <SendHorizontal className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          </button>

          {message && (
            <p className="text-center text-sm font-semibold text-red-400 mt-3 bg-red-950/20 py-2.5 px-4 rounded-xl border border-red-950/40 font-vazirmatn" role="alert">{message}</p>
          )}
        </form>
      </AuthCard>
    </AnimatedBackground>
  );
}
