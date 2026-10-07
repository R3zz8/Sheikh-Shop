'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Megaphone, Phone, Save, Loader2, CheckCircle2, ShieldAlert, Sparkles, X, PhoneCall } from 'lucide-react';

// Persian digits converter helper
export function toPersianDigits(str?: string | null): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)] ?? digit);
}

export default function PrePurchaseNoticeForm() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('اطلاعیه مهم پیش از ثبت سفارش');
  const [message, setMessage] = useState<string>(
    'با توجه به نوسانات قیمت ارز و محدودیت موجودی برخی کالاها، لطفاً پیش از ثبت نهایی سفارش و پرداخت، جهت اطمینان از قیمت روز و موجودی کالا با واحد فروش فروشگاه شیخ هماهنگ فرمایید.'
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('09178769556');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function fetchNotice() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/pre-purchase-notice');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setIsEnabled(data.isEnabled ?? true);
            setTitle(data.title ?? 'اطلاعیه مهم پیش از ثبت سفارش');
            setMessage(
              data.message ??
                'با توجه به نوسانات قیمت ارز و محدودیت موجودی برخی کالاها، لطفاً پیش از ثبت نهایی سفارش و پرداخت، جهت اطمینان از قیمت روز و موجودی کالا با واحد فروش فروشگاه شیخ هماهنگ فرمایید.'
            );
            setPhoneNumber(data.phoneNumber ?? '09178769556');
          }
        }
      } catch (err) {
        console.error('Error loading pre-purchase notice:', err);
        toast.error('خطا در بارگیری اطلاعات اطلاعیه');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotice();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('لطفاً عنوان اطلاعیه را وارد کنید');
      return;
    }

    if (!message.trim()) {
      toast.error('لطفاً متن اطلاعیه را وارد کنید');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('لطفاً شماره تماس را وارد کنید');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/pre-purchase-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled,
          title: title.trim(),
          message: message.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'خطا در ذخیره‌سازی اطلاعیه');
      }

      toast.success('تنظیمات اطلاعیه پیش از خرید با موفقیت به‌روزرسانی شد');
    } catch (err: any) {
      console.error('Error saving pre-purchase notice:', err);
      toast.error(err.message || 'خطا در ذخیره‌سازی اطلاعیه');
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeTelHref = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
  const displayPhonePersian = toPersianDigits(phoneNumber);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-stone-400 text-sm">در حال بارگیری تنظیمات اطلاعیه پیش از خرید...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-vazirmatn text-stone-100 dir-rtl" dir="rtl">
      {/* Header Banner */}
      <div className="bg-stone-900/80 border border-amber-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-amber-100 flex items-center gap-2">
              اطلاعیه پیش از خرید (Pre-Purchase Notice)
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              مدیریت اطلاعیه عمومی نوسانات قیمت، محدودیت موجودی و شماره هماهنگی واحد فروش
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-stone-950/60 px-4 py-2.5 rounded-xl border border-stone-800 self-start sm:self-auto">
          <span className="text-xs font-medium text-stone-300">وضعیت اطلاعیه:</span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {isEnabled ? 'فعال (نمایش روی سایت)' : 'غیرفعال'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <div className="lg:col-span-7 bg-stone-900/60 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-stone-950/50 rounded-xl border border-stone-800/80">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-200 cursor-pointer" htmlFor="notice-toggle">
                  نمایش اطلاعیه عمومی به بازدیدکنندگان
                </label>
                <p className="text-xs text-stone-400">
                  در صورت فعال بودن، هنگام ورود کاربران به سایت، پاپ‌آپ اطلاع‌رسانی پیش از خرید نمایش داده می‌شود.
                </p>
              </div>
              <button
                type="button"
                id="notice-toggle"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-opacity-75 ${
                  isEnabled ? 'bg-amber-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-stone-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {/* Notice Title */}
            <div className="space-y-2">
              <label htmlFor="notice-title" className="block text-sm font-semibold text-stone-200">
                عنوان اطلاعیه <span className="text-amber-400">*</span>
              </label>
              <input
                id="notice-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: اطلاعیه مهم پیش از ثبت سفارش"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all"
                required
              />
            </div>

            {/* Notice Message */}
            <div className="space-y-2">
              <label htmlFor="notice-message" className="block text-sm font-semibold text-stone-200">
                متن اطلاعیه <span className="text-amber-400">*</span>
              </label>
              <textarea
                id="notice-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="متن کامل اطلاعیه را وارد کنید..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all leading-relaxed"
                required
              />
              <p className="text-xs text-stone-400">
                می‌توانید برای خوانایی بهتر متن از شکستن خطوط (Enter) استفاده نمایید.
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="notice-phone" className="block text-sm font-semibold text-stone-200">
                شماره تماس واحد فروش <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="notice-phone"
                  type="text"
                  dir="ltr"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09178769556"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 text-left focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all pl-10"
                  required
                />
                <Phone className="w-4 h-4 text-amber-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              <p className="text-xs text-stone-400">
                در نسخه‌های موبایل، کلیک روی شماره یا دکمه تماس، به‌صورت مستقیم لینک تلفن (<code className="text-amber-300">tel:</code>) را باز خواهد کرد.
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ذخیره‌سازی...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              پیش‌نمایش زنده اطلاعیه (Live Preview)
            </h2>
            <span className="text-xs text-stone-400">نمای مشتریان</span>
          </div>

          <div className="relative bg-stone-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Background ambient lighting */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {!isEnabled && (
              <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center gap-3">
                <ShieldAlert className="w-10 h-10 text-rose-400" />
                <span className="text-rose-300 font-bold text-sm">اطلاعیه در حال حاضر غیرفعال است</span>
                <p className="text-xs text-stone-400 max-w-xs">
                  برای نمایش عمومی این پاپ‌آپ، گزینه‌ «نمایش اطلاعیه عمومی» را فعال نمایید.
                </p>
              </div>
            )}

            <div className="space-y-4 relative z-10">
              {/* Header inside modal */}
              <div className="flex items-start justify-between gap-3 border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">فروشگاه شیخ</span>
                    <h3 className="text-base font-bold text-stone-100">{title || 'عنوان اطلاعیه'}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 text-stone-400 flex items-center justify-center hover:text-stone-200 transition-colors cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Content */}
              <div className="text-sm text-stone-300 leading-relaxed whitespace-pre-line py-2">
                {message || 'متن اطلاعیه در این بخش قرار می‌گیرد...'}
              </div>

              {/* Contact Callout */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-amber-300">
                  <PhoneCall className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="text-xs font-semibold">تماس با واحد فروش:</span>
                </div>
                <a
                  href={safeTelHref}
                  className="text-sm font-bold text-amber-400 tracking-wider hover:underline flex items-center gap-1"
                  onClick={(e) => e.preventDefault()}
                >
                  <span>{displayPhonePersian || '۰۹۱۷۸۷۶۹۵۵۶'}</span>
                </a>
              </div>

              {/* Closing Copy */}
              <div className="text-xs text-stone-400 text-center pt-2 space-y-0.5">
                <p>از همراهی و اعتماد شما سپاسگزاریم.</p>
                <p className="font-semibold text-stone-300">فروشگاه شیخ</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2 relative z-10">
              <a
                href={safeTelHref}
                onClick={(e) => e.preventDefault()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs text-center flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 cursor-not-allowed"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>تماس مستقیم با واحد فروش</span>
              </a>
              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 font-semibold text-xs text-center hover:bg-stone-800 transition-colors cursor-not-allowed"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
