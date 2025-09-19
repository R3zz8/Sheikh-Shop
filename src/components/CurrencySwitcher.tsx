'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyCode, 
  CURRENCY_DISPLAY, 
  getSupportedCurrencies,
  type Locale 
} from '@/lib/currencyConfig';

interface CurrencySwitcherProps {
  currentCurrency?: CurrencyCode;
  locale?: Locale;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  className?: string;
  variant?: 'dropdown' | 'buttons';
}

export default function CurrencySwitcher({
  currentCurrency = 'EUR',
  locale = 'en',
  onCurrencyChange,
  className = '',
  variant = 'dropdown',
}: CurrencySwitcherProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currentCurrency);
  const [isOpen, setIsOpen] = useState(false);

  const supportedCurrencies = getSupportedCurrencies();

  useEffect(() => {
    // Load currency preference from localStorage on mount
    const savedCurrency = localStorage.getItem('preferred-currency');
    if (savedCurrency && supportedCurrencies.includes(savedCurrency as CurrencyCode)) {
      setSelectedCurrency(savedCurrency as CurrencyCode);
    }
  }, [supportedCurrencies]);

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setSelectedCurrency(currency);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem('preferred-currency', currency);
    
    // Set cookie for server-side access
    document.cookie = `preferred-currency=${currency}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    
    // Call callback if provided
    onCurrencyChange?.(currency);
    
    // Reload page to apply new currency
    window.location.reload();
  };

  const currentDisplay = CURRENCY_DISPLAY[selectedCurrency];

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {supportedCurrencies.map((currency) => {
          const display = CURRENCY_DISPLAY[currency];
          const isSelected = currency === selectedCurrency;
          
          return (
            <button
              key={currency}
              onClick={() => handleCurrencyChange(currency)}
              className={`
                px-3 py-1 text-sm font-medium rounded-md transition-colors
                ${isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
              title={`${display.name} (${currency})`}
            >
              {display.symbol} {currency}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentDisplay.symbol}</span>
        <span>{selectedCurrency}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-20">
            <div className="py-1">
              {supportedCurrencies.map((currency) => {
                const display = CURRENCY_DISPLAY[currency];
                const isSelected = currency === selectedCurrency;
                
                return (
                  <button
                    key={currency}
                    onClick={() => handleCurrencyChange(currency)}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition-colors
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-secondary'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{display.symbol}</span>
                      <div>
                        <div className="font-medium">{currency}</div>
                        <div className="text-xs opacity-70">{display.name}</div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for using currency in components
export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred-currency');
    if (savedCurrency && getSupportedCurrencies().includes(savedCurrency as CurrencyCode)) {
      setCurrency(savedCurrency as CurrencyCode);
    }
  }, []);

  const changeCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred-currency', newCurrency);
    document.cookie = `preferred-currency=${newCurrency}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  };

  return { currency, changeCurrency };
}

