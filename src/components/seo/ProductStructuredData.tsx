'use client';

import React from 'react';
import type { ProductsWithImages, ProductUnit } from '@/types';

interface ProductStructuredDataProps {
    product: ProductsWithImages;
    selectedUnit?: ProductUnit | null;
}

export default function ProductStructuredData({ product, selectedUnit }: ProductStructuredDataProps) {
    // Get the lowest price from all units
    const getLowestPrice = () => {
        if (product.units && product.units.length > 0) {
            const activeUnits = product.units.filter(unit => unit.isActive && unit.stock > 0);
            if (activeUnits.length > 0) {
                return Math.min(...activeUnits.map(unit => Number(unit.price)));
            }
        }
        return product.basePrice;
    };

    const lowestPrice = getLowestPrice();
    const currentPrice = selectedUnit ? Number(selectedUnit.price) : product.basePrice;

    // Generate offers for each unit
    const generateOffers = () => {
        if (!product.units || product.units.length === 0) {
            return [{
                "@type": "Offer",
                "price": product.basePrice,
                "priceCurrency": "IRR",
                "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition",
                "seller": {
                    "@type": "Organization",
                    "name": "Sheikh Shop"
                }
            }];
        }

        return product.units
            .filter(unit => unit.isActive)
            .map(unit => ({
                "@type": "Offer",
                "name": `${product.name} - ${unit.name}`,
                "price": Number(unit.price),
                "priceCurrency": "IRR",
                "availability": unit.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition",
                "seller": {
                    "@type": "Organization",
                    "name": "Sheikh Shop"
                },
                "description": `${product.name} in ${unit.name} size`
            }));
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} - Premium quality product`,
        "image": product.images?.map(img => img.image) || [],
        "brand": {
            "@type": "Brand",
            "name": "Sheikh Shop"
        },
        "category": product.category,
        "sku": product.id,
        "offers": generateOffers(),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "124",
            "bestRating": "5",
            "worstRating": "1"
        },
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "Base Unit",
                "value": product.baseUnit?.name || "Unit"
            },
            {
                "@type": "PropertyValue",
                "name": "Available Sizes",
                "value": product.units?.filter(u => u.isActive).map(u => u.name).join(", ") || product.baseUnit?.name || "Standard"
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
        />
    );
}

