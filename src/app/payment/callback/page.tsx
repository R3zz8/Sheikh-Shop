'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Home, Headphones, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

type PaymentState = 'loading' | 'success' | 'failed';

interface VerificationResponse {
  success: boolean;
  orderId?: string;
  authority?: string;
  reference?: string;
  amount?: number;
}

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PaymentState>('loading');
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const authority = searchParams.get('Authority') || searchParams.get('authority');
    const status = searchParams.get('Status') || searchParams.get('status');
    const orderIdParam = searchParams.get('orderId') || searchParams.get('order_id');
    const refId = searchParams.get('ref_id') || searchParams.get('refId');
    const amountStr = searchParams.get('amount');
    const reason = searchParams.get('reason');

    if (status === 'success') {
      setState('success');
      const parsedAmount = amountStr ? parseFloat(amountStr) : undefined;
      setVerificationData({
        success: true,
        orderId: orderIdParam || undefined,
        authority: authority || '',
        reference: refId || '',
        amount: parsedAmount,
      });
      toast.success('پرداخت با موفقیت انجام شد', {
        description: refId ? `کد پیگیری: ${refId}` : 'سفارش شما با موفقیت ثبت شد.',
        duration: 5000,
      });
      return;
    } else if (status === 'failed') {
      setState('failed');
      let msg = 'پرداخت ناموفق بود یا توسط شما لغو شد.';
      if (reason === 'payment_cancelled_by_user') {
        msg = 'پرداخت توسط کاربر لغو شد.';
      } else if (reason === 'verification_failed') {
        msg = 'تایید پرداخت از سوی درگاه زرین‌پال ناموفق بود.';
      } else if (reason === 'missing_authority') {
        msg = 'شناسه ارجاع پرداخت یافت نشد.';
      } else if (reason === 'order_not_found') {
        msg = 'سفارش مربوط به این پرداخت یافت نشد.';
      }
      setErrorMessage(msg);
      toast.error('پرداخت ناموفق', { description: msg, duration: 6000 });
      return;
    } else if (!authority) {
      setState('failed');
      setErrorMessage('شناسه پرداخت یافت نشد.');
      return;
    } else {
      verifyPayment(authority, status);
    }
    return undefined;
  }, [searchParams, router]);

  const verifyPayment = async (authority: string, statusParam: string | null) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authority, status: statusParam }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setVerificationData({
          success: true,
          authority: verifyData.authority || authority,
          reference: verifyData.reference || verifyData.details?.Reference || '',
          amount: verifyData.details?.Amount ? parseFloat(verifyData.details.Amount) : undefined,
        });
        setState('success');
        toast.success('پرداخت با موفقیت تایید شد!');
      } else {
        setState('failed');
        const errorMsg = verifyData.error || verifyData.details?.Description || 'تایید پرداخت انجام نشد.';
        setErrorMessage(errorMsg);
        toast.error('خطا در تایید پرداخت', { description: errorMsg });
      }
    } catch (error) {
      console.error('[Payment Callback Verification Error]', error);
      setState('failed');
      setErrorMessage('ارتباط با سرور جهت تایید پرداخت برقرار نشد.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-stone-900 to-black p-4 font-vazirmatn text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="bg-stone-900/90 border border-amber-500/20 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8 bg-gradient-to-b from-amber-900/20 to-transparent border-b border-amber-500/10">
            <AnimatePresence mode="wait">
              {state === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    در حال استعلام و تایید پرداخت...
                  </CardTitle>
                  <p className="text-stone-400 text-sm">
                    لطفاً چند لحظه شکیبا باشید
                  </p>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-3"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15 border border-green-500/30">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-200 to-green-400">
                    پرداخت با موفقیت انجام شد!
                  </CardTitle>
                  <p className="text-stone-300 text-sm">
                    سفارش شما با موفقیت ثبت گردید و جهت ارسال پردازش می‌شود.
                  </p>
                </motion.div>
              )}

              {state === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-3"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30">
                    <XCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <CardTitle className="text-2xl font-black text-red-400">
                    پرداخت ناموفق
                  </CardTitle>
                  <p className="text-stone-300 text-sm">
                    {errorMessage || 'پرداخت انجام نشد. هیچ مبلغی از حساب شما کسر نشده است.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <AnimatePresence mode="wait">
              {state === 'success' && verificationData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {verificationData.orderId && (
                    <div className="rounded-2xl bg-stone-950/60 p-3 border border-amber-500/20 flex items-center justify-between">
                      <span className="text-xs text-stone-400">شماره سفارش:</span>
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {verificationData.orderId}
                      </span>
                    </div>
                  )}

                  {verificationData.reference && (
                    <div className="rounded-2xl bg-stone-950/60 p-4 border border-green-500/20 flex items-center justify-between">
                      <span className="text-xs text-stone-400">کد پیگیری بانکی (Ref ID):</span>
                      <span className="text-base font-extrabold text-green-400 font-mono">
                        {verificationData.reference}
                      </span>
                    </div>
                  )}

                  {verificationData.amount !== undefined && (
                    <div className="rounded-2xl bg-stone-950/60 p-4 border border-stone-800 flex items-center justify-between">
                      <span className="text-xs text-stone-400">مبلغ پرداخت شده:</span>
                      <span className="text-base font-bold text-amber-300">
                        {formatPrice(verificationData.amount)}
                      </span>
                    </div>
                  )}

                  {verificationData.authority && (
                    <div className="rounded-2xl bg-stone-950/40 p-3 border border-stone-800 text-xs text-stone-500 flex items-center justify-between">
                      <span>شناسه ارجاع درگاه:</span>
                      <span className="font-mono text-[11px] text-stone-400">{verificationData.authority}</span>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    {verificationData.orderId ? (
                      <Link href={`/account/orders/${verificationData.orderId}`} className="w-full block">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-3 rounded-xl gap-2">
                          مشاهده جزئیات سفارش
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/account/orders" className="w-full block">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-3 rounded-xl gap-2">
                          مشاهده سفارش‌های من
                        </Button>
                      </Link>
                    )}

                    <Link href="/" className="w-full block">
                      <Button variant="outline" className="w-full border-stone-800 text-stone-300 hover:bg-stone-800 rounded-xl gap-2">
                        <Home className="h-4 w-4" />
                        بازگشت به صفحه اصلی
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {state === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
                    در صورت کسر وجه از حساب شما، مبلغ ظرف حداکثر ۷۲ ساعت کاری توسط بانک به حساب شما بازگردانده خواهد شد.
                  </div>

                  <div className="pt-2 space-y-3">
                    <Link href="/checkout" className="w-full block">
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-3 rounded-xl gap-2">
                        <RefreshCw className="h-4 w-4" />
                        تلاش مجدد برای پرداخت
                      </Button>
                    </Link>

                    <Link href="/contact" className="w-full block">
                      <Button variant="outline" className="w-full border-amber-500/20 text-stone-300 hover:bg-amber-500/10 hover:text-white rounded-xl gap-2">
                        <Headphones className="h-4 w-4" />
                        تماس با پشتیبانی
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
