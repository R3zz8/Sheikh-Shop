'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Tag } from 'lucide-react';
import type { DiscountInfo } from '@/types';
import { getDiscountTimeRemaining, isDiscountExpiringSoon } from '@/lib/pricing';

interface DiscountBadgeProps {
  discount?: DiscountInfo;
  discountPercentage?: number;
  className?: string;
  showCountdown?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export default function DiscountBadge({
  discount,
  discountPercentage,
  className = '',
  showCountdown = true,
  variant = 'destructive',
}: DiscountBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    discount ? getDiscountTimeRemaining(discount.endDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );
  const [isExpiringSoon, setIsExpiringSoon] = useState(
    discount ? isDiscountExpiringSoon(discount.endDate) : false
  );

  useEffect(() => {
    if (!showCountdown || !discount) return;

    const timer = setInterval(() => {
      const remaining = getDiscountTimeRemaining(discount.endDate);
      setTimeRemaining(remaining);
      setIsExpiringSoon(isDiscountExpiringSoon(discount.endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [discount, showCountdown]);

  const formatTimeRemaining = () => {
    if (timeRemaining.days > 0) return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    if (timeRemaining.hours > 0) return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    const minutes = timeRemaining.minutes.toString().padStart(2, '0');
    const seconds = timeRemaining.seconds.toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getBadgeContent = () => {
    if (discountPercentage) {
      return `${Math.round(discountPercentage)}% OFF`;
    }
    if (discount?.type === 'PERCENTAGE') {
      return `${Math.round(discount.value)}% OFF`;
    }
    if (discount) {
      return `$${discount.value} OFF`;
    }
    return null;
  };

  const percentageValue = discountPercentage || (discount?.type === 'PERCENTAGE' ? discount.value : 0);

  const getBadgeVariant = () => {
    if (isExpiringSoon) return 'destructive';
    if (percentageValue >= 20) return 'destructive';
    if (percentageValue >= 10) return 'default';
    return variant;
  };

  const getIcon = () => {
    if (isExpiringSoon) return <Clock className="w-3 h-3" />;
    if (percentageValue >= 20) return <Zap className="w-3 h-3" />;
    return <Tag className="w-3 h-3" />;
  };

  const badgeContent = getBadgeContent();
  if (!badgeContent) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs text-white shadow-lg ${
          isExpiringSoon 
            ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}
      >
        {getIcon()}
        {badgeContent}
      </div>
      
      {showCountdown && discount && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200/30 bg-red-500/10 text-red-200 text-xs font-medium">
          <Clock className="w-3 h-3" />
          {formatTimeRemaining()}
        </div>
      )}
    </div>
  );
}
