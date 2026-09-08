'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, CheckCheck, XCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface OrderTimelineProps {
  orderStatus: string;
  paymentStatus: string;
  trackingCode?: string | null;
}

export default function OrderTimeline({ orderStatus, paymentStatus, trackingCode }: OrderTimelineProps) {
  const [copied, setCopied] = useState(false);
  const isCancelled = orderStatus === 'CANCELLED';

  const handleCopyTrackingCode = () => {
    if (!trackingCode) return;
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      id: 'created',
      label: 'ثبت سفارش',
      icon: Clock,
      isCompleted: true,
      isActive: false,
    },
    {
      id: 'paid',
      label: 'تایید پرداخت',
      icon: CheckCircle2,
      isCompleted: paymentStatus === 'PAID' || orderStatus === 'PROCESSING' || orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED',
      isActive: paymentStatus === 'PENDING' && !isCancelled,
    },
    {
      id: 'processing',
      label: 'آماده‌سازی',
      icon: PackageCheck,
      isCompleted: orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED',
      isActive: orderStatus === 'PROCESSING' && !isCancelled,
    },
    {
      id: 'shipped',
      label: 'تحویل به تیپاکس',
      icon: Truck,
      isCompleted: orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED',
      isActive: orderStatus === 'SHIPPED' && !isCancelled,
    },
    {
      id: 'delivered',
      label: 'تحویل داده شد',
      icon: CheckCheck,
      isCompleted: orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED',
      isActive: false,
    },
  ];

  if (isCancelled) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-300">
        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">سفارش لغو شده است</h4>
          <p className="text-xs text-red-300/80 mt-0.5">این سفارش در حالت لغو شده قرار گرفته و پردازش نمی‌شود.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center justify-between max-w-2xl mx-auto px-2">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-stone-800 -z-0 rounded-full" />

        {steps.map((step) => {
          const StepIcon = step.icon;
          const isDone = step.isCompleted;
          const isCurrent = step.isActive;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isDone
                    ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : isCurrent
                    ? 'bg-stone-900 border-amber-400 text-amber-400 animate-pulse'
                    : 'bg-stone-900 border-stone-800 text-stone-600'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs mt-2 font-medium text-center ${
                  isDone || isCurrent ? 'text-amber-200 font-bold' : 'text-stone-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {trackingCode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-stone-400 block sm:inline">کد رهگیری تیپاکس: </span>
              <span className="font-mono text-base font-extrabold text-amber-300 tracking-wider">{trackingCode}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTrackingCode}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs text-amber-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد' : 'کپی کد رهگیری'}</span>
            </button>
            <a
              href={`https://tipax.ir/tracking?code=${encodeURIComponent(trackingCode)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <span>پیگیری مستقیم</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
