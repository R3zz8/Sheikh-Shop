'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Tag } from 'lucide-react';
import type { DiscountInfo } from '@/types';
import { getDiscountTimeRemaining, isDiscountExpiringSoon } from '@/lib/pricing';

interface DiscountBadgeProps {
  discount: DiscountInfo;
  className?: string;
  showCountdown?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export default function DiscountBadge({
  discount,
  className = '',
  showCountdown = true,
  variant = 'destructive',
}: DiscountBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState(getDiscountTimeRemaining(discount.endDate));
  const [isExpiringSoon, setIsExpiringSoon] = useState(isDiscountExpiringSoon(discount.endDate));

  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      const remaining = getDiscountTimeRemaining(discount.endDate);
      setTimeRemaining(remaining);
      setIsExpiringSoon(isDiscountExpiringSoon(discount.endDate));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [discount.endDate, showCountdown]);

  const formatTimeRemaining = () => {
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h`;
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else {
      return `${timeRemaining.minutes}m`;
    }
  };

  const getBadgeContent = () => {
    if (discount.type === 'PERCENTAGE') {
      return `${Math.round(discount.value)}% OFF`;
    } else {
      return `$${discount.value} OFF`;
    }
  };

  const getBadgeVariant = () => {
    if (isExpiringSoon) return 'destructive';
    if (discount.type === 'PERCENTAGE' && discount.value >= 20) return 'destructive';
    if (discount.type === 'PERCENTAGE' && discount.value >= 10) return 'default';
    return variant;
  };

  const getIcon = () => {
    if (isExpiringSoon) return <Clock className="w-3 h-3" />;
    if (discount.type === 'PERCENTAGE' && discount.value >= 20) return <Zap className="w-3 h-3" />;
    return <Tag className="w-3 h-3" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={getBadgeVariant()}
        className={`font-semibold text-xs px-2 py-1 ${
          isExpiringSoon ? 'animate-pulse' : ''
        }`}
      >
        <div className="flex items-center gap-1">
          {getIcon()}
          {getBadgeContent()}
        </div>
      </Badge>
      
      {showCountdown && (
        <Badge 
          variant="outline" 
          className="text-xs px-2 py-1 border-amber-200/20 text-amber-200"
        >
          <Clock className="w-3 h-3 mr-1" />
          {formatTimeRemaining()}
        </Badge>
      )}
    </div>
  );
}
