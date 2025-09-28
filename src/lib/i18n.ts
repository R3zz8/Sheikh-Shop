import { NextRequest } from 'next/server';

export type Locale = 'en' | 'ar';

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  [locale: string]: Translation;
}

// English translations
const enTranslations: Translation = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    shipping: 'Shipping',
    discount: 'Discount',
    free: 'Free',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    viewDetails: 'View Details',
    remove: 'Remove',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
  },
  navigation: {
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    about: 'About Us',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    cart: 'Cart',
    checkout: 'Checkout',
    orders: 'Orders',
    wishlist: 'Wishlist',
    search: 'Search Products',
  },
  product: {
    name: 'Product Name',
    description: 'Description',
    price: 'Price',
    originalPrice: 'Original Price',
    salePrice: 'Sale Price',
    youSave: 'You Save',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Only {count} left in stock',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    quantity: 'Quantity',
    selectSize: 'Select Size',
    selectColor: 'Select Color',
    reviews: 'Reviews',
    rating: 'Rating',
    writeReview: 'Write a Review',
    specifications: 'Specifications',
    features: 'Features',
    relatedProducts: 'Related Products',
    youMightAlsoLike: 'You Might Also Like',
    recommendedForYou: 'Recommended for You',
    bundleDeals: 'Bundle Deals',
    trendingNow: 'Trending Now',
    newArrivals: 'New Arrivals',
    bestSellers: 'Best Sellers',
    onSale: 'On Sale',
    freeShipping: 'Free Shipping',
    fastDelivery: 'Fast Delivery',
    securePayment: 'Secure Payment',
    moneyBackGuarantee: 'Money Back Guarantee',
  },
  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    itemCount: '{count} item(s)',
    subtotal: 'Subtotal',
    tax: 'Tax',
    shipping: 'Shipping',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    removeItem: 'Remove Item',
    updateQuantity: 'Update Quantity',
    applyCoupon: 'Apply Coupon',
    couponCode: 'Coupon Code',
    apply: 'Apply',
    removeCoupon: 'Remove Coupon',
    estimatedShipping: 'Estimated Shipping',
    freeShippingOver: 'Free shipping on orders over {amount}',
  },
  checkout: {
    title: 'Checkout',
    billingAddress: 'Billing Address',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    country: 'Country',
    sameAsBilling: 'Same as billing address',
    creditCard: 'Credit Card',
    paypal: 'PayPal',
    applePay: 'Apple Pay',
    googlePay: 'Google Pay',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    cardholderName: 'Cardholder Name',
    orderConfirmation: 'Order Confirmation',
    orderNumber: 'Order Number',
    estimatedDelivery: 'Estimated Delivery',
    trackOrder: 'Track Order',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signInWith: 'Sign in with',
    signUpWith: 'Sign up with',
    google: 'Google',
    facebook: 'Facebook',
    apple: 'Apple',
    emailVerification: 'Email Verification',
    verifyEmail: 'Verify Email',
    resendVerification: 'Resend Verification',
    accountCreated: 'Account Created',
    loginSuccess: 'Login Successful',
    logoutSuccess: 'Logout Successful',
    passwordReset: 'Password Reset',
    passwordResetSent: 'Password reset email sent',
    invalidCredentials: 'Invalid email or password',
    emailAlreadyExists: 'Email already exists',
    weakPassword: 'Password is too weak',
    emailNotVerified: 'Please verify your email address',
  },
  analytics: {
    views: 'Views',
    clicks: 'Clicks',
    addToCart: 'Add to Cart',
    purchases: 'Purchases',
    revenue: 'Revenue',
    conversionRate: 'Conversion Rate',
    averageOrderValue: 'Average Order Value',
    totalOrders: 'Total Orders',
    totalCustomers: 'Total Customers',
    topProducts: 'Top Products',
    topCategories: 'Top Categories',
    salesByMonth: 'Sales by Month',
    salesByDay: 'Sales by Day',
    customerInsights: 'Customer Insights',
    productPerformance: 'Product Performance',
    salesTrends: 'Sales Trends',
  },
  errors: {
    pageNotFound: 'Page Not Found',
    serverError: 'Server Error',
    networkError: 'Network Error',
    validationError: 'Validation Error',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    tooManyRequests: 'Too Many Requests',
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Try Again',
    goHome: 'Go Home',
    contactSupport: 'Contact Support',
  },
  seo: {
    homeTitle: 'Sheikh Shop - Premium Quality Products',
    homeDescription: 'Discover premium quality products at Sheikh Shop. Fast shipping, secure payments, and excellent customer service.',
    productsTitle: 'Products - Sheikh Shop',
    productsDescription: 'Browse our wide selection of premium products. Find exactly what you need with our easy-to-use search and filters.',
    categoriesTitle: 'Categories - Sheikh Shop',
    categoriesDescription: 'Explore products by category. From electronics to home goods, we have everything you need.',
    aboutTitle: 'About Us - Sheikh Shop',
    aboutDescription: 'Learn about Sheikh Shop\'s commitment to quality, customer service, and premium products.',
    contactTitle: 'Contact Us - Sheikh Shop',
    contactDescription: 'Get in touch with Sheikh Shop. We\'re here to help with any questions or concerns.',
  },
};

