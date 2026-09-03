'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShieldCheck,
  PhoneCall,
  Copy,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { STORE_CONTACT_CONFIG } from '@/lib/config/store';
import { formatToToman } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { ProductsWithImages } from '@/types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAndProceed?: () => void;
  product?: ProductsWithImages | null;
  selectedQuantity?: number;
  currentPrice?: number;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirmAndProceed,
  product,
  selectedQuantity = 1,
  currentPrice,
}: OrderConfirmationModalProps) {
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const displayPrice = currentPrice ?? (product?.basePrice || 0);
  const productImage =
    product?.images?.[0]?.secureUrl || product?.images?.[0]?.image || '/noImage.jpg';

  const handleCopyPhone = async () => {
    if (isCopying || copied) return;
    setIsCopying(true);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(STORE_CONTACT_CONFIG.phone);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = STORE_CONTACT_CONFIG.phone;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
    } finally {
      setIsCopying(false);
    }
  };

  const handlePrimaryCallAction = () => {
    window.location.href = STORE_CONTACT_CONFIG.phoneHref;
    if (onConfirmAndProceed) {
      onConfirmAndProceed();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'fixed z-50 grid w-full max-w-lg gap-0 border border-amber-500/20 bg-[#1C120C]/95 p-0 text-stone-100 shadow-[0_25px_60px_-15px_rgba(42,26,18,0.7)] backdrop-blur-2xl transition-all duration-200 dir-rtl font-vazirmatn overflow-hidden',
          'bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 rounded-t-[2.5rem] sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[2.5rem]'
        )}
        dir="rtl"
        aria-describedby="order-confirmation-description"
      >
        {/* Subtle Ambient Background Light */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-7 border-b border-amber-500/15 bg-gradient-to-b from-amber-500/10 to-transparent">
          <DialogHeader className="text-right space-y-1.5">
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-black w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{STORE_CONTACT_CONFIG.conciergeEyebrow}</span>
            </div>

            {/* Primary Heading */}
            <DialogTitle className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2.5 pt-1">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <span>{STORE_CONTACT_CONFIG.conciergeTitle}</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Polite Body Copy */}
          <div
            id="order-confirmation-description"
            className="text-xs sm:text-sm text-stone-200 leading-relaxed space-y-3 bg-[#2A1A12]/60 border border-amber-500/10 rounded-2xl p-4 sm:p-5"
          >
            <p className="font-bold text-amber-200/90">
              مشتری گرامی،
              <br />
              از اعتماد و انتخاب شما از فروشگاه شیخ صمیمانه سپاسگزاریم.
            </p>
            <p className="text-stone-300">
              با توجه به تغییرات لحظه‌ای بازار و شرایط تأمین برخی کالاها، برای اطمینان از موجودی و قیمت نهایی محصول، پیشنهاد می‌کنیم پیش از پرداخت، سفارش خود را با واحد فروش هماهنگ فرمایید.
            </p>
            <p className="text-stone-300">
              کارشناسان ما در کوتاه‌ترین زمان، وضعیت کالا را بررسی کرده و نتیجه را به شما اطلاع خواهند داد.
            </p>
            <div className="pt-2 border-t border-amber-500/10 text-xs font-bold text-amber-400/90 flex justify-between items-center">
              <span>با احترام، تیم فروشگاه شیخ</span>
              <span className="text-[11px] font-mono text-stone-400">واحد پشتیبانی اختصاصی</span>
            </div>
          </div>

          {/* Compact Benefits Grid */}
          <div className="grid grid-cols-3 gap-2.5 py-1">
            <div className="bg-[#2A1A12] border border-amber-500/15 rounded-xl p-2.5 text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto text-xs font-black">
                ✓
              </div>
              <span className="text-[11px] font-bold text-stone-200 block">بررسی موجودی</span>
            </div>
            <div className="bg-[#2A1A12] border border-amber-500/15 rounded-xl p-2.5 text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto text-xs font-black">
                ✓
              </div>
              <span className="text-[11px] font-bold text-stone-200 block">تأیید قیمت نهایی</span>
            </div>
            <div className="bg-[#2A1A12] border border-amber-500/15 rounded-xl p-2.5 text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto text-xs font-black">
                ✓
              </div>
              <span className="text-[11px] font-bold text-stone-200 block">هماهنگی سفارش</span>
            </div>
          </div>

          {/* Optional Compact Product Preview */}
          {product && (
            <div className="bg-[#2A1A12]/80 border border-amber-500/15 rounded-2xl p-3.5 flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1C120C] border border-amber-500/20 shrink-0">
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0 text-right space-y-1">
                <h4 className="text-xs font-black text-stone-100 truncate">{product.name}</h4>
                <div className="flex items-center justify-between text-[11px] text-stone-300">
                  <span>تعداد: <strong className="text-amber-300 font-bold">{selectedQuantity}</strong></span>
                  <span className="text-stone-400">
                    قیمت نمایش‌داده‌شده: <strong className="text-amber-400 font-black">{formatToToman(displayPrice * selectedQuantity)}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details & Inline Confirmation */}
          <div className="bg-[#2A1A12] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-0.5 text-right">
              <span className="text-[11px] font-bold text-stone-400 block">{STORE_CONTACT_CONFIG.supportTeamTitle}</span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-300 tracking-widest dir-ltr inline-block">
                {STORE_CONTACT_CONFIG.phonePersian}
              </span>
            </div>

            <button
              onClick={handleCopyPhone}
              disabled={isCopying}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border',
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-900/80 border-stone-700 hover:border-amber-500/40 text-stone-300 hover:text-amber-300'
              )}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>شماره تماس کپی شد.</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>کپی شماره</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 sm:p-6 border-t border-amber-500/15 bg-stone-950/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Primary Call Action */}
          <button
            onClick={handlePrimaryCallAction}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <PhoneCall className="w-4.5 h-4.5 text-stone-950" />
            <span>هماهنگی و تأیید سفارش</span>
          </button>

          {/* Secondary Exit Action */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 font-bold text-xs transition-colors text-center"
          >
            بعداً هماهنگ می‌کنم
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
