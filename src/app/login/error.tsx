'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LoginError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[LOGIN_ERROR_BOUNDARY] Exception caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 font-vazirmatn dir-rtl" dir="rtl">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-stone-950/80 to-stone-950" />

      <div className="relative w-full max-w-md bg-stone-900/90 border border-amber-500/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/30 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight">
            اختلال موقت در احراز هویت
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            متأسفانه هنگام بارگذاری یا پردازش ورود مشکلی رخ داده است. جای نگرانی نیست، می‌توانید مجدداً تلاش کنید.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
          "ارتباط با سرور موقتاً برقرار نشد. لطفاً چند لحظه دیگر دوباره تلاش کنید."
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-sm sm:text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className="size-4.5" />
            <span>تلاش مجدد</span>
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-bold text-sm sm:text-base hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Home className="size-4.5" />
            <span>بازگشت به خانه</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
