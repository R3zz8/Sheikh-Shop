import type { Locale } from './config';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    products: string;
    categories: string;
    articles: string;
    about: string;
    contact: string;
    cart: string;
    search: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    add: string;
    remove: string;
    view: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    search: string;
    filter: string;
    sort: string;
    clear: string;
    all: string;
    none: string;
    select: string;
    selected: string;
    total: string;
    subtotal: string;
    tax: string;
    shipping: string;
    discount: string;
    free: string;
    price: string;
    quantity: string;
    inStock: string;
    outOfStock: string;
    onSale: string;
    new: string;
    bestSeller: string;
    amazing: string;
  };

  // Product
  product: {
    addToCart: string;
    buyNow: string;
    description: string;
    specifications: string;
    reviews: string;
    relatedProducts: string;
    youMightAlsoLike: string;
    recentlyViewed: string;
    category: string;
    brand: string;
    weight: string;
    dimensions: string;
    origin: string;
    shelfLife: string;
    storage: string;
    ingredients: string;
    nutritionalInfo: string;
    allergens: string;
  };

  // Cart
  cart: {
    title: string;
    empty: string;
    emptyMessage: string;
    continueShopping: string;
    checkout: string;
    updateQuantity: string;
    removeItem: string;
    clearCart: string;
    itemCount: string;
    totalItems: string;
    estimatedShipping: string;
    estimatedTotal: string;
    secureCheckout: string;
    guestCheckout: string;
    loginToCheckout: string;
  };

  // Footer
  footer: {
    company: string;
    aboutUs: string;
    careers: string;
    press: string;
    sustainability: string;
    customerService: string;
    helpCenter: string;
    contactUs: string;
    shipping: string;
    returns: string;
    sizeGuide: string;
    trackOrder: string;
    legal: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    accessibility: string;
    social: string;
    newsletter: string;
    newsletterDescription: string;
    subscribe: string;
    email: string;
    copyright: string;
    allRightsReserved: string;
  };

  // SEO
  seo: {
    homeTitle: string;
    homeDescription: string;
    productsTitle: string;
    productsDescription: string;
    categoriesTitle: string;
    categoriesDescription: string;
    articlesTitle: string;
    articlesDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    contactTitle: string;
    contactDescription: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      categories: 'Categories',
      articles: 'Articles',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
      search: 'Search',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      remove: 'Remove',
      view: 'View',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      clear: 'Clear',
      all: 'All',
      none: 'None',
      select: 'Select',
      selected: 'Selected',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Tax',
      shipping: 'Shipping',
      discount: 'Discount',
      free: 'Free',
      price: 'Price',
      quantity: 'Quantity',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      onSale: 'On Sale',
      new: 'New',
      bestSeller: 'Best Seller',
      amazing: 'Amazing Deal',
    },
    product: {
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      relatedProducts: 'Related Products',
      youMightAlsoLike: 'You Might Also Like',
      recentlyViewed: 'Recently Viewed',
      category: 'Category',
      brand: 'Brand',
      weight: 'Weight',
      dimensions: 'Dimensions',
      origin: 'Origin',
      shelfLife: 'Shelf Life',
      storage: 'Storage',
      ingredients: 'Ingredients',
      nutritionalInfo: 'Nutritional Information',
      allergens: 'Allergens',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyMessage: 'Add some premium products to get started',
      continueShopping: 'Continue Shopping',
      checkout: 'Checkout',
      updateQuantity: 'Update Quantity',
      removeItem: 'Remove Item',
      clearCart: 'Clear Cart',
      itemCount: 'items',
      totalItems: 'Total Items',
      estimatedShipping: 'Estimated Shipping',
      estimatedTotal: 'Estimated Total',
      secureCheckout: 'Secure Checkout',
      guestCheckout: 'Guest Checkout',
      loginToCheckout: 'Login to Checkout',
    },
    footer: {
      company: 'Company',
      aboutUs: 'About Us',
      careers: 'Careers',
      press: 'Press',
      sustainability: 'Sustainability',
      customerService: 'Customer Service',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      shipping: 'Shipping',
      returns: 'Returns',
      sizeGuide: 'Size Guide',
      trackOrder: 'Track Order',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      accessibility: 'Accessibility',
      social: 'Social',
      newsletter: 'Newsletter',
      newsletterDescription: 'Subscribe to get updates on new products and exclusive offers',
      subscribe: 'Subscribe',
      email: 'Email',
      copyright: '© 2024 Sheikh Shop',
      allRightsReserved: 'All rights reserved',
    },
    seo: {
      homeTitle: 'Sheikh Shop - Premium Luxury Products',
      homeDescription: 'Discover our curated collection of premium luxury products. Experience exceptional quality and craftsmanship with Sheikh Shop.',
      productsTitle: 'Premium Products - Sheikh Shop',
      productsDescription: 'Browse our collection of premium dates, saffron, honey, and luxury Middle Eastern products.',
      categoriesTitle: 'Product Categories - Sheikh Shop',
      categoriesDescription: 'Explore our premium product categories including dates, saffron, honey, and more.',
      articlesTitle: 'Articles & Blog - Sheikh Shop',
      articlesDescription: 'Read our latest articles about premium products, health benefits, and culinary excellence.',
      aboutTitle: 'About Us - Sheikh Shop',
      aboutDescription: 'Learn about Sheikh Shop\'s commitment to quality and authentic Middle Eastern products.',
      contactTitle: 'Contact Us - Sheikh Shop',
      contactDescription: 'Get in touch with Sheikh Shop for customer support, inquiries, and feedback.',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      categories: 'الفئات',
      articles: 'المقالات',
      about: 'من نحن',
      contact: 'اتصل بنا',
      cart: 'السلة',
      search: 'بحث',
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      edit: 'تعديل',
      delete: 'حذف',
      add: 'إضافة',
      remove: 'إزالة',
      view: 'عرض',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      clear: 'مسح',
      all: 'الكل',
      none: 'لا شيء',
      select: 'اختيار',
      selected: 'محدد',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي',
      tax: 'الضريبة',
      shipping: 'الشحن',
      discount: 'الخصم',
      free: 'مجاني',
      price: 'السعر',
      quantity: 'الكمية',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      onSale: 'عرض',
      new: 'جديد',
      bestSeller: 'الأكثر مبيعاً',
      amazing: 'عرض رائع',
    },
    product: {
      addToCart: 'أضف للسلة',
      buyNow: 'اشتري الآن',
      description: 'الوصف',
      specifications: 'المواصفات',
      reviews: 'التقييمات',
      relatedProducts: 'منتجات ذات صلة',
      youMightAlsoLike: 'قد يعجبك أيضاً',
      recentlyViewed: 'شوهد مؤخراً',
      category: 'الفئة',
      brand: 'العلامة التجارية',
      weight: 'الوزن',
      dimensions: 'الأبعاد',
      origin: 'المنشأ',
      shelfLife: 'مدة الصلاحية',
      storage: 'التخزين',
      ingredients: 'المكونات',
      nutritionalInfo: 'المعلومات الغذائية',
      allergens: 'مسببات الحساسية',
    },
    cart: {
      title: 'سلة التسوق',
      empty: 'سلتك فارغة',
      emptyMessage: 'أضف بعض المنتجات المميزة للبدء',
      continueShopping: 'متابعة التسوق',
      checkout: 'الدفع',
      updateQuantity: 'تحديث الكمية',
      removeItem: 'إزالة العنصر',
      clearCart: 'مسح السلة',
      itemCount: 'عنصر',
      totalItems: 'إجمالي العناصر',
      estimatedShipping: 'الشحن المقدر',
      estimatedTotal: 'المجموع المقدر',
      secureCheckout: 'دفع آمن',
      guestCheckout: 'دفع كضيف',
      loginToCheckout: 'تسجيل الدخول للدفع',
    },
    footer: {
      company: 'الشركة',
      aboutUs: 'من نحن',
      careers: 'الوظائف',
      press: 'الصحافة',
      sustainability: 'الاستدامة',
      customerService: 'خدمة العملاء',
      helpCenter: 'مركز المساعدة',
      contactUs: 'اتصل بنا',
      shipping: 'الشحن',
      returns: 'الإرجاع',
      sizeGuide: 'دليل المقاسات',
      trackOrder: 'تتبع الطلب',
      legal: 'قانوني',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
      cookiePolicy: 'سياسة ملفات تعريف الارتباط',
      accessibility: 'إمكانية الوصول',
      social: 'اجتماعي',
      newsletter: 'النشرة الإخبارية',
      newsletterDescription: 'اشترك للحصول على تحديثات حول المنتجات الجديدة والعروض الحصرية',
      subscribe: 'اشتراك',
      email: 'البريد الإلكتروني',
      copyright: '© 2024 متجر الشيخ',
      allRightsReserved: 'جميع الحقوق محفوظة',
    },
    seo: {
      homeTitle: 'متجر الشيخ - منتجات فاخرة مميزة',
      homeDescription: 'اكتشف مجموعتنا المختارة من المنتجات الفاخرة المميزة. استمتع بجودة استثنائية وحرفية مع متجر الشيخ.',
      productsTitle: 'منتجات مميزة - متجر الشيخ',
      productsDescription: 'تصفح مجموعتنا من التمور المميزة والزعفران والعسل والمنتجات الفاخرة الشرق أوسطية.',
      categoriesTitle: 'فئات المنتجات - متجر الشيخ',
      categoriesDescription: 'استكشف فئات منتجاتنا المميزة بما في ذلك التمور والزعفران والعسل والمزيد.',
      articlesTitle: 'المقالات والمدونة - متجر الشيخ',
      articlesDescription: 'اقرأ أحدث مقالاتنا حول المنتجات المميزة والفوائد الصحية والتميز الطهوي.',
      aboutTitle: 'من نحن - متجر الشيخ',
      aboutDescription: 'تعرف على التزام متجر الشيخ بالجودة والمنتجات الشرق أوسطية الأصيلة.',
      contactTitle: 'اتصل بنا - متجر الشيخ',
      contactDescription: 'تواصل مع متجر الشيخ للحصول على دعم العملاء والاستفسارات والملاحظات.',
    },
  },
};
