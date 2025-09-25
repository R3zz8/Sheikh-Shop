# Currency System Documentation

## Overview

The Sheikh Shop currency system has been refactored to use **EUR as the base currency** while maintaining support for USD and AED. All product prices in the database are stored in EUR, and the system automatically converts and displays prices in the user's preferred currency.

## Key Features

- **Base Currency**: EUR (Euro)
- **Supported Currencies**: EUR, USD, AED
- **Automatic Conversion**: Real-time currency conversion using exchange rates
- **User Preference**: Manual currency switching with persistence
- **Locale-based Defaults**: EN → USD, AR → AED
- **Fallback Logic**: User choice → Locale mapping → EUR default
- **Multi-currency JSON-LD**: SEO-friendly structured data with all currencies

## File Structure

```
src/lib/
├── currencyConfig.ts     # Central currency configuration
├── currency.ts          # Currency conversion and formatting functions
└── seo/schema.ts        # Updated JSON-LD with multi-currency support

src/components/
├── CurrencySwitcher.tsx # Currency selection component
└── examples/CurrencyExample.tsx # Usage examples

src/middleware.ts        # Updated middleware with new currency logic
```

## Configuration

### Currency Mapping (`src/lib/currencyConfig.ts`)

```typescript
export const CURRENCY_MAP = {
  default: 'EUR',  // Global fallback
  en: 'USD',       // English locale
  ar: 'AED',       // Arabic locale
} as const;
```

### Exchange Rates

```typescript
export const EXCHANGE_RATES = {
  EUR: 1.0,    // Base currency
  USD: 1.08,   // 1 EUR = 1.08 USD
  AED: 3.97,   // 1 EUR = 3.97 AED
} as const;
```

## Usage Examples

### Basic Currency Conversion

```typescript
import { convertCurrency, formatPrice } from '@/lib/currency';

// Convert EUR to USD
const usdPrice = convertCurrency(120, 'EUR', 'USD'); // 129.60

// Format price with currency symbol
const formatted = formatPrice(120, 'EUR'); // "€120.00"
```

### Multi-Currency Prices

```typescript
import { getMultiCurrencyPrices } from '@/lib/currency';

const prices = getMultiCurrencyPrices(120); // EUR amount
// Returns: { EUR: 120, USD: 129.60, AED: 476.40 }
```

### User Preference Handling

```typescript
import { getUserPreferredCurrency } from '@/lib/currency';

const userCurrency = getUserPreferredCurrency('en', cookieValue);
// Priority: 1. User choice, 2. Locale mapping, 3. EUR fallback
```

### Currency Switcher Component

```tsx
import CurrencySwitcher from '@/components/CurrencySwitcher';

<CurrencySwitcher 
  currentCurrency="EUR"
  onCurrencyChange={(currency) => console.log(currency)}
  variant="dropdown" // or "buttons"
/>
```

## Database Schema

**Important**: All product prices in the database should be stored in EUR.

```sql
-- Product table (existing)
CREATE TABLE Product (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  basePrice REAL DEFAULT 0.0, -- This should be in EUR
  -- ... other fields
);
```

## Middleware Logic

The middleware follows this priority order:

1. **User's manual choice** (from cookie/localStorage)
2. **Locale-based mapping** (EN → USD, AR → AED)
3. **EUR fallback** (default)

```typescript
// In middleware.ts
function chooseCurrency(locale: Locale, country: string | null, userPreference?: string): CurrencyCode {
  // 1. Check user's manual preference first
  const parsedPreference = parseCurrency(userPreference);
  if (parsedPreference) return parsedPreference;
  
  // 2. Use locale-based mapping
  const localeCurrency = getUserPreferredCurrency(locale);
  
  // 3. Fallback to EUR (default)
  return localeCurrency || getDefaultCurrency();
}
```

## JSON-LD Structured Data

Product pages now include multiple currency offers for better SEO:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Saffron",
  "offers": [
    {
      "@type": "Offer",
      "price": "120.00",
      "priceCurrency": "EUR"
    },
    {
      "@type": "Offer", 
      "price": "129.60",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "price": "476.40", 
      "priceCurrency": "AED"
    }
  ]
}
```

## Migration Guide

### For Existing Products

If you have existing products with prices in USD or AED, you'll need to convert them to EUR:

```typescript
// Example migration script
const convertProductPrices = async () => {
  const products = await prisma.product.findMany();
  
  for (const product of products) {
    // Assuming current prices are in USD
    const eurPrice = convertCurrency(product.basePrice, 'USD', 'EUR');
    
    await prisma.product.update({
      where: { id: product.id },
      data: { basePrice: eurPrice }
    });
  }
};
```

### For Components

Update any components that hardcode currency values:

```typescript
// Before
const price = formatPrice(product.basePrice, 'USD');

// After  
const price = formatPrice(product.basePrice, currentCurrency);
```

## Environment Variables

No new environment variables are required. The system uses the centralized configuration in `currencyConfig.ts`.

## Testing

Use the example component to test the currency system:

```tsx
import CurrencyExample from '@/components/examples/CurrencyExample';

// Add to any page for testing
<CurrencyExample />
```

## Future Enhancements

1. **API Integration**: Replace hardcoded exchange rates with real-time API data
2. **More Currencies**: Add support for additional currencies (SAR, GBP, etc.)
3. **Historical Rates**: Store exchange rate history for analytics
4. **Admin Panel**: Currency management interface for administrators

## Troubleshooting

### Common Issues

1. **Prices showing as 0**: Ensure product prices are stored in EUR in the database
2. **Currency not switching**: Check localStorage and cookie settings
3. **Wrong conversion rates**: Update `EXCHANGE_RATES` in `currencyConfig.ts`

### Debug Mode

Enable debug logging by adding to your component:

```typescript
console.log('Current currency:', currentCurrency);
console.log('Converted price:', convertedPrice);
console.log('Multi-currency prices:', multiCurrencyPrices);
```

## Support

For issues or questions about the currency system, refer to:
- `src/components/examples/CurrencyExample.tsx` for usage examples
- `src/lib/currencyConfig.ts` for configuration options
- This documentation for implementation details

