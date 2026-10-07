'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Phone, X, PhoneCall, Check } from 'lucide-react';

interface PrePurchaseNoticeData {
  isEnabled: boolean;
  title: string;
  message: string;
  phoneNumber: string;
}

const STORAGE_KEY = 'sheikh_pre_purchase_notice_dismissed';

export function toPersianDigits(str?: string | null): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)] ?? digit);
}

export default function PrePurchaseNoticeModal() {
  const [notice, setNotice] = useState<PrePurchaseNoticeData | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAndFetchNotice() {
      try {
        // Check if user already dismissed the notice in this session
        if (typeof window !== 'undefined') {
          const dismissed = sessionStorage.getItem(STORAGE_KEY);
          if (dismissed === 'true') {
            return;
          }
        }

        const res = await fetch('/api/pre-purchase-notice', {
          cache: 'no-store',
        });

        if (!res.ok) return;

        const data: PrePurchaseNoticeData = await res.json();

        if (isMounted && data && data.isEnabled) {
          setNotice(data);
          setIsOpen(true);
        }
      } catch (err) {
        // Non-critical UX layer; fail silently without breaking site
        console.error('[PRE_PURCHASE_NOTICE_FETCH_ERROR]', err);
      }
    }

    checkAndFetchNotice();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
          // Ignore quota or disabled storage errors
        }
      }
    }, 200);
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen || !notice || !notice.isEnabled) {
    return null;
  }

  const safeTelHref = `tel:${notice.phoneNumber.replace(/[^0-9+]/g, '')}`;
  const displayPhonePersian = toPersianDigits(notice.phoneNumber);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-vazirmatn dir-rtl transition-opacity duration-200 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-purchase-notice-title"
      aria-describedby="pre-purchase-notice-desc"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card Container */}
      <div
        className={`relative w-full max-w-lg bg-stone-950/95 border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden transition-transform duration-200 flex flex-col max-h-[85vh] sm:max-h-[90vh] z-10 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Top ambient lighting glows */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-amber-500/20 flex items-start justify-between gap-3 relative z-10 bg-stone-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 tracking-wider block">فروشگاه شیخ</span>
              <h2 id="pre-purchase-notice-title" className="text-base sm:text-lg font-extrabold text-stone-100">
                {notice.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="بستن اطلاعیه"
            className="w-9 h-9 rounded-full bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 flex items-center justify-center transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 relative z-10 custom-scrollbar">
          {/* Main Copy */}
          <p
            id="pre-purchase-notice-desc"
            className="text-stone-200 text-sm sm:text-base leading-relaxed sm:leading-loose whitespace-pre-line font-medium text-justify"
          >
            {notice.message}
          </p>

          {/* Contact Callout Banner */}
          <div className="bg-gradient-to-r from-amber-950/40 via-stone-900/60 to-amber-950/40 border border-amber-500/35 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5 text-amber-200">
              <PhoneCall className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
              <span className="text-xs sm:text-sm font-bold">شماره هماهنگی واحد فروش:</span>
            </div>
            <a
              href={safeTelHref}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-base tracking-wider transition-all flex items-center justify-center gap-2 text-center dir-ltr cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>{displayPhonePersian}</span>
            </a>
          </div>

          {/* Respectful Closing Signoff */}
          <div className="text-center text-xs sm:text-sm text-stone-400 pt-1 space-y-1">
            <p>از همراهی و اعتماد شما سپاسگزاریم.</p>
            <p className="font-bold text-amber-300">فروشگاه شیخ</p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 pt-3 border-t border-amber-500/20 bg-stone-900/40 flex flex-col sm:flex-row gap-3 relative z-10">
          <a
            href={safeTelHref}
            onClick={handleClose}
            className="flex-1 min-h-[44px] py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>تماس مستقیم با واحد فروش</span>
          </a>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] py-3 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-bold text-sm text-center transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>متوجه شدم</span>
          </button>
        </div>
      </div>
    </div>
  );
}
