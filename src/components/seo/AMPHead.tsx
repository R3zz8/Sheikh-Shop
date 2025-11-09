'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getBaseUrl } from '@/lib/seo/hreflang';

export default function AMPHead() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Add amphtml link tag to head
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://sheikhshops.com';
    
    // Determine AMP URL based on current path
    let ampUrl = '';
    if (pathname === '/') {
      ampUrl = `${baseUrl}/amp`;
    } else if (pathname === '/products') {
      ampUrl = `${baseUrl}/amp/products`;
    } else if (pathname.startsWith('/products/')) {
      const slug = pathname.replace('/products/', '');
      ampUrl = `${baseUrl}/amp/products/${slug}`;
    }
    
    if (ampUrl) {
      // Remove existing amphtml link if any
      const existingLink = document.querySelector('link[rel="amphtml"]');
      if (existingLink) {
        existingLink.remove();
      }
      
      // Add new amphtml link
      const link = document.createElement('link');
      link.rel = 'amphtml';
      link.href = ampUrl;
      document.head.appendChild(link);
    }
    
    return () => {
      // Cleanup on unmount
      const link = document.querySelector('link[rel="amphtml"]');
      if (link) {
        link.remove();
      }
    };
  }, [pathname]);
  
  return null;
}


