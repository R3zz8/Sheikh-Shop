'use client';

import { useState, useEffect } from 'react';
import { 
  formatPrice, 
  convertCurrency, 
  getMultiCurrencyPrices, 
  getUserPreferredCurrency,
  type CurrencyCode 
} from '@/lib/currency';
import { CURRENCY_DISPLAY } from '@/lib/currencyConfig';
import CurrencySwitcher from '@/components/CurrencySwitcher';

/**
 * Example component demonstrating the new currency system
 * This shows how to use the currency conversion and formatting functions
 */
export default function CurrencyExample() {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('EUR');
  const [eurPrice] = useState(120.00); // Base price in EUR

  useEffect(() => {
    // Get user's preferred currency from localStorage/cookies
    const savedCurrency = localStorage.getItem('preferred-currency') as CurrencyCode;
    if (savedCurrency) {
      setCurrentCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrentCurrency(newCurrency);
  };

  // Convert the EUR price to the current currency
  const convertedPrice = convertCurrency(eurPrice, 'EUR', currentCurrency);
  const multiCurrencyPrices = getMultiCurrencyPrices(eurPrice);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Currency System Example</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Currency Switcher</h3>
          <CurrencySwitcher 
            currentCurrency={currentCurrency}
            onCurrencyChange={handleCurrencyChange}
            variant="dropdown"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Price Display</h3>
          <div className="text-3xl font-bold text-primary">
            {formatPrice(convertedPrice, currentCurrency)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Base price: {formatPrice(eurPrice, 'EUR')} (EUR)
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">All Currency Prices</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(multiCurrencyPrices).map(([currency, price]) => (
              <div key={currency} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-semibold">
                  {formatPrice(price, currency as CurrencyCode)}
                </div>
                <div className="text-sm text-gray-600">{currency}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Currency Information</h3>
          <div className="space-y-2">
            {Object.entries(CURRENCY_DISPLAY).map(([code, info]) => (
              <div key={code} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <span className="text-xl">{info.symbol}</span>
                <div>
                  <div className="font-medium">{code}</div>
                  <div className="text-sm text-gray-600">{info.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

