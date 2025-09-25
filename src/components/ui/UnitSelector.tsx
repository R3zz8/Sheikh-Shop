'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package } from 'lucide-react';
import type { Unit } from '@/types';
import { calculateProductPrice, formatUnit } from '@/lib/pricing';
import { formatPrice, convertCurrency } from '@/lib/currency';
import { useCurrencySafe } from '@/providers/CurrencyProvider';

interface UnitSelectorProps {
  units: Unit[];
  basePrice: number;
  baseUnit: Unit;
  selectedUnit: Unit;
  selectedQuantity: number;
  onUnitChange: (unit: Unit) => void;
  onQuantityChange: (quantity: number) => void;
  className?: string;
  showPriceCalculation?: boolean;
}

export default function UnitSelector({
  units,
  basePrice,
  baseUnit,
  selectedUnit,
  selectedQuantity,
  onUnitChange,
  onQuantityChange,
  className = '',
  showPriceCalculation = true,
}: UnitSelectorProps) {
  const { currency } = useCurrencySafe();
  const [localQuantity, setLocalQuantity] = useState(selectedQuantity.toString());

  useEffect(() => {
    setLocalQuantity(selectedQuantity.toString());
  }, [selectedQuantity]);

  const handleQuantityChange = (value: string) => {
    const numValue = parseFloat(value) || 1;
    const clampedValue = Math.max(0.1, Math.min(1000, numValue)); // Limit between 0.1 and 1000
    setLocalQuantity(clampedValue.toString());
    onQuantityChange(clampedValue);
  };

  const handleQuantityBlur = () => {
    const numValue = parseFloat(localQuantity) || 1;
    const clampedValue = Math.max(0.1, Math.min(1000, numValue));
    setLocalQuantity(clampedValue.toString());
    onQuantityChange(clampedValue);
  };

  const currentPrice = calculateProductPrice(basePrice, selectedUnit, selectedQuantity);
  const baseUnitPrice = calculateProductPrice(basePrice, selectedUnit, 1);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Unit Selection */}
      <div className="space-y-2">
        <Label htmlFor="unit-select" className="text-sm font-medium text-gray-200">
          <Package className="w-4 h-4 inline mr-2" />
          Select Unit
        </Label>
        <Select
          value={selectedUnit.id}
          onValueChange={(value) => {
            const unit = units.find(u => u.id === value);
            if (unit) onUnitChange(unit);
          }}
        >
          <SelectTrigger className="bg-white/8 backdrop-blur-sm border border-amber-200/20 text-white hover:bg-white/12 hover:border-amber-300/40">
            <SelectValue placeholder="Choose unit" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border border-amber-200/20">
            {units.map((unit) => (
              <SelectItem
                key={unit.id}
                value={unit.id}
                className="text-white hover:bg-amber-500/20 focus:bg-amber-500/20"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{unit.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {unit.symbol}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <Label htmlFor="quantity-input" className="text-sm font-medium text-gray-200">
          <Calculator className="w-4 h-4 inline mr-2" />
          Quantity
        </Label>
        <div className="relative">
          <Input
            id="quantity-input"
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            value={localQuantity}
            onChange={(e) => setLocalQuantity(e.target.value)}
            onBlur={handleQuantityBlur}
            className="bg-white/8 backdrop-blur-sm border border-amber-200/20 text-white placeholder-amber-200/60 focus:ring-2 focus:ring-amber-400 focus:border-amber-300/40 pr-16"
            placeholder="1"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-200/60 text-sm">
            {selectedUnit.symbol}
          </div>
        </div>
      </div>

      {/* Price Calculation Display */}
      {showPriceCalculation && (
        <div className="bg-white/5 backdrop-blur-sm border border-amber-200/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Base Price:</span>
            <span className="text-amber-200">
              {formatPrice(convertCurrency(basePrice, 'EUR', currency), currency)} per {baseUnit.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Unit Price:</span>
            <span className="text-amber-200">
              {formatPrice(convertCurrency(baseUnitPrice, 'EUR', currency), currency)} per {selectedUnit.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Quantity:</span>
            <span className="text-amber-200">
              {selectedQuantity} {formatUnit(selectedUnit, selectedQuantity)}
            </span>
          </div>
          <div className="border-t border-amber-200/20 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total Price:</span>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                {formatPrice(convertCurrency(currentPrice, 'EUR', currency), currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
