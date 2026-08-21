'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Home, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

type PaymentState = 'loading' | 'success' | 'failed';

interface VerificationResponse {
  success: boolean;
  message?: string;
  authority?: string;
  reference?: string;
  details?: {
    Code?: number;
    Description?: string;
    Authority?: string;
    Reference?: string;
    Amount?: string;
  };
  error?: string;
  code?: number;
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
    const refId = searchParams.get('ref_id') || searchParams.get('refId');
    const amount = searchParams.get('amount');
    const reason = searchParams.get('reason');

    if (status === 'success') {
      setState('success');
      setVerificationData({
        success: true,
        authority: authority || '',
        reference: refId || '',
        details: amount ? { Amount: amount } : undefined,
      });
      toast.success('پرداخت با موفقیت انجام شد', {
        description: refId ? `کد پیگیری: ${refId}` : 'سفارش شما با موفقیت ثبت شد.',
        duration: 5000,
      });

      const redirectDelay = 3000;
      setTimeout(() => {
        router.push('/success');
      }, redirectDelay);
      return;
    }

    if (status === 'failed') {
      setState('failed');
      let msg = 'پرداخت ناموفق بود یا توسط کاربر لغو شد.';
      if (reason === 'payment_cancelled_by_user') {
        msg = 'پرداخت توسط کاربر لغو شد.';
      } else if (reason === 'verification_failed') {
        msg = 'تایید پرداخت از سوی درگاه ناموفق بود.';
      } else if (reason === 'missing_authority') {
        msg = 'شناسه ارجاع پرداخت یافت نشد.';
      }
      setErrorMessage(msg);
      toast.error('پرداخت ناموفق', { description: msg, duration: 6000 });
      return;
    }

    if (!authority) {
      setState('failed');
      setErrorMessage('شناسه پرداخت یافت نشد.');
      return;
    }

    // Legacy fallback verification if needed
    verifyPayment(authority, status);
  }, [searchParams, router]);

  const verifyPayment = async (authority: string, status: string | null) => {
    try {
      console.log('[Payment Callback] Verifying payment:', { authority, status });

      // Call verification API
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authority, status }),
      });

      const verifyData: VerificationResponse = await verifyResponse.json();

      if (verifyData.success && verifyData.details?.Code === 100) {
        // Payment verified successfully
        setVerificationData(verifyData);
        setState('success');

        // Show success toast notification
        toast.success('Payment verified successfully!', {
          description: verifyData.reference 
            ? `Reference: ${verifyData.reference}` 
            : 'Your payment has been processed.',
          duration: 5000,
        });

        // Save transaction to database
        try {
          const amount = verifyData.details?.Amount 
            ? parseFloat(verifyData.details.Amount) 
            : 0;

          const saveResponse = await fetch('/api/payment/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              authority: verifyData.authority || authority,
              reference: verifyData.reference,
              amount: amount,
              status: 'COMPLETED',
              description: verifyData.details?.Description || 'Payment completed successfully',
            }),
          });

          const saveData = await saveResponse.json();
          
          if (!saveData.success) {
            console.error('[Payment Callback] Failed to save transaction:', saveData);
            toast.warning('Payment verified but failed to save transaction record', {
              description: 'Please contact support with your reference number.',
            });
            // Don't fail the whole flow if saving fails - payment is still verified
          } else {
            console.log('[Payment Callback] Transaction saved successfully');
            toast.success('Transaction saved to database', {
              duration: 3000,
            });
          }
        } catch (saveError) {
          console.error('[Payment Callback] Error saving transaction:', saveError);
          toast.error('Failed to save transaction', {
            description: 'Payment is verified but transaction record could not be saved.',
          });
          // Don't fail the whole flow if saving fails
        }

        // Auto-redirect after 3-5 seconds (randomized for better UX)
        const redirectDelay = 3000 + Math.random() * 2000; // 3-5 seconds
        setTimeout(() => {
          // Try to redirect to /account/orders if it exists, otherwise /success, fallback to /
          router.push('/success');
        }, redirectDelay);
      } else {
        // Payment verification failed
        setState('failed');
        const errorMsg = verifyData.error || 
          verifyData.details?.Description || 
          'Payment verification failed';
        setErrorMessage(errorMsg);
        setVerificationData(verifyData);

        // Show error toast notification
        toast.error('Payment verification failed', {
          description: errorMsg,
          duration: 6000,
        });
      }
    } catch (error) {
      console.error('[Payment Callback] Error verifying payment:', error);
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'An error occurred while verifying your payment';
      setState('failed');
      setErrorMessage(errorMsg);

      // Show error toast notification
      toast.error('Payment verification error', {
        description: errorMsg,
        duration: 6000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <AnimatePresence mode="wait">
              {state === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    در حال تایید پرداخت
                  </CardTitle>
                  <p className="text-gray-600">
                    لطفاً چند لحظه شکیبا باشید...
                  </p>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                  >
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </motion.div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    پرداخت موفقیت‌آمیز بود!
                  </CardTitle>
                  <p className="text-gray-600">
                    پرداخت شما تایید شد و سفارش با موفقیت ثبت گردید.
                  </p>
                </motion.div>
              )}

              {state === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 200, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
                  >
                    <XCircle className="h-10 w-10 text-red-600" />
                  </motion.div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    پرداخت ناموفق
                  </CardTitle>
                  <p className="text-gray-600">
                    {errorMessage || 'پرداخت شما انجام نشد.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {state === 'success' && verificationData && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="space-y-4"
                >
                  {verificationData.reference && (
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Reference Number
                      </p>
                      <p className="text-lg font-semibold text-green-900 font-mono">
                        {verificationData.reference}
                      </p>
                    </div>
                  )}

                  {verificationData.details?.Amount && (
                    <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Amount Paid
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(Number(verificationData.details.Amount))}
                      </p>
                    </div>
                  )}

                  {verificationData.authority && (
                    <div className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                      <p className="text-xs text-gray-600">
                        Authority: <span className="font-mono text-xs">{verificationData.authority}</span>
                      </p>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <p className="text-sm text-gray-500 text-center">
                      Redirecting to success page in a few seconds...
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Back to Home
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link href="/contact">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Support
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {state === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="space-y-4"
                >
                  {verificationData?.details && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Error Code
                      </p>
                      <p className="text-lg font-semibold text-red-900">
                        {verificationData.details.Code || verificationData.code || 'Unknown'}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Back to Home
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <Link href="/contact">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Support
                        </Link>
                      </Button>
                    </div>
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

