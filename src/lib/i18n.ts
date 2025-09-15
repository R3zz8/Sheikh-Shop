// Internationalization configuration and utilities

export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'en' as const;

export type Locale = typeof locales[number];

// Locale configuration
export const localeConfig = {
  en: {
    name: 'English',
    dir: 'ltr',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  },
  ar: {
    name: 'العربية',
    dir: 'rtl',
    currency: 'AED',
    dateFormat: 'DD/MM/YYYY',
  },
} as const;

// Currency formatting
export const formatCurrency = (amount: number, locale: Locale = defaultLocale) => {
  const currency = localeConfig[locale].currency;
  const localeCode = locale === 'ar' ? 'ar-AE' : 'en-US';
  
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Date formatting
export const formatDate = (date: Date, locale: Locale = defaultLocale) => {
  const localeCode = locale === 'ar' ? 'ar-AE' : 'en-US';
  
  return new Intl.DateTimeFormat(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Number formatting
export const formatNumber = (number: number, locale: Locale = defaultLocale) => {
  const localeCode = locale === 'ar' ? 'ar-AE' : 'en-US';
  
  return new Intl.NumberFormat(localeCode).format(number);
};

// Translation keys (simplified structure)
export const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    about: 'About Us',
    contact: 'Contact',
    
    // Product
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    price: 'Price',
    quantity: 'Quantity',
    
    // Cart
    cart: 'Cart',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    total: 'Total',
    emptyCart: 'Your cart is empty',
    
    // Search
    search: 'Search',
    searchPlaceholder: 'Search products and articles...',
    noResults: 'No results found',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    categories: 'الفئات',
    about: 'من نحن',
    contact: 'اتصل بنا',
    
    // Product
    addToCart: 'أضف للسلة',
    outOfStock: 'غير متوفر',
    inStock: 'متوفر',
    price: 'السعر',
    quantity: 'الكمية',
    
    // Cart
    cart: 'السلة',
    checkout: 'الدفع',
    subtotal: 'المجموع الفرعي',
    total: 'المجموع الكلي',
    emptyCart: 'سلتك فارغة',
    
    // Search
    search: 'بحث',
    searchPlaceholder: 'ابحث في المنتجات والمقالات...',
    noResults: 'لا توجد نتائج',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    edit: 'تعديل',
    delete: 'حذف',
  },
} as const;

// Translation function
export const t = (key: string, locale: Locale = defaultLocale): string => {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

// Hreflang generator
export const generateHreflang = (path: string, locales: Locale[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return locales.map(locale => ({
    hrefLang: locale,
    href: `${baseUrl}/${locale}${path}`,
  }));
};

// Locale detection from URL
export const getLocaleFromPath = (pathname: string): Locale => {
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  
  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return defaultLocale;
};

// Remove locale from path
export const removeLocaleFromPath = (pathname: string): string => {
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  
  if (locales.includes(firstSegment as Locale)) {
    return '/' + segments.slice(2).join('/');
  }
  
  return pathname;
};





