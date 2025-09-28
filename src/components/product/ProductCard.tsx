import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductsWithImages } from '@/types';

interface ProductCardProps {
  product: ProductsWithImages;
  className?: string;
  onClick?: () => void;
}

export default function ProductCard({ product, className = '', onClick }: ProductCardProps) {
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0]?.image || '/noImage.jpg'
    : '/noImage.jpg';

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-amber-600">
              ${product.basePrice.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {product.baseUnit?.name || 'unit'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

