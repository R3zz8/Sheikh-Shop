import type { Image } from '@prisma/client';
import type { Metadata } from 'next';
import type { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

type ProductMetadata = {
  title?: string;
  description?: string | null;
  keywords?: string[];
  images?: Image[] | null;
};

export default function customMetadataGenerator({
  title = 'digital shop',
  description = 'a digital shop for ...',
  keywords = ['digital', 'laptop', 'mobile'],
  images = undefined,
}: ProductMetadata): Metadata {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${title}`,
      images,
    } as OpenGraph,
  };
}
