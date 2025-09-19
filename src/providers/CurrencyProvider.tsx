'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, type Locale } from '@/lib/currencyConfig';
import { getUserPreferredCurrency, parseCurrency } from '@/lib/currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  locale: Locale;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
  locale?: Locale;
  initialCurrency?: CurrencyCode;
}

export function CurrencyProvider({ 
  children, 
  locale = 'en',
  initialCurrency 
}: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    // Always start with EUR to prevent hydration mismatch
    return initialCurrency || 'EUR';
  });
  
  const [isClient, setIsClient] = useState(false);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-currency', newCurrency);
      // Also set cookie for server-side access
      document.cookie = `preferred-currency=${newCurrency}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  };

  // Load currency from localStorage on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('preferred-currency');
      const parsedCurrency = parseCurrency(savedCurrency);
      if (parsedCurrency && parsedCurrency !== currency) {
        setCurrencyState(parsedCurrency);
      } else if (!parsedCurrency) {
        // If no saved currency, use locale-based preference
        const localeCurrency = getUserPreferredCurrency(locale);
        if (localeCurrency !== currency) {
          setCurrencyState(localeCurrency);
        }
      }
    }
  }, [locale, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, locale }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
}

// Hook for components that need currency but don't want to throw if no provider
export function useCurrencySafe() {
  const context = useContext(CurrencyContext);
  return context || { currency: 'EUR' as CurrencyCode, setCurrency: () => {}, locale: 'en' as Locale };
}
