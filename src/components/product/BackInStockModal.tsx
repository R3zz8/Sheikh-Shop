'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, X, AlertCircle, Loader2, Phone, Mail } from 'lucide-react';

interface BackInStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string | null;
}

export const BackInStockModal: React.FC<BackInStockModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
}) => {
  const [contactType, setContactType] = useState<'mobile' | 'email'>('mobile');
  const [contactValue, setContactValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!contactValue.trim()) {
      setErrorMessage(
        contactType === 'mobile'
          ? 'لطفاً شماره موبایل خود را وارد کنید.'
          : 'لطفاً آدرس ایمیل خود را وارد کنید.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const payload = contactType === 'mobile'
        ? { mobile: contactValue.trim() }
        : { email: contactValue.trim() };

      const response = await fetch(`/api/products/${productId}/back-in-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطایی در ثبت درخواست رخ داد.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'ارتباط با سرور برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setContactValue('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-stone-900/95 p-6 shadow-2xl text-right font-vazirmatn text-stone-100"
          dir="rtl"
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute left-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="rounded-full bg-amber-500/10 p-4 border border-amber-500/30">
                <CheckCircle2 className="h-12 w-12 text-amber-400" />
              </div>

              <h3 className="text-xl font-bold text-amber-200">
                درخواست شما با موفقیت ثبت شد ✦
              </h3>

              <p className="text-sm text-stone-300 leading-relaxed max-w-xs">
                به محض موجود شدن <span className="font-semibold text-amber-400">{productName}</span>، به شما اطلاع می‌دهیم.
              </p>

              <button
                onClick={handleReset}
                className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-stone-950 transition-all hover:bg-amber-400 active:scale-95"
              >
                متوجه شدم
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center space-x-3 space-x-reverse border-b border-stone-800 pb-4">
                <div className="rounded-xl bg-amber-500/10 p-2.5 border border-amber-500/20 text-amber-400">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">اطلاع‌رسانی موجودی</h3>
                  <p className="text-xs text-stone-400">به محض موجود شدن محصول به شما پیام می‌دهیم</p>
                </div>
              </div>

              {/* Product snippet */}
              <div className="flex items-center space-x-3 space-x-reverse rounded-xl bg-stone-950/60 p-3 border border-stone-800/80">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-12 w-12 rounded-lg object-contain bg-stone-900 border border-stone-800"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-stone-500 text-xs">
                    شیخ
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-stone-200 truncate">{productName}</h4>
                  <span className="text-xs text-amber-400/90">در حال حاضر ناموجود است</span>
                </div>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="flex items-center space-x-2 space-x-reverse rounded-xl bg-red-500/10 p-3 border border-red-500/30 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Contact toggle form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-300">
                    نحوه اطلاع‌رسانی را انتخاب کنید:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setContactType('mobile'); setContactValue(''); }}
                      className={`flex items-center justify-center space-x-2 space-x-reverse rounded-xl py-2.5 text-xs font-medium border transition-all ${
                        contactType === 'mobile'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                          : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>پیامک (موبایل)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setContactType('email'); setContactValue(''); }}
                      className={`flex items-center justify-center space-x-2 space-x-reverse rounded-xl py-2.5 text-xs font-medium border transition-all ${
                        contactType === 'email'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                          : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>ایمیل</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-300">
                    {contactType === 'mobile' ? 'شماره همراه (مثال: 09123456789)' : 'آدرس ایمیل'}
                  </label>
                  <input
                    type={contactType === 'mobile' ? 'tel' : 'email'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactType === 'mobile' ? '09123456789' : 'name@example.com'}
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ltr:text-left"
                    dir={contactType === 'email' ? 'ltr' : 'rtl'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 space-x-reverse rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-sm font-semibold text-stone-950 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>موجود شد خبرم کن ✦</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