// Arabic translations
const arTranslations: Translation = {
  common: {
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    price: 'السعر',
    quantity: 'الكمية',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    shipping: 'الشحن',
    discount: 'الخصم',
    free: 'مجاني',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    lowStock: 'متبقي {count} فقط',
    addToCart: 'أضف للسلة',
    buyNow: 'اشتري الآن',
    viewDetails: 'عرض التفاصيل',
    remove: 'إزالة',
    continue: 'متابعة',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    yes: 'نعم',
    no: 'لا',
  },
  navigation: {
    home: 'الرئيسية',
    products: 'المنتجات',
    categories: 'الفئات',
    about: 'من نحن',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    cart: 'السلة',
    checkout: 'الدفع',
    orders: 'الطلبات',
    wishlist: 'قائمة الأمنيات',
    search: 'البحث في المنتجات',
  },
  product: {
    name: 'اسم المنتج',
    description: 'الوصف',
    price: 'السعر',
    originalPrice: 'السعر الأصلي',
    salePrice: 'سعر البيع',
    youSave: 'توفر',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    lowStock: 'متبقي {count} فقط',
    addToCart: 'أضف للسلة',
    buyNow: 'اشتري الآن',
    quantity: 'الكمية',
    selectSize: 'اختر الحجم',
    selectColor: 'اختر اللون',
    reviews: 'التقييمات',
    rating: 'التقييم',
    writeReview: 'اكتب تقييماً',
    specifications: 'المواصفات',
    features: 'المميزات',
    relatedProducts: 'منتجات ذات صلة',
    youMightAlsoLike: 'قد يعجبك أيضاً',
    recommendedForYou: 'موصى لك',
    bundleDeals: 'عروض الباقات',
    trendingNow: 'الأكثر مبيعاً الآن',
    newArrivals: 'وصل حديثاً',
    bestSellers: 'الأكثر مبيعاً',
    onSale: 'في التخفيض',
    freeShipping: 'شحن مجاني',
    fastDelivery: 'توصيل سريع',
    securePayment: 'دفع آمن',
    moneyBackGuarantee: 'ضمان استرداد المال',
  },
  cart: {
    title: 'سلة التسوق',
    empty: 'سلتك فارغة',
    itemCount: '{count} عنصر',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    shipping: 'الشحن',
    total: 'المجموع',
    checkout: 'المتابعة للدفع',
    continueShopping: 'متابعة التسوق',
    removeItem: 'إزالة العنصر',
    updateQuantity: 'تحديث الكمية',
    applyCoupon: 'تطبيق كوبون',
    couponCode: 'كود الكوبون',
    apply: 'تطبيق',
    removeCoupon: 'إزالة الكوبون',
    estimatedShipping: 'الشحن المقدر',
    freeShippingOver: 'شحن مجاني للطلبات أكثر من {amount}',
  },
  checkout: {
    title: 'الدفع',
    billingAddress: 'عنوان الفواتير',
    shippingAddress: 'عنوان الشحن',
    paymentMethod: 'طريقة الدفع',
    orderSummary: 'ملخص الطلب',
    placeOrder: 'تأكيد الطلب',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    city: 'المدينة',
    state: 'الولاية',
    zipCode: 'الرمز البريدي',
    country: 'البلد',
    sameAsBilling: 'نفس عنوان الفواتير',
    creditCard: 'بطاقة ائتمان',
    paypal: 'باي بال',
    applePay: 'آبل باي',
    googlePay: 'جوجل باي',
    cardNumber: 'رقم البطاقة',
    expiryDate: 'تاريخ الانتهاء',
    cvv: 'رمز الأمان',
    cardholderName: 'اسم حامل البطاقة',
    orderConfirmation: 'تأكيد الطلب',
    orderNumber: 'رقم الطلب',
    estimatedDelivery: 'التوصيل المقدر',
    trackOrder: 'تتبع الطلب',
  },
  auth: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    signInWith: 'تسجيل الدخول بـ',
    signUpWith: 'إنشاء حساب بـ',
    google: 'جوجل',
    facebook: 'فيسبوك',
    apple: 'آبل',
    emailVerification: 'التحقق من البريد الإلكتروني',
    verifyEmail: 'التحقق من البريد',
    resendVerification: 'إعادة إرسال التحقق',
    accountCreated: 'تم إنشاء الحساب',
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    passwordReset: 'إعادة تعيين كلمة المرور',
    passwordResetSent: 'تم إرسال رابط إعادة تعيين كلمة المرور',
    invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
    emailAlreadyExists: 'البريد الإلكتروني موجود بالفعل',
    weakPassword: 'كلمة المرور ضعيفة جداً',
    emailNotVerified: 'يرجى التحقق من عنوان بريدك الإلكتروني',
  },
  analytics: {
    views: 'المشاهدات',
    clicks: 'النقرات',
    addToCart: 'إضافة للسلة',
    purchases: 'المشتريات',
    revenue: 'الإيرادات',
    conversionRate: 'معدل التحويل',
    averageOrderValue: 'متوسط قيمة الطلب',
    totalOrders: 'إجمالي الطلبات',
    totalCustomers: 'إجمالي العملاء',
    topProducts: 'أفضل المنتجات',
    topCategories: 'أفضل الفئات',
    salesByMonth: 'المبيعات حسب الشهر',
    salesByDay: 'المبيعات حسب اليوم',
    customerInsights: 'رؤى العملاء',
    productPerformance: 'أداء المنتجات',
    salesTrends: 'اتجاهات المبيعات',
  },
  errors: {
    pageNotFound: 'الصفحة غير موجودة',
    serverError: 'خطأ في الخادم',
    networkError: 'خطأ في الشبكة',
    validationError: 'خطأ في التحقق',
    unauthorized: 'غير مصرح',
    forbidden: 'ممنوع',
    tooManyRequests: 'طلبات كثيرة جداً',
    somethingWentWrong: 'حدث خطأ ما',
    tryAgain: 'حاول مرة أخرى',
    goHome: 'العودة للرئيسية',
    contactSupport: 'اتصل بالدعم',
  },
  seo: {
    homeTitle: 'متجر الشيخ - منتجات عالية الجودة',
    homeDescription: 'اكتشف منتجات عالية الجودة في متجر الشيخ. شحن سريع، دفوعات آمنة، وخدمة عملاء ممتازة.',
    productsTitle: 'المنتجات - متجر الشيخ',
    productsDescription: 'تصفح مجموعتنا الواسعة من المنتجات عالية الجودة. اعثر على ما تحتاجه بسهولة مع البحث والتصفية.',
    categoriesTitle: 'الفئات - متجر الشيخ',
    categoriesDescription: 'استكشف المنتجات حسب الفئة. من الإلكترونيات إلى السلع المنزلية، لدينا كل ما تحتاجه.',
    aboutTitle: 'من نحن - متجر الشيخ',
    aboutDescription: 'تعرف على التزام متجر الشيخ بالجودة وخدمة العملاء والمنتجات عالية الجودة.',
    contactTitle: 'اتصل بنا - متجر الشيخ',
    contactDescription: 'تواصل مع متجر الشيخ. نحن هنا لمساعدتك في أي أسئلة أو استفسارات.',
  },
};

