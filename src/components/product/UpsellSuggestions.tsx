'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, TrendingUp } from 'lucide-react';
import type { ProductsWithImages, ProductUnit } from '@/types';
import { formatPrice, convertCurrency } from '@/lib/currency';

interface UpsellSuggestionsProps {
    product: ProductsWithImages;
    selectedUnit: ProductUnit;
    currency: string;
}

export default function UpsellSuggestions({ product, selectedUnit, currency }: UpsellSuggestionsProps) {
    // Find better value units (larger units with better price per unit)
    const getUpsellUnits = () => {
        if (!product.units || product.units.length <= 1) return [];
        
        const currentPricePerUnit = Number(selectedUnit.price);
        const currentUnitSize = parseFloat(selectedUnit.name.replace(/[^\d.]/g, '')) || 1;
        const currentPricePerSize = currentPricePerUnit / currentUnitSize;
        
        return product.units
            .filter(unit => {
                if (!unit.isActive || unit.stock === 0) return false;
                if (unit.id === selectedUnit.id) return false;
                
                const unitSize = parseFloat(unit.name.replace(/[^\d.]/g, '')) || 1;
                const unitPricePerSize = Number(unit.price) / unitSize;
                
                // Show units that are larger and have better or similar price per size
                return unitSize > currentUnitSize && unitPricePerSize <= currentPricePerSize * 1.1;
            })
            .sort((a, b) => {
                const aSize = parseFloat(a.name.replace(/[^\d.]/g, '')) || 1;
                const bSize = parseFloat(b.name.replace(/[^\d.]/g, '')) || 1;
                return aSize - bSize; // Sort by size ascending
            })
            .slice(0, 2); // Show max 2 suggestions
    };

    const upsellUnits = getUpsellUnits();

    if (upsellUnits.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h4 className="text-green-200 font-semibold text-sm">Better Value Options</h4>
            </div>
            
            <div className="space-y-2">
                {upsellUnits.map((unit) => {
                    const currentPricePerUnit = Number(selectedUnit.price);
                    const currentUnitSize = parseFloat(selectedUnit.name.replace(/[^\d.]/g, '')) || 1;
                    const currentPricePerSize = currentPricePerUnit / currentUnitSize;
                    
                    const unitSize = parseFloat(unit.name.replace(/[^\d.]/g, '')) || 1;
                    const unitPricePerSize = Number(unit.price) / unitSize;
                    const savings = ((currentPricePerSize - unitPricePerSize) / currentPricePerSize) * 100;
                    
                    return (
                        <div
                            key={unit.id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-green-500/20"
                        >
                            <div>
                                <div className="text-white font-medium text-sm">
                                    {unit.name}
                                </div>
                                <div className="text-green-300 text-xs">
                                    Save {savings.toFixed(0)}% per unit
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-green-200 font-semibold text-sm">
                                    {formatPrice(convertCurrency(Number(unit.price), 'EUR', currency as any), currency as any)}
                                </div>
                                <div className="text-green-400 text-xs">
                                    {formatPrice(convertCurrency(unitPricePerSize, 'EUR', currency as any), currency as any)}/unit
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-3 pt-3 border-t border-green-500/20">
                <p className="text-green-300 text-xs text-center">
                    💡 Larger sizes often offer better value per unit
                </p>
            </div>
        </motion.div>
    );
}
