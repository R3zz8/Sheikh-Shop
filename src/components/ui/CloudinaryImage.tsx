'use client';

import Image from 'next/image';
import { cloudinaryHelpers } from '@/lib/cloudinary';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  variant?: 'optimized' | 'thumbnail' | 'responsive';
}

export default function CloudinaryImage({
  publicId,
  alt,
  width = 600,
  height = 600,
  className = '',
  variant = 'optimized',
}: CloudinaryImageProps) {
  let src = '';
  if (variant === 'thumbnail') {
    src = cloudinaryHelpers.urlThumbnail(publicId, width, height);
  } else if (variant === 'responsive') {
    src = cloudinaryHelpers.urlResponsive(publicId, width);
  } else {
    src = cloudinaryHelpers.urlOptimized(publicId);
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}







