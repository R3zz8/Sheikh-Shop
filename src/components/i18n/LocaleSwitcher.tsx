'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n/config';

interface LocaleSwitcherProps {
  currentLocale?: Locale;
  className?: string;
}

export default function LocaleSwitcher({ currentLocale = 'en', className = '' }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (locale: Locale) => {
    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Add new locale to pathname
    const newPath = `/${locale}${pathWithoutLocale}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {localeFlags[currentLocale]} {localeNames[currentLocale]}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3 ${
                    locale === currentLocale ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{localeFlags[locale]}</span>
                  <span className="text-sm font-medium">{localeNames[locale]}</span>
                  {locale === currentLocale && (
                    <span className="ml-auto text-xs text-amber-600">Current</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


