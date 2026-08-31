import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, CheckCheck, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  orderStatus: string;
  paymentStatus: string;
  trackingCode?: string | null;
}

export default function OrderTimeline({ orderStatus, paymentStatus, trackingCode }: OrderTimelineProps) {
  const isCancelled = orderStatus === 'CANCELLED';

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
      label: 'تحویل به پست',
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

        {steps.map((step, index) => {
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
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-center flex items-center justify-center gap-2">
          <Truck className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-stone-300">کد مرسوله پستی:</span>
          <span className="font-mono text-sm font-extrabold text-amber-300">{trackingCode}</span>
        </div>
      )}
    </div>
  );
}
