'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy } from 'lucide-react';

interface ProductBadgeProps {
  isNew?: boolean;
  isBestSeller?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductBadge({
  isNew = false,
  isBestSeller = false,
  className = '',
  size = 'md',
}: ProductBadgeProps) {
  if (!isNew && !isBestSeller) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`flex flex-wrap gap-2 font-vazirmatn ${className}`} dir="rtl">
      {isNew && (
        <Badge 
          variant="default"
          className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold border-0 shadow-lg`}
        >
          <div className="flex items-center gap-1">
            <Sparkles className={iconSizes[size]} />
            جدید
          </div>
        </Badge>
      )}
      
      {isBestSeller && (
        <Badge 
          variant="default"
          className={`${sizeClasses[size]} bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold border-0 shadow-lg`}
        >
          <div className="flex items-center gap-1">
            <Trophy className={iconSizes[size]} />
            پرفروش
          </div>
        </Badge>
      )}
    </div>
  );
}