// All translations
const translations: Translations = {
  en: enTranslations,
  ar: arTranslations,
};

// Get translation function
export function getTranslation(locale: Locale, key: string, params?: Record<string, any>): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  // Navigate through nested keys
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found in any language
        }
      }
      break;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters in translation
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] || match;
    });
  }

  return value;
}

// Get locale from request
export function getLocaleFromRequest(request: NextRequest): Locale {
  // Check URL path
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/ar/') || pathname.startsWith('/ar')) {
    return 'ar';
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage && acceptLanguage.includes('ar')) {
    return 'ar';
  }

  // Check cookie
  const localeCookie = request.cookies.get('locale');
  if (localeCookie && (localeCookie.value === 'ar' || localeCookie.value === 'en')) {
    return localeCookie.value as Locale;
  }

  // Default to English
  return 'en';
}

// Get localized URL
export function getLocalizedUrl(pathname: string, locale: Locale): string {
  if (locale === 'ar') {
    return `/ar${pathname}`;
  }
  return pathname;
}

// Get alternate URLs for hreflang
export function getAlternateUrls(pathname: string): { locale: Locale; url: string }[] {
  return [
    { locale: 'en', url: pathname },
    { locale: 'ar', url: `/ar${pathname}` },
  ];
}

// Format currency based on locale
export function formatCurrency(amount: number, currency: string, locale: Locale): string {
  const localeMap = {
    en: 'en-US',
    ar: 'ar-SA',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date based on locale
export function formatDate(date: Date, locale: Locale): string {
  const localeMap = {
    en: 'en-US',
    ar: 'ar-SA',
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format number based on locale
export function formatNumber(number: number, locale: Locale): string {
  const localeMap = {
    en: 'en-US',
    ar: 'ar-SA',
  };

  return new Intl.NumberFormat(localeMap[locale]).format(number);
}