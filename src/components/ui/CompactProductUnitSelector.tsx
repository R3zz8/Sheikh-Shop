'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Package } from 'lucide-react';
import type { ProductUnit } from '@/types';
import { formatPrice } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';
import { convertCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface CompactProductUnitSelectorProps {
  productUnits: ProductUnit[];
  selectedProductUnit: ProductUnit | null;
  onProductUnitChange: (unit: ProductUnit) => void;
  className?: string;
  variant?: 'card' | 'detail';
  disabled?: boolean;
}

export default function CompactProductUnitSelector({
  productUnits,
  selectedProductUnit,
  onProductUnitChange,
  className = '',
  variant = 'card',
  disabled = false,
}: CompactProductUnitSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { currency } = useCurrencySafe();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < productUnits.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : productUnits.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < productUnits.length) {
            const selectedUnit = productUnits[focusedIndex];
            if (selectedUnit) {
              handleSelect(selectedUnit);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    
    return undefined;
  }, [isOpen, focusedIndex, productUnits]);

  const handleSelect = (unit: ProductUnit) => {
    onProductUnitChange(unit);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  // Don't render if no units or only one unit
  if (!productUnits || productUnits.length <= 1) {
    return null;
  }

  const activeUnits = productUnits.filter(unit => unit.isActive);
  if (activeUnits.length <= 1) {
    return null;
  }

  const getVariantStyles = () => {
    if (variant === 'detail') {
      return {
        trigger: 'px-4 py-2.5 text-sm font-medium min-w-[120px]',
        dropdown: 'min-w-[200px] mt-2',
        option: 'px-4 py-3',
      };
    }
    
    return {
      trigger: 'px-3 py-1.5 text-xs font-medium min-w-[80px]',
      dropdown: 'min-w-[160px] mt-1',
      option: 'px-3 py-2',
    };
  };

  const styles = getVariantStyles();

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-full',
          'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
          'backdrop-blur-sm border border-amber-200/30',
          'text-white hover:from-amber-500/30 hover:to-orange-500/30',
          'hover:border-amber-200/50 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-amber-400/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          styles.trigger
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select product unit"
      >
        <div className="flex items-center gap-1.5">
          <Package className="w-3 h-3 text-amber-300" />
          <span className="truncate">
            {selectedProductUnit?.name || activeUnits[0]?.name || 'Select'}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            'w-3 h-3 text-amber-300 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 bg-gray-900/95 backdrop-blur-xl',
            'border border-amber-200/20 rounded-xl shadow-2xl',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            variant === 'card' ? 'right-0' : 'left-0',
            styles.dropdown
          )}
          role="listbox"
        >
          <div className="py-1">
            {activeUnits.map((unit, index) => {
              const isSelected = selectedProductUnit?.id === unit.id;
              const isFocused = index === focusedIndex;
              const isOutOfStock = unit.stock === 0;
              const isLowStock = unit.stock > 0 && unit.stock <= 5;
              
              let convertedPrice = Number(unit.price);
              try {
                convertedPrice = convertCurrency(Number(unit.price), 'EUR', currency);
              } catch (error) {
                console.error('Currency conversion error:', error);
              }

              return (
                <button
                  key={unit.id}
                  onClick={() => handleSelect(unit)}
                  disabled={isOutOfStock}
                  className={cn(
                    'w-full text-left transition-colors duration-150',
                    'flex items-center justify-between',
                    styles.option,
                    isSelected && 'bg-amber-500/20 text-amber-200',
                    isFocused && !isSelected && 'bg-white/10',
                    !isSelected && !isFocused && 'text-gray-300 hover:bg-white/5',
                    isOutOfStock && 'opacity-50 cursor-not-allowed'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{unit.name}</span>
                      {isOutOfStock && (
                        <span className="text-xs text-red-400 font-medium">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && (
                        <span className="text-xs text-yellow-400 font-medium">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {unit.stock} units available
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-amber-200">
                      {formatPrice(convertedPrice, currency)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
