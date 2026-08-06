'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import AuthCard from '@/components/auth/AuthCard';
import PasswordField from '@/components/auth/PasswordField';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResetPasswordValues {
  password?: string;
  confirmPassword?: string;
}

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    void fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken || ''));
  }, []);

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error('لینک بازیابی معتبر نیست یا منقضی شده است');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: data.password, csrfToken }),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('رمز عبور شما با موفقیت تغییر کرد! اکنون می‌توانید وارد شوید.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(resData.message || 'تغییر رمز عبور با خطا مواجه شد');
      }
    } catch {
      toast.error('خطایی رخ داد. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AnimatedBackground>
        <AuthCard
          title="لینک غیرمعتبر"
          subtitle="این لینک بازیابی نامعتبر است یا منقضی شده است"
          footer={(
            <div className="text-center font-vazirmatn">
              <a href="/forgot-password" className="text-amber-500 hover:text-amber-400 font-bold text-sm">درخواست لینک جدید</a>
            </div>
          )}
        >
          <div className="text-center p-4">
            <p className="text-red-400 font-vazirmatn text-sm sm:text-base">
              متأسفانه امکان بازیابی رمز عبور با این لینک وجود ندارد. لطفاً مجدداً درخواست ارسال لینک کنید.
            </p>
          </div>
        </AuthCard>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="تغییر رمز عبور"
        subtitle="رمز عبور جدید خود را وارد کنید"
        footer={(
          <div className="text-center font-vazirmatn">
            <a href="/login" className="text-slate-300 hover:text-amber-500 transition-colors font-medium text-sm">بازگشت به ورود</a>
          </div>
        )}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordField
            label="رمز عبور جدید"
            placeholder="رمز عبور جدید خود را وارد کنید"
            {...register('password', {
              required: 'وارد کردن رمز عبور الزامی است',
              minLength: {
                value: 6,
                message: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
              },
            })}
            error={errors.password?.message}
            required
          />

          <PasswordField
            label="تکرار رمز عبور جدید"
            placeholder="تکرار رمز عبور جدید را وارد کنید"
            {...register('confirmPassword', {
              required: 'تکرار رمز عبور الزامی است',
              validate: (val, values) =>
                val === values.password || 'رمزهای عبور جدید با یکدیگر مطابقت ندارند',
            })}
            error={errors.confirmPassword?.message}
            required
          />

          <motion.button
            type="submit"
            disabled={loading || !isValid}
            whileHover={isValid ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-base sm:text-lg px-4 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-3 cursor-pointer font-vazirmatn"
          >
            {loading ? 'در حال ثبت...' : 'بروزرسانی رمز عبور'}
          </motion.button>
        </form>
      </AuthCard>
    </AnimatedBackground>
  );
}
