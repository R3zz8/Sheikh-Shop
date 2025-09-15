'use client';

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { locales, localeConfig, type Locale } from '@/lib/i18n';
import { usePathname, useRouter } from 'next/navigation';

interface LocaleSwitcherProps {
  currentLocale?: Locale;
  className?: string;
}

export default function LocaleSwitcher({ 
  currentLocale = 'en', 
  className = '' 
}: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (locale: Locale) => {
    // Remove current locale from path if it exists
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Add new locale to path
    const newPath = `/${locale}${pathWithoutLocale}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {localeConfig[currentLocale].name}
        </span>
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
                  onClick={() => handleLocaleChange(locale)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    currentLocale === locale ? 'bg-blue-50' : ''
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg ${locale === 'ar' ? 'font-bold' : ''}`}>
                      {locale === 'en' ? '🇺🇸' : '🇦🇪'}
                    </span>
                    <span className={localeConfig[locale].dir === 'rtl' ? 'text-right' : 'text-left'}>
                      {localeConfig[locale].name}
                    </span>
                  </div>
                  {currentLocale === locale && (
                    <Check className="w-4 h-4 text-blue-600" />
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





